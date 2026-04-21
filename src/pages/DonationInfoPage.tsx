import { w } from '@widgets';

// 후원정보 페이지
export default function DonationInfoPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <w.Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/80 dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:p-8">
          <p className="text-xs font-black tracking-[0.22em] text-sky-700 dark:text-sky-300">
            SUPPORT INFO
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Support Information
          </h1>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-200 sm:text-base">
            후원해주신 분들께 감사드립니다.
            {'\n'}
            현재 페이지는 전체 후원정보 리스트를 임시 위젯으로 표시하는 단계입니다.
          </p>
        </section>

        <w.DonationInfoListWidget />
      </main>
    </div>
  );
}
