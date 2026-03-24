import type { Language } from '../../lib/i18n/i18n';

import logoKo from './wikisprint-logo-ko.png';
import logoEn from './wikisprint-logo-en.png';
import logoJa from './wikisprint-logo-ja.png';

// 언어별 로고 이미지 맵
const logoMap: Record<Language, string> = {
  ko: logoKo,
  en: logoEn,
  ja: logoJa,
};

// 현재 언어에 맞는 로고 이미지 URL 반환
export function getLogoByLanguage(language: Language): string {
  return logoMap[language];
}
