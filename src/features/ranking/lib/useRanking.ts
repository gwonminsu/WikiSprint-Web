import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getRanking } from '../api/rankingApi';
import type { RankingPeriod, RankingDifficulty, RankingListResponse } from '@/entities/ranking/types';

// 랭킹 목록 조회 훅 (React Query)
// - 비로그인도 조회 가능
// - 30초 staleTime
export function useRanking(
  period: RankingPeriod,
  difficulty: RankingDifficulty
): UseQueryResult<RankingListResponse, Error> {
  return useQuery({
    queryKey: ['ranking', period, difficulty],
    queryFn: () => getRanking({ periodType: period, difficulty }),
    staleTime: 1000 * 30,
  });
}
