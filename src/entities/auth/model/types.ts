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
};
