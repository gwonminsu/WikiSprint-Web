import { useAuthStore, useTranslation } from '@shared';
import { w } from '@widgets';

// 후원정보 페이지
export default function DonationInfoPage(): React.ReactElement {
  const accountInfo = useAuthStore((state) => state.accountInfo);
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <w.Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="rounded-4xl bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:bg-gray-900/80 dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:p-8">
          <p className="text-xs font-black tracking-[0.22em] text-sky-700 dark:text-sky-300">
            {t('donation.pageEyebrow')}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {t('donation.pageTitle')}
          </h1>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-200 sm:text-base">
            {t('donation.pageDescription')}
          </p>
        </section>

        {accountInfo?.is_admin === true ? <w.DonationPendingListWidget /> : null}
        <w.DonationInfoListWidget />
      </main>
    </div>
  );
}
