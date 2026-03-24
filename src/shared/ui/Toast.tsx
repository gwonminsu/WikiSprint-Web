import { useEffect, useCallback } from 'react';
import { create } from 'zustand';

// 토스트 타입
type ToastType = 'success' | 'error' | 'info' | 'warning';

// 토스트 아이템
type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
};

// 토스트 상태
type ToastState = {
  toasts: ToastItem[];
  add: (toast: Omit<ToastItem, 'id'>) => void;
  remove: (id: string) => void;
};

// 고유 ID 생성
let toastId = 0;
const generateId = (): string => `toast-${++toastId}`;

// 토스트 스토어
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: generateId() }],
    })),
  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// 토스트 훅
export function useToast() {
  const { add } = useToastStore();

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000): void => {
      add({ message, type, duration });
    },
    [add]
  );

  const success = useCallback(
    (message: string): void => showToast(message, 'success'),
    [showToast]
  );

  const error = useCallback(
    (message: string): void => showToast(message, 'error'),
    [showToast]
  );

  const info = useCallback(
    (message: string): void => showToast(message, 'info'),
    [showToast]
  );

  const warning = useCallback(
    (message: string): void => showToast(message, 'warning'),
    [showToast]
  );

  return { showToast, success, error, info, warning };
}

// 개별 토스트 아이템 컴포넌트
type ToastItemProps = {
  toast: ToastItem;
  onRemove: (id: string) => void;
};

function ToastItemComponent({ toast, onRemove }: ToastItemProps): React.ReactElement {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration ?? 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = (): React.ReactElement => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-[#FDB755]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-slide-up">
      {getIcon()}
      <p className="flex-1 text-sm text-gray-700 dark:text-gray-200">{toast.message}</p>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// 토스트 컨테이너 컴포넌트
export function ToastContainer(): React.ReactElement | null {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItemComponent toast={toast} onRemove={remove} />
        </div>
      ))}
    </div>
  );
}
