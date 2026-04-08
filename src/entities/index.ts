// Auth 엔티티 타입
import type {
  GoogleLoginRequest,
  GoogleLoginResponse,
} from './auth';

// GameRecord 엔티티 타입
import type {
  GameRecordStatus,
  GameRecord,
  RecordSummary,
  GameRecordListResponse,
  StartGameRecordRequest,
  StartGameRecordResponse,
  UpdatePathRequest,
  CompleteRecordRequest,
  AbandonRecordRequest,
  PendingGameState,
} from './game-record';

// Account 엔티티 타입
import type {
  Account,
  UpdateNickRequest,
  UpdateNickResponse,
  UploadProfileResponse,
  RemoveProfileResponse,
  AccountResponse,
  AddTargetWordRequest,
  DeleteTargetWordRequest,
  TargetWordResponse,
} from './account';

// Wiki 엔티티 타입
import type { WikiSummary, WikiArticle } from './wiki';

// Ranking 엔티티 타입
import type {
  RankingPeriod,
  RankingDifficulty,
  RankingRecord,
  RankingListResponse,
  RankingListRequest,
} from './ranking/types';

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
      AddTargetWordRequest: AddTargetWordRequest;
      DeleteTargetWordRequest: DeleteTargetWordRequest;
      TargetWordResponse: TargetWordResponse;
    },
  },
  wiki: {
    type: {} as {
      WikiSummary: WikiSummary;
      WikiArticle: WikiArticle;
    },
  },
  ranking: {
    type: {} as {
      RankingPeriod: RankingPeriod;
      RankingDifficulty: RankingDifficulty;
      RankingRecord: RankingRecord;
      RankingListResponse: RankingListResponse;
      RankingListRequest: RankingListRequest;
    },
  },
  gameRecord: {
    type: {} as {
      GameRecordStatus: GameRecordStatus;
      GameRecord: GameRecord;
      RecordSummary: RecordSummary;
      GameRecordListResponse: GameRecordListResponse;
      StartGameRecordRequest: StartGameRecordRequest;
      StartGameRecordResponse: StartGameRecordResponse;
      UpdatePathRequest: UpdatePathRequest;
      CompleteRecordRequest: CompleteRecordRequest;
      AbandonRecordRequest: AbandonRecordRequest;
      PendingGameState: PendingGameState;
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
  AddTargetWordRequest,
  DeleteTargetWordRequest,
  TargetWordResponse,
} from './account';

export type { WikiSummary, WikiArticle } from './wiki';

export type {
  RankingPeriod,
  RankingDifficulty,
  RankingRecord,
  RankingListResponse,
  RankingListRequest,
} from './ranking/types';

export type {
  GameRecordStatus,
  GameRecord,
  RecordSummary,
  GameRecordListResponse,
  StartGameRecordRequest,
  StartGameRecordResponse,
  UpdatePathRequest,
  CompleteRecordRequest,
  AbandonRecordRequest,
  PendingGameState,
} from './game-record';
