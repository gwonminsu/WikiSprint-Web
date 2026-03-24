import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ko, en, ja } from './locales';

// 지원 언어 타입
export type Language = 'ko' | 'en' | 'ja';

// 번역 키 타입 (구조만 정의)
export type TranslationKeys = typeof ko;

// 언어 정보
export const LANGUAGES: Record<Language, { label: string; nativeName: string }> = {
  ko: { label: '한국어', nativeName: '한국어' },
  en: { label: 'English', nativeName: 'English' },
  ja: { label: '日本語', nativeName: '日本語' },
};

// 번역 데이터 (타입 강제하지 않음)
const translations = {
  ko,
  en,
  ja,
} as const;

// 언어 상태
type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

// 언어 스토어
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ko',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'language-storage' }
  )
);

// 중첩된 객체에서 키로 값 가져오기
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

type TranslationKey = NestedKeyOf<TranslationKeys>;

// 번역 함수 타입
type TranslateFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

// 번역 훅
export function useTranslation(): { t: TranslateFunction; language: Language; setLanguage: (lang: Language) => void } {
  const { language, setLanguage } = useLanguageStore();

  const t: TranslateFunction = (key, params) => {
    const keys = key.split('.');
    let value: unknown = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // 키를 찾지 못하면 키 자체 반환
      }
    }

    let result = String(value);

    // 파라미터 치환
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      });
    }

    return result;
  };

  return { t, language, setLanguage };
}

// 현재 언어의 번역 데이터 가져오기
export function getTranslations(language: Language): (typeof translations)[Language] {
  return translations[language];
}
