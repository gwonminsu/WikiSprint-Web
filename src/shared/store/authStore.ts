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
type AuthState = {
  isAuthenticated: boolean;
  accountInfo: AccountInfo | null;
  setAuth: (accessToken: string, refreshToken: string) => void;
  setAccountInfo: (info: AccountInfo) => void;
  clearAuth: () => void;
  checkAuth: () => void;
};

// Zustand 인증 스토어 (persist 사용)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: !!getTokenStorage().getAccessToken(),
      accountInfo: null,

      setAuth: (accessToken: string, refreshToken: string): void => {
        getTokenStorage().setTokens(accessToken, refreshToken);
        set({ isAuthenticated: true, accountInfo: null });
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
        set({ isAuthenticated: hasToken });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accountInfo: state.accountInfo,
      }),
    }
  )
);
