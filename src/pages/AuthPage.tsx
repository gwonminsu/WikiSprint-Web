import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useGoogleLogin } from '@features';
import { getTokenStorage, useToast, useTranslation, getLogoByLanguage } from '@shared';

// 인증 페이지 (Google OAuth)
export default function AuthPage(): React.ReactElement {
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const { t, language } = useTranslation();
  const { mutate: googleLogin, isPending } = useGoogleLogin();

  useEffect(() => {
    if (getTokenStorage().getAccessToken()) {
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
    // 🔥 [수정] relative + overflow-hidden 추가
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* 🔥 [추가] 배경 패턴 레이어 */}
      <div className="absolute inset-0 pointer-events-none pattern-bg" />

      {/* 🔥 기존 컨텐츠 (z-index 위해 relative 유지) */}
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
            />
          </div>
        )}
      </div>
    </div>
  );
}
