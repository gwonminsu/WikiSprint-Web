import { useEffect } from 'react';
import { create } from 'zustand';
import { useTranslation } from '../lib/i18n';

// 다이얼로그 타입
type DialogType = 'alert' | 'confirm';

// 다이얼로그 옵션
type DialogOptions = {
  type?: DialogType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

// 다이얼로그 상태
type DialogState = {
  isOpen: boolean;
  options: DialogOptions | null;
  open: (options: DialogOptions) => void;
  close: () => void;
};

// 다이얼로그 스토어
export const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  options: null,
  open: (options) => set({ isOpen: true, options }),
  close: () => set({ isOpen: false, options: null }),
}));

// 다이얼로그 훅
export function useDialog() {
  const { open, close } = useDialogStore();

  const showAlert = (message: string, title?: string): void => {
    open({ type: 'alert', message, title });
  };

  const showConfirm = (options: Omit<DialogOptions, 'type'>): void => {
    open({ type: 'confirm', ...options });
  };

  return { showAlert, showConfirm, closeDialog: close };
}

// 다이얼로그 컴포넌트
export function Dialog(): React.ReactElement | null {
  const { isOpen, options, close } = useDialogStore();
  const { t } = useTranslation();

  // ESC 키로 닫기
  // useDialogStore.getState()로 최신 options/close를 직접 읽어 stale closure 방지
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        const { options: latestOptions, close } = useDialogStore.getState();
        latestOptions?.onCancel?.();
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !options) return null;

  const handleConfirm = (): void => {
    options.onConfirm?.();
    close();
  };

  const handleCancel = (): void => {
    options.onCancel?.();
    close();
  };

  const isConfirm = options.type === 'confirm';

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={handleCancel}
      />

      {/* 다이얼로그 */}
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl animate-scale-in">
        {/* 헤더 */}
        {options.title && (
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {options.title}
            </h2>
          </div>
        )}

        {/* 본문 */}
        <div className={`px-6 ${options.title ? 'pb-6' : 'py-6'}`}>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {options.message}
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex border-t border-gray-100 dark:border-gray-700">
          {isConfirm && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-4 text-gray-600 dark:text-gray-400 font-medium text-sm active:bg-gray-100 dark:active:bg-gray-700 transition-colors border-r border-gray-100 dark:border-gray-700"
            >
              {options.cancelText ?? t('common.cancel')}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-4 text-[#FDB755] dark:text-[#FDB755] font-semibold text-sm hover:bg-[#FDB755]/5 active:bg-[#FDB755]/10 transition-colors rounded-xl"
          >
            {options.confirmText ?? t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
