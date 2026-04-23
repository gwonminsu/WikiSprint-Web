import { useState } from 'react';
import { getProfileImageUrl, replayDonationAlert, useAllDonations } from '@features';
import { getTokenStorage, ProfileAvatar, queryClient, useAuthStore, useDialog, useToast, useTranslation } from '@shared';
import {
  AnonymousSupporterIcon,
  getDonationTierGlowClass,
  isRainbowDonationTier,
  normalizeDonationType,
  shouldUseAnonymousDonationAvatar,
} from '../lib/donationSupport';

function formatDonationDate(receivedAt: string, language: string): string {
  const locale = language === 'ko'
    ? 'ko-KR'
    : language === 'ja'
      ? 'ja-JP'
      : 'en-US';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(receivedAt));
}

function formatDonationAmount(amount: string | null, currency: string | null, fallback: string): string {
  if (!amount && !currency) {
    return fallback;
  }

  return [amount, currency].filter(Boolean).join(' ');
}

function resolveDonationInfoDisplayName(
  supporterName: string | null,
  accountNick: string | null,
  isAnonymous: boolean | null,
  anonymousLabel: string,
): string {
  if (isAnonymous === true) {
    return anonymousLabel;
  }

  return supporterName ?? accountNick ?? anonymousLabel;
}

// 후원 정보 페이지에서 전체 후원 목록을 표시한다.
export function DonationInfoListWidget(): React.ReactElement {
  const { t, language } = useTranslation();
  const { showConfirm } = useDialog();
  const toast = useToast();
  const accountInfo = useAuthStore((state) => state.accountInfo);
  const { data, isLoading, isError } = useAllDonations();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = isAuthenticated && accountInfo?.is_admin === true && !!getTokenStorage().getAccessToken();
  const [replayingIds, setReplayingIds] = useState<Set<string>>(new Set());

  const handleReplayAlert = (donationId: string): void => {
    showConfirm({
      title: t('donation.replayAlertConfirmTitle'),
      message: t('donation.replayAlertConfirmMessage'),
      confirmText: t('donation.replayAlertConfirmButton'),
      onConfirm: () => {
        setReplayingIds((prev) => new Set(prev).add(donationId));

        void replayDonationAlert(donationId)
          .then((message) => {
            void queryClient.invalidateQueries({ queryKey: ['donations', 'alerts', 'replays', 'recent'] });
            toast.success(message ?? t('donation.replayAlertSuccess'));
          })
          .catch(() => {
            toast.error(t('donation.replayAlertError'));
          })
          .finally(() => {
            setReplayingIds((prev) => {
              const next = new Set(prev);
              next.delete(donationId);
              return next;
            });
          });
      },
    });
  };

  return (
    <section className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/80 dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.18em] text-gray-400 dark:text-gray-500">
            {t('donation.listEyebrow')}
          </p>
          <h2 className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
            {t('donation.pageTitle')}
          </h2>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500 shadow-sm dark:bg-gray-900 dark:text-gray-300">
          {t('donation.allBadge')}
        </span>
      </div>

      {isLoading ? (
        <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
          {t('donation.loading')}
        </p>
      ) : null}

      {isError ? (
        <p className="mt-5 text-sm text-rose-600 dark:text-rose-300">
          {t('donation.error')}
        </p>
      ) : null}

      {!isLoading && !isError && (data?.length ?? 0) === 0 ? (
        <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
          {t('donation.empty')}
        </p>
      ) : null}

      {!isLoading && !isError && (data?.length ?? 0) > 0 ? (
        <div className="mt-5 space-y-3">
          {data?.map((donation) => {
            const displayName = resolveDonationInfoDisplayName(
              donation.supporterName,
              donation.accountNick,
              donation.isAnonymous,
              t('donation.anonymous'),
            );
            const glowClass = getDonationTierGlowClass(donation);
            const isRainbowTier = isRainbowDonationTier(donation);
            const useAnonymousAvatar = shouldUseAnonymousDonationAvatar(
              donation.accountNick,
              donation.supporterName,
              donation.isAnonymous,
            );
            const useAnonymousIcon = donation.isAnonymous === true;
            const profileImageUrl = useAnonymousAvatar
              ? null
              : getProfileImageUrl(donation.accountProfileImgUrl);

            const article = (
              <article
                className={`rounded-3xl border bg-white/90 p-4 shadow-sm dark:bg-gray-900/80 ${glowClass} ${
                  useAnonymousAvatar ? 'border-slate-300/80 dark:border-slate-600' : ''
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      imageUrl={profileImageUrl}
                      name={displayName}
                      size="md"
                      className={`h-11 w-11 rounded-2xl ${
                        useAnonymousIcon
                          ? 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                          : ''
                      }`}
                      fallbackContent={useAnonymousIcon ? <AnonymousSupporterIcon /> : undefined}
                    />

                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white">
                        {displayName}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                        {normalizeDonationType(donation.type, {
                          oneTime: t('donation.typeOneTime'),
                          monthly: t('donation.typeMonthly'),
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {isAdmin ? (
                      <p className="text-sm font-black text-amber-700 dark:text-amber-300">
                        {formatDonationAmount(
                          donation.amount,
                          donation.currency,
                          t('donation.amountFallback'),
                        )}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {formatDonationDate(donation.receivedAt, language)}
                    </p>
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => handleReplayAlert(donation.donationId)}
                        disabled={replayingIds.has(donation.donationId)}
                        className="mt-3 inline-flex items-center justify-center rounded-2xl border border-amber-300/80 bg-amber-100/80 px-3 py-2 text-xs font-black text-amber-800 shadow-sm transition-colors hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-400/40 dark:bg-amber-400/15 dark:text-amber-200 dark:hover:bg-amber-400/25"
                      >
                        {replayingIds.has(donation.donationId)
                          ? t('donation.replayAlertPending')
                          : t('donation.replayAlertButton')}
                      </button>
                    ) : null}
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {donation.message ?? t('donation.noMessage')}
                </p>
              </article>
            );

            return isRainbowTier ? (
              <div
                key={donation.donationId}
                className="donation-tier-rainbow rounded-3xl p-[1.5px]"
              >
                <div className="rounded-3xl bg-white dark:bg-gray-900">
                  {article}
                </div>
              </div>
            ) : (
              <div key={donation.donationId}>
                {article}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
