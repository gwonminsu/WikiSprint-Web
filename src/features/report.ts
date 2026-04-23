import { apiClient, API_ENDPOINTS } from '@/shared/api';
import type { ReportCreateRequest } from '@/entities';

export async function createReport(request: ReportCreateRequest): Promise<string | null> {
  const response = await apiClient.post<null>(API_ENDPOINTS.REPORT.CREATE, request);
  return response.message ?? null;
}
