export type ReportTargetType = 'ACCOUNT' | 'DONATION';

export type ReportReason =
  | 'PROFILE_IMAGE'
  | 'NICKNAME'
  | 'DONATION_CONTENT'
  | 'OTHER';

export interface ReportCreateRequest {
  targetType: ReportTargetType;
  targetAccountId?: string | null;
  targetDonationId?: string | null;
  reason: ReportReason;
  detail?: string | null;
}

export interface ReportSummary {
  profileImageCount: number;
  nicknameCount: number;
  donationContentCount: number;
  otherCount: number;
  totalPendingCount: number;
  otherDetails: string[];
}

export type AdminAccountListView = 'REPORTED' | 'ALL';
export type AdminAccountSort = 'RECENT_LOGIN' | 'RECENT_JOIN' | 'NAME';
export type AdminAccountDirection = 'ASC' | 'DESC';

export interface AdminAccountListRequest {
  view: AdminAccountListView;
  sort: AdminAccountSort;
  direction: AdminAccountDirection;
  search: string;
  page: number;
  size: number;
}

export interface AdminAccountItem {
  accountId: string;
  email: string | null;
  nick: string;
  profileImgUrl: string | null;
  nationality: string | null;
  isAdmin: boolean | null;
  lastLogin: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  totalGames: number | null;
  totalClears: number | null;
  totalAbandons: number | null;
  bestRecord: number | null;
  deletionRequestedAt: string | null;
  pendingReportCount: number;
}

export interface AdminAccountListResponse {
  accounts: AdminAccountItem[];
  page: number;
  size: number;
  totalPages: number;
  totalCount: number;
}
