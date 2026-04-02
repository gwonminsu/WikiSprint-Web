import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, getTokenStorage } from '@shared';
import type { ApiResponse } from '@shared';
import { authApi } from '../api/authApi';
import type { GoogleLoginRequest, GoogleLoginResponse } from '@entities';

// Google 로그인 mutation 훅
export function useGoogleLogin(): UseMutationResult<ApiResponse<GoogleLoginResponse>, Error, GoogleLoginRequest> {
  const navigate = useNavigate();
  const { setAccountInfo } = useAuthStore();
  const tokenStorage = getTokenStorage();

  return useMutation({
    mutationFn: (data: GoogleLoginRequest) => authApi.googleLogin(data),
    onSuccess: (response) => {
      // 토큰 저장
      if (response.auth?.accessToken && response.auth?.refreshToken) {
        tokenStorage.setTokens(response.auth.accessToken, response.auth.refreshToken);
      }
      // 계정 정보 저장
      if (response.data) {
        setAccountInfo({
          uuid: response.data.uuid,
          nick: response.data.nick,
          email: response.data.email,
          profile_img_url: response.data.profile_img_url,
          is_admin: response.data.is_admin ?? false,
        });
      }
      navigate('/');
    },
  });
}
