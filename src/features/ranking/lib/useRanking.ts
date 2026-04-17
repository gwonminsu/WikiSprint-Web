import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useAuthStore } from '@shared';
import { getRanking } from '../api/rankingApi';
import type { RankingPeriod, RankingDifficulty, RankingListResponse } from '@/entities/ranking/types';

// 랭킹 목록 조회 훅 (React Query)
// - 비로그인도 조회 가능
// - 30초 staleTime
export function useRanking(
  period: RankingPeriod,
  difficulty: RankingDifficulty
): UseQueryResult<RankingListResponse, Error> {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['ranking', period, difficulty, isAuthenticated ? 'auth' : 'guest'],
    queryFn: () => getRanking({ periodType: period, difficulty }),
    enabled: hasHydrated,
    staleTime: 1000 * 30,
  });
}
