import { w } from '@widgets';

// 랭킹 페이지
export default function RankingPage(): React.ReactElement {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <w.Header />

      <main className="flex-1">
        <w.RankingView />
      </main>
    </div>
  );
}
