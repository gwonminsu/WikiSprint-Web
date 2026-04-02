import { apiClient, API_ENDPOINTS, type ApiResponse } from '@shared';
import type { AddTargetWordRequest, DeleteTargetWordRequest } from '@entities';
import type { TargetWordResponse } from '@entities';

// 관리자 전용 API
export const adminApi = {
  // 전체 제시어 목록 조회
  getWords: async (): Promise<ApiResponse<TargetWordResponse[]>> => {
    return apiClient.post<TargetWordResponse[]>(API_ENDPOINTS.ADMIN.WORDS_LIST, {});
  },

  // 제시어 추가
  addWord: async (data: AddTargetWordRequest): Promise<ApiResponse<null>> => {
    return apiClient.post<null>(API_ENDPOINTS.ADMIN.WORDS_ADD, data);
  },

  // 제시어 삭제
  deleteWord: async (data: DeleteTargetWordRequest): Promise<ApiResponse<null>> => {
    return apiClient.post<null>(API_ENDPOINTS.ADMIN.WORDS_DELETE, data);
  },
};
