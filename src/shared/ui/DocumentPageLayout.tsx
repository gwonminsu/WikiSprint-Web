type DocumentPageLayoutProps = {
  eyebrow: string;
  title: string;
  lastUpdatedLabel?: string;
  lastUpdatedDate?: string;
  children: React.ReactNode;
};

export function DocumentPageLayout({
  eyebrow,
  title,
  lastUpdatedLabel,
  lastUpdatedDate,
  children,
}: DocumentPageLayoutProps): React.ReactElement {
  return (
    <section className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/80 dark:shadow-[0_18px_40px_rgba(0,0,0,0.28)] sm:p-8">
      <p className="text-xs font-black tracking-[0.22em] text-sky-700 dark:text-sky-300">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900 dark:text-white">
        {title}
      </h1>
      {lastUpdatedLabel && lastUpdatedDate ? (
        <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          {lastUpdatedLabel} · {lastUpdatedDate}
        </p>
      ) : null}
      <div className="mt-6 rounded-3xl border border-gray-200/80 bg-white/80 p-5 dark:border-gray-700 dark:bg-gray-950/40 sm:p-6">
        {children}
      </div>
    </section>
  );
}
