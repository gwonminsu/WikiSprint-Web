import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/shared/api';
import type { AdminAccountListRequest, AdminAccountListResponse, ReportSummary } from '@/entities';

export async function getAdminAccounts(request: AdminAccountListRequest): Promise<AdminAccountListResponse> {
  const response = await apiClient.post<AdminAccountListResponse>(API_ENDPOINTS.ADMIN_ACCOUNT.LIST, request);
  return response.data ?? {
    accounts: [],
    page: request.page,
    size: request.size,
    totalPages: 1,
    totalCount: 0,
  };
}

export async function getPendingReportCount(): Promise<number> {
  const response = await apiClient.post<{ count: number }>(API_ENDPOINTS.ADMIN_ACCOUNT.PENDING_COUNT, {});
  return response.data?.count ?? 0;
}

export async function getAccountReportSummary(accountId: string): Promise<ReportSummary> {
  const response = await apiClient.post<ReportSummary>(API_ENDPOINTS.ADMIN_ACCOUNT.REPORT_SUMMARY, {
    targetType: 'ACCOUNT',
    targetAccountId: accountId,
  });
  return response.data ?? emptyReportSummary();
}

export async function resolveAccountReports(accountId: string): Promise<string | null> {
  const response = await apiClient.post<{ deletedCount: number }>(API_ENDPOINTS.ADMIN_ACCOUNT.RESOLVE_REPORTS, {
    targetType: 'ACCOUNT',
    targetAccountId: accountId,
  });
  return response.message ?? null;
}

export async function censorAccountProfile(accountId: string): Promise<string | null> {
  const response = await apiClient.post<{ profileImgUrl: string }>(API_ENDPOINTS.ADMIN_ACCOUNT.CENSOR_PROFILE, { accountId });
  return response.message ?? null;
}

export async function censorAccountNickname(accountId: string): Promise<string | null> {
  const response = await apiClient.post<{ nick: string }>(API_ENDPOINTS.ADMIN_ACCOUNT.CENSOR_NICKNAME, { accountId });
  return response.message ?? null;
}

export async function grantAccountAdmin(accountId: string): Promise<string | null> {
  const response = await apiClient.post<null>(API_ENDPOINTS.ADMIN_ACCOUNT.GRANT_ADMIN, { accountId });
  return response.message ?? null;
}

export function useAdminAccounts(
  request: AdminAccountListRequest,
  enabled: boolean,
): UseQueryResult<AdminAccountListResponse, Error> {
  return useQuery({
    queryKey: ['admin-accounts', request],
    queryFn: () => getAdminAccounts(request),
    enabled,
    staleTime: 1000 * 10,
    retry: false,
  });
}

export function usePendingReportCount(enabled: boolean): UseQueryResult<number, Error> {
  return useQuery({
    queryKey: ['admin-reports', 'pending-count'],
    queryFn: getPendingReportCount,
    enabled,
    staleTime: 1000 * 15,
    retry: false,
  });
}

function emptyReportSummary(): ReportSummary {
  return {
    profileImageCount: 0,
    nicknameCount: 0,
    donationContentCount: 0,
    otherCount: 0,
    totalPendingCount: 0,
    otherDetails: [],
  };
}
