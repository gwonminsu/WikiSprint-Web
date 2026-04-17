import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ko, en, ja } from './locales';

// 지원 언어 타입
export type Language = 'ko' | 'en' | 'ja';

// 언어 정보
export const LANGUAGES: Record<Language, { label: string; nativeName: string }> = {
  ko: { label: '한국어', nativeName: '한국어' },
  en: { label: 'English', nativeName: 'English' },
  ja: { label: '日本語', nativeName: '日本語' },
};

// 공유 만료 안내는 locale 원본을 크게 흔들지 않도록 여기서 덮어쓴다.
// 실제 번역 데이터
const translations = {
  ko,
  en,
  ja,
} as const;

export type TranslationKeys = typeof translations.ko;

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

// 중첩된 객체에서 키 경로 문자열 추출
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

    for (const currentKey of keys) {
      if (value && typeof value === 'object' && currentKey in value) {
        value = (value as Record<string, unknown>)[currentKey];
      } else {
        // 키를 찾지 못하면 key 자체를 반환해 디버깅 가능하게 유지한다.
        return key;
      }
    }

    let result = String(value);

    // 템플릿 파라미터 치환
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
