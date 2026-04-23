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
  requestDeletion,
  useMyAccount,
  useUpdateNick,
  useUploadProfileImage,
  useRemoveProfileImage,
  useRequestDeletion,
  ProfileImageEditModal,
} from './account';

// Consent feature
import { register, useRegister } from './consent';

// GameRecord feature
import {
  startGameRecord,
  updateRecordPath,
  completeGameRecord,
  abandonGameRecord,
  createShareRecord,
  getGameRecords,
  getSharedRecord,
  useGameRecord,
  useGameLeaveGuard,
  GameLeaveGuard,
  useGameRecords,
  useSharedRecord,
} from './game-record';

// Ranking feature
import { getRanking, useRanking } from './ranking';
import {
  getLatestDonations,
  getRecentAlertDonations,
  getRecentDonationAlertReplays,
  getAllDonations,
  createAccountTransferDonation,
  getPendingAccountTransferDonations,
  confirmAccountTransferDonation,
  replayDonationAlert,
  getDonationReportSummary,
  resolveDonationReports,
  censorDonationSupporterName,
  censorDonationMessage,
  deleteDonation,
  useLatestDonations,
  useAllDonations,
  usePendingAccountTransferDonations,
} from './donation';
import { createReport } from './report';
import {
  censorAccountNickname,
  censorAccountProfile,
  getAccountReportSummary,
  getAdminAccounts,
  getPendingReportCount,
  grantAccountAdmin,
  resolveAccountReports,
  useAdminAccounts,
  usePendingReportCount,
} from './admin-account';

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
    useRequestDeletion,
    // Consent
    useRegister,
    // Admin
    useTargetWords,
    useAddTargetWord,
    useDeleteTargetWord,
    // GameRecord
    useGameRecord,
    useGameLeaveGuard,
    GameLeaveGuard,
    useGameRecords,
    useSharedRecord,
    // Ranking
    useRanking,
    // Donation
    useLatestDonations,
    useAllDonations,
    usePendingAccountTransferDonations,
    useAdminAccounts,
    usePendingReportCount,
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
      requestDeletion,
    },
    consent: { register },
    admin: adminApi,
    gameRecord: {
      startGameRecord,
      updateRecordPath,
      completeGameRecord,
      abandonGameRecord,
      createShareRecord,
      getGameRecords,
      getSharedRecord,
    },
    ranking: { getRanking },
    donation: {
      getLatestDonations,
      getRecentAlertDonations,
      getRecentDonationAlertReplays,
      getAllDonations,
      createAccountTransferDonation,
      getPendingAccountTransferDonations,
      confirmAccountTransferDonation,
      replayDonationAlert,
      getDonationReportSummary,
      resolveDonationReports,
      censorDonationSupporterName,
      censorDonationMessage,
      deleteDonation,
    },
    report: { createReport },
    adminAccount: {
      getAdminAccounts,
      getPendingReportCount,
      getAccountReportSummary,
      resolveAccountReports,
      censorAccountProfile,
      censorAccountNickname,
      grantAccountAdmin,
    },
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
  requestDeletion,
  useMyAccount,
  useUpdateNick,
  useUploadProfileImage,
  useRemoveProfileImage,
  useRequestDeletion,
  ProfileImageEditModal,
} from './account';

export { register, useRegister } from './consent';

export {
  startGameRecord,
  updateRecordPath,
  completeGameRecord,
  abandonGameRecord,
  createShareRecord,
  getGameRecords,
  getSharedRecord,
  useGameRecord,
  useGameLeaveGuard,
  GameLeaveGuard,
  useGameRecords,
  useSharedRecord,
} from './game-record';

export { getRanking, useRanking } from './ranking';
export {
  getLatestDonations,
  getRecentAlertDonations,
  getRecentDonationAlertReplays,
  getAllDonations,
  createAccountTransferDonation,
  getPendingAccountTransferDonations,
  confirmAccountTransferDonation,
  replayDonationAlert,
  getDonationReportSummary,
  resolveDonationReports,
  censorDonationSupporterName,
  censorDonationMessage,
  deleteDonation,
  useLatestDonations,
  useAllDonations,
  usePendingAccountTransferDonations,
} from './donation';
export { createReport } from './report';
export {
  getAdminAccounts,
  getPendingReportCount,
  getAccountReportSummary,
  resolveAccountReports,
  censorAccountProfile,
  censorAccountNickname,
  grantAccountAdmin,
  useAdminAccounts,
  usePendingReportCount,
} from './admin-account';
