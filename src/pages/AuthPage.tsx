import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useGoogleLogin } from '@features';
import { getTokenStorage, useAuthStore, useToast, useTranslation, getLogoByLanguage, useThemeStore, ThemeOrbitToggle } from '@shared';
import { authApi } from '@features/auth/api/authApi';
import type { GoogleLoginResponse } from '@entities';
import type { ApiResponse } from '@shared';
import { handleSuccessfulLogin } from '@features/auth/lib/useGoogleLogin';
import { w } from '@widgets';

// JWT exp 클레임으로 토큰 만료 여부 확인
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// iOS 감지 — Safari, Chrome 모두 WebKit 기반이라 팝업 postMessage 불가
function isIOS(): boolean {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

// iOS 전용: Google OAuth2 authorization code flow URL 생성
// response_type=id_token은 Google 정책상 차단됨 → code flow 사용
function buildGoogleOAuth2Url(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
  const redirectUri = window.location.origin + '/auth';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    access_type: 'online',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// Google 'G' 로고 SVG
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
  const { error: showError } = useToast();
  const toast = useToast();
  const { t, language } = useTranslation();
  const { resolvedTheme, setTheme } = useThemeStore();
  const { mutate: googleLogin, isPending } = useGoogleLogin();
  const { setAuth, setAccountInfo, checkAuth, setPendingConsent, setPendingDeletionCancel } = useAuthStore();
  const tokenStorage = getTokenStorage();
  // code 교환 중복 실행 방지 (React Strict Mode 이중 마운트 대응)
  const isProcessingCode = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      window.history.replaceState(null, '', window.location.pathname);
      showError(t('auth.googleLoginFail'));
      return;
    }

    // code 처리 로직을 async 함수로 분리
    const handleCodeLogin = async (): Promise<void> => {
      if (!code || isProcessingCode.current) return;

      isProcessingCode.current = true;
      window.history.replaceState(null, '', window.location.pathname);

      try {
        const redirectUri = window.location.origin + '/auth';

        // 수정: API 응답 받기
        const response: ApiResponse<GoogleLoginResponse> = await authApi.googleLoginWithCode({
          code,
          redirectUri,
        });

        // 응답 자체 검증
        if (!response) {
          throw new Error('google/code 응답이 비어있음');
        }

        const data = response.data;

        // 신규 유저: 계정 미생성 → 약관 동의 모달 표시
        // iOS code flow에서는 credential 재사용 불가이므로, 서버가 반환한 id_token_string 사용
        if (data?.is_new_user === true) {
          if (!data.id_token_string) {
            throw new Error('신규 유저 id_token_string 미반환');
          }
          setPendingConsent(true, data.id_token_string);
          return;
        }

        // 탈퇴 대기 계정: 토큰 미발급 → 탈퇴 취소 다이얼로그 표시
        if (data?.is_deletion_pending === true) {
          setPendingDeletionCancel(true, data.deletion_scheduled_at, data.id_token_string);
          return;
        }

        // 정상 로그인: 토큰 검증
        if (!response.auth?.accessToken || !response.auth?.refreshToken) {
          throw new Error('auth 토큰이 응답에 없음');
        }

        // 정상 로그인 처리 (토큰 저장 + 계정 정보 저장 + 전적 동기화 + 홈 이동)
        await handleSuccessfulLogin(response, { setAuth, setAccountInfo, toast, t, navigate });

        // checkAuth가 비동기일 가능성 고려
        await Promise.resolve(checkAuth());
      } catch (error) {
        // 어디서 터졌는지 임시 토스트로 노출
        const message = error instanceof Error ? error.message : 'unknown error';
        showError(t('auth.iosLoginFail', { message }));
        isProcessingCode.current = false;
      }
    };

    void handleCodeLogin();

    const token = getTokenStorage().getAccessToken();
    if (token && !isTokenExpired(token)) {
      navigate('/');
    }

  }, [checkAuth, navigate, setAuth, setAccountInfo, showError, t, toast, setPendingConsent, setPendingDeletionCancel, tokenStorage]);

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

  // iOS: 전체 페이지 리다이렉트로 Google OAuth2 code flow 시작
  const handleIOSGoogleLogin = (): void => {
    window.location.href = buildGoogleOAuth2Url();
  };

  const handleThemeToggle = (nextChecked: boolean): void => {
    setTheme(nextChecked ? 'dark' : 'light');
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gray-50 px-4 py-24 dark:bg-gray-900">
      <div className="fixed right-4 top-4 z-40 flex items-center gap-2 sm:right-6 sm:top-6 sm:gap-3">
        <ThemeOrbitToggle
          checked={resolvedTheme === 'dark'}
          onCheckedChange={handleThemeToggle}
          resolvedTheme={resolvedTheme}
          ariaLabel={t('settings.themeToggleLabel')}
        />
        <w.AuthLanguageDropdown />
      </div>

      {/* 배경 패턴 레이어 */}
      <div className="fixed inset-0 pointer-events-none pattern-bg" />

      <div className="relative w-full max-w-sm rounded-2xl bg-white p-10 text-center shadow-lg dark:bg-gray-800">
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
              // iOS: 팝업 postMessage 불가 → authorization code flow 전체 페이지 리다이렉트
              <button
                type="button"
                onClick={handleIOSGoogleLogin}
                className="flex items-center gap-3 rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <GoogleIcon />
                <span>{t('auth.googleLoginButton')}</span>
              </button>
            ) : (
              // Android / Desktop: 기존 GIS 팝업 방식
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
