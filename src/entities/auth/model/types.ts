// Google 로그인 요청
export type GoogleLoginRequest = {
  credential: string;
};

// Google 로그인 응답 (data 부분)
export type GoogleLoginResponse = {
  uuid: string;
  nick: string;
  email: string;
  profile_img_url: string | null;
  is_admin: boolean;
  nationality: string | null;
  // 신규 유저 플래그: true이면 계정 미생성 상태 → 약관 동의 모달 표시
  is_new_user?: boolean;
  // 탈퇴 대기 계정 플래그: true이면 토큰 미발급 → 탈퇴 취소 다이얼로그 표시
  is_deletion_pending?: boolean;
  // 탈퇴 예정 일시 (is_deletion_pending === true일 때 함께 반환)
  deletion_scheduled_at?: string;
  // iOS code flow 신규/탈퇴 대기 계정 대응: 재사용 가능한 ID 토큰 문자열
  id_token_string?: string;
};
