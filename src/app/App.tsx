import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryProvider } from './providers/QueryProvider';
import { Router } from './router/Router';
import { Dialog, ToastContainer, useThemeStore, useAuthStore } from '@shared';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

// 테마 초기화 컴포넌트
function ThemeInitializer(): null {
  const { theme } = useThemeStore();

  useEffect(() => {
    // 시스템 테마 변경 감지
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
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);

    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  return null;
}

// 인증 초기화 컴포넌트
function AuthInitializer(): null {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth(); // persist hydration 이후 토큰 재확인
  }, [checkAuth]);

  return null;
}

// 메인 앱 컴포넌트
export function App(): React.ReactElement {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryProvider>
        <ThemeInitializer />
        <AuthInitializer />
        <Router />
        <Dialog />
        <ToastContainer />
      </QueryProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
