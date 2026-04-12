// API 예외 클래스
export class ApiException extends Error {
  public readonly status: number;
  public readonly callId?: string;
  public readonly data?: unknown;

  constructor(message: string, status: number, callId?: string, data?: unknown) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.callId = callId;
    this.data = data;
  }
}

// API 응답 타입
export type ApiResponse<T> = {
  callId?: string;
  message?: string;
  data?: T;
  auth?: AuthResponseData;
  usedRefreshToken?: boolean;
};

// 인증 응답 데이터 (auth 필드에는 토큰 정보만 포함)
export type AuthResponseData = {
  accessToken?: string;
  refreshToken?: string;
};
