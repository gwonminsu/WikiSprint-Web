import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useGameStore, usePendingRecordStore, useRankingAlertStore, useSettingsStore, useToast, useTranslation } from '@shared';
import type { ApiResponse } from '@shared';
import type { GoogleLoginResponse, RegisterRequest } from '@entities';
import { queryClient } from '@/shared/config/queryClient';
import { register } from '../api/consentApi';
import {
  recoverClearedGameRecord,
  startGameRecord,
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
          if (isRecoverableClearedPendingGame(pending)) {
            const resp = await recoverClearedGameRecord({
              targetWord: pending.targetWord,
              navPath: JSON.stringify(pending.navPath),
              elapsedMs: pending.elapsedMs,
            });
            // 결과 화면 공유 버튼이 recordId를 필요로 한다.
            if (resp.recordId) {
              useGameStore.getState().setRecordId(resp.recordId);
            }
            const { rankingAlertEnabled, rankingAlertPeriod } = useSettingsStore.getState();
            if (rankingAlertEnabled) {
              resp.rankingAlerts
                .filter((alert) => alert.periodType === rankingAlertPeriod)
                .sort((l, r) => new Date(l.createdAt).getTime() - new Date(r.createdAt).getTime())
                .forEach((alert) => {
                  useRankingAlertStore.getState().enqueue(alert);
                });
            }
            toast.success(t('record.savedAfterLogin'));
          } else {
            const record = await startGameRecord({ targetWord: pending.targetWord, startDoc: pending.startDoc });
            await abandonGameRecord({ recordId: record.recordId });
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
        queryClient.invalidateQueries({ queryKey: ['rankingAlerts'] }),
      ]);

      navigate('/');
    },
  });
}
