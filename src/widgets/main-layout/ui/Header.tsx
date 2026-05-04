import { useNavigate } from 'react-router-dom';
import { useAuthStore, useDialog, useTranslation, useToast, ProfileAvatar, getLogoByLanguage } from '@shared';
import { getProfileImageUrl, useGameLeaveGuard } from '@features';

function NavDivider(): React.ReactElement {
  return (
    <div className="w-px h-4 bg-gray-300/60 dark:bg-gray-600/60 shrink-0" />
  );
}

export function Header(): React.ReactElement {
  const { accountInfo, clearAuth } = useAuthStore();
  const { showConfirm } = useDialog();
  const { t, language } = useTranslation();
  const { success: showSuccess } = useToast();
  const navigate = useNavigate();
  const { guardedNavigate } = useGameLeaveGuard();

  const profileImageUrl = accountInfo?.profile_img_url
    ? getProfileImageUrl(accountInfo.profile_img_url)
    : null;

  const handleLogout = (): void => {
    showConfirm({
      title: t('auth.logout'),
      message: t('auth.logoutConfirm'),
      confirmText: t('auth.logout'),
      onConfirm: () => {
        clearAuth();
        navigate('/');
        showSuccess(t('auth.logoutSuccess'));
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-6">
        <button
          type="button"
          onClick={() => guardedNavigate('/')}
          className="hover:opacity-80 transition-opacity shrink-0"
        >
          <img
            src={getLogoByLanguage(language)}
            alt="WikiSprint"
            className="h-8 object-contain"
          />
        </button>

        <nav className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => guardedNavigate('/')}
            className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors px-1"
          >
            📙{t('nav.home')}
          </button>

          <NavDivider />

          <button
            type="button"
            onClick={() => guardedNavigate('/play')}
            className="whitespace-nowrap flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors px-1"
          >
            🎮{t('game.helpButton')}
          </button>

          <NavDivider />

          <button
            type="button"
            onClick={() => guardedNavigate('/ranking')}
            className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors px-1"
          >
            🏆{t('nav.ranking')}
          </button>

          <NavDivider />

          <button
            type="button"
            onClick={() => guardedNavigate('/settings')}
            className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors px-1"
          >
            ⚙️{t('nav.settings')}
          </button>

          <NavDivider />

          {accountInfo ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => guardedNavigate('/record')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <ProfileAvatar
                  imageUrl={profileImageUrl}
                  name={accountInfo.nick}
                  size="sm"
                />
                <span className="whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                  {accountInfo.nick}
                </span>
              </button>
              <NavDivider />
              <button
                type="button"
                onClick={handleLogout}
                className="whitespace-nowrap text-sm text-red-400 hover:font-bold transition-all"
              >
                {t('auth.logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500 dark:text-gray-400">
                  <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9 1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
                </svg>
              </div>
              <span className="whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                {t('auth.guest')}
              </span>
              <NavDivider />
              <button
                type="button"
                onClick={() => guardedNavigate('/auth')}
                className="whitespace-nowrap text-sm text-red-400 hover:font-bold transition-all"
              >
                {t('auth.login')}
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
