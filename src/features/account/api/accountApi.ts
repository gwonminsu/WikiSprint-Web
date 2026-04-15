import { apiClient, API_ENDPOINTS, API_BASE_URL, ApiException } from '@/shared/api';
import type {
  AccountDetailRequest,
  UpdateNickRequest,
  UpdateNickResponse,
  UpdateNationalityRequest,
  UpdateNationalityResponse,
  UploadProfileResponse,
  RemoveProfileResponse,
  AccountResponse,
} from '@/entities/account';

// 내 계정 정보 조회
export const getMyAccount = async (): Promise<AccountResponse> => {
  const response = await apiClient.get<AccountResponse>(API_ENDPOINTS.ACCOUNT.ME);
  if (!response.data) throw new ApiException('계정 정보를 불러올 수 없습니다.', 0);
  return response.data;
};

// 특정 계정 정보 조회
export const getAccount = async (request: AccountDetailRequest): Promise<AccountResponse> => {
  const response = await apiClient.post<AccountResponse>(
    API_ENDPOINTS.ACCOUNT.DETAIL,
    request
  );
  if (!response.data) throw new ApiException('계정 정보를 불러올 수 없습니다.', 0);
  return response.data;
};

// 닉네임 변경
export const updateNick = async (request: UpdateNickRequest): Promise<UpdateNickResponse> => {
  const response = await apiClient.post<UpdateNickResponse>(
    API_ENDPOINTS.ACCOUNT.UPDATE_NICK,
    request
  );
  if (!response.data) throw new ApiException('닉네임 변경 응답이 없습니다.', 0);
  return response.data;
};

// 국적 변경
export const updateNationality = async (request: UpdateNationalityRequest): Promise<UpdateNationalityResponse> => {
  const response = await apiClient.post<UpdateNationalityResponse>(
    API_ENDPOINTS.ACCOUNT.UPDATE_NATIONALITY,
    request
  );
  if (!response.data) throw new ApiException('국적 변경 응답이 없습니다.', 0);
  return response.data;
};

// 프로필 이미지 업로드 (multipart/form-data)
export const uploadProfileImage = async (file: File): Promise<UploadProfileResponse> => {
  const createFormData = (): FormData => {
    const formData = new FormData();
    formData.append('file', file);
    return formData;
  };

  const response = await apiClient.postFormData<UploadProfileResponse>(
    API_ENDPOINTS.ACCOUNT.UPLOAD_PROFILE,
    createFormData
  );

  if (!response.data) throw new ApiException('프로필 이미지 업로드 응답이 없습니다.', 0);
  return response.data;
};

// 프로필 이미지 제거
export const removeProfileImage = async (): Promise<RemoveProfileResponse> => {
  const response = await apiClient.post<RemoveProfileResponse>(
    API_ENDPOINTS.ACCOUNT.REMOVE_PROFILE
  );
  if (!response.data) throw new ApiException('프로필 이미지 제거 응답이 없습니다.', 0);
  return response.data;
};

// 프로필 이미지 URL 생성
export const getProfileImageUrl = (fileUuidOrUrl: string | null): string | null => {
  if (!fileUuidOrUrl) return null;
  if (fileUuidOrUrl.startsWith('http://') || fileUuidOrUrl.startsWith('https://')) {
    return fileUuidOrUrl;
  }
  return `${API_BASE_URL}/api/account/profile/image/${fileUuidOrUrl}`;
};

// 회원탈퇴 요청 (immediate=false이면 7일 유예, true이면 즉시 삭제)
export const requestDeletion = async (immediate: boolean = false): Promise<void> => {
  await apiClient.post<void>(API_ENDPOINTS.ACCOUNT.DELETE_REQUEST, { immediate });
};
