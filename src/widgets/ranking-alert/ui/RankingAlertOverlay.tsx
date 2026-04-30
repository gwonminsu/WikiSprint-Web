import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecentRankingAlerts } from '@features';
import { useRankingAlertStore, useSettingsStore, useTranslation } from '@shared';
import type { Language } from '@shared';
import { RankingMedalFrame } from '@/widgets/ranking/ui/RankingMedalFrame';
import {
  RankingCardDisplay,
  RANK_BADGE,
  formatRankingMs,
} from '@/widgets/ranking/ui/RankingCardDisplay';
import type {
  RankingAlertPlayer,
  RankingAlertResponse,
  RankingRecord,
} from '@/entities/ranking/types';

const SHOWING_DURATION_MS = 5000;
const EXIT_DURATION_MS = 520;
const START_DELAY_MS = 120;
const SEEN_ALERT_STORAGE_KEY = 'wikisprint-seen-ranking-alerts';
const RECENT_ALERT_WINDOW_MS = 1000 * 60 * 10;

type SeenRankingAlertRecord = {
  id: string;
  seenAt: number;
};

type RankingAlertParticle = {
  id: string;
  x: string;
  y: string;
  delay: string;
  duration: string;
  color: string;
  size: string;
};

type RankingAlertViewModel = {
  alertId: string;
  kind: 'new-entry' | 'overtake';
  currentRank: number;
  previousRank: number | null;
  winnerRankDelta: number | null;
  winner: RankingAlertPlayer;
  loser: RankingAlertPlayer | null;
};

type RankingAlertRankSlotMode = 'entry' | 'overtake';

function RankingAlertHeadlineName({
  children,
  tone,
}: {
  children: string;
  tone: 'winner' | 'loser';
}): React.ReactElement {
  return (
    <span className={`ranking-alert__headline-name ranking-alert__headline-name--${tone}`}>
      {children}
    </span>
  );
}

function RankingAlertHeadlineRank({
  rank,
  language,
}: {
  rank: number;
  language: Language;
}): React.ReactElement {
  if (language === 'en') {
    return (
      <span className="ranking-alert__headline-rank">
        {'#'}
        <span className="ranking-alert__headline-rank-number">{rank}</span>
        {' on the daily overall ranking'}
      </span>
    );
  }

  if (language === 'ja') {
    return (
      <span className="ranking-alert__headline-rank">
        {'デイリー総合ランキング'}
        <span className="ranking-alert__headline-rank-number">{rank}</span>
        {'位'}
      </span>
    );
  }

  return (
    <span className="ranking-alert__headline-rank">
      {'일간 전체 랭킹 '}
      <span className="ranking-alert__headline-rank-number">{rank}</span>
      {'위'}
    </span>
  );
}

function renderRankingAlertHeadline(
  alert: RankingAlertViewModel,
  language: Language,
): React.ReactNode {
  const rankNode = <RankingAlertHeadlineRank rank={alert.currentRank} language={language} />;

  if (alert.kind === 'overtake' && alert.loser) {
    if (language === 'en') {
      return (
        <>
          <RankingAlertHeadlineName tone="winner">{alert.winner.nickname}</RankingAlertHeadlineName>
          {' overtook '}
          <RankingAlertHeadlineName tone="loser">{alert.loser.nickname}</RankingAlertHeadlineName>
          {' and reached '}
          {rankNode}
          {'!'}
        </>
      );
    }

    if (language === 'ja') {
      return (
        <>
          <RankingAlertHeadlineName tone="winner">{alert.winner.nickname}</RankingAlertHeadlineName>
          {'さんが'}
          <RankingAlertHeadlineName tone="loser">{alert.loser.nickname}</RankingAlertHeadlineName>
          {'さんを抜いて '}
          {rankNode}
          {'を達成しました！'}
        </>
      );
    }

    return (
      <>
        <RankingAlertHeadlineName tone="winner">{alert.winner.nickname}</RankingAlertHeadlineName>
        {'님이 '}
        <RankingAlertHeadlineName tone="loser">{alert.loser.nickname}</RankingAlertHeadlineName>
        {'님을 제치고 '}
        {rankNode}
        {'를 달성했습니다!'}
      </>
    );
  }

  if (language === 'en') {
    return (
      <>
        <RankingAlertHeadlineName tone="winner">{alert.winner.nickname}</RankingAlertHeadlineName>
        {' reached '}
        {rankNode}
        {'!'}
      </>
    );
  }

  if (language === 'ja') {
    return (
      <>
        <RankingAlertHeadlineName tone="winner">{alert.winner.nickname}</RankingAlertHeadlineName>
        {'さんが '}
        {rankNode}
        {'を達成しました！'}
      </>
    );
  }

  return (
    <>
      <RankingAlertHeadlineName tone="winner">{alert.winner.nickname}</RankingAlertHeadlineName>
      {'님이 '}
      {rankNode}
      {'를 달성했습니다!'}
    </>
  );
}

function formatRankDisplay(rank: number | null): string {
  if (rank === null) {
    return '-';
  }

  if (rank <= 3) {
    return RANK_BADGE[rank] ?? String(rank);
  }

  return String(rank);
}

function createParticles(): RankingAlertParticle[] {
  const palette = ['#ef4444', '#f97316', '#facc15'];

  return Array.from({ length: 22 }, (_, index) => ({
    id: `particle-${index}`,
    x: `${Math.round((Math.random() * 280) - 140)}px`,
    y: `${Math.round((Math.random() * -220) + 52)}px`,
    delay: `${Math.round(Math.random() * 110)}ms`,
    duration: `${680 + Math.round(Math.random() * 260)}ms`,
    color: palette[Math.floor(Math.random() * palette.length)] ?? '#facc15',
    size: `${9 + Math.round(Math.random() * 7)}px`,
  }));
}

function readSeenRankingAlerts(): SeenRankingAlertRecord[] {
  try {
    const rawValue = window.localStorage.getItem(SEEN_ALERT_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as SeenRankingAlertRecord[];
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

function writeSeenRankingAlerts(records: SeenRankingAlertRecord[]): void {
  try {
    window.localStorage.setItem(SEEN_ALERT_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // localStorage를 사용할 수 없는 환경에서는 현재 세션 중복 방지만 적용한다.
  }
}

function hasSeenRankingAlert(alertId: string): boolean {
  return readSeenRankingAlerts().some((record) => record.id === alertId);
}

function markSeenRankingAlert(alertId: string): void {
  const records = readSeenRankingAlerts().filter((record) => record.id !== alertId);
  writeSeenRankingAlerts([...records, { id: alertId, seenAt: Date.now() }].slice(-120));
}

function normalizeAlert(alert: RankingAlertResponse): RankingAlertViewModel {
  const previousRank = typeof alert.previousRank === 'number' ? alert.previousRank : null;
  const winnerRankDelta = typeof alert.winnerRankDelta === 'number' ? alert.winnerRankDelta : null;
  const loser = alert.loser ?? null;
  const kind = alert.kind === 'overtake' && loser ? 'overtake' : 'new-entry';

  return {
    alertId: alert.alertId,
    kind,
    currentRank: alert.currentRank,
    previousRank,
    winnerRankDelta,
    winner: alert.winner,
    loser,
  };
}

function toRankingRecord(player: RankingAlertPlayer): RankingRecord {
  return {
    id: 0,
    accountId: player.accountId,
    nickname: player.nickname,
    profileImageUrl: player.profileImageUrl,
    nationality: player.nationality,
    periodType: 'daily',
    difficulty: 'all',
    elapsedMs: player.elapsedMs,
    targetWord: player.targetWord,
    startDoc: player.startDoc,
    pathLength: player.pathLength,
    createdAt: new Date().toISOString(),
  };
}

function wrapCardByRank(rank: number, card: React.ReactElement): React.ReactElement {
  if (rank <= 3) {
    return <RankingMedalFrame rank={rank}>{card}</RankingMedalFrame>;
  }

  return card;
}

function buildPathLabel(item: RankingAlertPlayer, stepsLabel: string): React.ReactNode {
  return (
    <span className="ranking-alert__path">
      <span className="truncate">{item.startDoc}</span>
      <span className="ranking-alert__path-separator">-&gt;</span>
      <span className="shrink-0">{stepsLabel.replace('{{count}}', String(item.pathLength))}</span>
      <span className="ranking-alert__path-separator">-&gt;</span>
      <span className="truncate">{item.targetWord}</span>
    </span>
  );
}

function RankingAlertRankSlot({
  fromRank,
  toRank,
  tagText,
  tagVariant,
  mode,
  showArrow,
  className = '',
}: {
  fromRank: number | null;
  toRank: number;
  tagText: string;
  tagVariant: 'new' | 'up' | 'down';
  mode: RankingAlertRankSlotMode;
  showArrow?: boolean;
  className?: string;
}): React.ReactElement {
  const shouldShowArrow = showArrow ?? (mode === 'overtake' && fromRank !== null && fromRank !== toRank);

  return (
    <div className={['ranking-alert__rank-slot', className].join(' ')}>
      <div className="ranking-alert__rank-main">
        <span className="ranking-alert__rank-before">{formatRankDisplay(fromRank)}</span>
        <span className="ranking-alert__rank-after">{formatRankDisplay(toRank)}</span>
      </div>
      {shouldShowArrow ? <span className="ranking-alert__rank-arrow">{'→'}</span> : null}
      <span className={`ranking-alert__tag ranking-alert__tag--${tagVariant}`}>{tagText}</span>
    </div>
  );
}

function RankingAlertStaticRankSlot({
  rank,
}: {
  rank: number;
}): React.ReactElement {
  return (
    <div className="ranking-alert__rank-slot ranking-alert__rank-slot--static">
      <span className="ranking-alert__rank-current">{formatRankDisplay(rank)}</span>
    </div>
  );
}

function RankingAlertParticles({
  className = '',
}: {
  className?: string;
}): React.ReactElement {
  const [particles] = useState<RankingAlertParticle[]>(() => createParticles());

  return (
    <div className={['ranking-alert__particles', className].join(' ')} aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="ranking-alert__particle"
          style={{
            '--ranking-particle-x': particle.x,
            '--ranking-particle-y': particle.y,
            '--ranking-particle-delay': particle.delay,
            '--ranking-particle-duration': particle.duration,
            '--ranking-particle-color': particle.color,
            '--ranking-particle-size': particle.size,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function RankingAlertCardVisual({
  player,
  rank,
  className = '',
  rankSlot,
}: {
  player: RankingAlertPlayer;
  rank: number;
  className?: string;
  rankSlot: React.ReactNode;
}): React.ReactElement {
  const { t } = useTranslation();
  const card = (
    <RankingCardDisplay
      record={toRankingRecord(player)}
      rank={rank}
      className={className}
      rankSlot={rankSlot}
      infoLine={buildPathLabel(player, t('ranking.steps'))}
      trailingSlot={(
        <span className="ranking-time-pill">
          {formatRankingMs(player.elapsedMs)}
        </span>
      )}
    />
  );

  return wrapCardByRank(rank, card);
}

function RankingAlertEntryScene({
  alert,
}: {
  alert: RankingAlertViewModel;
}): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="ranking-alert__scene ranking-alert__scene--entry">
      <div className="ranking-alert__stage ranking-alert__stage--entry">
        <RankingAlertParticles className="ranking-alert__particles--entry" />

        <div className="ranking-alert__entry-card">
          <RankingAlertCardVisual
            player={alert.winner}
            rank={alert.currentRank}
            className="ranking-alert__card-surface ranking-alert__card-surface--entry"
            rankSlot={(
              <RankingAlertRankSlot
                fromRank={null}
                toRank={alert.currentRank}
                tagText={t('ranking.alertNewBadge')}
                tagVariant="new"
                mode="entry"
                showArrow={false}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

function RankingAlertOvertakeScene({
  alert,
}: {
  alert: RankingAlertViewModel;
}): React.ReactElement {
  const { t } = useTranslation();
  const loser = alert.loser;

  if (!loser) {
    return <RankingAlertEntryScene alert={alert} />;
  }

  const loserFromRank = alert.currentRank;
  const loserToRank = alert.currentRank + 1;
  const winnerIsNewEntry = alert.previousRank === null;
  const winnerFromRank = winnerIsNewEntry ? null : alert.previousRank;
  const winnerDelta = alert.winnerRankDelta ?? 0;
  const winnerTagText = winnerIsNewEntry
    ? t('ranking.alertNewBadge')
    : `▲ ${winnerDelta}`;
  const winnerTagVariant = winnerIsNewEntry ? 'new' : 'up';
  const winnerMode: RankingAlertRankSlotMode = winnerIsNewEntry ? 'entry' : 'overtake';

  return (
    <div className="ranking-alert__scene ranking-alert__scene--overtake">
      <div className="ranking-alert__stage ranking-alert__stage--overtake">
        <div className="ranking-alert__lane ranking-alert__lane--top">
          <div className="ranking-alert__overtake-loser-track">
            <div className="ranking-alert__overtake-loser-layer ranking-alert__overtake-loser-layer--initial">
              <RankingAlertCardVisual
                player={loser}
                rank={loserFromRank}
                className="ranking-alert__card-surface ranking-alert__card-surface--loser-initial"
                rankSlot={<RankingAlertStaticRankSlot rank={loserFromRank} />}
              />
            </div>

            <div className="ranking-alert__overtake-loser-layer ranking-alert__overtake-loser-layer--final">
              <RankingAlertCardVisual
                player={loser}
                rank={loserToRank}
                className="ranking-alert__card-surface ranking-alert__card-surface--loser-final"
                rankSlot={(
                  <RankingAlertRankSlot
                    fromRank={loserFromRank}
                    toRank={loserToRank}
                    tagText="▼ 1"
                    tagVariant="down"
                    mode="overtake"
                    showArrow={false}
                  />
                )}
              />
            </div>
          </div>

          <RankingAlertParticles className="ranking-alert__particles--winner" />

          <div className="ranking-alert__overtake-winner-wrap">
            <RankingAlertCardVisual
              player={alert.winner}
              rank={alert.currentRank}
              className="ranking-alert__card-surface ranking-alert__card-surface--winner"
              rankSlot={(
                <RankingAlertRankSlot
                  fromRank={winnerFromRank}
                  toRank={alert.currentRank}
                  tagText={winnerTagText}
                  tagVariant={winnerTagVariant}
                  mode={winnerMode}
                  showArrow={false}
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RankingAlertOverlay(): React.ReactElement | null {
  const { t, language } = useTranslation();
  const status = useRankingAlertStore((state) => state.status);
  const current = useRankingAlertStore((state) => state.current);
  const queueLength = useRankingAlertStore((state) => state.queue.length);
  const enqueue = useRankingAlertStore((state) => state.enqueue);
  const startNext = useRankingAlertStore((state) => state.startNext);
  const requestExit = useRankingAlertStore((state) => state.requestExit);
  const finishExit = useRankingAlertStore((state) => state.finishExit);
  const markHandled = useRankingAlertStore((state) => state.markHandled);
  const initializedIdsRef = useRef<Set<string>>(new Set());
  const hasInitializedRef = useRef(false);
  const wasDisabledRef = useRef(false);
  const rankingAlertEnabled = useSettingsStore((s) => s.rankingAlertEnabled);

  const { data } = useQuery<RankingAlertResponse[]>({
    queryKey: ['rankingAlerts', 'recent'],
    queryFn: getRecentRankingAlerts,
    refetchInterval: 1000 * 15,
    staleTime: 0,
    enabled: rankingAlertEnabled,
  });

  useEffect(() => {
    if (!rankingAlertEnabled) {
      useRankingAlertStore.setState({ status: 'idle', current: null, queue: [] });
      initializedIdsRef.current = new Set();
      hasInitializedRef.current = false;
      wasDisabledRef.current = true;
    }
  }, [rankingAlertEnabled]);

  useEffect(() => {
    if (!data) {
      return;
    }

    const nextIds = new Set(data.map((item) => item.alertId));
    if (!hasInitializedRef.current) {
      wasDisabledRef.current = false;
      initializedIdsRef.current = nextIds;
      hasInitializedRef.current = true;
      return;
    }

    data
      .filter((item) => !initializedIdsRef.current.has(item.alertId))
      .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
      .forEach((item) => {
        if (hasSeenRankingAlert(item.alertId)) {
          markHandled(item.alertId);
          return;
        }

        markSeenRankingAlert(item.alertId);
        enqueue(item);
      });

    initializedIdsRef.current = nextIds;
  }, [data, enqueue, markHandled]);

  useEffect(() => {
    if (!rankingAlertEnabled || status !== 'idle' || queueLength === 0) {
      return;
    }

    const timerId = window.setTimeout(startNext, START_DELAY_MS);
    return () => window.clearTimeout(timerId);
  }, [rankingAlertEnabled, queueLength, startNext, status]);

  useEffect(() => {
    if (status !== 'showing' || !current) {
      return;
    }

    if (!hasSeenRankingAlert(current.alertId)) {
      markSeenRankingAlert(current.alertId);
    }

    const timerId = window.setTimeout(requestExit, SHOWING_DURATION_MS);
    return () => window.clearTimeout(timerId);
  }, [current, requestExit, status]);

  useEffect(() => {
    if (status !== 'exiting') {
      return;
    }

    const timerId = window.setTimeout(finishExit, EXIT_DURATION_MS);
    return () => window.clearTimeout(timerId);
  }, [finishExit, status]);

  if (!rankingAlertEnabled || !current) {
    return null;
  }

  const alert = normalizeAlert(current);
  return (
    <button
      type="button"
      aria-label={t('ranking.alertSkip')}
      className={`ranking-alert ranking-alert--${status}`}
      onClick={requestExit}
    >
      <p className="ranking-alert__headline">
        {renderRankingAlertHeadline(alert, language)}
      </p>

      {alert.kind === 'overtake' && alert.loser ? (
        <RankingAlertOvertakeScene alert={alert} />
      ) : (
        <RankingAlertEntryScene alert={alert} />
      )}
    </button>
  );
}
