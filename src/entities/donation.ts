export interface DonationListItem {
  alertId?: string | null;
  donationId: string;
  source: string;
  accountId: string | null;
  accountNick: string | null;
  accountProfileImgUrl: string | null;
  type: string;
  supporterName: string | null;
  message: string | null;
  amount: string | null;
  currency: string | null;
  isAnonymous: boolean | null;
  receivedAt: string;
}

export interface AccountTransferDonationCreateRequest {
  coffeeCount: number;
  nickname: string;
  remitterName: string;
  message: string;
  anonymous: boolean;
}

export interface PendingAccountTransferDonationItem {
  donationId: string;
  source: string;
  accountId: string | null;
  accountNick: string | null;
  accountProfileImgUrl: string | null;
  supporterName: string | null;
  remitterName: string;
  message: string | null;
  coffeeCount: number;
  amount: string;
  currency: string;
  isAnonymous: boolean | null;
  receivedAt: string;
}
