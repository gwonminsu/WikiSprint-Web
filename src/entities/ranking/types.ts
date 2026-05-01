// 랭킹 엔티티 타입 정의

export type RankingPeriod = 'daily' | 'weekly' | 'monthly';
export type RankingDifficulty = 'all' | 'easy' | 'normal' | 'hard';
export type RankingAlertDifficulty = Exclude<RankingDifficulty, 'all'>;

export interface RankingRecord {
  id: number;
  accountId: string;
  nickname: string;
  profileImageUrl: string | null;
  nationality: string | null;
  periodType: RankingPeriod;
  difficulty: RankingDifficulty;
  elapsedMs: number;
  targetWord: string;
  startDoc: string;
  pathLength: number;
  createdAt: string;
}

export interface RankingListResponse {
  top100: RankingRecord[];
  me: RankingRecord | null;
  bucketDate: string;
  serverNow: string;
}

export interface RankingListRequest {
  periodType: RankingPeriod;
  difficulty: RankingDifficulty;
}

export interface RankingAlertPlayer {
  accountId: string;
  nickname: string;
  profileImageUrl: string | null;
  nationality: string | null;
  startDoc: string;
  targetWord: string;
  pathLength: number;
  elapsedMs: number;
}

export type RankingAlertKind = 'new-entry' | 'overtake';
export type RankingAlertStatus = 'idle' | 'showing' | 'exiting';

export interface RankingAlertResponse {
  alertId: string;
  kind: RankingAlertKind;
  createdAt: string;
  periodType: RankingPeriod;
  difficulty: RankingAlertDifficulty;
  winner: RankingAlertPlayer;
  loser: RankingAlertPlayer | null;
  currentRank: number;
  previousRank: number | null;
  winnerRankDelta: number | null;
}
