import type { ApiClientConfig, ApiResponse } from '../types';
import { ApiException } from '../types';

// API 클라이언트 타입 정의
export type ApiClient = {
  get: <T>(endpoint: string, skipAuth?: boolean) => Promise<ApiResponse<T>>;
  post: <T>(endpoint: string, body?: unknown, skipAuth?: boolean) => Promise<ApiResponse<T>>;
  postFormData: <T>(endpoint: string, createFormData: () => FormData) => Promise<ApiResponse<T>>;
  put: <T>(endpoint: string, body?: unknown) => Promise<ApiResponse<T>>;
  delete: <T>(endpoint: string) => Promise<ApiResponse<T>>;
  fetchBinary: (endpoint: string, options?: RequestInit) => Promise<Response>;
};

// JWT 자동 갱신 + 동시 요청 관리 API 클라이언트 생성
export function createApiClient(config: ApiClientConfig): ApiClient {
  let isRefreshing = false;
  let refreshSubscribers: Array<(token: string) => void> = [];

  const addRefreshSubscriber = (callback: (token: string) => void): void => {
    refreshSubscribers.push(callback);
  };

  const onRefreshed = (token: string): void => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
  };

  // 토큰 갱신 요청
  async function refreshToken(): Promise<string | null> {
    const currentRefreshToken = config.tokenStorage.getRefreshToken();
    if (!currentRefreshToken) {
      return null;
    }

    try {
      // 백엔드는 Authorization 헤더로 refreshToken을 받음
      const response = await fetch(`${config.baseUrl}${config.refreshEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentRefreshToken}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      // 서버 응답 형식: { auth: { accessToken, refreshToken }, message }
      const data = await response.json() as {
        auth?: { accessToken?: string; refreshToken?: string };
        message?: string;
      };

      // auth 필드에서 토큰 추출
      const newAccessToken = data.auth?.accessToken;
      const newRefreshToken = data.auth?.refreshToken;

      if (newAccessToken) {
        config.tokenStorage.setTokens(
          newAccessToken,
          newRefreshToken || currentRefreshToken
        );

        if (config.onAuthUpdate) {
          config.onAuthUpdate({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        }

        return newAccessToken;
      }

      return null;
    } catch {
      return null;
    }
  }

  // 인터셉터 적용 fetch
  async function interceptedFetch<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuth = false
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // 인증 헤더 추가 (skipAuth가 아닌 경우)
    if (!skipAuth) {
      const accessToken = config.tokenStorage.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    try {
      let response = await fetch(`${config.baseUrl}${endpoint}`, fetchOptions);
      let data: ApiResponse<T> = await response.json();

      // 401 에러 + ACCESS_TOKEN_EXPIRED 처리
      if (response.status === 401 && data.message === 'ACCESS_TOKEN_EXPIRED') {
        if (!isRefreshing) {
          isRefreshing = true;

          const newToken = await refreshToken();

          if (newToken) {
            isRefreshing = false;
            onRefreshed(newToken);

            // 원래 요청 재시도
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(`${config.baseUrl}${endpoint}`, {
              ...fetchOptions,
              headers,
            });
            data = await response.json();
            data.usedRefreshToken = true;
          } else {
            isRefreshing = false;
            refreshSubscribers = [];

            if (config.onAuthFailure) {
              config.onAuthFailure();
            }

            throw new ApiException('인증이 만료되었습니다.', 401, data.callId);
          }
        } else {
          // 다른 요청이 갱신 중이면 대기
          const newToken = await new Promise<string>((resolve) => {
            addRefreshSubscriber(resolve);
          });

          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(`${config.baseUrl}${endpoint}`, {
            ...fetchOptions,
            headers,
          });
          data = await response.json();
          data.usedRefreshToken = true;
        }
      }

      // 응답 에러 처리
      if (!response.ok) {
        console.error('[API Error]', {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          message: data.message,
          data: data.data,
          fullResponse: data,
        });
        throw new ApiException(
          data.message || '요청 처리 중 오류가 발생했습니다.',
          response.status,
          data.callId,
          data.data
        );
      }

      // auth 데이터 있으면 콜백 호출
      if (data.auth && config.onAuthUpdate) {
        config.onAuthUpdate(data.auth);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }

      throw new ApiException(
        error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.',
        0
      );
    }
  }

  // FormData 전송용 인터셉터 (Content-Type 자동 설정 제외)
  // createFormData: FormData를 재생성하는 함수 (재시도 시 새 FormData 필요)
  async function interceptedFetchFormData<T>(
    endpoint: string,
    createFormData: () => FormData
  ): Promise<ApiResponse<T>> {
    // 인증 헤더 추가
    const accessToken = config.tokenStorage.getAccessToken();
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      let response = await fetch(`${config.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: createFormData(),
      });
      let data: ApiResponse<T> = await response.json();

      // 401 에러 + ACCESS_TOKEN_EXPIRED 처리
      if (response.status === 401 && data.message === 'ACCESS_TOKEN_EXPIRED') {
        if (!isRefreshing) {
          isRefreshing = true;

          const newToken = await refreshToken();

          if (newToken) {
            isRefreshing = false;
            onRefreshed(newToken);

            // 원래 요청 재시도 (새 FormData 생성)
            response = await fetch(`${config.baseUrl}${endpoint}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${newToken}`,
              },
              body: createFormData(),
            });
            data = await response.json();
            data.usedRefreshToken = true;
          } else {
            isRefreshing = false;
            refreshSubscribers = [];

            if (config.onAuthFailure) {
              config.onAuthFailure();
            }

            throw new ApiException('인증이 만료되었습니다.', 401, data.callId);
          }
        } else {
          // 다른 요청이 갱신 중이면 대기
          const newToken = await new Promise<string>((resolve) => {
            addRefreshSubscriber(resolve);
          });

          response = await fetch(`${config.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${newToken}`,
            },
            body: createFormData(),
          });
          data = await response.json();
          data.usedRefreshToken = true;
        }
      }

      // 응답 에러 처리
      if (!response.ok) {
        console.error('[FormData] 에러 응답:', response.status, data);
        throw new ApiException(
          data.message || '요청 처리 중 오류가 발생했습니다.',
          response.status,
          data.callId,
          data.data
        );
      }

      // auth 데이터 있으면 콜백 호출
      if (data.auth && config.onAuthUpdate) {
        config.onAuthUpdate(data.auth);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }

      throw new ApiException(
        error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.',
        0
      );
    }
  }

  // 바이너리 데이터 fetch (파일 다운로드용)
  async function fetchBinary(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    const accessToken = config.tokenStorage.getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${config.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new ApiException('파일 다운로드 중 오류가 발생했습니다.', response.status);
    }

    return response;
  }

  return {
    get: <T>(endpoint: string, skipAuth?: boolean): Promise<ApiResponse<T>> =>
      interceptedFetch<T>(endpoint, { method: 'GET' }, skipAuth),

    post: <T>(endpoint: string, body?: unknown, skipAuth?: boolean): Promise<ApiResponse<T>> =>
      interceptedFetch<T>(
        endpoint,
        {
          method: 'POST',
          body: body ? JSON.stringify(body) : undefined,
        },
        skipAuth
      ),

    postFormData: <T>(endpoint: string, createFormData: () => FormData): Promise<ApiResponse<T>> =>
      interceptedFetchFormData<T>(endpoint, createFormData),

    put: <T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> =>
      interceptedFetch<T>(endpoint, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      }),

    delete: <T>(endpoint: string): Promise<ApiResponse<T>> =>
      interceptedFetch<T>(endpoint, { method: 'DELETE' }),

    fetchBinary,
  };
}
