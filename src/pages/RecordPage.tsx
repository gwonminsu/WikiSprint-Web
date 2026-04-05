import { w } from '@widgets';

// 전적 페이지
export default function RecordPage(): React.ReactElement {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <w.Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <w.GameRecordView />
      </main>
    </div>
  );
}
