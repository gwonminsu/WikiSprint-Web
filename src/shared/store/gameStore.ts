import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type GamePhase = 'intro' | 'ready' | 'playing' | 'completed' | 'result';

// 0: 오마카세, 1: 쉬움, 2: 보통, 3: 어려움
export type Difficulty = 0 | 1 | 2 | 3;

type GameState = {
  phase: GamePhase;
  targetWord: string;
  currentDocTitle: string;
  navigationHistory: string[];
  elapsedMs: number;
  isTimerRunning: boolean;
  recordId: string | null;
  gameStartedAt: number | null;
  difficulty: Difficulty;

  setPhase: (phase: GamePhase) => void;
  startGame: (targetWord: string, startDocTitle: string, recordId: string | null) => void;
  setRecordId: (recordId: string | null) => void;
  navigateToDoc: (docTitle: string) => void;
  popDoc: () => void;
  tickTimer: (elapsedMs: number) => void;
  completeGame: () => void;
  resetGame: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
};

const initialState = {
  phase: 'intro' as GamePhase,
  targetWord: '',
  currentDocTitle: '',
  navigationHistory: [],
  elapsedMs: 0,
  isTimerRunning: false,
  recordId: null,
  gameStartedAt: null,
  difficulty: 0 as Difficulty,
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,

      setPhase: (phase: GamePhase): void => {
        set({ phase });
      },

      startGame: (targetWord: string, startDocTitle: string, recordId: string | null): void => {
        set({
          phase: 'playing',
          targetWord,
          currentDocTitle: startDocTitle,
          navigationHistory: [startDocTitle],
          elapsedMs: 0,
          isTimerRunning: true,
          recordId,
          gameStartedAt: Date.now(),
        });
      },

      // 비로그인 클리어 후 로그인 저장된 전적 ID를 결과 화면에 다시 반영
      setRecordId: (recordId: string | null): void => {
        set({ recordId });
      },

      navigateToDoc: (docTitle: string): void => {
        set((state) => ({
          currentDocTitle: docTitle,
          navigationHistory: [...state.navigationHistory, docTitle],
        }));
      },

      popDoc: (): void => {
        set((state) => {
          if (state.navigationHistory.length <= 1) return state;

          const newHistory = state.navigationHistory.slice(0, -1);
          return {
            navigationHistory: newHistory,
            currentDocTitle: newHistory[newHistory.length - 1],
          };
        });
      },

      tickTimer: (elapsedMs: number): void => {
        set({ elapsedMs });
      },

      completeGame: (): void => {
        set({ phase: 'completed', isTimerRunning: false });
      },

      resetGame: (): void => {
        set((state) => ({ ...initialState, difficulty: state.difficulty }));
      },

      setDifficulty: (difficulty: Difficulty): void => {
        set({ difficulty });
      },
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        phase: state.phase,
        targetWord: state.targetWord,
        currentDocTitle: state.currentDocTitle,
        navigationHistory: state.navigationHistory,
        recordId: state.recordId,
        gameStartedAt: state.gameStartedAt,
        difficulty: state.difficulty,
        elapsedMs: state.elapsedMs,
      }),
    }
  )
);
