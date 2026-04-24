import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createReport } from '@features';
import { useDialog, useToast, useTranslation } from '@shared';
import type { ReportReason, ReportTargetType } from '@/entities';

type ReportModalProps = {
  isOpen: boolean;
  targetNick: string;
  targetType: ReportTargetType;
  targetAccountId?: string | null;
  targetDonationId?: string | null;
  allowDonationContentReason?: boolean;
  onSubmitted?: () => void | Promise<void>;
  onClose: () => void;
};

const BASE_REASONS: ReportReason[] = ['PROFILE_IMAGE', 'NICKNAME', 'OTHER'];

export function ReportModal({
  isOpen,
  targetNick,
  targetType,
  targetAccountId,
  targetDonationId,
  allowDonationContentReason = false,
  onSubmitted,
  onClose,
}: ReportModalProps): React.ReactElement | null {
  const { t } = useTranslation();
  const toast = useToast();
  const { showConfirm } = useDialog();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason(null);
      setDetail('');
      setIsSubmitting(false);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const reasons = allowDonationContentReason
    ? ['PROFILE_IMAGE', 'NICKNAME', 'DONATION_CONTENT', 'OTHER'] as ReportReason[]
    : BASE_REASONS;

  const resolveRequestTarget = (): {
    targetType: ReportTargetType;
    targetAccountId: string | null;
    targetDonationId: string | null;
  } => {
    const canPromoteDonationReportToAccount = targetType === 'DONATION'
      && !!targetAccountId;

    if (canPromoteDonationReportToAccount) {
      return {
        targetType: 'ACCOUNT',
        targetAccountId: targetAccountId ?? null,
        targetDonationId: null,
      };
    }

    return {
      targetType,
      targetAccountId: targetType === 'ACCOUNT' ? targetAccountId ?? null : null,
      targetDonationId: targetType === 'DONATION' ? targetDonationId ?? null : null,
    };
  };

  const submitReport = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const requestTarget = resolveRequestTarget();
      await createReport({
        targetType: requestTarget.targetType,
        targetAccountId: requestTarget.targetAccountId,
        targetDonationId: targetDonationId ?? requestTarget.targetDonationId,
        reason: reason!,
        detail: reason === 'OTHER' ? detail.trim() || null : null,
      });
      await onSubmitted?.();
      toast.success(t('report.success', { nick: targetNick }));
      onClose();
    } catch {
      toast.error(t('report.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (): void => {
    if (!reason) {
      toast.warning(t('report.selectReasonRequired'));
      return;
    }

    showConfirm({
      title: t('report.confirmTitle'),
      message: t('report.confirmMessage'),
      confirmText: t('report.confirmAction'),
      onConfirm: () => { void submitReport(); },
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label={t('common.cancel')}
        onClick={onClose}
      />
      <section className="relative z-[101] w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-black text-gray-950 dark:text-white">
            {t('report.title', { nick: targetNick })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label={t('common.cancel')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {reasons.map((item) => (
            <label
              key={item}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:border-orange-300 hover:bg-orange-50 dark:border-gray-700 dark:text-gray-200 dark:hover:border-orange-400/50 dark:hover:bg-orange-400/10"
            >
              <input
                type="radio"
                name="report-reason"
                value={item}
                checked={reason === item}
                onChange={() => setReason(item)}
                className="h-4 w-4 accent-orange-500"
              />
              {t(`report.reason.${item}` as Parameters<typeof t>[0])}
            </label>
          ))}
        </div>

        <div className="mt-4">
          <textarea
            value={detail}
            onChange={(event) => setDetail(event.target.value.slice(0, 100))}
            disabled={reason !== 'OTHER'}
            maxLength={100}
            rows={3}
            placeholder={t('report.otherPlaceholder')}
            className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-orange-400 disabled:cursor-not-allowed disabled:opacity-45 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <p className="mt-1 text-right text-xs font-semibold text-gray-400">
            {detail.length}/100
          </p>
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="mt-5 w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t('report.submitting') : t('report.submit')}
        </button>
      </section>
    </div>,
    document.body,
  );
}
