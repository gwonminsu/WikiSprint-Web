// Auth feature
import {
  useGoogleLogin,
  authApi,
} from './auth';

// Admin feature
import {
  adminApi,
  useTargetWords,
  useAddTargetWord,
  useDeleteTargetWord,
} from './admin';

// Wiki feature (Wikipedia API 클라이언트)
import { getRandomArticle, getArticleHtml, getArticleSummary, getRandomTargetWord } from './wiki';

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
  ProfileImageEditModal,
} from './account';

// GameRecord feature
import {
  startGameRecord,
  updateRecordPath,
  completeGameRecord,
  abandonGameRecord,
  getGameRecords,
  useGameRecord,
  useGameRecords,
} from './game-record';

// Ranking feature
import { getRanking, useRanking } from './ranking';

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
    // Admin
    useTargetWords,
    useAddTargetWord,
    useDeleteTargetWord,
    // GameRecord
    useGameRecord,
    useGameRecords,
    // Ranking
    useRanking,
  },
  api: {
    wiki: { getRandomArticle, getArticleHtml, getArticleSummary, getRandomTargetWord },
    auth: authApi,
    account: {
      getMyAccount,
      updateNick,
      uploadProfileImage,
      removeProfileImage,
      getProfileImageUrl,
    },
    admin: adminApi,
    gameRecord: {
      startGameRecord,
      updateRecordPath,
      completeGameRecord,
      abandonGameRecord,
      getGameRecords,
    },
    ranking: { getRanking },
  },
  ui: {
    ProfileImageEditModal,
  },
} as const;

// 개별 export (직접 import 용도)
export { useGoogleLogin, authApi } from './auth';
export { adminApi, useTargetWords, useAddTargetWord, useDeleteTargetWord } from './admin';
export { getRandomArticle, getArticleHtml, getArticleSummary, getRandomTargetWord } from './wiki';

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
  ProfileImageEditModal,
} from './account';

export {
  startGameRecord,
  updateRecordPath,
  completeGameRecord,
  abandonGameRecord,
  getGameRecords,
  useGameRecord,
  useGameRecords,
} from './game-record';

export { getRanking, useRanking } from './ranking';
