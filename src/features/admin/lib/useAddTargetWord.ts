import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import type { AddTargetWordRequest } from '@entities';

// 제시어 추가 mutation 훅
export function useAddTargetWord(): UseMutationResult<void, Error, AddTargetWordRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddTargetWordRequest): Promise<void> => {
      await adminApi.addWord(data);
    },
    onSuccess: () => {
      // 목록 캐시 무효화 → 자동 재조회
      void queryClient.invalidateQueries({ queryKey: ['adminTargetWords'] });
    },
  });
}
