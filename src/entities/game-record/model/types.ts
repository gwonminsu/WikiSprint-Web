// 게임 전적 도메인 타입

// 게임 전적 상태
export type GameRecordStatus = 'in_progress' | 'cleared' | 'abandoned';

// 개별 전적 레코드
export type GameRecord = {
  recordId: string;
  accountId: string;
  targetWord: string;
  startDoc: string;
  navPath: string[];           // 방문 경로 배열 (서버 JSON 문자열 → 파싱 후)
  elapsedMs: number | null;    // cleared 상태에서만 설정
  status: GameRecordStatus;
  lastArticle: string | null;
  playedAt: string;            // ISO 날짜 문자열
};

// 누적 통계 요약 (accounts 테이블 기반)
export type RecordSummary = {
  totalPlays: number;
  clearCount: number;
  giveUpCount: number;
  bestTimeMs: number | null;
};

// 전적 목록 조회 응답
export type GameRecordListResponse = {
  records: GameRecord[];
  summary: RecordSummary;
};

// 게임 시작 요청
export type StartGameRecordRequest = {
  targetWord: string;
  startDoc: string;
};

// 게임 시작 응답
export type StartGameRecordResponse = {
  recordId: string;
};

// 경로 업데이트 요청
export type UpdatePathRequest = {
  recordId: string;
  navPath: string;        // JSON.stringify된 배열
  lastArticle: string;
};

// 클리어 요청
export type CompleteRecordRequest = {
  recordId: string;
  navPath: string;
  elapsedMs: number;
};

// 포기 요청
export type AbandonRecordRequest = {
  recordId: string;
};

// 공유용 전적 응답 (공개 정보만 포함)
export type SharedGameRecord = {
  nick: string;
  profileImgUrl: string | null;
  targetWord: string;
  startDoc: string;
  navPath: string[];
  elapsedMs: number;
};

// 비로그인 임시 게임 상태 (pendingRecordStore용)
export type PendingGameState = {
  targetWord: string;
  startDoc: string;
  navPath: string[];
  lastArticle: string;
  startedAt: number;          // Date.now() — 경과 시간 계산용
  status: 'in_progress' | 'cleared' | 'abandoned';
  elapsedMs: number | null;   // cleared 시에만 설정
};
