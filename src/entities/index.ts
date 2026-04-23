// Auth 엔티티 타입
import type {
  GoogleLoginRequest,
  GoogleLoginResponse,
} from './auth';

// Consent 엔티티 타입
import type { ConsentType, ConsentItem, RegisterRequest } from './consent';

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
  SharedGameRecord,
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
} from './account';

// Wiki 엔티티 타입
import type { WikiSummary, WikiArticle, TargetWordResponse } from './wiki';

// Ranking 엔티티 타입
import type {
  RankingPeriod,
  RankingDifficulty,
  RankingRecord,
  RankingListResponse,
  RankingListRequest,
} from './ranking/types';
import type {
  AccountTransferDonationCreateRequest,
  DonationListItem,
  PendingAccountTransferDonationItem,
} from './donation';
import type {
  AdminAccountDirection,
  AdminAccountItem,
  AdminAccountListRequest,
  AdminAccountListResponse,
  AdminAccountListView,
  AdminAccountSort,
  ReportCreateRequest,
  ReportReason,
  ReportSummary,
  ReportTargetType,
} from './report';

// 네임스페이스 export
export const e = {
  auth: {
    type: {} as {
      GoogleLoginRequest: GoogleLoginRequest;
      GoogleLoginResponse: GoogleLoginResponse;
    },
  },
  consent: {
    type: {} as {
      ConsentType: ConsentType;
      ConsentItem: ConsentItem;
      RegisterRequest: RegisterRequest;
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
  donation: {
    type: {} as {
      DonationListItem: DonationListItem;
      PendingAccountTransferDonationItem: PendingAccountTransferDonationItem;
      AccountTransferDonationCreateRequest: AccountTransferDonationCreateRequest;
    },
  },
  report: {
    type: {} as {
      ReportTargetType: ReportTargetType;
      ReportReason: ReportReason;
      ReportCreateRequest: ReportCreateRequest;
      ReportSummary: ReportSummary;
      AdminAccountListView: AdminAccountListView;
      AdminAccountSort: AdminAccountSort;
      AdminAccountDirection: AdminAccountDirection;
      AdminAccountListRequest: AdminAccountListRequest;
      AdminAccountItem: AdminAccountItem;
      AdminAccountListResponse: AdminAccountListResponse;
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
      SharedGameRecord: SharedGameRecord;
    },
  },
} as const;

// 타입 직접 export (직접 import 용도)
export type {
  GoogleLoginRequest,
  GoogleLoginResponse,
} from './auth';

export type { ConsentType, ConsentItem, RegisterRequest } from './consent';

export type {
  Account,
  UpdateNickRequest,
  UpdateNickResponse,
  UploadProfileResponse,
  RemoveProfileResponse,
  AccountResponse,
  AddTargetWordRequest,
  DeleteTargetWordRequest,
} from './account';

export type { WikiSummary, WikiArticle, TargetWordResponse } from './wiki';

export type {
  RankingPeriod,
  RankingDifficulty,
  RankingRecord,
  RankingListResponse,
  RankingListRequest,
} from './ranking/types';

export type {
  DonationListItem,
  PendingAccountTransferDonationItem,
  AccountTransferDonationCreateRequest,
} from './donation';

export type {
  ReportTargetType,
  ReportReason,
  ReportCreateRequest,
  ReportSummary,
  AdminAccountListView,
  AdminAccountSort,
  AdminAccountDirection,
  AdminAccountListRequest,
  AdminAccountItem,
  AdminAccountListResponse,
} from './report';

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
  SharedGameRecord,
} from './game-record';
