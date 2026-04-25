import { useEffect } from 'react';
import { DocumentPageLayout, MarkdownDocument, useTranslation } from '@shared';
import { w } from '@widgets';

export default function PatchPage(): React.ReactElement {
  const { t } = useTranslation();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t('patch.documentTitle');

    return () => {
      document.title = previousTitle;
    };
  }, [t]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <w.Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <DocumentPageLayout
          eyebrow={t('patch.eyebrow')}
          title={t('patch.title')}
          lastUpdatedLabel={t('patch.lastUpdatedLabel')}
          lastUpdatedDate={t('patch.lastUpdatedDate')}
        >
          <MarkdownDocument content={t('patch.content')} />
        </DocumentPageLayout>
      </main>
    </div>
  );
}
