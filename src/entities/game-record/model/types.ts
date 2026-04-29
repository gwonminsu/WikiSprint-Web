// 게임 전적 상태
export type GameRecordStatus = 'in_progress' | 'cleared' | 'abandoned';

// 개별 전적 레코드
export type GameRecord = {
  recordId: string;
  accountId: string;
  targetWord: string;
  difficulty: number | null;
  startDoc: string;
  // 방문 경로 배열 (서버 JSON 문자열 -> 파싱 후)
  navPath: string[];
  // cleared 상태에서만 설정
  elapsedMs: number | null;
  status: GameRecordStatus;
  lastArticle: string | null;
  // ISO 날짜 문자열
  playedAt: string;
};

// 누적 통계 요약 (accounts 테이블 기반)
export type RecordSummary = {
  totalPlays: number;
  clearCount: number;
  giveUpCount: number;
  bestTimeMs: number | null;
};

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
  // JSON.stringify된 배열
  navPath: string;
  lastArticle: string;
};

// 클리어 요청
export type CompleteRecordRequest = {
  recordId: string;
  navPath: string;
  elapsedMs: number;
};

export type CompleteRecordResponse = {
  rankingAlert: import('@/entities/ranking/types').RankingAlertResponse | null;
};

// 포기 요청
export type AbandonRecordRequest = {
  recordId: string;
};

// 공유 링크 생성 요청
export type CreateShareRecordRequest = {
  recordId: string;
};

// 공유 링크 생성 응답
export type ShareRecord = {
  shareId: string;
  expiresAt: string;
};

// 공유 전용 전적 응답
export type SharedGameRecord = {
  nick: string;
  profileImgUrl: string | null;
  targetWord: string;
  startDoc: string;
  navPath: string[];
  elapsedMs: number;
  expiresAt: string;
};

// 비로그인 임시 게임 상태 (pendingRecordStore용)
export type PendingGameState = {
  targetWord: string;
  startDoc: string;
  navPath: string[];
  lastArticle: string;
  // Date.now() 기준 경과 시간 계산용
  startedAt: number;
  status: 'in_progress' | 'cleared' | 'abandoned';
  // cleared 시에만 설정
  elapsedMs: number | null;
};
