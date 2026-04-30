import { confirmAccountTransferDonation, getProfileImageUrl, usePendingAccountTransferDonations } from '@features';
import { ProfileAvatar, getTokenStorage, queryClient, useAuthStore, useDialog, useToast, useTranslation } from '@shared';
import { toDonationAlertFromPendingItem, useDonationAlertStore } from '../lib/donationAlert';
import { AnonymousSupporterIcon } from '../lib/donationSupport';

function formatDonationDate(receivedAt: string, language: string): string {
  const locale = language === 'ko'
    ? 'ko-KR'
    : language === 'ja'
      ? 'ja-JP'
      : language === 'zh'
        ? 'zh-CN'
      : 'en-US';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(receivedAt));
}

function resolvePendingSupporterDisplayName(
  supporterName: string | null,
  isAnonymous: boolean | null,
  anonymousLabel: string,
): string {
  if (isAnonymous === true) {
    return anonymousLabel;
  }

  return supporterName ?? anonymousLabel;
}

function resolvePendingAccountNick(
  accountNick: string | null,
  loggedOutLabel: string,
): string {
  return accountNick ?? loggedOutLabel;
}

export function DonationPendingListWidget(): React.ReactElement | null {
  const { t, language } = useTranslation();
  const { showConfirm } = useDialog();
  const toast = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.accountInfo?.is_admin === true);
  const canLoadPendingDonations = isAuthenticated && isAdmin && !!getTokenStorage().getAccessToken();
  const { data, isLoading, isError } = usePendingAccountTransferDonations(canLoadPendingDonations);
  const enqueueDonationAlert = useDonationAlertStore((state) => state.enqueue);

  if (!canLoadPendingDonations) {
    return null;
  }

  const handleConfirm = (donation: NonNullable<typeof data>[number]): void => {
    showConfirm({
      title: t('donation.pendingConfirmTitle'),
      message: t('donation.pendingConfirmMessage'),
      confirmText: t('donation.pendingConfirmButton'),
      onConfirm: () => {
        void (async () => {
          try {
            await confirmAccountTransferDonation(donation.donationId);
            enqueueDonationAlert(toDonationAlertFromPendingItem(donation, t('donation.anonymous')));
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ['donations', 'all'] }),
              queryClient.invalidateQueries({ queryKey: ['donations', 'latest'] }),
              queryClient.invalidateQueries({ queryKey: ['donations', 'pending-account-transfer'] }),
            ]);
            toast.success(t('donation.pendingConfirmSuccess'));
          } catch (error) {
            console.error(error);
            toast.error(t('donation.pendingConfirmError'));
          }
        })();
      },
    });
  };

  return (
    <section className="rounded-4xl bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:bg-gray-900/80 dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:p-8">
      <p className="text-xs font-black tracking-[0.22em] text-amber-700 dark:text-amber-300">
        {t('donation.pendingEyebrow')}
      </p>
      <h2 className="mt-3 text-2xl font-black tracking-tight text-gray-900 dark:text-white">
        {t('donation.pendingTitle')}
      </h2>

      {isLoading ? (
        <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
          {t('donation.loading')}
        </p>
      ) : null}

      {isError ? (
        <p className="mt-5 text-sm text-rose-600 dark:text-rose-300">
          {t('donation.pendingError')}
        </p>
      ) : null}

      {!isLoading && !isError && (data?.length ?? 0) === 0 ? (
        <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
          {t('donation.pendingEmpty')}
        </p>
      ) : null}

      {!isLoading && !isError && (data?.length ?? 0) > 0 ? (
        <div className="mt-5 space-y-3">
          {data?.map((donation) => {
            const supporterDisplayName = resolvePendingSupporterDisplayName(
              donation.supporterName,
              donation.isAnonymous,
              t('donation.anonymous'),
            );
            const accountNickDisplay = resolvePendingAccountNick(
              donation.accountNick,
              t('donation.pendingLoggedOutAccountNick'),
            );
            const useAnonymousIcon = donation.isAnonymous === true;
            const useLetterFallback = !useAnonymousIcon && donation.isAccountLinkedDisplay !== true;
            const profileImageUrl = useLetterFallback
              ? null
              : getProfileImageUrl(donation.accountProfileImgUrl);

            return (
              <article
                key={donation.donationId}
                className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/80"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      imageUrl={profileImageUrl}
                      name={supporterDisplayName}
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
                        {supporterDisplayName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t('donation.pendingAccountNick')}: {accountNickDisplay}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t('donation.pendingRemitterName')}: {donation.remitterName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t('donation.pendingCoffeeCount', { count: donation.coffeeCount })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-amber-700 dark:text-amber-300">
                      {donation.amount} {donation.currency}
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {formatDonationDate(donation.receivedAt, language)}
                    </p>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {donation.message ?? ''}
                </p>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleConfirm(donation)}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300"
                  >
                    {t('donation.pendingConfirmButton')}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
