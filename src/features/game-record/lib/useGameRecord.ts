import { useCallback, useRef } from 'react';
import { useAuthStore, useGameStore, usePendingRecordStore, useRankingAlertStore, useToastStore } from '@shared';
import { queryClient } from '@/shared/config/queryClient';
import {
  startGameRecord,
  updateRecordPath,
  completeGameRecord,
  abandonGameRecord,
} from '../api/gameRecordApi';

// 디바운스 타이머는 모듈 레벨에서 관리해 컴포넌트 생명주기와 분리한다.
let updatePathDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 500;

export function useGameRecord(): {
  startRecord: (targetWord: string, startDoc: string) => Promise<string | null>;
  updatePath: (navPath: string[], lastArticle: string) => void;
  completeRecord: (navPath: string[], elapsedMs: number) => void;
  abandonRecord: () => void;
} {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthRef = useRef(isAuthenticated);
  isAuthRef.current = isAuthenticated;

  const startRecord = useCallback(async (targetWord: string, startDoc: string): Promise<string | null> => {
    if (isAuthRef.current) {
      const resp = await startGameRecord({ targetWord, startDoc });
      return resp.recordId;
    }

    usePendingRecordStore.getState().setPendingGame({
      targetWord,
      startDoc,
      navPath: [startDoc],
      lastArticle: startDoc,
      startedAt: Date.now(),
      status: 'in_progress',
      elapsedMs: null,
    });
    return null;
  }, []);

  const updatePath = useCallback((navPath: string[], lastArticle: string): void => {
    if (isAuthRef.current) {
      const recordId = useGameStore.getState().recordId;
      if (!recordId) return;

      if (updatePathDebounceTimer !== null) {
        clearTimeout(updatePathDebounceTimer);
      }

      updatePathDebounceTimer = setTimeout(() => {
        updateRecordPath({
          recordId,
          navPath: JSON.stringify(navPath),
          lastArticle,
        }).catch(() => {
          // 경로 저장 실패는 플레이 진행을 막지 않는다.
        });

        updatePathDebounceTimer = null;
      }, DEBOUNCE_MS);
      return;
    }

    usePendingRecordStore.getState().updatePendingPath(navPath, lastArticle);
  }, []);

  const completeRecord = useCallback((navPath: string[], elapsedMs: number): void => {
    if (updatePathDebounceTimer !== null) {
      clearTimeout(updatePathDebounceTimer);
      updatePathDebounceTimer = null;
    }

    if (isAuthRef.current) {
      const recordId = useGameStore.getState().recordId;
      if (!recordId) return;

      completeGameRecord({
        recordId,
        navPath: JSON.stringify(navPath),
        elapsedMs,
      })
        .then((response) => {
          if (response.rankingAlert) {
            useRankingAlertStore.getState().enqueue(response.rankingAlert);
          }

          return Promise.all([
            queryClient.invalidateQueries({ queryKey: ['ranking'] }),
            queryClient.invalidateQueries({ queryKey: ['rankingAlerts'] }),
            queryClient.invalidateQueries({ queryKey: ['gameRecords'] }),
            queryClient.invalidateQueries({ queryKey: ['myAccount'] }),
          ]);
        })
        .catch((err: unknown) => {
          console.error('[useGameRecord] 클리어 전적 저장 실패:', err);
          useToastStore.getState().add({
            message: '전적 저장에 실패했습니다.',
            type: 'error',
            duration: 4000,
          });
        });
      return;
    }

    const lastArticle = navPath[navPath.length - 1];
    if (!lastArticle) return;

    usePendingRecordStore.getState().completePendingGame(navPath, lastArticle, elapsedMs);
  }, []);

  const abandonRecord = useCallback((): void => {
    if (updatePathDebounceTimer !== null) {
      clearTimeout(updatePathDebounceTimer);
      updatePathDebounceTimer = null;
    }

    if (isAuthRef.current) {
      const recordId = useGameStore.getState().recordId;
      if (!recordId) return;

      abandonGameRecord({ recordId }).catch((err: unknown) => {
        console.error('[useGameRecord] 포기 전적 저장 실패:', err);
      });
      return;
    }

    usePendingRecordStore.getState().abandonPendingGame();
  }, []);

  return { startRecord, updatePath, completeRecord, abandonRecord };
}
