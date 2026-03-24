import { w } from '@widgets';
import { useAuthStore } from '@shared';

// WikiSprint 홈 페이지
export default function HomePage(): React.ReactElement {
  const { accountInfo } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <w.Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">WikiSprint</h1>
          {accountInfo?.nick && (
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              안녕하세요, {accountInfo.nick}님
            </p>
          )}
          <div className="w-16 h-1 bg-primary rounded-full mx-auto opacity-30" />
        </div>
      </main>

    </div>
  );
}
