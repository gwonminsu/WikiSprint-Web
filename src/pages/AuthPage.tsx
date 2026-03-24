import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useGoogleLogin } from '@features';
import { getTokenStorage, useToast, useTranslation } from '@shared';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

// 인증 페이지 (Google OAuth)
export default function AuthPage(): React.ReactElement {
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const { t } = useTranslation();
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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">WikiSprint</h1>
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
    </GoogleOAuthProvider>
  );
}
