import type { Language } from '../../lib/i18n/i18n';

import logoKo from './wikisprint-logo-ko.png';
import logoEn from './wikisprint-logo-en.png';
import logoJa from './wikisprint-logo-ja.png';
import tutoDoc from './tutoDoc.png';
import talkerStart from './talker-start.png';
import talkerFinger from './talker-finger.png';
import talkerIdle from './talker-idle.png';
import talkerYawn from './talker-yawn.png';
import talkerSleep from './talker-sleep.png';
import talkerGood from './talker-good.png';
import talkerOk from './talker-ok.png';
import talkerLate from './talker-late.png';
import talkerWarn from './talker-warn.png';

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

// 튜토리얼 문서 이미지
export { tutoDoc };

// 캐릭터(talker) 이미지
export { talkerStart, talkerFinger, talkerIdle, talkerYawn, talkerSleep, talkerGood, talkerOk, talkerLate, talkerWarn };
