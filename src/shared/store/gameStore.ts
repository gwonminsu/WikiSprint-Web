import { create } from 'zustand';

// 게임 진행 단계
type GamePhase = 'intro' | 'ready' | 'playing' | 'completed' | 'result';

// 게임 상태 타입
type GameState = {
  phase: GamePhase;
  targetWord: string;
  currentDocTitle: string;
  navigationHistory: string[];  // 방문한 문서 제목 배열 (시작 문서 포함)
  elapsedMs: number;            // 경과 시간 (밀리초)
  isTimerRunning: boolean;

  // 액션
  setPhase: (phase: GamePhase) => void;
  startGame: (targetWord: string, startDocTitle: string) => void;
  navigateToDoc: (docTitle: string) => void;
  tickTimer: (elapsedMs: number) => void;
  completeGame: () => void;
  resetGame: () => void;
};

// 초기 상태
const initialState = {
  phase: 'intro' as GamePhase,
  targetWord: '',
  currentDocTitle: '',
  navigationHistory: [],
  elapsedMs: 0,
  isTimerRunning: false,
};

// 게임 진행 상태 스토어 (비영속 — 새로고침 시 초기화)
export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setPhase: (phase: GamePhase): void => {
    set({ phase });
  },

  // 게임 시작: 제시어와 시작 문서를 설정하고 타이머 시작
  startGame: (targetWord: string, startDocTitle: string): void => {
    set({
      phase: 'playing',
      targetWord,
      currentDocTitle: startDocTitle,
      navigationHistory: [startDocTitle],
      elapsedMs: 0,
      isTimerRunning: true,
    });
  },

  // 문서 이동: 방문 히스토리에 추가하고 현재 문서 제목 업데이트
  navigateToDoc: (docTitle: string): void => {
    set((state) => ({
      currentDocTitle: docTitle,
      navigationHistory: [...state.navigationHistory, docTitle],
    }));
  },

  // 타이머 틱: 경과 시간 업데이트
  tickTimer: (elapsedMs: number): void => {
    set({ elapsedMs });
  },

  // 게임 클리어: 타이머 정지, 완료 상태로 전환
  completeGame: (): void => {
    set({ phase: 'completed', isTimerRunning: false });
  },

  // 게임 초기화: 모든 상태를 초기값으로 리셋
  resetGame: (): void => {
    set({ ...initialState });
  },
}));
