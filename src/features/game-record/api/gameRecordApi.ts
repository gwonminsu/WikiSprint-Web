import { apiClient, API_ENDPOINTS, ApiException } from '@/shared/api';
import type {
  StartGameRecordRequest,
  StartGameRecordResponse,
  UpdatePathRequest,
  CompleteRecordRequest,
  AbandonRecordRequest,
  GameRecordListResponse,
  SharedGameRecord,
} from '@/entities/game-record';

// 게임 시작 — in_progress 전적 생성
export const startGameRecord = async (
  request: StartGameRecordRequest
): Promise<StartGameRecordResponse> => {
  const response = await apiClient.post<StartGameRecordResponse>(
    API_ENDPOINTS.RECORD.START,
    request
  );
  if (!response.data) throw new ApiException('게임 시작 응답이 없습니다.', 0);
  return response.data;
};

// 경로 업데이트 (문서 이동 시 디바운스 호출)
export const updateRecordPath = async (request: UpdatePathRequest): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.RECORD.UPDATE_PATH, request);
};

// 클리어 처리
export const completeGameRecord = async (request: CompleteRecordRequest): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.RECORD.COMPLETE, request);
};

// 포기 처리
export const abandonGameRecord = async (request: AbandonRecordRequest): Promise<void> => {
  await apiClient.post(API_ENDPOINTS.RECORD.ABANDON, request);
};

// 공유용 전적 조회 (JWT 불필요 — skipAuth=true)
export const getSharedRecord = async (shareId: string): Promise<SharedGameRecord> => {
  const response = await apiClient.post<SharedGameRecord>(
    `${API_ENDPOINTS.RECORD.SHARE}/${shareId}`,
    undefined,
    true  // skipAuth — 비로그인 접근 허용
  );
  if (!response.data) throw new ApiException('공유 링크가 유효하지 않습니다.', 0);
  const raw = response.data;

  // navPath는 서버에서 JSON 문자열로 오는 경우 배열로 파싱
  return {
    ...raw,
    navPath: typeof raw.navPath === 'string'
      ? (JSON.parse(raw.navPath as unknown as string) as string[])
      : raw.navPath,
  };
};

// 전적 목록 + 누적 통계 조회
export const getGameRecords = async (): Promise<GameRecordListResponse> => {
  const response = await apiClient.post<GameRecordListResponse>(
    API_ENDPOINTS.RECORD.LIST
  );
  if (!response.data) throw new ApiException('전적 목록을 불러올 수 없습니다.', 0);
  const raw = response.data;

  // navPath는 서버에서 JSON 문자열로 오므로 배열로 파싱
  const records = raw.records.map((r) => ({
    ...r,
    navPath: typeof r.navPath === 'string'
      ? (JSON.parse(r.navPath) as string[])
      : r.navPath,
  }));

  return { ...raw, records };
};
