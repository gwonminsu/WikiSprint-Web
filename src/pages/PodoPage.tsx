import { useEffect, useState } from 'react';
import { podoGalleryImages, useTranslation } from '@shared';
import { w } from '@widgets';

export default function PodoPage(): React.ReactElement {
  const { t } = useTranslation();
  const [selectedImageOrder, setSelectedImageOrder] = useState<number | null>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t('podo.documentTitle');

    return () => {
      document.title = previousTitle;
    };
  }, [t]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.2,
      }
    );

    const targets = document.querySelectorAll<HTMLElement>('[data-podo-card]');
    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedImageOrder === null) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setSelectedImageOrder(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageOrder]);

  const selectedImage = selectedImageOrder === null
    ? null
    : podoGalleryImages.find((image) => image.order === selectedImageOrder) ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(196,181,253,0.24),_transparent_34%),linear-gradient(180deg,_#f9fafb_0%,_#f3f4f6_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(91,33,182,0.24),_transparent_30%),linear-gradient(180deg,_#111827_0%,_#0f172a_100%)]">
      <w.Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_60px_rgba(88,28,135,0.14)] backdrop-blur dark:border-violet-400/20 dark:bg-slate-950/75 dark:shadow-[0_26px_64px_rgba(10,10,30,0.42)] sm:p-8">
          <p className="text-xs font-black tracking-[0.24em] text-violet-700 dark:text-violet-300">
            {t('podo.eyebrow')}
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
            {t('podo.headingPrefix')}{' '}
            <a
              href="https://www.instagram.com/gwongrape?igsh=MWViZTNrdHNhbXhscA=="
              target="_blank"
              rel="noreferrer"
              className="inline-block text-[1.25em] font-black tracking-[-0.04em] text-violet-700 drop-shadow-[0_10px_24px_rgba(109,40,217,0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200"
            >
              {t('podo.highlightedName')}
            </a>{' '}
            {t('podo.headingSuffix')}
          </h1>
          <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
            {t('podo.description')}
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_44px_rgba(76,29,149,0.1)] backdrop-blur dark:border-violet-400/15 dark:bg-slate-950/70 dark:shadow-[0_20px_48px_rgba(2,6,23,0.38)] sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.22em] text-violet-600 dark:text-violet-300">
                {t('podo.galleryEyebrow')}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                {t('podo.galleryTitle')}
              </h2>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t('podo.galleryCount', { count: podoGalleryImages.length })}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {podoGalleryImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                data-podo-card=""
                onClick={() => setSelectedImageOrder(image.order)}
                className="podo-gallery-card group relative overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/90 text-left shadow-[0_18px_40px_rgba(76,29,149,0.12)] transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:border-violet-300/10 dark:bg-slate-900/90 dark:shadow-[0_20px_42px_rgba(2,6,23,0.34)]"
                style={{ transitionDelay: `${index * 35}ms` }}
                aria-label={t('podo.openImage', { order: image.order })}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,181,253,0.24),_transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={image.src}
                    alt={t('podo.photoAlt', { order: image.order })}
                    loading="lazy"
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-4">
                  <div>
                    <p className="text-xs font-black tracking-[0.18em] text-violet-600 dark:text-violet-300">
                      PODO #{String(image.order).padStart(2, '0')}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {t('podo.photoCardLabel', { order: image.order })}
                    </p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 transition-colors group-hover:bg-violet-200 dark:bg-violet-400/10 dark:text-violet-200 dark:group-hover:bg-violet-400/20">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M7 17 17 7" />
                      <path d="M8 7h9v9" />
                    </svg>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      {selectedImage ? (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/86 p-4 backdrop-blur-sm">
          <button
            type="button"
            className="absolute inset-0"
            aria-label={t('podo.closeLightbox')}
            onClick={() => setSelectedImageOrder(null)}
          />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.8rem] border border-white/10 bg-slate-950 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
              <div>
                <p className="text-xs font-black tracking-[0.2em] text-violet-300">
                  PODO #{String(selectedImage.order).padStart(2, '0')}
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  {t('podo.photoCardLabel', { order: selectedImage.order })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImageOrder(null)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label={t('podo.closeLightbox')}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black/40">
              <img
                src={selectedImage.src}
                alt={t('podo.photoAlt', { order: selectedImage.order })}
                className="max-h-full w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
