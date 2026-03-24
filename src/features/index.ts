// Auth feature
import {
  useGoogleLogin,
  authApi,
} from './auth';

// Account feature
import {
  getMyAccount,
  updateNick,
  uploadProfileImage,
  removeProfileImage,
  getProfileImageUrl,
  useMyAccount,
  useUpdateNick,
  useUploadProfileImage,
  useRemoveProfileImage,
} from './account';

// 네임스페이스 export
export const f = {
  hook: {
    // Auth
    useGoogleLogin,
    // Account
    useMyAccount,
    useUpdateNick,
    useUploadProfileImage,
    useRemoveProfileImage,
  },
  api: {
    auth: authApi,
    account: {
      getMyAccount,
      updateNick,
      uploadProfileImage,
      removeProfileImage,
      getProfileImageUrl,
    },
  },
} as const;

// 개별 export (직접 import 용도)
export { useGoogleLogin, authApi } from './auth';

export {
  getMyAccount,
  updateNick,
  uploadProfileImage,
  removeProfileImage,
  getProfileImageUrl,
  useMyAccount,
  useUpdateNick,
  useUploadProfileImage,
  useRemoveProfileImage,
} from './account';
