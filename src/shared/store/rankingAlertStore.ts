import { create } from 'zustand';
import type { RankingAlertResponse, RankingAlertStatus } from '@/entities/ranking/types';

interface RankingAlertState {
  status: RankingAlertStatus;
  current: RankingAlertResponse | null;
  queue: RankingAlertResponse[];
  handledIds: string[];
  enqueue: (item: RankingAlertResponse) => void;
  startNext: () => void;
  requestExit: () => void;
  finishExit: () => void;
  markHandled: (alertId: string) => void;
}

export const useRankingAlertStore = create<RankingAlertState>((set, get) => ({
  status: 'idle',
  current: null,
  queue: [],
  handledIds: [],
  enqueue: (item) => {
    const { current, queue, handledIds } = get();
    const alreadyQueued = queue.some((queuedItem) => queuedItem.alertId === item.alertId);
    const alreadyCurrent = current?.alertId === item.alertId;
    const alreadyHandled = handledIds.includes(item.alertId);

    if (alreadyQueued || alreadyCurrent || alreadyHandled) {
      return;
    }

    set({
      queue: [...queue, item],
      handledIds: [...handledIds, item.alertId].slice(-120),
    });
  },
  startNext: () => {
    const { status, queue } = get();
    if (status !== 'idle' || queue.length === 0) {
      return;
    }

    const [nextItem, ...remainingItems] = queue;
    if (!nextItem) {
      return;
    }

    set({ current: nextItem, queue: remainingItems, status: 'showing' });
  },
  requestExit: () => {
    const { current, status } = get();
    if (!current || status === 'exiting') {
      return;
    }

    set({ status: 'exiting' });
  },
  finishExit: () => {
    set({ current: null, status: 'idle' });
  },
  markHandled: (alertId) => {
    const { handledIds } = get();
    if (handledIds.includes(alertId)) {
      return;
    }

    set({ handledIds: [...handledIds, alertId].slice(-120) });
  },
}));
