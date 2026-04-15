import { apiClient, API_ENDPOINTS, type ApiResponse } from '@shared';
import type { GoogleLoginRequest, GoogleLoginResponse } from '@entities';
import type { ConsentItem } from '@entities';

// iOS OAuth2 code flow 요청 타입
type GoogleCodeRequest = {
  code: string;
  redirectUri: string;
};

// 약관 동의 후 회원가입 요청 타입
type RegisterRequest = {
  credential: string;
  consents: ConsentItem[];
};

// 탈퇴 취소 요청 타입 (Google ID 토큰으로 본인 확인)
type CancelDeletionRequest = {
  credential: string;
};

// 인증 관련 API
export const authApi = {
  // Google 로그인 (GIS credential 방식)
  googleLogin: async (data: GoogleLoginRequest): Promise<ApiResponse<GoogleLoginResponse>> => {
    return apiClient.post<GoogleLoginResponse>(API_ENDPOINTS.AUTH.GOOGLE, data, true);
  },

  // iOS 전용: authorization code → id_token 교환 후 로그인
  googleLoginWithCode: async (data: GoogleCodeRequest): Promise<ApiResponse<GoogleLoginResponse>> => {
    return apiClient.post<GoogleLoginResponse>(API_ENDPOINTS.AUTH.GOOGLE_CODE, data, true);
  },

  // 약관 동의 완료 후 계정 생성 (Google ID 토큰 재검증 + 동의 항목 저장, 단일 트랜잭션)
  register: async (data: RegisterRequest): Promise<ApiResponse<GoogleLoginResponse>> => {
    return apiClient.post<GoogleLoginResponse>(API_ENDPOINTS.AUTH.REGISTER, data, true);
  },

  // 탈퇴 취소 (Google ID 토큰으로 본인 확인 → deletion_requested_at = NULL + 정상 로그인)
  cancelDeletion: async (data: CancelDeletionRequest): Promise<ApiResponse<GoogleLoginResponse>> => {
    return apiClient.post<GoogleLoginResponse>(API_ENDPOINTS.AUTH.CANCEL_DELETION, data, true);
  },
};
