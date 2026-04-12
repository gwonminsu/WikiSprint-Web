import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useGoogleLogin } from '@features';
import { getTokenStorage, useAuthStore, useToast, useTranslation, getLogoByLanguage, API_BASE_URL } from '@shared';

// JWT exp 클레임으로 토큰 만료 여부 확인 (라이브러리 없이 base64 디코딩)
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
  } catch {
    return true; // 파싱 실패 시 만료로 처리
  }
}

// iOS 기기 감지 (Safari, Chrome 모두 WebKit 사용으로 동일 문제 발생)
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// URL 해시 파라미터 파싱
function parseHash(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!hash || hash === '#') return params;
  hash.replace(/^#/, '').split('&').forEach((pair) => {
    const [key, value] = pair.split('=');
    if (key) params[decodeURIComponent(key)] = decodeURIComponent(value ?? '');
  });
  return params;
}

// 인증 페이지 (Google OAuth)
export default function AuthPage(): React.ReactElement {
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const { t, language } = useTranslation();
  const { mutate: googleLogin, isPending } = useGoogleLogin();
  const { setAccountInfo, checkAuth } = useAuthStore();

  useEffect(() => {
    // iOS redirect 방식 콜백 처리: URL 해시에 토큰이 있는 경우
    const hashParams = parseHash(window.location.hash);

    if (hashParams['error'] === 'login_failed') {
      // 해시 클리어 후 에러 표시
      window.history.replaceState(null, '', window.location.pathname);
      showError(t('auth.googleLoginFail'));
      return;
    }

    if (hashParams['at'] && hashParams['rt']) {
      // 토큰 저장
      getTokenStorage().setTokens(hashParams['at'], hashParams['rt']);

      // 계정 정보 저장
      setAccountInfo({
        uuid: hashParams['uuid'] ?? '',
        nick: hashParams['nick'] ?? '',
        email: hashParams['email'] ?? '',
        profile_img_url: hashParams['piu'] || null,
        is_admin: hashParams['adm'] === 'true',
        nationality: hashParams['nat'] || null,
      });

      // 인증 상태 갱신 후 해시 클리어
      checkAuth();
      window.history.replaceState(null, '', window.location.pathname);
      navigate('/');
      return;
    }

    // 이미 로그인된 경우 홈으로 이동
    const token = getTokenStorage().getAccessToken();
    if (token && !isTokenExpired(token)) {
      navigate('/');
    }
  }, [navigate, showError, t, setAccountInfo, checkAuth]);

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

  // iOS에서 사용할 redirect 방식 login_uri
  const googleRedirectUri = `${API_BASE_URL}/api/auth/google/redirect`;

  return (
    // relative + overflow-hidden 추가
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* 배경 패턴 레이어 */}
      <div className="absolute inset-0 pointer-events-none pattern-bg" />

      {/* 기존 컨텐츠 (z-index 위해 relative 유지) */}
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
              // iOS: 팝업 차단 이슈로 redirect 방식 사용
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                shape="rectangular"
                ux_mode="redirect"
                login_uri={googleRedirectUri}
              />
            ) : (
              // 기타 환경: 기존 팝업 방식
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
