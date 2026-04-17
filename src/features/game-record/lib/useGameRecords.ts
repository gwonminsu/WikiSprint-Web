import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useAuthStore } from '@shared';
import { getGameRecords } from '../api/gameRecordApi';
import type { GameRecordListResponse } from '@/entities/game-record';

// 게임 전적 목록 조회 훅 (React Query)
// - 로그인 상태에서만 쿼리 활성화
// - 2분 staleTime (전적은 자주 바뀌지 않음)
export function useGameRecords(): UseQueryResult<GameRecordListResponse, Error> {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['gameRecords', isAuthenticated ? 'auth' : 'guest'],
    queryFn: getGameRecords,
    enabled: hasHydrated && isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });
}
