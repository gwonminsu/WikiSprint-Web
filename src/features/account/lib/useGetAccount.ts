import { useQuery } from '@tanstack/react-query';
import { getAccount } from '../api';

// 특정 계정 상세 조회 훅
export function useGetAccount(uuid: string) {
  return useQuery({
    queryKey: ['myAccount', uuid],
    queryFn: () => getAccount( {uuid} ),
    enabled: !!uuid,
    select: (response) => response!,
  });
}