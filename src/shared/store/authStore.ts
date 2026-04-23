import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTokenStorage } from '../api';

// 계정 정보 타입
type AccountInfo = {
  uuid: string;
  nick: string;
  email: string;
  profile_img_url: string | null;
  is_admin: boolean;
  nationality: string | null;
};

// 인증 상태 타입
export type AuthState = {
  hasHydrated: boolean;
  isAuthenticated: boolean;
  accountInfo: AccountInfo | null;
  setAuth: (accessToken: string, refreshToken: string) => void;
  setAccountInfo: (info: AccountInfo) => void;
  clearAuth: () => void;
  checkAuth: () => void;

  // 약관 동의 대기 상태: 신규 가입 → 동의 모달 표시 → 완료 시 계정 생성
  pendingConsent: boolean;
  pendingCredential: string | null;
  setPendingConsent: (pending: boolean, credential?: string) => void;
  clearPendingConsent: () => void;

  // 탈퇴 취소 대기 상태: 탈퇴 대기 계정 재로그인 → 취소 다이얼로그 표시
  pendingDeletionCancel: boolean;
  deletionScheduledAt: string | null;
  pendingDeletionCredential: string | null;
  setPendingDeletionCancel: (pending: boolean, scheduledAt?: string, credential?: string) => void;
};

// Zustand 인증 스토어 (persist 사용)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasHydrated: true,
      isAuthenticated: !!getTokenStorage().getAccessToken(),
      accountInfo: null,

      setAuth: (accessToken: string, refreshToken: string): void => {
        getTokenStorage().setTokens(accessToken, refreshToken);
        set({ isAuthenticated: true });
      },

      setAccountInfo: (info: AccountInfo): void => {
        set({ accountInfo: info });
      },

      clearAuth: (): void => {
        getTokenStorage().clearTokens();
        set({ isAuthenticated: false, accountInfo: null });
      },

      checkAuth: (): void => {
        const hasToken = !!getTokenStorage().getAccessToken();
        set((state) => ({
          isAuthenticated: hasToken,
          accountInfo: hasToken ? state.accountInfo : null,
        }));
      },

      // 약관 동의 대기 상태 초기값
      pendingConsent: false,
      pendingCredential: null,

      setPendingConsent: (pending: boolean, credential?: string): void => {
        set({ pendingConsent: pending, pendingCredential: credential ?? null });
      },

      // pendingConsent, pendingCredential 동시 초기화 (모달 취소/닫기/이탈 시 호출)
      clearPendingConsent: (): void => {
        set({ pendingConsent: false, pendingCredential: null });
      },

      // 탈퇴 취소 대기 상태 초기값
      pendingDeletionCancel: false,
      deletionScheduledAt: null,
      pendingDeletionCredential: null,

      setPendingDeletionCancel: (pending: boolean, scheduledAt?: string, credential?: string): void => {
        set({
          pendingDeletionCancel: pending,
          deletionScheduledAt: scheduledAt ?? null,
          pendingDeletionCredential: credential ?? null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accountInfo: state.accountInfo,
        // pending 상태 persist: 앱 재시작 후에도 모달/다이얼로그가 유지되어야 함
        pendingConsent: state.pendingConsent,
        pendingCredential: state.pendingCredential,
        pendingDeletionCancel: state.pendingDeletionCancel,
        deletionScheduledAt: state.deletionScheduledAt,
        pendingDeletionCredential: state.pendingDeletionCredential,
      }),
    }
  )
);
