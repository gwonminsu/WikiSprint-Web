import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PendingGameState } from '@/entities/game-record';

// 비로그인 상태에서 게임 진행 상태를 임시 저장하는 스토어
// 로그인 후 서버 전송 후 초기화됨. localStorage에 persist하여 새로고침/크래시 에도 유지됨
type PendingRecordState = {
  pendingGame: PendingGameState | null;
  setPendingGame: (game: PendingGameState) => void;
  updatePendingPath: (navPath: string[], lastArticle: string) => void;
  completePendingGame: (elapsedMs: number) => void;
  abandonPendingGame: () => void;
  clearPendingGame: () => void;
};

export const usePendingRecordStore = create<PendingRecordState>()(
  persist(
    (set) => ({
      pendingGame: null,

      // 게임 시작 — 새 pendingGame 설정
      setPendingGame: (game: PendingGameState): void => {
        set({ pendingGame: game });
      },

      // 경로 업데이트 (문서 이동 시 localStorage에 실시간 반영)
      updatePendingPath: (navPath: string[], lastArticle: string): void => {
        set((state) => {
          if (!state.pendingGame) return {};
          return {
            pendingGame: { ...state.pendingGame, navPath, lastArticle },
          };
        });
      },

      // 클리어 처리
      completePendingGame: (elapsedMs: number): void => {
        set((state) => {
          if (!state.pendingGame) return {};
          return {
            pendingGame: { ...state.pendingGame, status: 'cleared', elapsedMs },
          };
        });
      },

      // 포기 처리
      abandonPendingGame: (): void => {
        set((state) => {
          if (!state.pendingGame) return {};
          return {
            pendingGame: { ...state.pendingGame, status: 'abandoned' },
          };
        });
      },

      // 로그인 후 서버 저장 완료 시 초기화
      clearPendingGame: (): void => {
        set({ pendingGame: null });
      },
    }),
    { name: 'pending-record-storage' }
  )
);
