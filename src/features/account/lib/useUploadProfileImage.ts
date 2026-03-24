import { useMutation } from '@tanstack/react-query';
import { uploadProfileImage } from '../api';
import type { UploadProfileResponse } from '@/entities/account';

// 프로필 이미지 업로드 훅
export function useUploadProfileImage() {
  return useMutation<UploadProfileResponse, Error, File>({
    mutationFn: uploadProfileImage,
  });
}
