import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@shared';
import { getMyAccount } from '../api/accountApi';

// 내 계정 정보를 조회하고 authStore와 동기화한다.
export function useMyAccount() {
  const { hasHydrated, isAuthenticated, setAccountInfo } = useAuthStore();

  const shouldFetch = hasHydrated && isAuthenticated;

  const query = useQuery({
    queryKey: ['myAccount'],
    queryFn: getMyAccount,
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (!query.data) return;

    setAccountInfo({
      uuid: query.data.uuid,
      nick: query.data.nick,
      nationality: query.data.nationality ?? null,
      email: query.data.email,
      profile_img_url: query.data.profile_img_url,
      is_admin: query.data.is_admin ?? false,
    });
  }, [query.data, setAccountInfo]);

  return query;
}
