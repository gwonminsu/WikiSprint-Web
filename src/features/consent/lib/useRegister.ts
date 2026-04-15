import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { getTokenStorage, useAuthStore, usePendingRecordStore, useToast, useTranslation } from '@shared';
import { useNavigate } from 'react-router-dom';
import type { ApiResponse } from '@shared';
import type { GoogleLoginResponse, RegisterRequest } from '@entities';
import { register } from '../api/consentApi';
import {
  startGameRecord,
  completeGameRecord,
  abandonGameRecord,
} from '../../game-record';

// 약관 동의 완료 후 계정 생성 mutation 훅
export function useRegister(): UseMutationResult<ApiResponse<GoogleLoginResponse>, Error, RegisterRequest> {
  const navigate = useNavigate();
  const { setAccountInfo, clearPendingConsent } = useAuthStore();
  const tokenStorage = getTokenStorage();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: async (response) => {
      // 동의 모달 pending 상태 완전 초기화
      clearPendingConsent();

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
    },
  });
}
