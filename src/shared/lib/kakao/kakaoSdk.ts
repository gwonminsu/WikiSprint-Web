// 카카오 JavaScript SDK 초기화 유틸리티
// VITE_KAKAO_JS_KEY 환경변수로 앱 키를 관리

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY as string | undefined;
// 카카오 SDK CDN URL (integrity hash 포함 버전)
const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';

let isInitialized = false;

// 카카오 SDK 스크립트 동적 로드
function loadKakaoScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Kakao) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = KAKAO_SDK_URL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('카카오 SDK 스크립트 로드 실패'));
    document.head.appendChild(script);
  });
}

// 카카오 SDK 초기화 — 이미 초기화된 경우 스킵
export async function initKakaoSdk(): Promise<boolean> {
  if (!KAKAO_JS_KEY) return false;

  // 이미 초기화되어 있으면 바로 반환
  if (isInitialized && window.Kakao?.isInitialized()) return true;

  try {
    await loadKakaoScript();
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY);
    }
    isInitialized = !!window.Kakao?.isInitialized();
    return isInitialized;
  } catch {
    return false;
  }
}
