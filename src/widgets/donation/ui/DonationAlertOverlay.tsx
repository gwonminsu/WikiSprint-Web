import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLatestDonations, getRecentAlertDonations, getRecentDonationAlertReplays } from '@features';
import type { DonationListItem } from '@entities';
import { donationAwake, donationBarrel, donationCoffee, donationOverdose, useSettingsStore, useTranslation } from '@shared';
import {
  toDonationAlertFromListItem,
  useDonationAlertStore,
  type DonationAlertItem,
  type DonationEffectType,
} from '../lib/donationAlert';

const EFFECT_IMAGE_MAP: Record<DonationEffectType, string> = {
  coffee: donationCoffee,
  awake: donationAwake,
  barrel: donationBarrel,
  overdose: donationOverdose,
};

const EFFECT_LABEL_MAP: Record<DonationEffectType, string> = {
  coffee: 'coffee shake',
  awake: 'caffeine awake',
  barrel: 'caffeine barrel',
  overdose: 'caffeine overdose',
};

const RECENT_ALERT_WINDOW_MS = 1000 * 60 * 10;
const SEEN_ALERT_STORAGE_KEY = 'wikisprint-seen-donation-alerts';

type SeenDonationAlertRecord = {
  id: string;
  seenAt: number;
};

function readSeenDonationAlerts(): SeenDonationAlertRecord[] {
  try {
    const rawValue = window.localStorage.getItem(SEEN_ALERT_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as SeenDonationAlertRecord[];
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    const cutoff = Date.now() - RECENT_ALERT_WINDOW_MS;
    return parsedValue.filter((record) => (
      typeof record.id === 'string' &&
      typeof record.seenAt === 'number' &&
      record.seenAt >= cutoff
    ));
  } catch {
    return [];
  }
}

function writeSeenDonationAlerts(records: SeenDonationAlertRecord[]): void {
  try {
    window.localStorage.setItem(SEEN_ALERT_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // localStorage를 사용할 수 없는 환경에서는 현재 세션 중복 방지만 적용한다.
  }
}

function hasSeenDonationAlert(alertId: string): boolean {
  return readSeenDonationAlerts().some((record) => record.id === alertId);
}

function markSeenDonationAlert(alertId: string): void {
  const records = readSeenDonationAlerts().filter((record) => record.id !== alertId);
  writeSeenDonationAlerts([...records, { id: alertId, seenAt: Date.now() }].slice(-120));
}

function resolveAlertId(donation: { alertId?: string | null; donationId: string }): string {
  return donation.alertId ?? donation.donationId;
}

function parseAlertTimeMs(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsedTime = new Date(value).getTime();
  return Number.isFinite(parsedTime) ? parsedTime : null;
}

function isAtOrAfterCutoff(value: string | null | undefined, cutoffMs: number | null): boolean {
  if (cutoffMs === null) {
    return true;
  }

  const parsedTime = parseAlertTimeMs(value);
  if (parsedTime === null) {
    return false;
  }

  return parsedTime >= cutoffMs;
}

function isWithinRecentAlertWindow(receivedAt: string): boolean {
  const receivedTime = new Date(receivedAt).getTime();
  if (!Number.isFinite(receivedTime)) {
    return false;
  }

  return Date.now() - receivedTime <= RECENT_ALERT_WINDOW_MS;
}

function getEffectClassName(effectType: DonationEffectType): string {
  return `donation-alert__image donation-alert__image--${effectType}`;
}

function DonationAlertContent({ item }: { item: DonationAlertItem }): React.ReactElement {
  const { t } = useTranslation();
  const message = item.message?.trim();

  return (
    <>
      <img
        src={EFFECT_IMAGE_MAP[item.effectType]}
        alt=""
        aria-hidden="true"
        className={getEffectClassName(item.effectType)}
      />

      <div className="donation-alert__text">
        <p className="donation-alert__headline">
          <span className="donation-alert__name">{item.displayName}</span>
          {t('donation.alertDonatedPrefix')}
          <span className="donation-alert__coffee">
            {t('donation.alertCoffeeCount', { count: item.coffeeCount })}
          </span>
          {t('donation.alertDonatedSuffix')}
        </p>

        {message ? (
          <p className="donation-alert__message">
            {message}
          </p>
        ) : null}

        <span className="sr-only">{EFFECT_LABEL_MAP[item.effectType]}</span>
      </div>
    </>
  );
}

export function DonationAlertOverlay(): React.ReactElement | null {
  const { t } = useTranslation();
  const phase = useDonationAlertStore((state) => state.phase);
  const current = useDonationAlertStore((state) => state.current);
  const queueLength = useDonationAlertStore((state) => state.queue.length);
  const enqueue = useDonationAlertStore((state) => state.enqueue);
  const startNext = useDonationAlertStore((state) => state.startNext);
  const requestExit = useDonationAlertStore((state) => state.requestExit);
  const finishExit = useDonationAlertStore((state) => state.finishExit);
  const markHandled = useDonationAlertStore((state) => state.markHandled);
  const initializedIdsRef = useRef<Set<string>>(new Set());
  const replayInitializedIdsRef = useRef<Set<string>>(new Set());
  const hasInitializedRef = useRef(false);
  const [hasLoadedRecentAlerts, setHasLoadedRecentAlerts] = useState(false);
  const donationAlertEnabled = useSettingsStore((s) => s.donationAlertEnabled);
  const donationAlertEnabledAt = useSettingsStore((s) => s.donationAlertEnabledAt);

  useEffect(() => {
    if (!donationAlertEnabled) {
      useDonationAlertStore.setState({ phase: 'idle', current: null, queue: [] });
      initializedIdsRef.current = new Set();
      replayInitializedIdsRef.current = new Set();
      hasInitializedRef.current = false;
      // hasLoadedRecentAlerts는 유지 — ON 복귀 시 recentAlertData 재처리 방지
    }
  }, [donationAlertEnabled]);

  const enqueueIfUnseen = (donation: DonationListItem): void => {
    const alertId = resolveAlertId(donation);
    if (hasSeenDonationAlert(alertId)) {
      markHandled(alertId);
      return;
    }

    markSeenDonationAlert(alertId);
    enqueue(toDonationAlertFromListItem(donation, t('donation.anonymous')));
  };

  const { data: recentAlertData, isError: isRecentAlertError } = useQuery({
    queryKey: ['donations', 'alerts', 'recent'],
    queryFn: getRecentAlertDonations,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 1000 * 60 * 10,
    enabled: donationAlertEnabled,
  });

  const { data } = useQuery({
    queryKey: ['donations', 'latest', 'alert-watch'],
    queryFn: getLatestDonations,
    refetchInterval: 1000 * 15,
    staleTime: 1000 * 10,
    enabled: donationAlertEnabled,
  });

  const { data: replayAlertData } = useQuery({
    queryKey: ['donations', 'alerts', 'replays', 'recent'],
    queryFn: getRecentDonationAlertReplays,
    refetchInterval: 1000 * 15,
    staleTime: 0,
    enabled: donationAlertEnabled,
  });

  useEffect(() => {
    if (hasLoadedRecentAlerts || !recentAlertData) {
      return;
    }

    recentAlertData
      .slice()
      .sort((left, right) => new Date(left.receivedAt).getTime() - new Date(right.receivedAt).getTime())
      .forEach((donation) => {
        initializedIdsRef.current.add(donation.donationId);
        if (!isAtOrAfterCutoff(donation.alertCreatedAt ?? donation.receivedAt, donationAlertEnabledAt)) {
          return;
        }

        enqueueIfUnseen(donation);
      });

    setHasLoadedRecentAlerts(true);
  }, [donationAlertEnabledAt, enqueueIfUnseen, hasLoadedRecentAlerts, recentAlertData]);

  useEffect(() => {
    if (!isRecentAlertError || hasLoadedRecentAlerts) {
      return;
    }

    setHasLoadedRecentAlerts(true);
  }, [hasLoadedRecentAlerts, isRecentAlertError]);

  useEffect(() => {
    if (!data || !hasLoadedRecentAlerts) {
      return;
    }

    const nextIds = new Set(data.map((donation) => donation.donationId));

    if (!hasInitializedRef.current) {
      data
        .filter((donation) => !initializedIdsRef.current.has(donation.donationId))
        .filter((donation) => {
          if (donationAlertEnabledAt !== null) {
            return isAtOrAfterCutoff(donation.alertCreatedAt ?? donation.receivedAt, donationAlertEnabledAt);
          }

          return isWithinRecentAlertWindow(donation.receivedAt);
        })
        .sort((left, right) => new Date(left.receivedAt).getTime() - new Date(right.receivedAt).getTime())
        .forEach((donation) => {
          enqueueIfUnseen(donation);
        });

      initializedIdsRef.current = nextIds;
      hasInitializedRef.current = true;
      return;
    }

    data
      .filter((donation) => !initializedIdsRef.current.has(donation.donationId))
      .filter((donation) => isAtOrAfterCutoff(donation.alertCreatedAt ?? donation.receivedAt, donationAlertEnabledAt))
      .sort((left, right) => new Date(left.receivedAt).getTime() - new Date(right.receivedAt).getTime())
      .forEach((donation) => {
        enqueueIfUnseen(donation);
      });

    initializedIdsRef.current = nextIds;
  }, [data, donationAlertEnabledAt, enqueueIfUnseen, hasLoadedRecentAlerts]);

  useEffect(() => {
    if (!replayAlertData) {
      return;
    }

    replayAlertData
      .slice()
      .sort((left, right) => {
        const leftTime = parseAlertTimeMs(left.alertCreatedAt ?? left.receivedAt) ?? 0;
        const rightTime = parseAlertTimeMs(right.alertCreatedAt ?? right.receivedAt) ?? 0;
        return leftTime - rightTime;
      })
      .forEach((donation) => {
        const alertId = resolveAlertId(donation);
        if (replayInitializedIdsRef.current.has(alertId)) {
          return;
        }

        replayInitializedIdsRef.current.add(alertId);

        if (!isAtOrAfterCutoff(donation.alertCreatedAt ?? donation.receivedAt, donationAlertEnabledAt)) {
          return;
        }

        enqueueIfUnseen(donation);
      });
  }, [donationAlertEnabledAt, enqueueIfUnseen, replayAlertData]);

  useEffect(() => {
    if (!donationAlertEnabled || phase !== 'idle' || queueLength === 0) {
      return;
    }

    const timerId = window.setTimeout(startNext, 150);
    return () => window.clearTimeout(timerId);
  }, [donationAlertEnabled, phase, queueLength, startNext]);

  useEffect(() => {
    if (phase !== 'showing' || !current) {
      return;
    }

    const timerId = window.setTimeout(requestExit, 5000);
    return () => window.clearTimeout(timerId);
  }, [current, phase, requestExit]);

  useEffect(() => {
    if (phase !== 'exiting') {
      return;
    }

    const timerId = window.setTimeout(finishExit, 520);
    return () => window.clearTimeout(timerId);
  }, [finishExit, phase]);

  if (!donationAlertEnabled || !current) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={t('donation.alertSkip')}
      className={`donation-alert donation-alert--${phase}`}
      onClick={requestExit}
    >
      <DonationAlertContent item={current} />
    </button>
  );
}
