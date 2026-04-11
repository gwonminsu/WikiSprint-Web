import { useMutation } from '@tanstack/react-query';
import { updateNationality } from '../api';
import type { UpdateNationalityRequest, UpdateNationalityResponse } from '@/entities/account';

// 국적 변경 훅
export function useUpdateNationality() {
  return useMutation<UpdateNationalityResponse, Error, UpdateNationalityRequest>({
    mutationFn: updateNationality,
  });
}
