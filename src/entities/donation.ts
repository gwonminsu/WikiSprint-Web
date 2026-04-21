export interface DonationListItem {
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
