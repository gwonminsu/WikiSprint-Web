// 계정 정보
export type Account = {
  uuid: string;
  google_id: string;
  email: string;
  nick: string;
  profile_img_url: string | null;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
};

// 닉네임 변경 요청
export type AccountDetailRequest = {
  uuid: string;
};

// 닉네임 변경 요청
export type UpdateNickRequest = {
  nick: string;
};

// 닉네임 변경 응답
export type UpdateNickResponse = {
  message: string;
  nick: string;
};

// 프로필 이미지 업로드 응답
export type UploadProfileResponse = {
  message: string;
  profile_img_url: string;
};

// 프로필 이미지 제거 응답
export type RemoveProfileResponse = {
  message: string;
};

// 계정 정보 응답
export type AccountResponse = {
  uuid: string;
  nick: string;
  email: string;
  profile_img_url: string | null;
};
