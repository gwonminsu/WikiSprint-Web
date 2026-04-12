import type { TokenStorage } from '../types';

// [보안] localStorage는 XSS 공격 시 토큰 탈취에 취약합니다.
// Wikipedia HTML 렌더링에 DOMPurify를 적용하여 XSS 표면을 최소화했으나,
// 장기적으로는 access token → 메모리(Zustand), refresh token → httpOnly 쿠키로
// 전환하는 것이 권장됩니다. (서버 측 Set-Cookie 헤더 설정 필요)
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
