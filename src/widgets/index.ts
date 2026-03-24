// Main Layout 위젯
import { Header } from './main-layout';

// Settings 위젯
import { SettingsView } from './settings';

// 네임스페이스 export
export const w = {
  Header,
  SettingsView,
} as const;

// 개별 export (직접 import 용도)
export { Header } from './main-layout';
export { SettingsView } from './settings';
