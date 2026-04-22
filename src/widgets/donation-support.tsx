import type { DonationListItem } from '@entities';

// 익명 후원자용 실루엣 아이콘이다.
export function AnonymousSupporterIcon(): React.ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
    >
      <circle cx="16" cy="10" r="4.5" fill="currentColor" opacity="0.88" />
      <path
        d="M9.2 24.6c1.2-3.6 4.1-5.9 6.8-5.9 2.7 0 5.6 2.3 6.8 5.9"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 후원 버튼용 아이콘이다.
export function SupportButtonIcon(): React.ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="h-10 w-10"
      fill="none"
    >
      <path
        d="M16 28.8c-7.8-5.4-11.9-9.4-11.9-14.5 0-4 3.1-7 6.9-7 2.2 0 4.1 1 5 2.7 1-1.7 2.9-2.7 5.1-2.7 3.8 0 6.9 3 6.9 7 0 5.1-4.1 9.1-11.9 14.5l-.1.1-.1-.1Z"
        fill="#f97316"
      />
      <g transform="translate(16 16) scale(0.75) translate(-16 -16)">
        <path
          d="M16 11.8v9M19.2 14.4c0-1.3-1.5-2.3-3.2-2.3s-3.2 1-3.2 2.3 1 2 3.2 2.5 3.2 1.2 3.2 2.5-1.5 2.3-3.2 2.3-3.2-1-3.2-2.3"
          stroke="#fdba74"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

// 프로필 URL이 안전한지 확인한다.
export function isSafeProfileImageUrl(url: string | null): boolean {
  if (!url) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

// 후원자의 표시 이름을 계산한다.
export function resolveDonationDisplayName(
  donation: DonationListItem,
  anonymousLabel: string,
): string {
  if (donation.isAnonymous === true) {
    return anonymousLabel;
  }

  return donation.accountNick ?? donation.supporterName ?? anonymousLabel;
}

// 후원 타입을 사용자 친화적인 라벨로 정규화한다.
export function normalizeDonationType(
  donationType: string | null,
  labels: { oneTime: string; monthly: string },
): string {
  if (!donationType) {
    return labels.oneTime;
  }

  const normalizedType = donationType.trim().toLowerCase();
  if (
    normalizedType.includes('monthly')
    || normalizedType.includes('subscription')
    || normalizedType.includes('membership')
  ) {
    return labels.monthly;
  }

  if (normalizedType.includes('donation') || normalizedType.includes('one')) {
    return labels.oneTime;
  }

  return donationType;
}

// 최근 후원자 미리보기용 고유 키를 만든다.
export function buildDonationIdentityKey(donation: DonationListItem): string {
  if (donation.isAnonymous === true) {
    return `anonymous:${donation.donationId}`;
  }

  if (donation.accountId) {
    return `account:${donation.accountId}`;
  }

  const displayName = resolveDonationDisplayName(donation, 'anonymous');
  return `name:${displayName.toLowerCase()}`;
}

function parseDonationAmount(amount: string | null): number | null {
  if (!amount) {
    return null;
  }

  const numericAmount = Number(amount);
  return Number.isFinite(numericAmount) ? numericAmount : null;
}

export function getDonationTierGlowClass(donation: DonationListItem): string {
  const amount = parseDonationAmount(donation.amount);
  if (amount === null) {
    return 'donation-tier-default';
  }

  if (donation.source === 'account transfer') {
    if (amount <= 5000) {
      return 'donation-tier-bronze';
    }
    if (amount <= 10000) {
      return 'donation-tier-silver';
    }
    if (amount <= 20000) {
      return 'donation-tier-gold';
    }
    return 'donation-tier-rainbow-inner';
  }

  if (amount <= 5) {
    return 'donation-tier-bronze';
  }
  if (amount <= 10) {
    return 'donation-tier-silver';
  }
  if (amount <= 20) {
    return 'donation-tier-gold';
  }
  return 'donation-tier-rainbow-inner';
}

export function isRainbowDonationTier(donation: DonationListItem): boolean {
  const amount = parseDonationAmount(donation.amount);
  if (amount === null) {
    return false;
  }

  if (donation.source === 'account transfer') {
    return amount > 20000;
  }

  return amount > 20;
}
