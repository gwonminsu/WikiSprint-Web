import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useMyAccount } from '@features';
import {
  Dialog,
  ToastContainer,
  useThemeStore,
  useAuthStore,
  useViewportScale,
  setAuthUpdateCallback,
  getTokenStorage,
} from '@shared';
import { QueryProvider } from './providers/QueryProvider';
import { Router } from './router/Router';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

// 테마 초기화 컴포넌트
function ThemeInitializer(): null {
  const { theme, setResolvedTheme } = useThemeStore();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (): void => {
      const root = document.documentElement;
      const effectiveTheme = theme === 'system'
        ? (mediaQuery.matches ? 'dark' : 'light')
        : theme;

      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      setResolvedTheme(effectiveTheme);
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);

    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [setResolvedTheme, theme]);

  return null;
}

// 인증 상태와 계정 정보를 앱 전역에서 먼저 맞춘다.
function AuthInitializer(): null {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const setAuth = useAuthStore((state) => state.setAuth);

  useMyAccount();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    setAuthUpdateCallback((data) => {
      if (!data.accessToken) return;

      const refreshToken = data.refreshToken ?? getTokenStorage().getRefreshToken();
      if (!refreshToken) return;

      setAuth(data.accessToken, refreshToken);
    });
  }, [setAuth]);

  return null;
}

// 모바일 줌 뷰포트 축소 처리
function ViewportScaleInitializer(): null {
  useViewportScale();
  return null;
}

export function App(): React.ReactElement {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryProvider>
        <ThemeInitializer />
        <AuthInitializer />
        <ViewportScaleInitializer />
        <Router />
        <Dialog />
        <ToastContainer />
      </QueryProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
