import { useNavigate } from 'react-router-dom';
import { getProfileImageUrl, useLatestDonations } from '@features';
import { EmbossButton, ProfileAvatar, useTranslation } from '@shared';
import type { DonationListItem } from '@entities';
import {
  AnonymousSupporterIcon,
  buildDonationIdentityKey,
  resolveDonationDisplayName,
} from '../lib/donationSupport';

function getUniqueRecentSupporters(donations: DonationListItem[]): DonationListItem[] {
  const seenKeys = new Set<string>();

  return donations.filter((donation) => {
    const identityKey = buildDonationIdentityKey(donation);
    if (seenKeys.has(identityKey)) {
      return false;
    }

    seenKeys.add(identityKey);
    return true;
  });
}

// /doc 페이지 마지막에 배치되는 후원 정보 섹션이다.
export function DonationSection(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data } = useLatestDonations();

  const uniqueSupporters = getUniqueRecentSupporters(data ?? []);
  const previewSupporters = uniqueSupporters.slice(0, 5);
  const extraSupporterCount = Math.max(uniqueSupporters.length - previewSupporters.length, 0);

  return (
    <section className="rounded-4xl border border-white/70 bg-linear-to-br from-sky-50 via-white to-amber-50 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-700 dark:from-sky-500/10 dark:via-gray-900 dark:to-amber-500/10 dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:p-8">
      <p className="text-xs font-black tracking-[0.22em] text-sky-700 dark:text-sky-300">
        {t('doc.donation.eyebrow')}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-900 dark:text-white">
        {t('doc.donation.title')}
      </h2>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-200 sm:text-base">
        {t('doc.donation.description')}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {previewSupporters.length > 0 ? (
          <>
            {previewSupporters.map((donation) => {
              const displayName = resolveDonationDisplayName(donation, t('donation.anonymous'));
              const useAnonymousIcon = donation.isAnonymous === true;
              const useLetterFallback = !useAnonymousIcon && donation.isAccountLinkedDisplay !== true;
              const profileImageUrl = useLetterFallback
                ? null
                : getProfileImageUrl(donation.accountProfileImgUrl);

              return (
                <div
                  key={buildDonationIdentityKey(donation)}
                  title={displayName}
                  className="flex items-center justify-center"
                >
                  <ProfileAvatar
                    imageUrl={profileImageUrl}
                    name={displayName}
                    size="md"
                    className={`h-12 w-12 rounded-2xl shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-700 ${
                      useAnonymousIcon
                        ? 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                        : 'bg-white dark:bg-slate-900'
                    }`}
                    fallbackContent={useAnonymousIcon ? <AnonymousSupporterIcon /> : undefined}
                  />
                </div>
              );
            })}

            {extraSupporterCount > 0 ? (
              <div className="flex h-12 min-w-12 items-center justify-center rounded-2xl bg-slate-900 px-3 text-sm font-black text-white dark:bg-white dark:text-slate-900">
                +{extraSupporterCount}
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('doc.donation.noPreview')}
          </p>
        )}
      </div>

      <p className="mt-5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {t('doc.donation.notice')}
      </p>

      <div className="mt-6">
        <EmbossButton
          type="button"
          variant="primary"
          onClick={() => navigate('/donations')}
          className="px-6"
        >
          {t('doc.donation.button')}
        </EmbossButton>
      </div>
    </section>
  );
}
