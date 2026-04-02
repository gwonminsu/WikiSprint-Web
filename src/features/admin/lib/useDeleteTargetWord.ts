import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import type { DeleteTargetWordRequest } from '@entities';

// 제시어 삭제 mutation 훅
export function useDeleteTargetWord(): UseMutationResult<void, Error, DeleteTargetWordRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteTargetWordRequest): Promise<void> => {
      await adminApi.deleteWord(data);
    },
    onSuccess: () => {
      // 목록 캐시 무효화 → 자동 재조회
      void queryClient.invalidateQueries({ queryKey: ['adminTargetWords'] });
    },
  });
}
