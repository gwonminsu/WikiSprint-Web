// 랭킹 엔티티 타입 정의

export type RankingPeriod = 'daily' | 'weekly' | 'monthly';
export type RankingDifficulty = 'all' | 'easy' | 'normal' | 'hard';

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
