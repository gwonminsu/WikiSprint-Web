import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useGameStore, usePendingRecordStore, useToast, useTranslation } from '@shared';
import type { ApiResponse } from '@shared';
import type { GoogleLoginResponse, RegisterRequest } from '@entities';
import { queryClient } from '@/shared/config/queryClient';
import { register } from '../api/consentApi';
import {
  startGameRecord,
  completeGameRecord,
  abandonGameRecord,
  isRecoverableClearedPendingGame,
} from '../../game-record';

export function useRegister(): UseMutationResult<ApiResponse<GoogleLoginResponse>, Error, RegisterRequest> {
  const navigate = useNavigate();
  const { setAuth, setAccountInfo, clearPendingConsent } = useAuthStore();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: async (response) => {
      clearPendingConsent();

      if (response.auth?.accessToken && response.auth?.refreshToken) {
        setAuth(response.auth.accessToken, response.auth.refreshToken);
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

      toast.success(t('auth.loginSuccess'));

      const pending = usePendingRecordStore.getState().pendingGame;
      if (pending) {
        try {
          const resp = await startGameRecord({
            targetWord: pending.targetWord,
            startDoc: pending.startDoc,
          });

          if (isRecoverableClearedPendingGame(pending)) {
            useGameStore.getState().setRecordId(resp.recordId);
            await completeGameRecord({
              recordId: resp.recordId,
              navPath: JSON.stringify(pending.navPath),
              elapsedMs: pending.elapsedMs,
            });
            toast.success(t('record.savedAfterLogin'));
          } else {
            await abandonGameRecord({ recordId: resp.recordId });
            if (pending.status === 'cleared') {
              console.warn('[useRegister] 마지막 경로가 제시어와 달라 게스트 클리어 전적 복구를 중단합니다.', {
                targetWord: pending.targetWord,
                navPath: pending.navPath,
              });
              toast.warning(t('record.savedAfterLoginFailed'));
            }
          }
        } catch {
          // 저장 실패는 로그인 자체를 막지 않는다.
        } finally {
          usePendingRecordStore.getState().clearPendingGame();
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['myAccount'] }),
        queryClient.invalidateQueries({ queryKey: ['gameRecords'] }),
        queryClient.invalidateQueries({ queryKey: ['ranking'] }),
      ]);

      navigate('/');
    },
  });
}
