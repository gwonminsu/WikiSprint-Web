// Main Layout 위젯
import { Header } from './main-layout';

// Settings 위젯
import { SettingsView } from './settings';

// Doc Button 위젯 (WikiSprint 소개 페이지 플로팅 버튼)
import { DocFloatingButton } from './doc-button';

// Doc Content 위젯 (WikiSprint 소개 페이지 콘텐츠)
import { DocContentView } from './doc-content';

// Game Intro 위젯 (홈 게임 플로우 — talker + 말풍선 + iframe)
import { GameIntroView } from './game-intro';

// Game Result 위젯 (게임 결과 화면 — 카드 타임라인 + 요약)
import { GameResultView } from './game-result';

// Game Record 위젯 (전적 페이지 — 요약 + 카드 리스트)
import { GameRecordView } from './game-record';

// 네임스페이스 export
export const w = {
  Header,
  SettingsView,
  DocFloatingButton,
  DocContentView,
  GameIntroView,
  GameResultView,
  GameRecordView,
} as const;

// 개별 export (직접 import 용도)
export { Header } from './main-layout';
export { SettingsView } from './settings';
export { DocFloatingButton } from './doc-button';
export { DocContentView } from './doc-content';
export { GameIntroView } from './game-intro';
export { GameResultView } from './game-result';
export { GameRecordView } from './game-record';
