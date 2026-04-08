import { apiClient, API_ENDPOINTS } from '@/shared/api';
import type { RankingListRequest, RankingListResponse } from '@/entities/ranking/types';

// 랭킹 목록 조회 (비로그인도 가능)
export const getRanking = async (
  request: RankingListRequest
): Promise<RankingListResponse> => {
  const response = await apiClient.post<RankingListResponse>(
    API_ENDPOINTS.RANKING.LIST,
    request
  );
  return response.data!;
};
