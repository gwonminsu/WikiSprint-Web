export const API_BASE_URL = 'http://localhost:8585';

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
} as const;
