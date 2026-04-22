import { Header } from './main-layout';
import { AuthLanguageDropdown } from './auth';
import { SettingsView } from './settings';
import { DocFloatingButton } from './doc-button';
import { DonationFloatingButton, DonationInfoListWidget, DonationPendingListWidget, DonationSection } from './donation';
import { DocContentView } from './doc-content';
import { GameIntroView } from './game-intro';
import { GameResultView } from './game-result';
import { GameRecordView } from './game-record';
import { RankingView } from './ranking';
import { ConsentModal } from './consent';

export const w = {
  Header,
  AuthLanguageDropdown,
  SettingsView,
  DocFloatingButton,
  DonationFloatingButton,
  DonationInfoListWidget,
  DonationPendingListWidget,
  DocContentView,
  DonationSection,
  GameIntroView,
  GameResultView,
  GameRecordView,
  RankingView,
  ConsentModal,
} as const;

export { Header } from './main-layout';
export { AuthLanguageDropdown } from './auth';
export { SettingsView } from './settings';
export { DocFloatingButton } from './doc-button';
export { DonationFloatingButton, DonationInfoListWidget, DonationPendingListWidget, DonationSection } from './donation';
export { DocContentView } from './doc-content';
export { GameIntroView } from './game-intro';
export { GameResultView } from './game-result';
export { GameRecordView } from './game-record';
export { RankingView } from './ranking';
export { ConsentModal } from './consent';
