import { useEffect } from 'react';
import { useTranslation } from '@shared';
import { w } from '@widgets';

function getPrivacyBody(content: string): string {
  return content.replace(/^[^\n]*\n\n/, '');
}

// 개인정보 처리방침 공개 페이지
export default function PrivacyPage(): React.ReactElement {
  const { t } = useTranslation();
  const content = t('privacy.content');
  const body = getPrivacyBody(content);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t('privacy.documentTitle');

    return () => {
      document.title = previousTitle;
    };
  }, [t]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <w.Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/80 dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:p-8">
          <p className="text-xs font-black tracking-[0.22em] text-sky-700 dark:text-sky-300">
            PRIVACY
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {t('privacy.title')}
          </h1>
          <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
            {t('privacy.lastUpdatedLabel')} · {t('privacy.lastUpdatedDate')}
          </p>
          <div className="mt-6 rounded-3xl border border-gray-200/80 bg-white/80 p-5 dark:border-gray-700 dark:bg-gray-950/40 sm:p-6">
            <p className="whitespace-pre-line text-sm leading-7 text-gray-700 dark:text-gray-200 sm:text-base">
              {body}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
