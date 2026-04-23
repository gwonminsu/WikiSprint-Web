import { create } from 'zustand';
import type { DonationListItem, PendingAccountTransferDonationItem } from '@entities';

export type DonationEffectType = 'coffee' | 'awake' | 'barrel' | 'overdose';

export type DonationAlertPhase = 'idle' | 'showing' | 'exiting';

export interface DonationAlertItem {
  id: string;
  displayName: string;
  message: string | null;
  coffeeCount: number;
  effectType: DonationEffectType;
}

interface DonationAlertState {
  phase: DonationAlertPhase;
  current: DonationAlertItem | null;
  queue: DonationAlertItem[];
  handledIds: string[];
  enqueue: (item: DonationAlertItem) => void;
  startNext: () => void;
  requestExit: () => void;
  finishExit: () => void;
  markHandled: (id: string) => void;
}

const KRW_PER_COFFEE = 2000;
const FOREIGN_AMOUNT_PER_COFFEE = 5;

function parseDonationAmount(amount: string | null): number | null {
  if (!amount) {
    return null;
  }

  const numericAmount = Number(amount);
  return Number.isFinite(numericAmount) ? numericAmount : null;
}

function clampCoffeeCount(count: number): number {
  if (!Number.isFinite(count)) {
    return 1;
  }

  return Math.max(1, Math.floor(count));
}

function getEffectTypeByKrwAmount(amount: number): DonationEffectType {
  if (amount <= 5000) {
    return 'coffee';
  }
  if (amount <= 10000) {
    return 'awake';
  }
  if (amount <= 20000) {
    return 'barrel';
  }
  return 'overdose';
}

function getEffectTypeByForeignAmount(amount: number): DonationEffectType {
  if (amount <= 5) {
    return 'coffee';
  }
  if (amount <= 10) {
    return 'awake';
  }
  if (amount <= 20) {
    return 'barrel';
  }
  return 'overdose';
}

function resolveListDonationCoffeeCount(donation: DonationListItem): number {
  const amount = parseDonationAmount(donation.amount);
  if (amount === null) {
    return 1;
  }

  if (donation.source === 'account transfer') {
    return clampCoffeeCount(amount / KRW_PER_COFFEE);
  }

  return clampCoffeeCount(amount / FOREIGN_AMOUNT_PER_COFFEE);
}

function resolveListDonationEffectType(donation: DonationListItem): DonationEffectType {
  const amount = parseDonationAmount(donation.amount);
  if (amount === null) {
    return 'coffee';
  }

  if (donation.source === 'account transfer') {
    return getEffectTypeByKrwAmount(amount);
  }

  return getEffectTypeByForeignAmount(amount);
}

function resolvePendingDonationEffectType(donation: PendingAccountTransferDonationItem): DonationEffectType {
  const amount = parseDonationAmount(donation.amount);
  if (amount === null) {
    return getEffectTypeByKrwAmount(donation.coffeeCount * KRW_PER_COFFEE);
  }

  return getEffectTypeByKrwAmount(amount);
}

export function toDonationAlertFromListItem(
  donation: DonationListItem,
  anonymousLabel: string,
): DonationAlertItem {
  return {
    id: donation.donationId,
    displayName: donation.isAnonymous === true
      ? anonymousLabel
      : donation.accountNick ?? donation.supporterName ?? anonymousLabel,
    message: donation.message,
    coffeeCount: resolveListDonationCoffeeCount(donation),
    effectType: resolveListDonationEffectType(donation),
  };
}

export function toDonationAlertFromPendingItem(
  donation: PendingAccountTransferDonationItem,
  anonymousLabel: string,
): DonationAlertItem {
  return {
    id: donation.donationId,
    displayName: donation.isAnonymous === true
      ? anonymousLabel
      : donation.supporterName ?? donation.accountNick ?? anonymousLabel,
    message: donation.message,
    coffeeCount: clampCoffeeCount(donation.coffeeCount),
    effectType: resolvePendingDonationEffectType(donation),
  };
}

export const useDonationAlertStore = create<DonationAlertState>((set, get) => ({
  phase: 'idle',
  current: null,
  queue: [],
  handledIds: [],
  enqueue: (item) => {
    const { current, queue, handledIds } = get();
    const alreadyQueued = queue.some((queuedItem) => queuedItem.id === item.id);
    const alreadyCurrent = current?.id === item.id;
    const alreadyHandled = handledIds.includes(item.id);

    if (alreadyQueued || alreadyCurrent || alreadyHandled) {
      return;
    }

    set({ queue: [...queue, item], handledIds: [...handledIds, item.id].slice(-80) });
  },
  startNext: () => {
    const { phase, queue } = get();
    if (phase !== 'idle' || queue.length === 0) {
      return;
    }

    const [nextItem, ...remainingItems] = queue;
    if (!nextItem) {
      return;
    }

    set({ current: nextItem, queue: remainingItems, phase: 'showing' });
  },
  requestExit: () => {
    const { current, phase } = get();
    if (!current || phase === 'exiting') {
      return;
    }

    set({ phase: 'exiting' });
  },
  finishExit: () => {
    set({ current: null, phase: 'idle' });
  },
  markHandled: (id) => {
    const { handledIds } = get();
    if (handledIds.includes(id)) {
      return;
    }

    set({ handledIds: [...handledIds, id].slice(-80) });
  },
}));
