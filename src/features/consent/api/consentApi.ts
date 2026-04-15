import { apiClient, API_ENDPOINTS, type ApiResponse } from '@shared';
import type { GoogleLoginResponse } from '@entities';
import type { RegisterRequest } from '@entities';

// 약관 동의 후 회원가입 API (Google ID 토큰 재검증 + 계정 생성 + 동의 저장, 단일 트랜잭션)
export const register = async (data: RegisterRequest): Promise<ApiResponse<GoogleLoginResponse>> => {
  return apiClient.post<GoogleLoginResponse>(API_ENDPOINTS.AUTH.REGISTER, data, true);
};
