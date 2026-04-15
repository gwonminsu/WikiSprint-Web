import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, getTokenStorage, usePendingRecordStore, useToast, useTranslation, type AuthState } from '@shared';
import type { ApiResponse } from '@shared';
import { authApi } from '../api/authApi';
import type { GoogleLoginRequest, GoogleLoginResponse } from '@entities';
import {
  startGameRecord,
  completeGameRecord,
  abandonGameRecord,
} from '../../game-record';

// 로그인 성공 후 계정 정보 저장 + 전적 동기화 + 홈 이동 (정상 로그인 공통 처리)
async function handleSuccessfulLogin(
  response: ApiResponse<GoogleLoginResponse>,
  deps: {
    setAccountInfo: AuthState['setAccountInfo'];
    tokenStorage: ReturnType<typeof getTokenStorage>;
    toast: ReturnType<typeof useToast>;
    t: ReturnType<typeof useTranslation>['t'];
    navigate: ReturnType<typeof useNavigate>;
  }
): Promise<void> {
  const { setAccountInfo, tokenStorage, toast, t, navigate } = deps;

  // 토큰 저장
  if (response.auth?.accessToken && response.auth?.refreshToken) {
    tokenStorage.setTokens(response.auth.accessToken, response.auth.refreshToken);
  }
  // 계정 정보 저장
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

  toast.success(t('auth.loginSuccess'));

  // 비로그인 상태에서 플레이한 전적이 있으면 서버에 동기화
  const pending = usePendingRecordStore.getState().pendingGame;
  if (pending) {
    try {
      const resp = await startGameRecord({ targetWord: pending.targetWord, startDoc: pending.startDoc });
      if (pending.status === 'cleared' && pending.elapsedMs != null) {
        await completeGameRecord({
          recordId: resp.recordId,
          navPath: JSON.stringify(pending.navPath),
          elapsedMs: pending.elapsedMs,
        });
      } else {
        await abandonGameRecord({ recordId: resp.recordId });
      }
      toast.success(t('record.savedAfterLogin'));
    } catch {
      // 저장 실패 시 조용히 무시
    } finally {
      usePendingRecordStore.getState().clearPendingGame();
    }
  }

  navigate('/');
}

// Google 로그인 mutation 훅
export function useGoogleLogin(): UseMutationResult<ApiResponse<GoogleLoginResponse>, Error, GoogleLoginRequest> {
  const navigate = useNavigate();
  const { setAccountInfo, setPendingConsent, setPendingDeletionCancel } = useAuthStore();
  const tokenStorage = getTokenStorage();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: GoogleLoginRequest) => authApi.googleLogin(data),
    onSuccess: async (response, variables) => {
      const data = response.data;

      // 신규 유저: 계정 미생성 → 약관 동의 모달 표시
      if (data?.is_new_user === true) {
        // credential을 저장하여 /auth/register 호출 시 재사용
        setPendingConsent(true, variables.credential);
        return;
      }

      // 탈퇴 대기 계정: 토큰 미발급 → 탈퇴 취소 다이얼로그 표시
      if (data?.is_deletion_pending === true) {
        // id_token_string: 서버가 반환한 재사용 가능 토큰으로 /auth/cancel-deletion 호출 시 사용
        setPendingDeletionCancel(true, data.deletion_scheduled_at, data.id_token_string);
        return;
      }

      // 정상 로그인
      await handleSuccessfulLogin(response, { setAccountInfo, tokenStorage, toast, t, navigate });
    },
  });
}

// 외부에서 재사용 가능하도록 export (AuthPage iOS flow에서 사용)
export { handleSuccessfulLogin };
