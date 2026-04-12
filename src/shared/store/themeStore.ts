import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 테마 타입
export type Theme = 'light' | 'dark' | 'system';

// 테마 상태
type ThemeState = {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
};

// 시스템 테마 감지
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// 테마 적용
const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;

  if (effectiveTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// 테마 스토어
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      resolvedTheme: getSystemTheme(),
      setTheme: (theme) => {
        const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
        applyTheme(theme);
        set({ theme, resolvedTheme: effectiveTheme, });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // 스토어 복원 후 테마 적용
        if (state) {
          const effectiveTheme = state.theme === 'system' ? getSystemTheme() : state.theme;
          applyTheme(state.theme);
          state.resolvedTheme = effectiveTheme;
        }
      },
    }
  )
);

// 시스템 테마 감지는 App.tsx의 ThemeInitializer 컴포넌트에서 useEffect로 처리
