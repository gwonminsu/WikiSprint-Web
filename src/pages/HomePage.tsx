import { w } from '@widgets';
import { useAuthStore, useTranslation, getLogoByLanguage } from '@shared';

// WikiSprint 홈 페이지
export default function HomePage(): React.ReactElement {
  const { accountInfo } = useAuthStore();
  const { language } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <w.Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <div className="text-center">
          <img
            src={getLogoByLanguage(language)}
            alt="WikiSprint"
            className="h-16 mx-auto mb-2 object-contain"
          />
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            안녕하세요, {accountInfo?.nick ?? '게스트'}님
          </p>
          <div className="w-16 h-1 bg-primary rounded-full mx-auto opacity-30" />
        </div>
      </main>

    </div>
  );
}
