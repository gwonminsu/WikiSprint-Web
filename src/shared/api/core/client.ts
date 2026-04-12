import type { TokenStorage, AuthResponseData } from '../types';
import { createApiClient, type ApiClient } from './interceptor';
import { createLocalStorageTokenStorage } from './token';
import { API_BASE_URL, API_ENDPOINTS } from '../constants';

// 기본 토큰 저장소 (localStorage 기반) - 기존 키와 호환
const tokenStorage = createLocalStorageTokenStorage('access_token', 'refresh_token');

// 인증 업데이트 콜백
let authUpdateCallback: ((data: AuthResponseData) => void) | null = null;

// 인증 실패 콜백 (React Router navigate 등록용)
// 등록되지 않은 경우 window.location.href 폴백 사용
let authFailureCallback: (() => void) | null = null;

// 인증 업데이트 콜백 설정
export function setAuthUpdateCallback(callback: (data: AuthResponseData) => void): void {
  authUpdateCallback = callback;
}

// 인증 실패 콜백 설정 — App 마운트 시 react-router navigate로 등록
export function setAuthFailureCallback(callback: () => void): void {
  authFailureCallback = callback;
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
    if (authFailureCallback) {
      // SPA 내 navigate — 현재 상태(게임 중 등) 손실 없이 이동
      authFailureCallback();
    } else {
      // 콜백 미등록 시 폴백 (App 마운트 전 실패 등 극단적 상황)
      window.location.href = '/auth';
    }
  },
});
