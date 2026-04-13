import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getSharedRecord } from '../api/gameRecordApi';
import type { SharedGameRecord } from '@/entities/game-record';

// 공유 전적 조회 훅 — shareId 기반, 인증 불필요
export function useSharedRecord(shareId: string): UseQueryResult<SharedGameRecord, Error> {
  return useQuery({
    queryKey: ['sharedRecord', shareId],
    queryFn: () => getSharedRecord(shareId),
    enabled: !!shareId,
    staleTime: 1000 * 60 * 5, // 5분 (공유 결과는 변하지 않으므로)
    retry: false,
  });
}
