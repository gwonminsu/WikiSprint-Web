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
  ownerTabId: string | null;
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
  ownerTabId: null,
  difficulty: 0 as Difficulty,
};

const GAME_TAB_ID_STORAGE_KEY = 'game-tab-id';
const GAME_HEARTBEAT_STORAGE_KEY = 'game-heartbeat';
const GAME_HEARTBEAT_STALE_MS = 10_000;

type GameHeartbeat = {
  tabId: string;
  recordId: string | null;
  updatedAt: number;
};

function getCurrentGameTabId(): string {
  const existingTabId = sessionStorage.getItem(GAME_TAB_ID_STORAGE_KEY);
  if (existingTabId) {
    return existingTabId;
  }

  const newTabId = crypto.randomUUID();
  sessionStorage.setItem(GAME_TAB_ID_STORAGE_KEY, newTabId);
  return newTabId;
}

function readGameHeartbeat(): GameHeartbeat | null {
  const raw = localStorage.getItem(GAME_HEARTBEAT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as GameHeartbeat;
  } catch {
    return null;
  }
}

function writeGameHeartbeat(recordId: string | null): void {
  const heartbeat: GameHeartbeat = {
    tabId: getCurrentGameTabId(),
    recordId,
    updatedAt: Date.now(),
  };
  localStorage.setItem(GAME_HEARTBEAT_STORAGE_KEY, JSON.stringify(heartbeat));
}

function clearGameHeartbeat(): void {
  const heartbeat = readGameHeartbeat();
  if (heartbeat?.tabId !== getCurrentGameTabId()) {
    return;
  }
  localStorage.removeItem(GAME_HEARTBEAT_STORAGE_KEY);
}

export function syncGameHeartbeat(recordId: string | null): void {
  writeGameHeartbeat(recordId);
}

export function releaseGameHeartbeat(): void {
  clearGameHeartbeat();
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,

      setPhase: (phase: GamePhase): void => {
        set({ phase });
      },

      startGame: (targetWord: string, startDocTitle: string, recordId: string | null): void => {
        writeGameHeartbeat(recordId);
        set({
          phase: 'playing',
          targetWord,
          currentDocTitle: startDocTitle,
          navigationHistory: [startDocTitle],
          elapsedMs: 0,
          isTimerRunning: true,
          recordId,
          gameStartedAt: Date.now(),
          ownerTabId: getCurrentGameTabId(),
        });
      },

      // 비로그인 클리어 후 로그인 저장된 전적 ID를 결과 화면에 다시 반영
      setRecordId: (recordId: string | null): void => {
        const state = useGameStore.getState();
        if (state.phase === 'playing' && state.ownerTabId === getCurrentGameTabId()) {
          writeGameHeartbeat(recordId);
        }
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
        clearGameHeartbeat();
        set({ phase: 'completed', isTimerRunning: false });
      },

      resetGame: (): void => {
        clearGameHeartbeat();
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
        ownerTabId: state.ownerTabId,
        difficulty: state.difficulty,
        elapsedMs: state.elapsedMs,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const currentTabId = getCurrentGameTabId();
        if (state.ownerTabId === null || state.ownerTabId === currentTabId) {
          return;
        }
        if (state.phase !== 'playing' || state.recordId === null) {
          useGameStore.setState((currentState) => ({
            ...initialState,
            difficulty: currentState.difficulty,
          }));
          return;
        }

        const heartbeat = readGameHeartbeat();
        const hasActiveOwner =
          heartbeat?.tabId === state.ownerTabId &&
          heartbeat.updatedAt >= Date.now() - GAME_HEARTBEAT_STALE_MS;

        if (hasActiveOwner) {
          useGameStore.setState((currentState) => ({
            ...initialState,
            difficulty: currentState.difficulty,
          }));
          return;
        }

        // 원래 탭이 사라진 고아 세션이면 현재 탭이 소유권을 넘겨받아 자동 정리 효과를 이어간다.
        useGameStore.setState({
          ownerTabId: currentTabId,
        });
      },
    }
  )
);
