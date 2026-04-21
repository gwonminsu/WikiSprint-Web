import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { setAuthFailureCallback, useAuthStore, useDialog, useToast, useTranslation, getTokenStorage } from '@shared';
import { ConsentModal } from '@widgets';
import { authApi } from '@features/auth/api/authApi';

// 코드 스플리팅 — 각 페이지를 별도 청크로 분리하여 초기 번들 크기 절감
// nsfwjs/TensorFlow.js 등 무거운 의존성이 필요한 페이지만 지연 로딩됨
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const DocPage = lazy(() => import('@/pages/DocPage'));
const DonationInfoPage = lazy(() => import('@/pages/DonationInfoPage'));
const RecordPage = lazy(() => import('@/pages/RecordPage'));
const RankingPage = lazy(() => import('@/pages/RankingPage'));
const SharePage = lazy(() => import('@/pages/SharePage'));

// 인증 실패 시 SPA 내 navigate 등록 — BrowserRouter 내부에서 useNavigate 사용
function AuthFailureHandler(): null {
  const navigate = useNavigate();

  useEffect(() => {
    setAuthFailureCallback(() => {
      navigate('/auth');
    });
  }, [navigate]);

  return null;
}

// 탈퇴 취소 다이얼로그 + 약관 동의 모달 — BrowserRouter 내부에서 useNavigate 사용
function GlobalModals(): React.ReactElement {
  const {
    pendingConsent,
    pendingCredential,
    clearPendingConsent,
    pendingDeletionCancel,
    deletionScheduledAt,
    pendingDeletionCredential,
    setPendingDeletionCancel,
    setAccountInfo,
  } = useAuthStore();
  const navigate = useNavigate();
  const { showConfirm } = useDialog();
  const toast = useToast();
  const { t } = useTranslation();
  const tokenStorage = getTokenStorage();

  // 탈퇴 취소 다이얼로그: pendingDeletionCancel === true일 때 표시
  useEffect(() => {
    if (!pendingDeletionCancel || !deletionScheduledAt) return;

    showConfirm({
      title: t('account.deletionCancelTitle'),
      message: t('account.deletionCancelMessage', { date: deletionScheduledAt }),
      confirmText: t('account.cancelDeletion'),
      cancelText: t('account.keepDeletion'),
      onConfirm: () => {
        if (!pendingDeletionCredential) {
          toast.error(t('common.error'));
          setPendingDeletionCancel(false);
          return;
        }
        // async 처리: void로 처리 (에러 케이스는 catch에서 토스트)
        void (async () => {
          try {
            const response = await authApi.cancelDeletion({ credential: pendingDeletionCredential });
            setPendingDeletionCancel(false);
            if (response.auth?.accessToken && response.auth?.refreshToken) {
              tokenStorage.setTokens(response.auth.accessToken, response.auth.refreshToken);
            }
            if (response.data) {
              setAccountInfo({
                uuid: response.data.uuid,
                nick: response.data.nick,
                nationality: response.data.nationality ?? null,
                email: response.data.email,
                profile_img_url: response.data.profile_img_url,
                is_admin: response.data.is_admin ?? false,
              });
            }
            toast.success(t('account.deletionCancelled'));
            navigate('/');
          } catch (error) {
            toast.error(error instanceof Error ? error.message : t('common.error'));
            setPendingDeletionCancel(false);
          }
        })();
      },
      onCancel: () => {
        // 탈퇴 유지: 상태 초기화 후 로그인 페이지로
        setPendingDeletionCancel(false);
        navigate('/auth');
      },
    });
  // showConfirm은 안정적인 참조이므로 dep 배열에서 제외하여 중복 표시 방지
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDeletionCancel]);

  return (
    <>
      {/* 약관 동의 모달: 신규 가입 시 표시 */}
      <ConsentModal
        isOpen={pendingConsent}
        credential={pendingCredential ?? ''}
        onCancel={clearPendingConsent}
      />
    </>
  );
}

// 앱 라우터
export function Router(): React.ReactElement {
  return (
    <BrowserRouter>
      <AuthFailureHandler />
      <GlobalModals />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/doc" element={<DocPage />} />
          <Route path="/donations" element={<DonationInfoPage />} />
          <Route path="/record" element={<RecordPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/share/:shareId" element={<SharePage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
