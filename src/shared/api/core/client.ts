import type { TokenStorage, AuthResponseData } from '../types';
import { createApiClient, type ApiClient } from './interceptor';
import { createLocalStorageTokenStorage } from './token';
import { API_BASE_URL, API_ENDPOINTS } from '../constants';

// 기본 토큰 저장소 (localStorage 기반) - 기존 키와 호환
const tokenStorage = createLocalStorageTokenStorage('access_token', 'refresh_token');

// 인증 업데이트 콜백
let authUpdateCallback: ((data: AuthResponseData) => void) | null = null;

// 인증 업데이트 콜백 설정
export function setAuthUpdateCallback(callback: (data: AuthResponseData) => void): void {
  authUpdateCallback = callback;
}

// 토큰 저장소 접근
export function getTokenStorage(): TokenStorage {
  return tokenStorage;
}

// API 클라이언트 인스턴스
export const apiClient: ApiClient = createApiClient({
  baseUrl: API_BASE_URL,
  refreshEndpoint: API_ENDPOINTS.AUTH.REFRESH,
  tokenStorage,
  onAuthUpdate: (data: AuthResponseData): void => {
    if (authUpdateCallback) {
      authUpdateCallback(data);
    }
  },
  onAuthFailure: (): void => {
    tokenStorage.clearTokens();
    window.location.href = '/auth';
  },
});
