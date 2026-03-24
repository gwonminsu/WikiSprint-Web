import { useThemeStore, useTranslation, useAuthStore, ProfileAvatar, LANGUAGES, type Theme, type Language } from '@shared';
import { getProfileImageUrl } from '@/features/account';

// 설정 뷰 위젯
export function SettingsView(): React.ReactElement {
  const { theme, setTheme } = useThemeStore();
  const { t, language, setLanguage } = useTranslation();
  const { accountInfo } = useAuthStore();

  const profileImageUrl = accountInfo?.profile_img_url
    ? getProfileImageUrl(accountInfo.profile_img_url)
    : null;
  const nickname = accountInfo?.nick || t('common.user');

  // 테마 옵션
  const themeOptions: { value: Theme; label: string }[] = [
    { value: 'light', label: t('settings.themeLight') },
    { value: 'dark', label: t('settings.themeDark') },
    { value: 'system', label: t('settings.themeSystem') },
  ];

  // 언어 옵션
  const languageOptions: { value: Language; label: string }[] = [
    { value: 'ko', label: LANGUAGES.ko.nativeName },
    { value: 'en', label: LANGUAGES.en.nativeName },
    { value: 'ja', label: LANGUAGES.ja.nativeName },
  ];

  return (
    <div className="space-y-6">

      {/* 내 계정 */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          {t('common.account')}
        </h2>
        <div className="flex items-center gap-4">
          <ProfileAvatar imageUrl={profileImageUrl} name={nickname} size="rg" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{nickname}</p>
            {accountInfo?.email && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{accountInfo.email}</p>
            )}
          </div>
        </div>
      </section>

      {/* 테마 설정 */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          {t('settings.theme')}
        </h2>
        <div className="flex gap-3 flex-wrap">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                theme === option.value
                  ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                  : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {/* 언어 설정 */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          {t('settings.language')}
        </h2>
        <div className="flex gap-3 flex-wrap">
          {languageOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLanguage(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                language === option.value
                  ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                  : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {/* 앱 정보 */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          {t('settings.about')}
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-gray-900 dark:text-white">{t('settings.version')}</span>
          <span className="text-gray-500 dark:text-gray-400">0.1.0</span>
        </div>
      </section>

    </div>
  );
}
