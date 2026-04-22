import { useState } from 'react';
import { useAuthStore, useTranslation } from '@shared';
import { SupportButtonIcon } from './donation-support';

const KOFI_URL = import.meta.env.VITE_KOFI_URL ?? '';

function buildTipPanelUrl(kofiUrl: string): string {
  if (!kofiUrl) {
    return '';
  }

  try {
    const url = new URL(kofiUrl);
    url.searchParams.set('hidefeed', 'true');
    url.searchParams.set('widget', 'true');
    url.searchParams.set('embed', 'true');
    url.searchParams.set('preview', 'true');
    return url.toString();
  } catch {
    return '';
  }
}

// 커스텀 후원 버튼과 Ko-fi 패널을 제공한다.
export function DonationFloatingButton(): React.ReactElement | null {
  const { t } = useTranslation();
  const accountInfo = useAuthStore((state) => state.accountInfo);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAnonymousChecked, setIsAnonymousChecked] = useState(false);

  if (!KOFI_URL) {
    return null;
  }

  const tipPanelUrl = buildTipPanelUrl(KOFI_URL);

  const handleToggle = (): void => {
    setIsOpen((previous) => {
      if (previous) {
        setIsCheckoutOpen(false);
      }
      return !previous;
    });
  };

  const handleClose = (): void => {
    setIsOpen(false);
    setIsCheckoutOpen(false);
  };

  const handleStartCheckout = (): void => {
    setIsCheckoutOpen(true);
  };

  const handleBackToIntro = (): void => {
    setIsCheckoutOpen(false);
  };

  const handleOpenKofiPage = (): void => {
    window.open(KOFI_URL, '_blank', 'noopener,noreferrer');
  };

  const displayNameGuide = isAnonymousChecked
    ? t('donation.anonymousCheckedHint')
    : isAuthenticated && accountInfo?.nick
      ? t('donation.displayNameLoggedInHint', { nick: accountInfo.nick })
      : t('donation.displayNameGuestHint');

  return (
    <div className="pointer-events-none fixed inset-0 z-200">
      {isOpen ? (
        <button
          type="button"
          aria-label={t('donation.closePanel')}
          onClick={handleClose}
          className="pointer-events-auto absolute inset-0 bg-slate-950/14 backdrop-blur-[1.5px]"
        />
      ) : null}

      <div className="pointer-events-none absolute bottom-6 right-6 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-3">
        <div
          className={[
            'pointer-events-auto origin-bottom-right overflow-hidden rounded-4xl',
            'bg-white/96 shadow-[0_24px_70px_rgba(14,165,233,0.24)] backdrop-blur-xl',
            'transition-all duration-300 ease-out dark:bg-slate-950/92',
            isOpen
              ? 'max-h-[84vh] w-[min(26rem,calc(100vw-1.5rem))] translate-y-0 opacity-100'
              : 'pointer-events-none max-h-0 w-[min(22rem,calc(100vw-1.5rem))] translate-y-3 opacity-0',
          ].join(' ')}
        >
          <div className="flex items-center justify-between bg-linear-to-r from-sky-100 via-cyan-50 to-white px-5 py-4 dark:from-sky-500/15 dark:via-slate-950 dark:to-slate-950">
            <div className="flex items-center gap-3">
              {isCheckoutOpen ? (
                <button
                  type="button"
                  onClick={handleBackToIntro}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg font-black text-slate-700 transition hover:-translate-y-px hover:bg-sky-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  aria-label={t('donation.backToIntro')}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 18 9 12l6-6" />
                  </svg>
                </button>
              ) : null}

              <div>
                <p className="text-[11px] font-black tracking-[0.22em] text-sky-700 dark:text-sky-300">
                  {t('donation.panelEyebrow')}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                  {isCheckoutOpen ? t('donation.checkoutTitle') : t('donation.introTitle')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg font-black text-slate-700 transition hover:-translate-y-px hover:bg-sky-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              aria-label={t('donation.closePanel')}
            >
              ×
            </button>
          </div>

          <div className="max-h-[calc(84vh-4.5rem)] overflow-y-auto scrollbar-thin-custom px-5 pb-5">
            {isCheckoutOpen ? (
              <div className="pt-4">

                <iframe
                  id="kofiframe"
                  src={tipPanelUrl}
                  className="mt-4 w-full rounded-[1.4rem] border-0 bg-[#f9f9f9]"
                  height="712"
                  title={t('donation.embedTitle')}
                  sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
                  referrerPolicy="no-referrer"
                />

                <button
                  type="button"
                  onClick={handleOpenKofiPage}
                  className="mt-4 w-full rounded-[1.2rem] bg-white px-4 py-3 text-sm font-bold text-sky-800 transition hover:bg-sky-50 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-slate-800"
                >
                  {t('donation.openKofiPage')}
                </button>
              </div>
            ) : (
              <div className="py-5">
                <p className="text-sm font-black tracking-[0.18em] text-sky-700 dark:text-sky-300">
                  KO-FI
                </p>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {t('donation.panelTitle')}
                </h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {t('donation.panelDescription')}
                </p>

                <label className="mt-5 flex items-start gap-3 rounded-[1.3rem] bg-sky-50/80 px-4 py-4 dark:bg-sky-500/10">
                  <input
                    type="checkbox"
                    checked={isAnonymousChecked}
                    onChange={(event) => setIsAnonymousChecked(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-sky-300 text-sky-500 focus:ring-sky-400"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-slate-900 dark:text-white">
                      {t('donation.anonymousLabel')}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {t('donation.anonymousDescription')}
                    </span>
                  </span>
                </label>

                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {displayNameGuide}
                </p>

                <button
                  type="button"
                  onClick={handleStartCheckout}
                  className="mt-5 w-full rounded-[1.3rem] bg-sky-400 px-4 py-4 text-sm font-black text-white shadow-[0_16px_38px_rgba(14,165,233,0.28)] transition hover:-translate-y-px hover:bg-sky-300"
                >
                  {t('donation.startSupport')}
                </button>

                <button
                  type="button"
                  onClick={handleOpenKofiPage}
                  className="mt-3 w-full rounded-[1.2rem] bg-white px-4 py-3 text-sm font-bold text-sky-800 transition hover:bg-sky-50 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-slate-800"
                >
                  {t('donation.openKofiPage')}
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-controls="kofiframe"
          className="pointer-events-auto inline-flex items-center gap-3 rounded-[1.35rem] bg-sky-400 px-4 py-2 text-white shadow-[0_18px_42px_rgba(14,165,233,0.36)] transition hover:-translate-y-px hover:bg-sky-300"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center text-white">
            <SupportButtonIcon />
          </span>
          <span className="text-sm font-black tracking-[0.03em]">
            Support me
          </span>
        </button>
      </div>
    </div>
  );
}
