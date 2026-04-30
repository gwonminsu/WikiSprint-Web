import type { Language } from '../../lib/i18n/i18n';

import logoKo from './wikisprint-logo-ko.png';
import logoEn from './wikisprint-logo-en.png';
import logoJa from './wikisprint-logo-ja.png';
import logoZh from './wikisprint-logo-zh.png';
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
import gameClear from './game-clear.png';
import donationCoffee from './donation-coffee.png';
import donationAwake from './donation-awake.png';
import donationBarrel from './donation-barrel.png';
import donationOverdose from './donation-overdose.png';
export { podoGalleryImages, type PodoGalleryImage } from './cat';

// 언어별 로고 이미지 맵
const logoMap: Record<Language, string> = {
  ko: logoKo,
  en: logoEn,
  ja: logoJa,
  zh: logoZh,
};

// 현재 언어에 맞는 로고 이미지 URL 반환
export function getLogoByLanguage(language: Language): string {
  return logoMap[language];
}

// 튜토리얼 문서 이미지
export { tutoDoc };

// 캐릭터(talker) 이미지
export { talkerStart, talkerFinger, talkerIdle, talkerYawn, talkerSleep, talkerGood, talkerOk, talkerLate, talkerWarn };

// 결과 화면 이미지
export { gameClear };

// 후원 알림 연출 이미지
export { donationCoffee, donationAwake, donationBarrel, donationOverdose };
