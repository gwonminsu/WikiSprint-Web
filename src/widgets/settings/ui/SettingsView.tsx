import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useTranslation,
  useAuthStore,
  ProfileAvatar,
  ThemeControlGroup,
  LANGUAGES,
  useToast,
  useDialog,
  type Language,
  getCountryFlagUrl,
  getCountryFlagSrcSet,
  COUNTRY_LIST,
  type CountryOption,
  ApiException,
} from '@shared';
import { getProfileImageUrl, useUpdateNick, useUpdateNationality, useRequestDeletion, ProfileImageEditModal } from '@/features/account';
import { AdminTargetWordsSection } from './AdminTargetWordsSection';

// 이메일 마스킹: 첫 글자 제외 @ 이전을 ***으로 치환
function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 1) return email;
  return `${email.charAt(0)}***${email.slice(atIndex)}`;
}

// 설정 뷰 위젯
export function SettingsView(): React.ReactElement {
  const { t, language, setLanguage } = useTranslation();
  const { accountInfo, setAccountInfo, clearAuth } = useAuthStore();
  const { success: toastSuccess, error: toastError } = useToast();
  const { showConfirm } = useDialog();
  const updateNickMutation = useUpdateNick();
  const updateNationalityMutation = useUpdateNationality();
  const requestDeletionMutation = useRequestDeletion();
  const navigate = useNavigate();

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
  // 국적 드롭다운 상태
  const [isNationalityOpen, setIsNationalityOpen] = useState<boolean>(false);
  const [nationalitySearch, setNationalitySearch] = useState<string>('');
  const nationalityRef = useRef<HTMLDivElement>(null);

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
    } catch (error: unknown) {
      // 서버가 반환한 에러 메시지(닉네임 중복 등)를 토스트에 직접 표시
      if (error instanceof ApiException && error.message) {
        toastError(error.message);
      } else {
        toastError(t('profile.nickUpdateFail'));
      }
      setIsEditingNick(false);
    }
  };

  // 국적 드롭다운 외부 클릭 시 닫기
  useEffect((): (() => void) => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (nationalityRef.current && !nationalityRef.current.contains(e.target as Node)) {
        setIsNationalityOpen(false);
        setNationalitySearch('');
      }
    };
    if (isNationalityOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNationalityOpen]);

  // 국적 선택 (null = 무국적)
  const selectNationality = async (code: string | null): Promise<void> => {
    setIsNationalityOpen(false);
    setNationalitySearch('');
    try {
      const response = await updateNationalityMutation.mutateAsync({ nationality: code });
      if (accountInfo) {
        setAccountInfo({ ...accountInfo, nationality: response.nationality });
      }
      toastSuccess(t('profile.nationalityUpdateSuccess'));
    } catch {
      toastError(t('profile.nationalityUpdateFail'));
    }
  };

  // 국가 목록 필터링 (검색어 기반) — 검색어가 바뀔 때만 재계산
  const filteredCountries: CountryOption[] = useMemo(() =>
    COUNTRY_LIST.filter((c: CountryOption): boolean => {
      if (!nationalitySearch) return true;
      const q = nationalitySearch.toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        c.nameKo.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.nameJa.toLowerCase().includes(q)
      );
    }),
    [nationalitySearch]
  );

  // 현재 국적의 국가 정보
  const currentCountry: CountryOption | undefined = COUNTRY_LIST.find(
    (c: CountryOption): boolean => c.code === accountInfo?.nationality
  );

  // 현재 국적 국기 이미지 URL 계산
  const currentFlagUrl: string | null = getCountryFlagUrl(accountInfo?.nationality);

  // 현재 국적 국기 srcSet 계산
  const currentFlagSrcSet: string | undefined = getCountryFlagSrcSet(accountInfo?.nationality);

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
        {accountInfo ? (
          // 로그인 상태: 기존 프로필 UI
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
                {accountInfo.email && (
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

                {/* 국적 */}
                <div className="relative flex items-center gap-1 mt-0.5" ref={nationalityRef}>
                  {/* 국기 이미지 */}
                  {currentFlagUrl ? (
                    <img
                      src={currentFlagUrl}
                      srcSet={currentFlagSrcSet}
                      alt={
                        currentCountry
                          ? (language === 'ja'
                              ? currentCountry.nameJa
                              : language === 'en'
                                ? currentCountry.nameEn
                                : currentCountry.nameKo)
                          : 'flag'
                      }
                      width={16}
                      height={12}
                      className="shrink-0 rounded-xs object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">🌐</span>
                  )}

                  <span className="text-sm text-gray-500 dark:text-gray-400 truncate ml-1">
                    {currentCountry
                      ? (language === 'ja' ? currentCountry.nameJa : language === 'en' ? currentCountry.nameEn : currentCountry.nameKo)
                      : t('profile.stateless')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNationalityOpen((prev: boolean) => !prev);
                      setNationalitySearch('');
                    }}
                    className="p-1 text-gray-400 hover:text-primary rounded transition-colors shrink-0"
                    aria-label={t('profile.selectNationality')}
                  >
                    {/* 연필 아이콘 */}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>

                  {/* 국적 선택 드롭다운 */}
                  {isNationalityOpen && (
                    <div
                      className="absolute z-50 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden"
                      style={{ top: '100%', left: 0 }}
                    >
                      {/* 검색 입력 */}
                      <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                        <input
                          type="text"
                          value={nationalitySearch}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNationalitySearch(e.target.value)}
                          placeholder={t('profile.selectNationality')}
                          autoFocus
                          className="w-full text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-primary text-gray-900 dark:text-white"
                        />
                      </div>
                      {/* 국가 목록 */}
                      <ul className="max-h-48 overflow-y-auto">
                        {/* 무국적 옵션 */}
                        <li>
                          <button
                            type="button"
                            onClick={() => void selectNationality(null)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors text-left ${
                              !accountInfo.nationality ? 'text-primary font-semibold' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <span>🌐</span>
                            <span>{t('profile.stateless')}</span>
                          </button>
                        </li>

                        {/* 국가 목록 */}
                        {filteredCountries.map((c: CountryOption) => (
                          <li key={c.code}>
                            <button
                              type="button"
                              onClick={() => void selectNationality(c.code)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors text-left ${
                                accountInfo.nationality === c.code ? 'text-primary font-semibold' : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {/* 국기 이미지 */}
                              <img
                                src={getCountryFlagUrl(c.code) ?? undefined}
                                srcSet={getCountryFlagSrcSet(c.code)}
                                alt={language === 'ja' ? c.nameJa : language === 'en' ? c.nameEn : c.nameKo}
                                width={16}
                                height={12}
                                className="shrink-0 rounded-xs object-cover mr-1"
                                loading="lazy"
                              />

                              <span className="truncate">
                                {language === 'ja' ? c.nameJa : language === 'en' ? c.nameEn : c.nameKo}
                              </span>
                            </button>
                          </li>
                        ))}

                        {filteredCountries.length === 0 && (
                          <li className="px-3 py-3 text-xs text-gray-400 text-center">
                            {t('common.searchEmpty')}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 관리자 배지 (관리자 계정에만 표시) */}
                {accountInfo.is_admin && (
                  <div className="mt-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-widest text-yellow-400 bg-gray-900 dark:bg-gray-950 border border-yellow-500/40 rounded select-none">
                      {/* 방패 아이콘 */}
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                      </svg>
                      {t('admin.badge')}
                    </span>
                  </div>
                )}

              </div>
            </div>
          </div>
        ) : (
          // 비로그인 상태: 게스트 UI
          <div className="flex items-start gap-4">

            {/* 달리는 사람 아이콘 */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 dark:text-gray-500">
                  <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9 1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
                </svg>
              </div>
            </div>

            {/* 로그인 유도 문구 + 버튼 */}
            <div className="min-w-0 flex-1 h-24 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-3 min-w-0 w-full text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t('auth.loginPrompt')}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-yellow-400 via-orange-400 to-red-500 hover:from-yellow-500 hover:via-orange-500 hover:to-red-600 shadow-md hover:shadow-lg transition-all"
                >
                  {t('auth.login')}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 테마 설정 */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          {t('settings.theme')}
        </h2>
        <div className="space-y-3">
          <ThemeControlGroup />
          <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {t('settings.themeControlHint')}
          </p>
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

      {/* 관리자 전용: 제시어 관리 섹션 */}
      {accountInfo?.is_admin && <AdminTargetWordsSection />}

      {/* 앱 정보 */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
          {t('settings.about')}
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-gray-900 dark:text-white">{t('settings.version')}</span>
          <span className="text-gray-500 dark:text-gray-400">2.9.0</span>
        </div>
      </section>

      {/* 회원탈퇴 — 로그인 상태에서만 표시, 권장하지 않는 디자인으로 시각적으로 낮은 강조 */}
      {accountInfo && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            type="button"
            onClick={() => {
              showConfirm({
                title: t('account.deleteAccountTitle'),
                message: t('account.deleteAccountMessage'),
                confirmText: t('account.deleteAccountConfirm'),
                cancelText: t('common.cancel'),
                onConfirm: () => {
                  requestDeletionMutation.mutate(
                    { immediate: true },
                    {
                      onSuccess: () => {
                        clearAuth();
                        navigate('/auth');
                        toastSuccess(t('account.deleteAccountRequested'));
                      },
                      onError: (error) => {
                        toastError(error instanceof Error ? error.message : t('common.error'));
                      },
                    }
                  );
                },
              });
            }}
            className="text-xs text-gray-400 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-500 transition-colors underline-offset-2 hover:underline"
          >
            {t('account.deleteAccount')}
          </button>
        </div>
      )}

      {/* 프로필 이미지 편집 모달 (로그인 상태에서만 렌더링) */}
      {accountInfo && (
        <ProfileImageEditModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentImageUrl={profileImageUrl}
          isCustomImage={
            !!accountInfo.profile_img_url &&
            !accountInfo.profile_img_url.startsWith('http')
          }
        />
      )}

    </div>
  );
}
