import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useGoogleLogin } from '@features';
import { getTokenStorage, useToast, useTranslation, getLogoByLanguage } from '@shared';

// JWT exp 클레임으로 토큰 만료 여부 확인 (라이브러리 없이 base64 디코딩)
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
  } catch {
    return true; // 파싱 실패 시 만료로 처리
  }
}

// iOS 감지 — Safari, Chrome 모두 WebKit 기반이라 팝업 postMessage 불가
function isIOS(): boolean {
  const ua = navigator.userAgent;

  const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
  const isIpadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;

  return isIOSDevice || isIpadOS;
}

// 디버깅 메시지 길이 제한용 헬퍼
function debugToast(showInfo: (message: string) => void, label: string, value: string): void {
  const shortValue = value.length > 120 ? `${value.slice(0, 120)}...` : value;
  showInfo(`[DEBUG] ${label}: ${shortValue}`);
}

// iOS 전용: Google OAuth2 implicit flow 리다이렉트 URL 생성
// 팝업 대신 전체 페이지 리다이렉트 → Google 인증 → id_token과 함께 /auth로 복귀
function buildGoogleOAuth2Url(showInfo: (message: string) => void): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
  const redirectUri = window.location.origin + '/auth';
  const nonce = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce,
    prompt: 'select_account',
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  debugToast(showInfo, 'origin', window.location.origin);
  debugToast(showInfo, 'redirectUri', redirectUri);
  debugToast(showInfo, 'clientId', clientId);
  debugToast(showInfo, 'oauthUrl', url);

  return url;
}

// Google 'G' 로고 SVG (iOS 전용 버튼에 사용)
function GoogleIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

// 인증 페이지 (Google OAuth)
export default function AuthPage(): React.ReactElement {
  const navigate = useNavigate();

  // 수정: iOS 디버깅용 info 토스트 추가
  const { error: showError, info: showInfo } = useToast();

  const { t, language } = useTranslation();
  const { mutate: googleLogin, isPending } = useGoogleLogin();

  useEffect(() => {
    // 수정: 콘솔로그 대신 토스트로 현재 환경 확인
    debugToast(showInfo, 'isIOS', String(isIOS()));
    // 수정: 콘솔로그 대신 토스트로 현재 href 확인
    debugToast(showInfo, 'href', window.location.href);
    // 수정: 콘솔로그 대신 토스트로 현재 origin 확인
    debugToast(showInfo, 'origin', window.location.origin);

    // iOS OAuth2 redirect 콜백 처리: URL 해시에서 id_token 추출
    const hash = window.location.hash;
    if (hash.length > 1) {
      const params = new URLSearchParams(hash.substring(1));
      const idToken = params.get('id_token');
      const error = params.get('error');

      // 콜백 해시 디버깅 토스트
      debugToast(showInfo, 'hash', hash);

      if (error) {
        // 에러값 확인용 토스트
        debugToast(showInfo, 'oauthError', error);

        window.history.replaceState(null, '', window.location.pathname);
        showError(t('auth.googleLoginFail'));
        return;
      }

      if (idToken) {
        // id_token 수신 여부 확인용 토스트
        debugToast(showInfo, 'idTokenReceived', 'true');

        window.history.replaceState(null, '', window.location.pathname);
        googleLogin({ credential: idToken });
        return;
      }
    }

    const token = getTokenStorage().getAccessToken();
    if (token && !isTokenExpired(token)) {
      navigate('/');
    }
  }, [navigate, googleLogin, showError, showInfo, t]);

  const handleGoogleSuccess = (credentialResponse: CredentialResponse): void => {
    if (!credentialResponse.credential) {
      showError(t('auth.googleLoginFail'));
      return;
    }
    googleLogin({ credential: credentialResponse.credential });
  };

  const handleGoogleError = (): void => {
    showError(t('auth.googleLoginFail'));
  };

  // iOS: 팝업 대신 전체 페이지 리다이렉트로 Google OAuth2 인증
  const handleIOSGoogleLogin = (): void => {
    // 클릭 시점 디버깅 토스트
    debugToast(showInfo, 'iosLoginClick', 'clicked');

    window.location.href = buildGoogleOAuth2Url(showInfo);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none pattern-bg" />

      <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 text-center">
        <img
          src={getLogoByLanguage(language)}
          alt="WikiSprint"
          className="h-16 mx-auto mb-2 object-contain"
        />
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
          {t('auth.welcome')}
        </p>

        {isPending ? (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex justify-center">
            {isIOS() ? (
              <button
                type="button"
                onClick={handleIOSGoogleLogin}
                className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <GoogleIcon />
                <span>Google로 로그인</span>
              </button>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                shape="rectangular"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}