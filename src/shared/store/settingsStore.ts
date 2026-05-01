import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RankingPeriod } from '@/entities/ranking/types';

type SettingsState = {
  rankingAlertEnabled: boolean;
  rankingAlertPeriod: RankingPeriod;
  donationAlertEnabled: boolean;
  donationAlertEnabledAt: number | null;
  setRankingAlertEnabled: (enabled: boolean) => void;
  setRankingAlertPeriod: (period: RankingPeriod) => void;
  setDonationAlertEnabled: (enabled: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      rankingAlertEnabled: true,
      rankingAlertPeriod: 'daily',
      donationAlertEnabled: true,
      donationAlertEnabledAt: null,
      setRankingAlertEnabled: (enabled: boolean) => set({ rankingAlertEnabled: enabled }),
      setRankingAlertPeriod: (rankingAlertPeriod: RankingPeriod) => set({ rankingAlertPeriod }),
      setDonationAlertEnabled: (enabled: boolean) => set({
        donationAlertEnabled: enabled,
        donationAlertEnabledAt: enabled ? Date.now() : null,
      }),
    }),
    {
      name: 'settings-storage',
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<SettingsState> | undefined;
        return {
          rankingAlertEnabled: state?.rankingAlertEnabled ?? true,
          rankingAlertPeriod: state?.rankingAlertPeriod ?? 'daily',
          donationAlertEnabled: state?.donationAlertEnabled ?? true,
          donationAlertEnabledAt: state?.donationAlertEnabledAt ?? null,
        };
      },
    },
  ),
);
