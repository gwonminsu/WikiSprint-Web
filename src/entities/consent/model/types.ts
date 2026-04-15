// 약관 동의 타입 — 동의한 항목만 배열에 포함 (미동의 항목은 배열에서 제외)
export type ConsentType =
  | 'terms_of_service'
  | 'privacy_policy'
  | 'age_verification'
  | 'marketing_notification';

// 동의 항목 (타입 + 버전)
export type ConsentItem = {
  type: ConsentType;
  version: string;
};

// 회원가입 요청 (Google ID 토큰 + 동의한 항목 목록)
export type RegisterRequest = {
  credential: string;
  consents: ConsentItem[];
};
