import { useMutation } from '@tanstack/react-query';
import { updateNick } from '../api';
import type { UpdateNickRequest, UpdateNickResponse } from '@/entities/account';

// 닉네임 변경 훅
export function useUpdateNick() {
  return useMutation<UpdateNickResponse, Error, UpdateNickRequest>({
    mutationFn: updateNick,
  });
}
