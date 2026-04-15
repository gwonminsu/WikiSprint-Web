import { useState, useEffect } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { useToast, useTranslation, useDialog } from '@shared';
import type { ConsentType, ConsentItem } from '@entities';
import { useRegister } from '@features/consent';

// 필수 동의 타입 목록 (서버 ConsentConstants.REQUIRED_TYPES와 동일)
const REQUIRED_CONSENT_TYPES: ConsentType[] = [
  'terms_of_service',
  'privacy_policy',
  'age_verification',
];

// 모든 동의 타입 (UI 표시 순서 유지)
const ALL_CONSENT_TYPES: ConsentType[] = [
  'terms_of_service',
  'privacy_policy',
  'age_verification',
  'marketing_notification',
];

// 각 동의 항목의 현재 버전 (서버 ConsentConstants와 일치해야 함)
const CONSENT_VERSIONS: Record<ConsentType, string> = {
  terms_of_service: 'v1.0',
  privacy_policy: 'v1.0',
  age_verification: 'v1.0',
  marketing_notification: 'v1.0',
};

type Props = {
  isOpen: boolean;
  credential: string;
  onCancel: () => void;
};

// 약관 동의 모달
// - Radix Dialog 기반 하단 시트 (모바일) / 중앙 다이얼로그 (데스크톱)
// - 필수 3개 (이용약관, 개인정보, 만14세) + 선택 1개 (마케팅)
// - 전체동의 ↔ 개별 체크 양방향 동기화
// - 필수 3개 모두 체크 시 가입 버튼 색상 전환 애니메이션으로 활성화
export function ConsentModal({ isOpen, credential, onCancel }: Props): React.ReactElement {
  const { t } = useTranslation();
  const toast = useToast();
  const { showConfirm } = useDialog();
  const { mutate: registerMutate, isPending } = useRegister();

  // 각 동의 항목 체크 상태
  const [checked, setChecked] = useState<Record<ConsentType, boolean>>({
    terms_of_service: false,
    privacy_policy: false,
    age_verification: false,
    marketing_notification: false,
  });

  // 닫기 컨펌 중복 오픈 방지
  const [isClosingConfirmOpen, setIsClosingConfirmOpen] = useState<boolean>(false);

  // 모달이 열릴 때 체크 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setChecked({
        terms_of_service: false,
        privacy_policy: false,
        age_verification: false,
        marketing_notification: false,
      });
      setIsClosingConfirmOpen(false);
    }
  }, [isOpen]);

  // ESC 키는 전역으로 직접 처리
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      handleCloseRequest();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPending, isClosingConfirmOpen]);

  // 전체 동의 여부
  const isAllChecked: boolean = ALL_CONSENT_TYPES.every((type) => checked[type]);

  // 필수 항목 모두 체크 여부 (가입 버튼 활성화 조건)
  const isRequiredAllChecked: boolean = REQUIRED_CONSENT_TYPES.every((type) => checked[type]);

  // 전체 동의 토글
  const handleToggleAll = (): void => {
    const nextValue = !isAllChecked;
    const next = {} as Record<ConsentType, boolean>;
    ALL_CONSENT_TYPES.forEach((type) => { next[type] = nextValue; });
    setChecked(next);
  };

  // 개별 항목 토글
  const handleToggle = (type: ConsentType): void => {
    setChecked((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleCloseRequest = (): void => {
    // 가입 요청 중이거나 이미 컨펌 열려있으면 무시
    if (isPending || isClosingConfirmOpen) return;

    setIsClosingConfirmOpen(true);

    // 닫기 요청 시 컨펌 다이얼로그 표시
    showConfirm({
      title: t('consent.cancelTitle'),
      message: t('consent.cancelMessage'),
      confirmText: t('consent.cancelConfirmButton'),
      cancelText: t('common.cancel'),
      onConfirm: () => {
        setIsClosingConfirmOpen(false);
        onCancel();
      },
      onCancel: () => {
        setIsClosingConfirmOpen(false);
      },
    });
  };

  // 가입 요청: 동의한 항목만 배열에 포함 (미동의 선택 항목은 배열에서 제외)
  const handleSignUp = (): void => {
    if (!isRequiredAllChecked || isPending) return;

    const consents: ConsentItem[] = ALL_CONSENT_TYPES
      .filter((type) => checked[type])
      .map((type) => ({ type, version: CONSENT_VERSIONS[type] }));

    registerMutate(
      { credential, consents },
      {
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : t('common.error'));
        },
      }
    );
  };

  return (
    <RadixDialog.Root open={isOpen} modal={false}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/60 animate-fade-in" onClick={handleCloseRequest} />

        <RadixDialog.Content
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          aria-describedby={undefined}
          // [수정] full-screen Content 자체를 백드롭처럼 사용
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseRequest();
            }
          }}
        >
          <div
            className="
              w-full sm:max-w-lg
              bg-white dark:bg-gray-800
              rounded-t-3xl sm:rounded-3xl
              shadow-2xl
              flex flex-col
              max-h-[92dvh] sm:max-h-[85vh]
              animate-scale-in
            "
          >
            {/* 헤더 */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <RadixDialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('consent.title')}
                </RadixDialog.Title>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('consent.description')}
                </p>
              </div>

              {/* 우측 상단 X 버튼 */}
              <button
                type="button"
                onClick={handleCloseRequest}
                disabled={isPending}
                aria-label={t('common.close')}
                className="
                  shrink-0
                  w-9 h-9 rounded-full
                  flex items-center justify-center
                  text-gray-400 hover:text-gray-600
                  hover:bg-gray-100
                  dark:hover:bg-gray-700 dark:hover:text-gray-200
                  transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* 스크롤 가능한 본문 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin-custom">
              {/* 전체 동의 버튼 */}
              <button
                type="button"
                onClick={handleToggleAll}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <CircleCheckIcon checked={isAllChecked} />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {t('consent.agreeAll')}
                </span>
              </button>

              <div className="border-t border-gray-100 dark:border-gray-700" />

              {/* 이용약관 (필수) */}
              <ConsentAccordionItem
                label={t('consent.termsOfService')}
                required
                checked={checked.terms_of_service}
                onToggle={() => handleToggle('terms_of_service')}
                content={t('consent.termsContent')}
              />

              {/* 개인정보 처리방침 (필수) */}
              <ConsentAccordionItem
                label={t('consent.privacyPolicy')}
                required
                checked={checked.privacy_policy}
                onToggle={() => handleToggle('privacy_policy')}
                content={t('consent.privacyContent')}
              />

              {/* 만 14세 이상 확인 (필수) */}
              <ConsentAccordionItem
                label={t('consent.ageVerification')}
                required
                checked={checked.age_verification}
                onToggle={() => handleToggle('age_verification')}
                content={t('consent.ageContent')}
              />

              {/* 마케팅 알림 동의 (선택) */}
              <ConsentAccordionItem
                label={t('consent.marketingNotification')}
                required={false}
                checked={checked.marketing_notification}
                onToggle={() => handleToggle('marketing_notification')}
                content={t('consent.marketingContent')}
              />
            </div>

            {/* 가입 버튼 */}
            <div className="px-6 pb-6 pt-4 shrink-0 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={handleSignUp}
                disabled={!isRequiredAllChecked || isPending}
                className={`
                  consent-signup-btn
                  ${isRequiredAllChecked ? 'consent-signup-btn--active' : ''}
                  w-full py-4 rounded-2xl font-bold text-sm text-white
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <span className="consent-signup-btn__label">
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('common.loading')}
                    </span>
                  ) : (
                    t('consent.signUp')
                  )}
                </span>
              </button>
            </div>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

// 원형 체크 아이콘
function CircleCheckIcon({ checked }: { checked: boolean }): React.ReactElement {
  return (
    <div
      className={`
        w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
        transition-all duration-200
        ${checked
          ? 'bg-primary border-primary'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
        }
      `}
    >
      {checked && (
        <svg className="w-3 h-3 text-gray-900 dark:text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
        </svg>
      )}
    </div>
  );
}

// 아코디언 형태 동의 항목 컴포넌트 (열기/닫기 + 하단 체크박스)
type ConsentAccordionItemProps = {
  label: string;
  required: boolean;
  checked: boolean;
  onToggle: () => void;
  content: string;
};

function ConsentAccordionItem({
  label,
  required,
  checked,
  onToggle,
  content,
}: ConsentAccordionItemProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { t } = useTranslation();

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* 헤더: 열기/닫기 토글 */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          w-full flex items-center justify-between px-4 py-3 text-left
          bg-white dark:bg-gray-800
          hover:bg-gray-50 dark:hover:bg-gray-700
          transition-colors
          group
        "
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            {label}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-medium ${
              required
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {required ? t('consent.required') : t('consent.optional')}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 consent-accordion-chevron ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 약관 내용 + 개별 동의 체크 */}
      <div
        className={`consent-accordion-content ${
          isOpen ? 'consent-accordion-content--open' : 'consent-accordion-content--closed'
        }`}
      >
        <div className="consent-accordion-content-inner">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap mb-3">
              {content}
            </p>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2" />
          </div>
        </div>
      </div>

      {/* 개별 체크박스 (항상 표시) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="w-full flex items-center gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <CircleCheckIcon checked={checked} />
        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
          {required ? t('consent.agreeRequired') : t('consent.agreeOptional')}
        </span>
      </button>
    </div>
  );
}
