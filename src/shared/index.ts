// UI 컴포넌트
import { Dialog, ToastContainer, useDialog, useToast, ProfileAvatar, EmbossButton } from './ui';

// 스토어
import { useAuthStore, useThemeStore } from './store';

// 라이브러리
import { cn, useTranslation, useLanguageStore, LANGUAGES } from './lib';

// API 클라이언트
import { apiClient, getTokenStorage, setAuthUpdateCallback } from './api';

// Config
import { queryClient } from './config';

// 네임스페이스 export
export const shared = {
  ui: {
    Dialog,
    ToastContainer,
    useDialog,
    useToast,
    ProfileAvatar,
    EmbossButton,
  },
  store: {
    useAuthStore,
    useThemeStore,
  },
  lib: {
    cn,
    useTranslation,
    useLanguageStore,
    LANGUAGES,
  },
  api: {
    client: apiClient,
    getTokenStorage,
    setAuthUpdateCallback,
  },
  config: {
    queryClient,
  },
} as const;

// 개별 export (직접 import 용도)
export { Dialog, ToastContainer, useDialog, useToast, useDialogStore, useToastStore, ProfileAvatar, EmbossButton } from './ui';
export { useAuthStore, useThemeStore, useSystemThemeListener, type Theme } from './store';
export { cn, useTranslation, useLanguageStore, getTranslations, LANGUAGES, type Language } from './lib';
export { queryClient } from './config';
export {
  apiClient,
  getTokenStorage,
  setAuthUpdateCallback,
  createApiClient,
  createLocalStorageTokenStorage,
  ApiException,
  API_BASE_URL,
  API_ENDPOINTS,
  type ApiClient,
  type ApiResponse,
  type AuthResponseData,
  type TokenStorage,
  type ApiClientConfig,
} from './api';
