import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 게임 진행 단계
type GamePhase = 'intro' | 'ready' | 'playing' | 'completed' | 'result';

// 난이도 타입 (0: 오마카세/전체 랜덤, 1: 쉬움, 2: 보통, 3: 어려움)
export type Difficulty = 0 | 1 | 2 | 3;

// 게임 상태 타입
type GameState = {
  phase: GamePhase;
  targetWord: string;
  currentDocTitle: string;
  navigationHistory: string[];  // 방문한 문서 제목 배열 (시작 문서 포함)
  elapsedMs: number;            // 경과 시간 (밀리초)
  isTimerRunning: boolean;
  recordId: string | null;      // 서버 전적 ID (로그인 시 게임 시작과 함께 설정)
  gameStartedAt: number | null; // Date.now() — 비정상 종료 감지용
  difficulty: Difficulty;       // 선택된 난이도 (0: 오마카세, 1~3: 쉬움/보통/어려움)

  // 액션
  setPhase: (phase: GamePhase) => void;
  startGame: (targetWord: string, startDocTitle: string, recordId: string | null) => void;
  navigateToDoc: (docTitle: string) => void;
  popDoc: () => void;
  tickTimer: (elapsedMs: number) => void;
  completeGame: () => void;
  resetGame: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
};

// 초기 상태
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

// 게임 진행 상태 스토어
// persist: phase/recordId 등을 localStorage에 저장하여 새로고침/크래시 후 비정상 종료 감지 가능
export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,

      setPhase: (phase: GamePhase): void => {
        set({ phase });
      },

      // 게임 시작: 제시어, 시작 문서, 서버 전적 ID 설정 + 타이머 시작
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

      // 문서 이동: 방문 히스토리에 추가하고 현재 문서 제목 업데이트
      navigateToDoc: (docTitle: string): void => {
        set((state) => ({
          currentDocTitle: docTitle,
          navigationHistory: [...state.navigationHistory, docTitle],
        }));
      },

      // 뒤로가기: 히스토리 마지막 항목 제거 후 직전 문서로 복귀
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

      // 타이머 틱: 경과 시간 업데이트
      tickTimer: (elapsedMs: number): void => {
        set({ elapsedMs });
      },

      // 게임 클리어: 타이머 정지, 완료 상태로 전환
      completeGame: (): void => {
        set({ phase: 'completed', isTimerRunning: false });
      },

      // 게임 초기화: difficulty를 제외한 상태를 초기값으로 리셋
      resetGame: (): void => {
        set((state) => ({ ...initialState, difficulty: state.difficulty }));
      },

      // 난이도 설정 (게임 리셋과 독립적으로 유지)
      setDifficulty: (difficulty: Difficulty): void => {
        set({ difficulty });
      },
    }),
    {
      name: 'game-storage',
      // isTimerRunning은 새로고침 시 복구하지 않음 (타이머는 재시작 불가)
      // elapsedMs는 결과 화면(completed)에서 새로고침 시 클리어 시간 유지를 위해 persist
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
