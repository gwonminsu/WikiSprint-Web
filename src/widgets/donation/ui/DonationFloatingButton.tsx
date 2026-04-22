import { useEffect, useMemo, useState } from 'react';
import { createAccountTransferDonation } from '@features';
import { EmbossButton, queryClient, useAuthStore, useDialog, useToast, useTranslation } from '@shared';
import { SupportButtonIcon } from '../lib/donationSupport';

const KOFI_URL = 'https://ko-fi.com/minjoy';
const KOFI_EMBED_URL = 'https://ko-fi.com/minjoy/?hidefeed=true&widget=true&embed=true&preview=true';
const DOMESTIC_ACCOUNT_INFO = 'IM뱅크 508-13-061547-7 권민수';
const KRW_PER_COFFEE = 2000;

type PanelMode = 'intro' | 'overseas' | 'domestic';

function formatKrw(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

export function DonationFloatingButton(): React.ReactElement {
  const { t } = useTranslation();
  const toast = useToast();
  const { showConfirm } = useDialog();
  const accountInfo = useAuthStore((state) => state.accountInfo);

  const [isOpen, setIsOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('intro');
  const [coffeeCount, setCoffeeCount] = useState(1);
  const [nickname, setNickname] = useState('');
  const [remitterName, setRemitterName] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymousChecked, setIsAnonymousChecked] = useState(false);
  const [isSubmittingDomestic, setIsSubmittingDomestic] = useState(false);

  const totalAmount = useMemo(() => coffeeCount * KRW_PER_COFFEE, [coffeeCount]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const resetDomesticForm = (): void => {
    setCoffeeCount(1);
    setNickname('');
    setRemitterName('');
    setMessage('');
    setIsAnonymousChecked(false);
  };

  const closePanel = (): void => {
    setIsOpen(false);
    setPanelMode('intro');
  };

  const handleOpen = (): void => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setPanelMode('intro');
      }
      return next;
    });
  };

  const submitDomesticDonation = async (): Promise<void> => {
    if (isSubmittingDomestic) {
      return;
    }

    try {
      setIsSubmittingDomestic(true);
      await createAccountTransferDonation({
        coffeeCount,
        nickname,
        remitterName,
        message,
        anonymous: isAnonymousChecked,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['donations', 'latest'] }),
        queryClient.invalidateQueries({ queryKey: ['donations', 'all'] }),
        queryClient.invalidateQueries({ queryKey: ['donations', 'pending-account-transfer'] }),
      ]);

      toast.success(t('donation.domesticSubmitSuccess'));
      resetDomesticForm();
      closePanel();
    } catch (error) {
      console.error(error);
      toast.error(t('donation.domesticSubmitError'));
    } finally {
      setIsSubmittingDomestic(false);
    }
  };

  const handleDomesticSubmit = (): void => {
    const normalizedRemitterName = remitterName.trim();
    if (normalizedRemitterName.length === 0) {
      toast.error('입금자명은 필수입니다.');
      return;
    }

    showConfirm({
      title: '국내 후원 확인',
      message: `입금자명 ${normalizedRemitterName}으로 신청하시겠습니까?`,
      confirmText: '확인 후 요청',
      cancelText: t('common.cancel'),
      onConfirm: () => {
        void submitDomesticDonation();
      },
    });
  };

  const displayNameHint = accountInfo?.nick
    ? t('donation.displayNameLoggedInHint', { nick: accountInfo.nick })
    : t('donation.displayNameGuestHint');

  const panelDescription = panelMode === 'intro'
    ? t('donation.panelDescription')
    : panelMode === 'domestic'
      ? t('donation.domesticDescription')
      : t('donation.overseasDescription');

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={isOpen ? t('donation.floatingButtonOpen') : t('donation.floatingButton')}
        className="fixed bottom-5 right-5 z-60 inline-flex items-center gap-3 rounded-2xl bg-sky-500 px-4 py-3 text-white shadow-[0_18px_34px_rgba(14,165,233,0.34)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-sky-400 active:translate-y-0 dark:bg-sky-500 dark:hover:bg-sky-400 sm:bottom-6 sm:right-6"
      >
        <SupportButtonIcon />
        <span className="text-sm font-black tracking-[0.01em] text-white">Support me</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label={t('donation.closePanel')}
            className="absolute inset-0 bg-slate-950/44 backdrop-blur-[2px]"
            onClick={closePanel}
          />

          <section className="absolute bottom-20 right-4 z-10 flex h-[min(78vh,780px)] w-[min(calc(100vw-2rem),430px)] flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_28px_70px_rgba(15,23,42,0.24)] dark:bg-slate-950 sm:bottom-24 sm:right-6">
            <div className="border-b border-slate-200/80 px-6 pb-5 pt-6 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-black tracking-[0.28em] text-sky-600 dark:text-sky-300">
                    {t('donation.panelEyebrow')}
                  </p>
                  <h2 className="mt-3 text-[1.55rem] font-black leading-tight text-slate-950 dark:text-white">
                    {panelMode === 'intro'
                      ? t('donation.panelTitle')
                      : panelMode === 'domestic'
                        ? t('donation.domesticTitle')
                        : t('donation.overseasTitle')}
                  </h2>
                  {panelDescription ? (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {panelDescription}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={closePanel}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>

              {panelMode !== 'intro' ? (
                <button
                  type="button"
                  onClick={() => setPanelMode('intro')}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span aria-hidden="true">←</span>
                  {t('donation.backToIntro')}
                </button>
              ) : null}
            </div>

            <div className="scrollbar-thin-custom flex-1 overflow-y-auto px-6 pb-6 pt-5">
              {panelMode === 'intro' ? (
                <div className="space-y-5">
                  <div className="rounded-[1.6rem] bg-slate-50 p-5 dark:bg-slate-900/80">
                    <p className="text-xs font-black tracking-[0.16em] text-slate-400 dark:text-slate-500">
                      DOMESTIC (KOREA)
                    </p>
                    <h3 className="mt-2 text-lg font-black text-slate-950 dark:text-white">
                      {t('donation.domesticBranchButton')}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {t('donation.domesticBranchDescription')}
                    </p>

                    <EmbossButton
                      type="button"
                      variant="primary"
                      onClick={() => setPanelMode('domestic')}
                      className="mt-4 w-full"
                    >
                      {t('donation.domesticBranchButton')}
                    </EmbossButton>
                  </div>

                  <div className="rounded-[1.6rem] bg-sky-50 p-5 dark:bg-sky-500/10">
                    <p className="text-xs font-black tracking-[0.16em] text-sky-700 dark:text-sky-200">
                      GLOBAL
                    </p>
                    <h3 className="mt-2 text-lg font-black text-slate-950 dark:text-white">
                      {t('donation.overseasBranchButton')}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {t('donation.overseasBranchDescription')}
                    </p>

                    <div className="mt-4 rounded-[1.4rem] bg-white/80 p-4 dark:bg-slate-900/70">
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isAnonymousChecked}
                          onChange={(event) => setIsAnonymousChecked(event.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                        />
                        <span>
                          <span className="block text-sm font-black text-slate-900 dark:text-white">
                            {t('donation.anonymousLabel')}
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {t('donation.anonymousDescription')}
                          </span>
                        </span>
                      </label>

                      <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {displayNameHint}
                      </p>
                    </div>

                    <EmbossButton
                      type="button"
                      variant="secondary"
                      onClick={() => setPanelMode('overseas')}
                      className="mt-4 w-full"
                    >
                      {t('donation.overseasBranchButton')}
                    </EmbossButton>
                  </div>
                </div>
              ) : null}

              {panelMode === 'overseas' ? (
                <div className="space-y-4">
                  <iframe
                    id="kofiframe"
                    src={KOFI_EMBED_URL}
                    title={t('donation.embedTitle')}
                    className="min-h-[640px] w-full rounded-[1.5rem] bg-slate-50 p-1 dark:bg-slate-900"
                    style={{ border: 'none' }}
                  />

                  <EmbossButton
                    type="button"
                    variant="secondary"
                    onClick={() => window.open(KOFI_URL, '_blank', 'noopener,noreferrer')}
                    className="w-full"
                  >
                    {t('donation.openKofiPage')}
                  </EmbossButton>
                </div>
              ) : null}

              {panelMode === 'domestic' ? (
                <div className="space-y-5">
                  <div className="rounded-[1.6rem] bg-slate-50 p-5 dark:bg-slate-900/80">
                    <p className="text-xs font-black tracking-[0.16em] text-slate-400 dark:text-slate-500">
                      {t('donation.domesticAccountLabel')}
                    </p>
                    <p className="mt-2 text-base font-black text-slate-950 dark:text-white">
                      {DOMESTIC_ACCOUNT_INFO}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {t('donation.domesticAccountDescription')}
                    </p>
                  </div>

                  <div className="rounded-[1.6rem] bg-white/80 p-5 ring-1 ring-slate-200/80 dark:bg-slate-900/70 dark:ring-slate-800">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black tracking-[0.16em] text-slate-400 dark:text-slate-500">
                          {t('donation.coffeeCountLabel')}
                        </p>
                        <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                          {t('donation.coffeeCountValue', { count: coffeeCount })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCoffeeCount((prev) => Math.max(1, prev - 1))}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl font-black text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                          −
                        </button>
                        <button
                          type="button"
                          onClick={() => setCoffeeCount((prev) => Math.min(100, prev + 1))}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl font-black text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <p className="mt-4 text-sm font-bold text-amber-700 dark:text-amber-300">
                      {formatKrw(totalAmount)}
                    </p>
                  </div>

                  <label className="block">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {t('donation.nicknameLabel')}
                    </span>
                    <input
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      placeholder={t('donation.nicknamePlaceholder')}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {displayNameHint}
                    </p>
                  </label>

                  <label className="block">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {t('donation.remitterNameLabel')}
                    </span>
                    <input
                      value={remitterName}
                      onChange={(event) => setRemitterName(event.target.value)}
                      placeholder={t('donation.remitterNamePlaceholder')}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {t('donation.messageLabel')}
                    </span>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder={t('donation.messagePlaceholder')}
                      rows={4}
                      className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </label>

                  <label className="flex items-start gap-3 rounded-[1.4rem] bg-amber-50 p-4 dark:bg-amber-500/10">
                    <input
                      type="checkbox"
                      checked={isAnonymousChecked}
                      onChange={(event) => setIsAnonymousChecked(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    />
                    <span>
                      <span className="block text-sm font-black text-slate-900 dark:text-white">
                        {t('donation.anonymousLabel')}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {t('donation.anonymousDescription')}
                      </span>
                    </span>
                  </label>

                  <EmbossButton
                    type="button"
                    variant="primary"
                    disabled={isSubmittingDomestic}
                    onClick={handleDomesticSubmit}
                    className="w-full"
                  >
                    {isSubmittingDomestic
                      ? t('common.loading')
                      : t('donation.domesticTipButton', { amount: formatKrw(totalAmount) })}
                  </EmbossButton>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
