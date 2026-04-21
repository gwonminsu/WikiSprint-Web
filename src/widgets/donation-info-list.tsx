import { useAllDonations } from '@features';
import { ProfileAvatar, useTranslation } from '@shared';
import {
  AnonymousSupporterIcon,
  normalizeDonationType,
  resolveDonationDisplayName,
} from './donation-support';

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

// 임시 위젯: 후원정보 페이지에서 전체 후원 목록을 간단히 표시한다.
export function DonationInfoListWidget(): React.ReactElement {
  const { t, language } = useTranslation();
  const { data, isLoading, isError } = useAllDonations();

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
            const displayName = resolveDonationDisplayName(donation, t('donation.anonymous'));

            return (
              <article
                key={donation.donationId}
                className="rounded-3xl border border-white bg-white/90 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/80"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      imageUrl={donation.isAnonymous === true ? null : donation.accountProfileImgUrl}
                      name={displayName}
                      size="md"
                      className="h-11 w-11 rounded-2xl"
                      fallbackContent={donation.isAnonymous === true ? <AnonymousSupporterIcon /> : undefined}
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
                    <p className="text-sm font-black text-amber-700 dark:text-amber-300">
                      {formatDonationAmount(
                        donation.amount,
                        donation.currency,
                        t('donation.amountFallback'),
                      )}
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {formatDonationDate(donation.receivedAt, language)}
                    </p>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {donation.isAnonymous === true
                    ? t('donation.privateMessage')
                    : donation.message ?? t('donation.noMessage')}
                </p>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
