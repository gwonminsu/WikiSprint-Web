import { apiClient, API_ENDPOINTS, type ApiResponse } from '@shared';
import type { GoogleLoginRequest, GoogleLoginResponse } from '@entities';

// iOS OAuth2 code flow 요청 타입
type GoogleCodeRequest = {
  code: string;
  redirectUri: string;
};

// 인증 관련 API
export const authApi = {
  // Google 로그인 / 자동 가입 (GIS credential 방식)
  googleLogin: async (data: GoogleLoginRequest): Promise<ApiResponse<GoogleLoginResponse>> => {
    return apiClient.post<GoogleLoginResponse>(API_ENDPOINTS.AUTH.GOOGLE, data, true);
  },

  // iOS 전용: authorization code → id_token 교환 후 로그인
  googleLoginWithCode: async (data: GoogleCodeRequest): Promise<ApiResponse<GoogleLoginResponse>> => {
    return apiClient.post<GoogleLoginResponse>(API_ENDPOINTS.AUTH.GOOGLE_CODE, data, true);
  },
};
