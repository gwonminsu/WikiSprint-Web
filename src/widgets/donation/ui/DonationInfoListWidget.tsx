import { useEffect, useState } from 'react';
import {
  censorDonationMessage,
  censorDonationSupporterName,
  deleteDonation,
  getDonationReportSummary,
  getProfileImageUrl,
  replayDonationAlert,
  resolveDonationReports,
  useAllDonations,
} from '@features';
import { getTokenStorage, ProfileAvatar, queryClient, useAuthStore, useDialog, useToast, useTranslation } from '@shared';
import type { DonationListItem, ReportSummary } from '@/entities';
import { ReportModal } from '@/widgets/report';
import {
  AnonymousSupporterIcon,
  getDonationTierGlowClass,
  isRainbowDonationTier,
  normalizeDonationType,
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
  const [reportDonation, setReportDonation] = useState<DonationListItem | null>(null);
  const [expandedDonationId, setExpandedDonationId] = useState<string | null>(null);
  const [reportSummaries, setReportSummaries] = useState<Record<string, ReportSummary>>({});
  const [moderatingIds, setModeratingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAdmin || !data || data.length === 0) {
      return;
    }

    const missingDonationIds = data
      .map((donation) => donation.donationId)
      .filter((donationId) => !reportSummaries[donationId]);

    if (missingDonationIds.length === 0) {
      return;
    }

    void Promise.allSettled(
      missingDonationIds.map(async (donationId) => ({
        donationId,
        summary: await getDonationReportSummary(donationId),
      })),
    ).then((results) => {
      setReportSummaries((prev) => {
        const next = { ...prev };
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            next[result.value.donationId] = result.value.summary;
          }
        });
        return next;
      });
    });
  }, [data, isAdmin, reportSummaries]);

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

  const toggleAdminPanel = (donationId: string): void => {
    if (!isAdmin) {
      return;
    }

    setExpandedDonationId((current) => current === donationId ? null : donationId);
    if (!reportSummaries[donationId]) {
      void getDonationReportSummary(donationId)
        .then((summary) => setReportSummaries((prev) => ({ ...prev, [donationId]: summary })))
        .catch(() => toast.error(t('report.summaryError')));
    }
  };

  const runDonationAction = (donationId: string, action: () => Promise<string | null>): void => {
    setModeratingIds((prev) => new Set(prev).add(donationId));
    void action()
      .then((message) => {
        toast.success(message ?? t('common.success'));
        void queryClient.invalidateQueries({ queryKey: ['donations', 'all'] });
        void getDonationReportSummary(donationId)
          .then((summary) => setReportSummaries((prev) => ({ ...prev, [donationId]: summary })))
          .catch(() => undefined);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : t('common.error'));
      })
      .finally(() => {
        setModeratingIds((prev) => {
          const next = new Set(prev);
          next.delete(donationId);
          return next;
        });
      });
  };

  const renderReportSummary = (summary: ReportSummary | undefined): React.ReactElement => {
    if (!summary) {
      return <p className="text-xs text-gray-500 dark:text-gray-400">{t('report.loadingSummary')}</p>;
    }

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <span className="rounded-2xl bg-white px-3 py-2 font-bold text-gray-600 dark:bg-gray-900 dark:text-gray-300">
            {t('report.reason.PROFILE_IMAGE')}: {summary.profileImageCount}
          </span>
          <span className="rounded-2xl bg-white px-3 py-2 font-bold text-gray-600 dark:bg-gray-900 dark:text-gray-300">
            {t('report.reason.NICKNAME')}: {summary.nicknameCount}
          </span>
          <span className="rounded-2xl bg-white px-3 py-2 font-bold text-gray-600 dark:bg-gray-900 dark:text-gray-300">
            {t('report.reason.DONATION_CONTENT')}: {summary.donationContentCount}
          </span>
          <span className="rounded-2xl bg-white px-3 py-2 font-bold text-gray-600 dark:bg-gray-900 dark:text-gray-300">
            {t('report.reason.OTHER')}: {summary.otherCount}
          </span>
        </div>
        {summary.otherDetails.length > 0 ? (
          <ul className="overflow-hidden rounded-2xl border border-gray-200 bg-white text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            {summary.otherDetails.map((detail, index) => (
              <li
                key={`${detail}-${index}`}
                className={[
                  'flex gap-3 px-3 py-3',
                  index > 0 ? 'border-t border-gray-200 dark:border-gray-700' : '',
                ].join(' ')}
              >
                <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-600 dark:bg-rose-400/15 dark:text-rose-200">
                  {index + 1}
                </span>
                <span className="min-w-0 leading-relaxed">{detail}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  };

  const refreshDonationSummary = async (donationId: string): Promise<void> => {
    const summary = await getDonationReportSummary(donationId);
    setReportSummaries((prev) => ({ ...prev, [donationId]: summary }));
    await queryClient.invalidateQueries({ queryKey: ['donations', 'all'] });
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
            const useAnonymousIcon = donation.isAnonymous === true;
            const useLetterFallback = !useAnonymousIcon && donation.isAccountLinkedDisplay !== true;
            const profileImageUrl = useLetterFallback
              ? null
              : getProfileImageUrl(donation.accountProfileImgUrl);
            const pendingReportCount = reportSummaries[donation.donationId]?.totalPendingCount ?? 0;
            const isExpanded = expandedDonationId === donation.donationId;
            const canRestoreLinkedNickname = donation.isAccountLinkedDisplay === true
              && donation.supporterName === 'BadNameSupporter'
              && !!donation.accountNick?.trim();

            const article = (
              <article
                onClick={() => toggleAdminPanel(donation.donationId)}
                className={`rounded-3xl border bg-white/90 p-4 shadow-sm dark:bg-gray-900/80 ${isAdmin ? 'cursor-pointer' : ''} ${glowClass} ${
                  useLetterFallback ? 'border-slate-300/80 dark:border-slate-600' : ''
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
                      <p className="flex flex-wrap items-center gap-2 text-sm font-black text-gray-900 dark:text-white">
                        <span>{displayName}</span>
                        {isAdmin && donation.isAccountLinkedDisplay === true ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black tracking-[0.08em] text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
                            {t('donation.accountLinkedBadge')}
                          </span>
                        ) : null}
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
                      <div className="flex items-center justify-end gap-2">
                        {pendingReportCount > 0 ? (
                          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-600 dark:bg-rose-400/15 dark:text-rose-200">
                            {pendingReportCount > 99 ? '99+' : pendingReportCount}
                          </span>
                        ) : null}
                        <svg
                          className={`ranking-chevron shrink-0 text-xs text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    ) : null}
                    {isAdmin ? (
                      <p className="mt-2 text-sm font-black text-amber-700 dark:text-amber-300">
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
                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleReplayAlert(donation.donationId);
                          }}
                          disabled={replayingIds.has(donation.donationId)}
                          className="inline-flex items-center justify-center rounded-2xl border border-amber-300/80 bg-amber-100/80 px-3 py-2 text-xs font-black text-amber-800 shadow-sm transition-colors hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-400/40 dark:bg-amber-400/15 dark:text-amber-200 dark:hover:bg-amber-400/25"
                        >
                          {replayingIds.has(donation.donationId)
                            ? t('donation.replayAlertPending')
                            : t('donation.replayAlertButton')}
                        </button>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setReportDonation(donation);
                      }}
                      aria-label="🚨"
                      title="🚨"
                      className="mt-2 inline-flex appearance-none items-center justify-center bg-transparent px-1 py-1 text-sm leading-none text-rose-600 transition-colors hover:text-rose-700 dark:text-rose-200 dark:hover:text-rose-100"
                    >
                      🚨
                    </button>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {donation.message ?? ''}
                </p>
                {isAdmin ? (
                  <div
                    className={[
                      'ranking-expand-wrapper',
                      isExpanded ? 'ranking-expand-wrapper--open' : 'ranking-expand-wrapper--closed',
                    ].join(' ')}
                  >
                    <div className="ranking-expand-inner">
                      <div className="ranking-expand-panel">
                        <div className="mb-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={moderatingIds.has(donation.donationId)}
                            onClick={(event) => {
                              event.stopPropagation();
                              showConfirm({
                                title: canRestoreLinkedNickname
                                  ? t('donation.adminRestoreAccountNicknameConfirmTitle')
                                  : t('donation.adminCensorSupporterNameConfirmTitle'),
                                message: canRestoreLinkedNickname
                                  ? t('donation.adminRestoreAccountNicknameConfirmMessage')
                                  : t('donation.adminCensorSupporterNameConfirmMessage'),
                                confirmText: canRestoreLinkedNickname
                                  ? t('donation.adminRestoreAccountNickname')
                                  : t('donation.adminCensorSupporterName'),
                                onConfirm: () => runDonationAction(donation.donationId, () => censorDonationSupporterName(donation.donationId)),
                              });
                            }}
                            className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-black text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
                          >
                            {canRestoreLinkedNickname
                              ? t('donation.adminRestoreAccountNickname')
                              : t('donation.adminCensorSupporterName')}
                          </button>
                          <button
                            type="button"
                            disabled={moderatingIds.has(donation.donationId)}
                            onClick={(event) => {
                              event.stopPropagation();
                              showConfirm({
                                title: t('donation.adminCensorMessageConfirmTitle'),
                                message: t('donation.adminCensorMessageConfirmMessage'),
                                confirmText: t('donation.adminCensorMessage'),
                                onConfirm: () => runDonationAction(donation.donationId, () => censorDonationMessage(donation.donationId)),
                              });
                            }}
                            className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-black text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
                          >
                            {t('donation.adminCensorMessage')}
                          </button>
                          <button
                            type="button"
                            disabled={moderatingIds.has(donation.donationId)}
                            onClick={(event) => {
                              event.stopPropagation();
                              showConfirm({
                                title: t('donation.adminResolveConfirmTitle'),
                                message: t('donation.adminResolveConfirmMessage'),
                                confirmText: t('report.resolve'),
                                onConfirm: () => runDonationAction(donation.donationId, () => resolveDonationReports(donation.donationId)),
                              });
                            }}
                            className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-black text-white disabled:opacity-60"
                          >
                            {t('report.resolve')}
                          </button>
                          <button
                            type="button"
                            disabled={moderatingIds.has(donation.donationId)}
                            onClick={(event) => {
                              event.stopPropagation();
                              showConfirm({
                                title: t('donation.adminDeleteTitle'),
                                message: t('donation.adminDeleteMessage'),
                                confirmText: t('donation.adminDelete'),
                                onConfirm: () => runDonationAction(donation.donationId, () => deleteDonation(donation.donationId)),
                              });
                            }}
                            className="rounded-2xl bg-rose-600 px-3 py-2 text-xs font-black text-white disabled:opacity-60"
                          >
                            {t('donation.adminDelete')}
                          </button>
                        </div>
                        {renderReportSummary(reportSummaries[donation.donationId])}
                      </div>
                    </div>
                  </div>
                ) : null}
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
      <ReportModal
        isOpen={reportDonation !== null}
        targetNick={reportDonation ? resolveDonationInfoDisplayName(
          reportDonation.supporterName,
          reportDonation.accountNick,
          reportDonation.isAnonymous,
          t('donation.anonymous'),
        ) : ''}
        targetType="DONATION"
        targetAccountId={reportDonation?.isAccountLinkedDisplay ? reportDonation.accountId : null}
        targetDonationId={reportDonation?.donationId ?? null}
        allowDonationContentReason
        onSubmitted={reportDonation && isAdmin ? () => refreshDonationSummary(reportDonation.donationId) : undefined}
        onClose={() => setReportDonation(null)}
      />
    </section>
  );
}
