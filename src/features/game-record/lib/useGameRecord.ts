import { useCallback, useRef } from 'react';
import { useAuthStore, useGameStore, usePendingRecordStore, useToastStore } from '@shared';
import { queryClient } from '@/shared/config/queryClient';
import {
  startGameRecord,
  updateRecordPath,
  completeGameRecord,
  abandonGameRecord,
} from '../api/gameRecordApi';

// 디바운스 타임아웃 ID를 모듈 레벨에서 관리 (컴포넌트 마운트 주기와 무관하게 유지)
let updatePathDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 500;

// 게임 전적 라이프사이클 훅
// - 로그인 시: 서버 기반 실시간 추적
// - 비로그인 시: pendingRecordStore (localStorage) 기반 로컬 추적
export function useGameRecord(): {
  startRecord: (targetWord: string, startDoc: string) => Promise<string | null>;
  updatePath: (navPath: string[], lastArticle: string) => void;
  completeRecord: (navPath: string[], elapsedMs: number) => void;
  abandonRecord: () => void;
} {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // 최신 isAuthenticated를 클로저가 아닌 ref로 참조 (debounce 콜백 내에서도 최신값 사용)
  const isAuthRef = useRef(isAuthenticated);
  isAuthRef.current = isAuthenticated;

  // 게임 시작 — 서버에 in_progress 전적 생성 또는 pendingGame 초기화
  const startRecord = useCallback(async (targetWord: string, startDoc: string): Promise<string | null> => {
    if (isAuthRef.current) {
      try {
        const resp = await startGameRecord({ targetWord, startDoc });
        return resp.recordId;
      } catch {
        return null;
      }
    } else {
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
    }
  }, []);

  // 경로 업데이트 — 500ms 디바운스로 서버 동기화 (비정상 종료 시 복구용)
  const updatePath = useCallback((navPath: string[], lastArticle: string): void => {
    if (isAuthRef.current) {
      const recordId = useGameStore.getState().recordId;
      if (!recordId) return;

      // 기존 디바운스 타이머 취소 후 재설정
      if (updatePathDebounceTimer !== null) {
        clearTimeout(updatePathDebounceTimer);
      }
      updatePathDebounceTimer = setTimeout(() => {
        updateRecordPath({
          recordId,
          navPath: JSON.stringify(navPath),
          lastArticle,
        }).catch(() => {
          // 경로 업데이트 실패는 게임 플로우에 영향 없음 — 조용히 무시
        });
        updatePathDebounceTimer = null;
      }, DEBOUNCE_MS);
    } else {
      usePendingRecordStore.getState().updatePendingPath(navPath, lastArticle);
    }
  }, []);

  // 클리어 처리 — 최종 경로와 경과 시간을 서버에 전달
  const completeRecord = useCallback((navPath: string[], elapsedMs: number): void => {
    // 디바운스 취소 (complete가 최종 상태이므로 update-path 불필요)
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
      }).then(() => {
        // 클리어 후 랭킹 캐시 무효화 (즉시 반영)
        queryClient.invalidateQueries({ queryKey: ['ranking'] });
      }).catch((err: unknown) => {
        console.error('[useGameRecord] 클리어 전적 저장 실패:', err);
        useToastStore.getState().add({ message: '전적 저장에 실패했습니다.', type: 'error', duration: 4000 });
      });
    } else {
      usePendingRecordStore.getState().completePendingGame(elapsedMs);
    }
  }, []);

  // 포기 처리
  const abandonRecord = useCallback((): void => {
    // 디바운스 취소
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
    } else {
      usePendingRecordStore.getState().abandonPendingGame();
    }
  }, []);

  return { startRecord, updatePath, completeRecord, abandonRecord };
}
