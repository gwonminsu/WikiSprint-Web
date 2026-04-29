import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SettingsState = {
  rankingAlertEnabled: boolean;
  donationAlertEnabled: boolean;
  donationAlertEnabledAt: number | null;
  setRankingAlertEnabled: (enabled: boolean) => void;
  setDonationAlertEnabled: (enabled: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      rankingAlertEnabled: true,
      donationAlertEnabled: true,
      donationAlertEnabledAt: null,
      setRankingAlertEnabled: (enabled: boolean) => set({ rankingAlertEnabled: enabled }),
      setDonationAlertEnabled: (enabled: boolean) => set({
        donationAlertEnabled: enabled,
        donationAlertEnabledAt: enabled ? Date.now() : null,
      }),
    }),
    { name: 'settings-storage' },
  ),
);
