export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: '/api/auth/google',
    REFRESH: '/api/auth/token/refresh',
  },
  ACCOUNT: {
    ME: '/api/account/me',
    DETAIL: '/api/account/detail',
    UPDATE_NICK: '/api/account/nick/update',
    UPLOAD_PROFILE: '/api/account/profile/upload',
    REMOVE_PROFILE: '/api/account/profile/remove',
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
  },
  // 랭킹 엔드포인트
  RANKING: {
    LIST: '/api/ranking/list',
  },
} as const;
