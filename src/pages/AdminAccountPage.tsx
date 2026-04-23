import { w } from '@widgets';

export default function AdminAccountPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <w.Header />
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <w.AdminAccountManagementView />
      </main>
    </div>
  );
}
