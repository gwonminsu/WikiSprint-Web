import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, getTokenStorage, usePendingRecordStore, useToast, useTranslation } from '@shared';
import type { ApiResponse } from '@shared';
import { authApi } from '../api/authApi';
import type { GoogleLoginRequest, GoogleLoginResponse } from '@entities';
import {
  startGameRecord,
  completeGameRecord,
  abandonGameRecord,
} from '../../game-record/api/gameRecordApi';

// Google 로그인 mutation 훅
export function useGoogleLogin(): UseMutationResult<ApiResponse<GoogleLoginResponse>, Error, GoogleLoginRequest> {
  const navigate = useNavigate();
  const { setAccountInfo } = useAuthStore();
  const tokenStorage = getTokenStorage();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: GoogleLoginRequest) => authApi.googleLogin(data),
    onSuccess: async (response) => {
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
    },
  });
}
