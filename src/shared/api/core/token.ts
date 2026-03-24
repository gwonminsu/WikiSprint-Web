import type { TokenStorage } from '../types';

// localStorage 기반 토큰 저장소 생성
export function createLocalStorageTokenStorage(
  accessTokenKey = 'accessToken',
  refreshTokenKey = 'refreshToken'
): TokenStorage {
  return {
    getAccessToken: (): string | null => localStorage.getItem(accessTokenKey),
    getRefreshToken: (): string | null => localStorage.getItem(refreshTokenKey),
    setTokens: (accessToken: string, refreshToken: string | null): void => {
      localStorage.setItem(accessTokenKey, accessToken);
      if (refreshToken) {
        localStorage.setItem(refreshTokenKey, refreshToken);
      }
    },
    clearTokens: (): void => {
      localStorage.removeItem(accessTokenKey);
      localStorage.removeItem(refreshTokenKey);
    },
  };
}
