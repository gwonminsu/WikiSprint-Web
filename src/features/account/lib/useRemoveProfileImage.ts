import { useMutation } from '@tanstack/react-query';
import { removeProfileImage } from '../api';
import type { RemoveProfileResponse } from '@/entities/account';

// 프로필 이미지 제거 훅
export function useRemoveProfileImage() {
  return useMutation<RemoveProfileResponse, Error, void>({
    mutationFn: removeProfileImage,
  });
}
