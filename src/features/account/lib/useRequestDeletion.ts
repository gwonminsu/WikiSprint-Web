import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { requestDeletion } from '../api';

type RequestDeletionVariables = {
  immediate?: boolean;
};

// 회원탈퇴 요청 훅
// - immediate=false(기본): 7일 유예 후 스케줄러 삭제
// - immediate=true: 즉시 삭제 (테스트용)
export function useRequestDeletion(): UseMutationResult<void, Error, RequestDeletionVariables> {
  return useMutation<void, Error, RequestDeletionVariables>({
    mutationFn: ({ immediate = false }: RequestDeletionVariables) => requestDeletion(immediate),
  });
}
