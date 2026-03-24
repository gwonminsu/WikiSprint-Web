import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useDialog, useTranslation, ProfileAvatar, getLogoByLanguage } from '@shared';
import { getProfileImageUrl } from '@/features/account';

// 웹 네비게이션 헤더
export function Header(): React.ReactElement {
  const { accountInfo, clearAuth } = useAuthStore();
  const { showConfirm } = useDialog();
  const { t, language } = useTranslation();
  const navigate = useNavigate();

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
        navigate('/auth');
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-6">
        {/* 로고 */}
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img
            src={getLogoByLanguage(language)}
            alt="WikiSprint"
            className="h-8 object-contain"
          />
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/settings"
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
          >
            {t('nav.settings')}
          </Link>

          {/* 사용자 메뉴 */}
          {accountInfo && (
            <div className="flex items-center gap-3">
              <ProfileAvatar
                imageUrl={profileImageUrl}
                name={accountInfo.nick}
                size="sm"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">
                {accountInfo.nick}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                {t('auth.logout')}
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
