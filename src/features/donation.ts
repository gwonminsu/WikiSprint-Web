import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/shared/api';
import type { DonationListItem } from '@/entities';

// 최신 후원 목록을 조회한다.
export async function getLatestDonations(): Promise<DonationListItem[]> {
  const response = await apiClient.post<DonationListItem[]>(
    API_ENDPOINTS.DONATION.LATEST,
    {},
  );
  return response.data ?? [];
}

// 전체 후원 목록을 조회한다.
export async function getAllDonations(): Promise<DonationListItem[]> {
  const response = await apiClient.post<DonationListItem[]>(
    API_ENDPOINTS.DONATION.ALL,
    {},
  );
  return response.data ?? [];
}

// 최신 후원 목록 쿼리 훅
export function useLatestDonations(): UseQueryResult<DonationListItem[], Error> {
  return useQuery({
    queryKey: ['donations', 'latest'],
    queryFn: getLatestDonations,
    staleTime: 1000 * 30,
  });
}

// 전체 후원 목록 쿼리 훅
export function useAllDonations(): UseQueryResult<DonationListItem[], Error> {
  return useQuery({
    queryKey: ['donations', 'all'],
    queryFn: getAllDonations,
    staleTime: 1000 * 30,
  });
}
