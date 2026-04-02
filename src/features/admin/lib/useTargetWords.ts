import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import type { TargetWordResponse } from '@entities';

// 전체 제시어 목록 조회 훅
export function useTargetWords(): UseQueryResult<TargetWordResponse[]> {
  return useQuery({
    queryKey: ['adminTargetWords'],
    queryFn: async () => {
      const response = await adminApi.getWords();
      return response.data ?? [];
    },
    staleTime: 1000 * 60, // 1분
  });
}
