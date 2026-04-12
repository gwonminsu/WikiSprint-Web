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

// 인증 페이지 (Google OAuth)
export default function AuthPage(): React.ReactElement {
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const { t, language } = useTranslation();
  const { mutate: googleLogin, isPending } = useGoogleLogin();

  useEffect(() => {
    const token = getTokenStorage().getAccessToken();
    // 토큰이 존재하고 만료되지 않은 경우에만 홈으로 리다이렉트
    if (token && !isTokenExpired(token)) {
      navigate('/');
    }
  }, [navigate]);

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
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              size="large"
              shape="rectangular"
              use_fedcm_for_prompt={false}
              itp_support
            />
          </div>
        )}
      </div>
    </div>
  );
}
