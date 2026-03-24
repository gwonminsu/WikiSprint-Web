import { w } from '@widgets';
import { useTranslation } from '@shared';

// 설정 페이지
export default function SettingsPage(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <w.Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t('nav.settings')}
        </h1>
        <w.SettingsView />
      </main>
    </div>
  );
}
