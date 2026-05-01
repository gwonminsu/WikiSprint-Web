import { apiClient, API_ENDPOINTS, ApiException } from '@/shared/api';
import type {
  StartGameRecordRequest,
  StartGameRecordResponse,
  UpdatePathRequest,
  CompleteRecordRequest,
  CompleteRecordResponse,
  AbandonRecordRequest,
  GameRecordListResponse,
  SharedGameRecord,
  CreateShareRecordRequest,
  ShareRecord,
} from '@/entities/game-record';

// 게임 시작 - in_progress 전적 생성
export const startGameRecord = async (
  request: StartGameRecordRequest
): Promise<StartGameRecordResponse> => {
  const response = await apiClient.post<StartGameRecordResponse>(
    API_ENDPOINTS.RECORD.START,
    request
  );

  if (!response.data) {
    throw new ApiException('게임 시작 응답이 비어 있습니다.', 0);
  }

  return response.data;
};

// 경로 업데이트 (문서 이동 시 디바운스 호출)
export const updateRecordPath = async (request: UpdatePathRequest): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.RECORD.UPDATE_PATH, request);
};

// 클리어 처리
export const completeGameRecord = async (request: CompleteRecordRequest): Promise<CompleteRecordResponse> => {
  const response = await apiClient.post<CompleteRecordResponse>(API_ENDPOINTS.RECORD.COMPLETE, request);
  return response.data ?? { rankingAlerts: [] };
};

// 포기 처리
export const abandonGameRecord = async (request: AbandonRecordRequest): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.RECORD.ABANDON, request);
};

// 공유 링크 생성 - recordId 기준으로 24시간 유효한 shareId 확보
export const createShareRecord = async (
  request: CreateShareRecordRequest
): Promise<ShareRecord> => {
  const response = await apiClient.post<ShareRecord>(
    API_ENDPOINTS.RECORD.SHARE,
    request
  );

  if (!response.data) {
    throw new ApiException('공유 링크를 생성하지 못했습니다.', 0);
  }

  return response.data;
};

// 공유용 전적 조회 (JWT 불필요 - skipAuth=true)
export const getSharedRecord = async (shareId: string): Promise<SharedGameRecord> => {
  const response = await apiClient.post<SharedGameRecord>(
    `${API_ENDPOINTS.RECORD.SHARE}/${shareId}`,
    undefined,
    true
  );

  if (!response.data) {
    throw new ApiException('공유 링크가 유효하지 않습니다.', 0);
  }

  const raw = response.data;

  // navPath는 서버에서 JSON 문자열로 오는 경우 배열로 파싱
  return {
    ...raw,
    navPath: typeof raw.navPath === 'string'
      ? (JSON.parse(raw.navPath) as string[])
      : raw.navPath,
  };
};

// 전적 목록 + 누적 통계 조회
export const getGameRecords = async (): Promise<GameRecordListResponse> => {
  const response = await apiClient.post<GameRecordListResponse>(
    API_ENDPOINTS.RECORD.LIST
  );

  if (!response.data) {
    throw new ApiException('전적 목록을 불러올 수 없습니다.', 0);
  }

  const raw = response.data;
  // navPath는 서버에서 JSON 문자열로 오므로 배열로 파싱
  const records = raw.records.map((record) => ({
    ...record,
    navPath: typeof record.navPath === 'string'
      ? (JSON.parse(record.navPath) as string[])
      : record.navPath,
  }));

  return { ...raw, records };
};
