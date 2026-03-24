import { apiClient, API_ENDPOINTS, type ApiResponse } from '@shared';
import type { GoogleLoginRequest, GoogleLoginResponse } from '@entities';

// 인증 관련 API
export const authApi = {
  // Google 로그인 / 자동 가입
  googleLogin: async (data: GoogleLoginRequest): Promise<ApiResponse<GoogleLoginResponse>> => {
    return apiClient.post<GoogleLoginResponse>(API_ENDPOINTS.AUTH.GOOGLE, data, true);
  },
};
