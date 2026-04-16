// 에셋
import { getLogoByLanguage } from './assets/images';

// UI 컴포넌트
import { Dialog, ToastContainer, useDialog, useToast, ProfileAvatar, EmbossButton, SpeechBubble, Accordion, SuccessOverlay, ThemeOrbitToggle, ThemeSystemButton, ThemeControlGroup } from './ui';

// 스토어
import { useAuthStore, useThemeStore, useGameStore, usePendingRecordStore } from './store';

// 라이브러리
import { cn, useTranslation, useLanguageStore, LANGUAGES } from './lib';

// API 클라이언트
import { apiClient, getTokenStorage, setAuthUpdateCallback } from './api';

// Config
import { queryClient } from './config';

// 네임스페이스 export
export const shared = {
  esset: {
    getLogoByLanguage,
  },
  ui: {
    Dialog,
    ToastContainer,
    useDialog,
    useToast,
    ProfileAvatar,
    EmbossButton,
    SpeechBubble,
    Accordion,
    SuccessOverlay,
    ThemeOrbitToggle,
    ThemeSystemButton,
    ThemeControlGroup,
  },
  store: {
    useAuthStore,
    useThemeStore,
    useGameStore,
    usePendingRecordStore,
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
export { getLogoByLanguage, tutoDoc, talkerStart, talkerFinger, talkerIdle, talkerYawn, talkerSleep, talkerGood, talkerOk, talkerLate, talkerWarn, gameClear } from './assets/images';
export { Dialog, ToastContainer, useDialog, useToast, useDialogStore, useToastStore, ProfileAvatar, EmbossButton, SpeechBubble, Accordion, SuccessOverlay, ThemeOrbitToggle, ThemeSystemButton, ThemeControlGroup } from './ui';
export { useAuthStore, useThemeStore, type Theme, useGameStore, usePendingRecordStore, type Difficulty, type AuthState } from './store';
export { cn, useTranslation, useLanguageStore, getTranslations, LANGUAGES, type Language, useViewportScale, getCountryFlagSrcSet, getCountryFlagUrl, COUNTRY_LIST, type CountryOption, initKakaoSdk } from './lib';
export { queryClient } from './config';
export {
  apiClient,
  getTokenStorage,
  setAuthUpdateCallback,
  setAuthFailureCallback,
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
