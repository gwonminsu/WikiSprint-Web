import { useState } from 'react';
import { useThemeStore, useTranslation, useAuthStore, ProfileAvatar, LANGUAGES, useToast, type Theme, type Language } from '@shared';
import { getProfileImageUrl, useUpdateNick, ProfileImageEditModal } from '@/features/account';

// 이메일 마스킹: 첫 글자 제외 @ 이전을 ***으로 치환
function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 1) return email;
  return `${email.charAt(0)}***${email.slice(atIndex)}`;
}

// 설정 뷰 위젯
export function SettingsView(): React.ReactElement {
  const { theme, setTheme } = useThemeStore();
  const { t, language, setLanguage } = useTranslation();
  const { accountInfo, setAccountInfo } = useAuthStore();
  const { success: toastSuccess, error: toastError } = useToast();
  const updateNickMutation = useUpdateNick();

  const profileImageUrl = accountInfo?.profile_img_url
    ? getProfileImageUrl(accountInfo.profile_img_url)
    : null;
  const nickname = accountInfo?.nick || t('common.user');

  // 닉네임 편집 상태
  const [isEditingNick, setIsEditingNick] = useState<boolean>(false);
  const [nickInput, setNickInput] = useState<string>(nickname);
  // 이메일 노출 상태
  const [isEmailRevealed, setIsEmailRevealed] = useState<boolean>(false);
  // 프로필 이미지 모달 상태
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // 닉네임 편집 시작
  const startEditNick = (): void => {
    setNickInput(accountInfo?.nick || '');
    setIsEditingNick(true);
  };

  // 닉네임 편집 취소
  const cancelEditNick = (): void => {
    setIsEditingNick(false);
    setNickInput(accountInfo?.nick || '');
  };

  // 닉네임 저장
  const saveNick = async (): Promise<void> => {
    const trimmed = nickInput.trim();
    if (!trimmed || trimmed === accountInfo?.nick) {
      setIsEditingNick(false);
      return;
    }
    try {
      const response = await updateNickMutation.mutateAsync({ nick: trimmed });
      if (accountInfo) {
        setAccountInfo({ ...accountInfo, nick: response.nick });
      }
      toastSuccess(t('profile.nickUpdateSuccess'));
      setIsEditingNick(false);
    } catch {
      toastError(t('profile.nickUpdateFail'));
      setIsEditingNick(false);
    }
  };

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
        <div className="flex items-start gap-4">

          {/* 프로필 아바타 + 이미지 변경 버튼 */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <ProfileAvatar imageUrl={profileImageUrl} name={nickname} size="xl" />
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="text-xs text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 dark:hover:bg-orange-950/20 dark:hover:border-orange-400 dark:hover:text-orange-400 font-medium transition-colors"
            >
              {t('profile.changeProfileImage')}
            </button>
          </div>

          {/* 닉네임 + 이메일 — 아바타(96px) 기준 중앙 정렬 */}
          <div className="min-w-0 flex-1 h-24 flex items-center">
            
            <div className="flex flex-col justify-center min-w-0 w-full">

              {/* 닉네임 */}
              {isEditingNick ? (
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={nickInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickInput(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') void saveNick();
                        if (e.key === 'Escape') cancelEditNick();
                      }}
                      autoFocus
                      maxLength={15}
                      className="font-semibold text-gray-900 dark:text-white bg-transparent border-b border-primary outline-none flex-1 text-sm pb-0.5 min-w-0"
                    />
                    {/* 체크 버튼 */}
                    <button
                      type="button"
                      onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}
                      onClick={() => void saveNick()}
                      className="p-1 text-primary hover:text-primary/70 rounded transition-colors shrink-0"
                      aria-label={t('common.save')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  </div>
                  {/* 글자수 카운터 */}
                  <span className={`text-xs text-right ${nickInput.length >= 15 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    {nickInput.length}/15
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{nickname}</p>
                  <button
                    type="button"
                    onClick={startEditNick}
                    className="p-1 text-gray-400 hover:text-primary rounded transition-colors shrink-0"
                    aria-label={t('profile.editNickname')}
                  >
                    {/* 연필 아이콘 */}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
              )}

              {/* 이메일 */}
              {accountInfo?.email && (
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {isEmailRevealed ? accountInfo.email : maskEmail(accountInfo.email)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEmailRevealed((prev: boolean) => !prev)}
                    className="p-1 text-gray-400 hover:text-primary rounded transition-colors shrink-0"
                    aria-label={t('profile.showEmail')}
                  >
                    {isEmailRevealed ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    )}
                  </button>
                </div>
              )}

            </div>
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
          <span className="text-gray-500 dark:text-gray-400">1.2.0</span>
        </div>
      </section>

      {/* 프로필 이미지 편집 모달 */}
      <ProfileImageEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentImageUrl={profileImageUrl}
        isCustomImage={
          !!accountInfo?.profile_img_url &&
          !accountInfo.profile_img_url.startsWith('http')
        }
      />

    </div>
  );
}
