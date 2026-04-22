import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { setAuthFailureCallback, useAuthStore, useDialog, useToast, useTranslation, getTokenStorage } from '@shared';
import { GameLeaveGuard } from '@features';
import { ConsentModal } from '@widgets';
import { authApi } from '@features/auth/api/authApi';

// 코드 스플리팅으로 각 페이지를 필요 시점에만 로드한다.
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const DocPage = lazy(() => import('@/pages/DocPage'));
const DonationInfoPage = lazy(() => import('@/pages/DonationInfoPage'));
const RecordPage = lazy(() => import('@/pages/RecordPage'));
const RankingPage = lazy(() => import('@/pages/RankingPage'));
const SharePage = lazy(() => import('@/pages/SharePage'));

// 인증 실패 시 SPA 내부에서 로그인 페이지로 보낸다.
function AuthFailureHandler(): null {
  const navigate = useNavigate();

  useEffect(() => {
    setAuthFailureCallback(() => {
      navigate('/auth');
    });
  }, [navigate]);

  return null;
}

// 전역 다이얼로그와 약관 동의 모달은 라우터 내부에서 제어한다.
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
        setPendingDeletionCancel(false);
        navigate('/auth');
      },
    });
  // showConfirm은 안정 참조로 유지되므로 중복 표시를 막기 위해 의존성에서 제외한다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletionScheduledAt, navigate, pendingDeletionCancel, pendingDeletionCredential, setAccountInfo, setPendingDeletionCancel, t, toast, tokenStorage]);

  return (
    <>
      <ConsentModal
        isOpen={pendingConsent}
        credential={pendingCredential ?? ''}
        onCancel={clearPendingConsent}
      />
    </>
  );
}

export function Router(): React.ReactElement {
  return (
    <BrowserRouter>
      <AuthFailureHandler />
      <GameLeaveGuard />
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
