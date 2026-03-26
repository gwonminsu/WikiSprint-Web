// Auth 엔티티 타입
import type {
  GoogleLoginRequest,
  GoogleLoginResponse,
} from './auth';

// Account 엔티티 타입
import type {
  Account,
  UpdateNickRequest,
  UpdateNickResponse,
  UploadProfileResponse,
  RemoveProfileResponse,
  AccountResponse,
} from './account';

// Wiki 엔티티 타입
import type { WikiSummary, WikiArticle } from './wiki';

// 네임스페이스 export
export const e = {
  auth: {
    type: {} as {
      GoogleLoginRequest: GoogleLoginRequest;
      GoogleLoginResponse: GoogleLoginResponse;
    },
  },
  account: {
    type: {} as {
      Account: Account;
      UpdateNickRequest: UpdateNickRequest;
      UpdateNickResponse: UpdateNickResponse;
      UploadProfileResponse: UploadProfileResponse;
      RemoveProfileResponse: RemoveProfileResponse;
      AccountResponse: AccountResponse;
    },
  },
  wiki: {
    type: {} as {
      WikiSummary: WikiSummary;
      WikiArticle: WikiArticle;
    },
  },
} as const;

// 타입 직접 export (직접 import 용도)
export type {
  GoogleLoginRequest,
  GoogleLoginResponse,
} from './auth';

export type {
  Account,
  UpdateNickRequest,
  UpdateNickResponse,
  UploadProfileResponse,
  RemoveProfileResponse,
  AccountResponse,
} from './account';

export type { WikiSummary, WikiArticle } from './wiki';
