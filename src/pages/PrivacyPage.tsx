import { useEffect } from 'react';
import { DocumentPageLayout, useTranslation } from '@shared';
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
        <DocumentPageLayout
          eyebrow="PRIVACY"
          title={t('privacy.title')}
          lastUpdatedLabel={t('privacy.lastUpdatedLabel')}
          lastUpdatedDate={t('privacy.lastUpdatedDate')}
        >
            <p className="whitespace-pre-line text-sm leading-7 text-gray-700 dark:text-gray-200 sm:text-base">
              {body}
            </p>
        </DocumentPageLayout>
      </main>
    </div>
  );
}
