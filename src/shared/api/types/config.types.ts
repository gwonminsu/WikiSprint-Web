import type { AuthResponseData } from './api.types';

// 토큰 저장소 인터페이스
export type TokenStorage = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken: string | null) => void;
  clearTokens: () => void;
};

// API 클라이언트 설정
export type ApiClientConfig = {
  baseUrl: string;
  refreshEndpoint: string;
  tokenStorage: TokenStorage;
  onAuthUpdate?: (data: AuthResponseData) => void;
  onAuthFailure?: () => void;
};
