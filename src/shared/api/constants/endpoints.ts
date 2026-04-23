export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: '/api/auth/google',
    GOOGLE_CODE: '/api/auth/google/code',
    REFRESH: '/api/auth/token/refresh',
    // 약관 동의 완료 후 계정 생성 (Google ID 토큰 + 동의 항목)
    REGISTER: '/api/auth/register',
    // 탈퇴 취소 (Google ID 토큰으로 본인 확인, permitAll)
    CANCEL_DELETION: '/api/auth/cancel-deletion',
  },
  ACCOUNT: {
    ME: '/api/account/me',
    DETAIL: '/api/account/detail',
    UPDATE_NICK: '/api/account/nick/update',
    UPLOAD_PROFILE: '/api/account/profile/upload',
    REMOVE_PROFILE: '/api/account/profile/remove',
    UPDATE_NATIONALITY: '/api/account/nationality/update',
    // 회원탈퇴 요청 (immediate=true이면 즉시 삭제, false이면 7일 유예)
    DELETE_REQUEST: '/api/account/delete/request',
  },
  // Wikipedia API 프록시 엔드포인트
  WIKI: {
    RANDOM: '/api/wiki/random',
    PAGE_HTML: '/api/wiki/page/html',       // + /{title}
    PAGE_SUMMARY: '/api/wiki/page/summary', // + /{title}
    TARGET_RANDOM: '/api/wiki/target/random',
  },
  // 관리자 전용 엔드포인트
  ADMIN: {
    WORDS_LIST: '/api/admin/words/list',
    WORDS_ADD: '/api/admin/words/add',
    WORDS_DELETE: '/api/admin/words/delete',
  },
  // 게임 전적 엔드포인트
  RECORD: {
    START: '/api/record/start',
    UPDATE_PATH: '/api/record/update-path',
    COMPLETE: '/api/record/complete',
    ABANDON: '/api/record/abandon',
    LIST: '/api/record/list',
    SHARE: '/api/record/share', // + /{shareId}
  },
  // 랭킹 엔드포인트
  RANKING: {
    LIST: '/api/ranking/list',
  },
  DONATION: {
    ALL: '/api/donations',
    LATEST: '/api/donations/latest',
    RECENT_ALERTS: '/api/donations/alerts/recent',
    DETAIL: '/api/donations', // + /{donationId}
    ACCOUNT_TRANSFER_REQUEST: '/api/donations/account-transfer/request',
    ADMIN_PENDING_ACCOUNT_TRANSFER: '/api/admin/donations/account-transfer/pending',
    ADMIN_CONFIRM_ACCOUNT_TRANSFER: '/api/admin/donations/account-transfer/confirm',
    WEBHOOK_KOFI: '/api/webhook/kofi',
  },
} as const;
