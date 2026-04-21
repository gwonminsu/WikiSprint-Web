import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/shared/api';
import type {
  AccountTransferDonationCreateRequest,
  DonationListItem,
  PendingAccountTransferDonationItem,
} from '@/entities';

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

// 국내 계좌이체 후원 요청을 저장한다.
export async function createAccountTransferDonation(
  request: AccountTransferDonationCreateRequest,
): Promise<string | null> {
  const response = await apiClient.post<null>(
    API_ENDPOINTS.DONATION.ACCOUNT_TRANSFER_REQUEST,
    request,
  );
  return response.message ?? null;
}

// 관리자용 국내 후원 확인 대기 목록을 조회한다.
export async function getPendingAccountTransferDonations(): Promise<PendingAccountTransferDonationItem[]> {
  const response = await apiClient.post<PendingAccountTransferDonationItem[]>(
    API_ENDPOINTS.DONATION.ADMIN_PENDING_ACCOUNT_TRANSFER,
    {},
  );
  return response.data ?? [];
}

// 관리자용 국내 후원 확인 처리를 요청한다.
export async function confirmAccountTransferDonation(donationId: string): Promise<string | null> {
  const response = await apiClient.post<null>(
    API_ENDPOINTS.DONATION.ADMIN_CONFIRM_ACCOUNT_TRANSFER,
    { donationId },
  );
  return response.message ?? null;
}

// 최신 후원 목록 쿼리
export function useLatestDonations(): UseQueryResult<DonationListItem[], Error> {
  return useQuery({
    queryKey: ['donations', 'latest'],
    queryFn: getLatestDonations,
    staleTime: 1000 * 30,
  });
}

// 전체 후원 목록 쿼리
export function useAllDonations(): UseQueryResult<DonationListItem[], Error> {
  return useQuery({
    queryKey: ['donations', 'all'],
    queryFn: getAllDonations,
    staleTime: 1000 * 30,
  });
}

// 관리자용 국내 후원 확인 대기 목록 쿼리
export function usePendingAccountTransferDonations(): UseQueryResult<PendingAccountTransferDonationItem[], Error> {
  return useQuery({
    queryKey: ['donations', 'pending-account-transfer'],
    queryFn: getPendingAccountTransferDonations,
    staleTime: 1000 * 10,
  });
}
