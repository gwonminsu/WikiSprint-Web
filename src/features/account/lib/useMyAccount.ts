import { useQuery } from '@tanstack/react-query';
import { getMyAccount } from '../api/accountApi';
import { useAuthStore } from '@shared';
import { useEffect } from 'react';

// 내 계정 정보 조회 및 자동 저장 훅
export function useMyAccount() {
  const { isAuthenticated, setAccountInfo, accountInfo } = useAuthStore();

  // accountInfo가 없거나 nick이 없는 경우 API 호출
  const shouldFetch = isAuthenticated && (!accountInfo || !accountInfo.nick);
  
  const query = useQuery({
    queryKey: ['myAccount'],
    queryFn: getMyAccount,
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 5, // 5분
    retry: 1,
  });

  // 조회 성공 시 authStore에 저장
  useEffect(() => {
    if (query.data) {
      console.log('계정 조회 성공');
      setAccountInfo({
        uuid: query.data.uuid,
        nick: query.data.nick,
        email: query.data.email,
        profile_img_url: query.data.profile_img_url,
        is_admin: query.data.is_admin ?? false,
      });
    }
  }, [query.data, setAccountInfo]);

  return query;
}
