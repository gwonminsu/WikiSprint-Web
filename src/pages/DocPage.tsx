import { w } from '@widgets';

// WikiSprint 소개 문서 페이지
export default function DocPage(): React.ReactElement {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <w.Header />
      <main className="flex-1">
        <w.DocContentView />
      </main>
    </div>
  );
}
