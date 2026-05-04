import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, useDialog, useTranslation, useToast, ProfileAvatar, getLogoByLanguage } from '@shared';
import { getProfileImageUrl, useGameLeaveGuard } from '@features';

type HeaderNavItem = {
  href: string;
  icon: string;
  label: string;
  accent?: boolean;
};

function NavDivider(): React.ReactElement {
  return <div className="header-nav-divider" />;
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header(): React.ReactElement {
  const { accountInfo, clearAuth } = useAuthStore();
  const { showConfirm } = useDialog();
  const { t, language } = useTranslation();
  const { success: showSuccess } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { guardedNavigate } = useGameLeaveGuard();

  const profileImageUrl = accountInfo?.profile_img_url
    ? getProfileImageUrl(accountInfo.profile_img_url)
    : null;

  const navItems: HeaderNavItem[] = [
    { href: '/', icon: '📙', label: t('nav.home') },
    { href: '/play', icon: '🎮', label: t('game.helpButton'), accent: true },
    { href: '/ranking', icon: '🏆', label: t('nav.ranking') },
    { href: '/settings', icon: '⚙️', label: t('nav.settings') },
  ];

  const navigateWithTransition = (path: string): void => {
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => void;
    };

    if (transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(() => {
        guardedNavigate(path);
      });
      return;
    }

    guardedNavigate(path);
  };

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
    <header className="sticky top-0 z-50 border-b border-gray-200/85 bg-white/82 backdrop-blur-xl dark:border-gray-700/70 dark:bg-gray-800/78">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-3 sm:px-4 md:px-6">
        <button
          type="button"
          onClick={() => navigateWithTransition('/')}
          className="header-logo-button shrink-0"
        >
          <img
            src={getLogoByLanguage(language)}
            alt="WikiSprint"
            className="h-8 object-contain"
          />
        </button>

        <nav className="flex min-w-0 flex-nowrap items-center justify-end gap-2 sm:gap-3">
          {navItems.map((item, index) => {
            const active = isActivePath(location.pathname, item.href);
            const navClassName = [
              'header-nav-button',
              item.accent ? 'header-nav-button--accent' : '',
              active ? 'header-nav-button--active' : '',
            ].filter(Boolean).join(' ');

            return (
              <div key={item.href} className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => navigateWithTransition(item.href)}
                  aria-current={active ? 'page' : undefined}
                  className={navClassName}
                >
                  <span className="header-nav-button__icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
                {index < navItems.length - 1 ? <NavDivider /> : null}
              </div>
            );
          })}

          <NavDivider />

          {accountInfo ? (
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => navigateWithTransition('/record')}
                aria-current={isActivePath(location.pathname, '/record') ? 'page' : undefined}
                className={`header-profile-button ${isActivePath(location.pathname, '/record') ? 'header-profile-button--active' : ''}`}
              >
                <ProfileAvatar
                  imageUrl={profileImageUrl}
                  name={accountInfo.nick}
                  size="sm"
                />
                <span className="header-account-name whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                  {accountInfo.nick}
                </span>
              </button>
              <NavDivider />
              <button
                type="button"
                onClick={handleLogout}
                className="header-auth-button"
              >
                {t('auth.logout')}
              </button>
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500 dark:text-gray-400">
                  <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9 1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
                </svg>
              </div>
              <span className="header-guest-name whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                {t('auth.guest')}
              </span>
              <NavDivider />
              <button
                type="button"
                onClick={() => navigateWithTransition('/auth')}
                aria-current={isActivePath(location.pathname, '/auth') ? 'page' : undefined}
                className={`header-auth-button ${isActivePath(location.pathname, '/auth') ? 'header-auth-button--active' : ''}`}
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
