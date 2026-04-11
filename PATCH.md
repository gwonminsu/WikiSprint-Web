## v2.4.0 (2026-04-12)

### Added
- 국적 설정 기능 추가 (설정 페이지 프로필 섹션)
  - 이메일 행 아래에 국적 행 신규 배치, 연필 아이콘 클릭 시 검색 가능 드롭다운 표시
  - 50개국 목록 (`shared/lib/countryUtils.ts`) — ISO 3166-1 alpha-2 코드 기반
  - flagcdn.com 국기 이미지 + 고해상도 srcSet 지원 (`getCountryFlagUrl`, `getCountryFlagSrcSet`)
  - 무국적 상태는 🌐 지구본으로 표시, 드롭다운 최상단 "미설정" 옵션으로 복원 가능
  - 국가명 다국어 표시 (한국어·영어·일본어, 현재 언어 설정 연동)
- 랭킹 카드 국기 표시 (`RankingCard`, `MyRankingCard`)
  - 닉네임 왼쪽에 소형 국기 이미지 (16×12px, 2x/3x srcSet) 표시
  - 국적 미설정 시 🌐 폴백
- `useUpdateNationality` 훅 신규 추가 (`features/account/lib/`)
- `UpdateNationalityRequest` / `UpdateNationalityResponse` 타입 추가 (`entities/account/model/types.ts`)
- `AccountInfo`, `AccountResponse`, `Account` — `nationality: string | null` 필드 추가
- `RankingRecord` — `nationality: string | null` 필드 추가
- `ACCOUNT.UPDATE_NATIONALITY` 엔드포인트 상수 추가
- i18n ko/en/ja — `profile.nationality`, `nationalityUpdateSuccess/Fail`, `stateless`, `selectNationality` 키 추가
- `mockRankingData.ts` 삭제 (불필요한 더미 데이터 파일 정리)

### Changed
- 앱 버전 2.3.1 → **2.4.0**

========================================================================================================
========================================================================================================
========================================================================================================

## v2.3.1 (2026-04-09)

### Added
- 링크 없는 문서 진입 시 뒤로가기 기능 추가
  - 이동 가능한 파란 링크가 0개인 문서 진입 시 talkerFinger + 안내 말풍선 표시
  - 말풍선 오른쪽에 SVG 뒤로가기 버튼 생성 (시작 문서일 경우 버튼 미표시)
  - 클릭 시 직전 문서로 복귀, talker는 경과시간 기반 이미지로 재설정
- `gameStore` — `popDoc()` 액션 추가 (히스토리 마지막 항목 제거 + currentDocTitle 복귀)
- i18n ko/en/ja — `game.noLinksMessage`, `game.goBack` 키 추가

### Changed
- 앱 버전 2.3.0 → **2.3.1**

========================================================================================================
========================================================================================================
========================================================================================================

## v2.3.0 (2026-04-08)

### Added
- 랭킹 페이지 (`/ranking`) 신규 추가 — 기간(일·주·월) × 난이도(전체·쉬움·보통·어려움) Top 100 리더보드
  - `widgets/ranking/` — `RankingView`, `RankingCard`, `RankingTabs`, `RankingMedalFrame`, `MyRankingCard`
  - `features/ranking/` — `getRanking` API + `useRanking` 훅 (TanStack Query staleTime 30s)
  - `entities/ranking/types.ts` — `RankingPeriod`, `RankingDifficulty`, `RankingRecord`, `RankingListResponse`, `RankingListRequest`
  - `pages/RankingPage.tsx`
- 네임스페이스 등록 — `e.ranking.*`, `f.hook.useRanking`, `f.api.ranking.getRanking`, `w.RankingView`
- `RANKING.LIST` 엔드포인트 상수 추가 (`/api/ranking/list`)
- Header — 🏆 랭킹 네비게이션 버튼 추가
- i18n ko/en/ja — `ranking.*` 키 30종, `nav.ranking` 추가
- 아케이드 스타일 리더보드 CSS 추가 (656줄)

### Changed
- 게임 클리어 시 `queryClient.invalidateQueries({ queryKey: ['ranking'] })` 추가 → 클리어 즉시 랭킹 반영
- 앱 버전 2.2.0 → **2.3.0**

========================================================================================================
========================================================================================================
========================================================================================================

## v2.2.0 (2026-04-07)

### Added
- 홈 화면 난이도 선택 드롭다운 (`DifficultyDropdown`) 추가
  - 오마카세(기본) / 쉬움 / 보통 / 어려움 4단계 선택
  - Radix DropdownMenu 기반, 아케이드 스타일 디자인
  - 열릴 때 중력 낙하 + 바운스 애니메이션, 내부 옵션 stagger fade
  - 선택 시 난이도 설명 토스트 (같은 난이도 재선택 시 비반복)
- 말풍선 아래 현재 난이도 pill 태그 표시
  - 오마카세: 회색 톤, 쉬움/보통/어려움: amber 톤
- `gameStore` — `difficulty` / `setDifficulty` 상태 추가 (persist 포함, 게임 리셋과 독립)
- `wikiApi.getRandomTargetWord` — `difficulty` 옵셔널 파라미터 추가 (1~3: 해당 난이도, 미전달/0: 오마카세)
- i18n ko/en/ja — 난이도 관련 번역 키 10개 추가 (`difficultyOmakase`, `difficultyEasyToast` 등)
- CSS `@keyframes dropdown-gravity-drop` / `dropdown-gravity-up` / `dropdown-item-fade` 추가
- 게임 시작 시 선택 난이도 전달, 404(제시어 없음) 발생 시 오마카세로 자동 폴백 + 토스트 안내
- `RecordSummaryBar` 최고 기록 아이콘 ⚡ → 🏆, amber 색상 강조

### Changed
- 최고 기록(`bestTimeMs`) — 최근 5건 cleared MIN 계산 방식 → `accounts.best_record` 칼럼 기반으로 변경
  - FIFO 삭제로 인한 최고 기록 소실 문제 해결
  - 전체 클리어 기록 중 최단 시간이 영구 보존됨
- 앱 버전 2.1.0 → **2.2.0**

========================================================================================================
========================================================================================================
========================================================================================================

## v2.1.0 (2026-04-06)

### Added
- `GameIntroView` — 문서 내 각주/앵커 링크 클릭 시 스크롤 이동 구현
  - `#fragment` (bare) 및 `./Title#fragment` 형태 모두 처리
  - 현재 문서와 동일한 문서의 fragment는 API 호출 없이 해당 ID 요소로 smooth scroll
- `sanitizeWikiHtml` — 프론트엔드 HTML 캐시(`sanitizedHtmlCache`) 추가
  - 세션 내 재방문 시 DOMParser 재처리 생략, 즉시 반환
- `sanitizeWikiHtml` — 이미지 `loading="lazy"` + `decoding="async"` 적용 (초기 렌더링 부담 감소)
- `sanitizeWikiHtml` — Wikipedia 메타데이터/네비게이션 요소 제거 (`.navbox`, `.authority-control`, `.mbox-small`, `.ambox` 등 DOM 노드 낭비 요소)
- i18n `game.fetchErrorMessage` 키 추가 (ko/en/ja) — API 오류 시 전용 일시적 오류 안내 메시지
- i18n `doc.wikiLicense` 키 추가 (ko/en/ja) — CC BY-SA 라이선스 표시 문구

### Changed
- `GameIntroView` catch 블록 — `externalLinkMessage` → `fetchErrorMessage`로 교체 (API 오류 시 올바른 안내)
- `vite.config.ts` — `server.port: 5969` 고정 (기존 CLI 옵션 방식에서 설정 파일로 변경)
- 앱 버전 2.0.0 → **2.1.0**

========================================================================================================
========================================================================================================
========================================================================================================

## v2.0.0 (2026-04-06)

### Added
- 게임 전적 시스템 (`features/game-record`) — 게임 시작 시 즉시 `in_progress` 전적 생성, 문서 이동마다 경로 갱신(500ms 디바운스), 클리어/포기 시 최종 상태 전환
- `useGameRecord` hook — `startRecord` / `updatePath` / `completeRecord` / `abandonRecord` 4개 액션, 로그인 여부에 따라 서버 API 또는 `pendingRecordStore` 분기
- 크래시 복구 — `gameStore` persist 미들웨어 추가, 재접속 시 `phase === 'playing'` 감지 후 자동 포기 처리 + toast 안내
- 비로그인 전적 보관 (`pendingRecordStore`) — 게스트 플레이 시 전적 임시 저장, 로그인 후 서버 동기화
- 전적 페이지 (`widgets/game-record`) — `RecordSummaryBar`(누적 통계), `RecordCard`(상태별 카드), `RecordPathSegment`(경로 아코디언), `EmptyRecordView`
- 전적 카드 애니메이션 2종 — `animate-record-fade-up`(stagger), `animate-record-summary-in`
- `gameStore`에 `recordId`, `gameStartedAt` 필드 추가 — persist 대상 포함
- i18n 키 추가 — `record.*` 섹션 전체(totalPlays, clearCount, giveUpCount, bestTime 등), `game.autoClosed`

### Changed
- `GameIntroView` — `handleGameStart`: `startRecord()` → `startGame(recordId)` 순서로 서버 전적 먼저 생성, `handleArticleClick`: 일반 이동 시 `updatePath()` 호출 추가
- `Header.guardedNavigate` — playing 이탈 시 `abandonRecord()` 단일 호출로 단순화 (기존 스냅샷 + saveRecord 제거)
- `useGoogleLogin` — 로그인 후 `pendingGame` 동기화: start → complete or abandon 순서로 서버 전적 생성
- `GameRecordStatus` 타입 추가 — `'in_progress' | 'cleared' | 'abandoned'`
- 기존 `useSaveRecord` / `saveGameRecord` API 제거 → `useGameRecord` / `startGameRecord` 등으로 교체
- `endpoints.ts` RECORD 상수 — `SAVE` 제거, `START` / `UPDATE_PATH` / `COMPLETE` / `ABANDON` / `LIST` 추가

========================================================================================================
========================================================================================================
========================================================================================================

## v1.9.0 (2026-04-04)

### Added
- 게임 결과 화면 (`GameResultView`) — `phase === 'result'` 신규 단계 추가, 클리어 후 위키 문서 영역을 결과 화면으로 완전 교체
- 문서 경로 카드 타임라인 (`PathTimeline`) — 방문 문서를 카드로 순차 등장 (짝수 index: 오른쪽, 홀수: 왼쪽, 첫 카드: scale-in, 마지막: bounce)
- 카드 등장 속도 변화 (`useCardSequence`) — 초반(0~20%) 800ms, 중반(20~80%) 200ms, 후반(80~100%) 800ms 딜레이, 카드 30개 초과 시 중반 100ms로 자동 조정
- 카드 간 연결선 애니메이션 — 상단에서 하단으로 scaleY 성장, 새 카드 등장 시 스크롤 자동 추적
- 마지막 카드 도착 spark 효과 — 기존 `SuccessOverlay` 파티클 패턴 재활용, 8개 amber 계열 파티클로 축소 적용
- 결과 요약 (`ResultSummary`) — `talkerGood` 이미지 + "이렇게 {시작문서}에서부터 총 {n}개의 경로를 거쳐 {n}분 {nn.nn}초 만에 제시어 {제시어}에 도착했습니다!" 텍스트
- 하단 버튼 — 다시하기(게임 초기화), 다시 보기(카드 애니메이션 리마운트 재생), 카카오톡/디스코드 공유(console.log 임시)
- "결과 확인" 버튼 — `completed` 상태의 sticky 바 타이머 자리에 표시, 클릭 시 `phase → 'result'`
- 결과 화면 전용 CSS 애니메이션 7종 — `result-header`, `result-card-scale-in`, `result-card-from-right`, `result-card-from-left`, `result-card-arrive`, `result-connector`, `result-summary-in`
- i18n 결과 화면 키 9개 추가 — `resultButton`, `resultHeader`, `resultTagStart`, `resultTagArrive`, `resultSummary`, `resultRestart`, `resultReplay`, `resultShareKakao`, `resultShareDiscord` (ko/en/ja)

### Changed
- `GamePhase` 타입 확장 — `'completed'` → `'completed' | 'result'`
- `Header.guardedNavigate` — `completed`/`result` 상태에서 확인 다이얼로그 없이 즉시 `resetGame()` 후 이동 (게임 종료 후 이탈은 경고 불필요)
- `GameIntroView` — `completed` 상태에서 타이머 자리에 "결과 확인" 버튼 렌더링
- `HomePage` — `phase === 'result'` 분기 추가, CC BY-SA 출처 표시 result 단계에서 미표시

========================================================================================================
========================================================================================================
========================================================================================================

## v1.8.0 (2026-04-02)

### Added
- Redlink(미존재 문서) 시각적 비활성화 — `sanitizeWikiHtml()`을 DOMParser 기반으로 개선, `class="new"` 또는 `redlink=1`/`action=edit` 감지 시 `href` 제거 + `data-redlink` 속성 + `wiki-redlink` 클래스 적용 (회색 텍스트, 클릭 불가)
- Redlink 전용 안내 말풍선 — 외부 링크 메시지와 분리, `game.redlinkMessage` i18n 키 신규 추가 (ko/en/ja)
- 성공 오버레이 애니메이션 (`SuccessOverlay`) — 목표 문서 도달 시 Impact Burst 텍스트 + Ring Pulse 5개 + Spark 파티클 16개 CSS 애니메이션 표시 후 자동 페이드아웃
- 관리자 시스템 — `is_admin` 기반 관리자 배지(방패 아이콘 + 노란 텍스트) 및 제시어 관리 UI(`AdminTargetWordsSection`) 설정 페이지에 추가
- `features/admin` FSD 슬라이스 신규 생성 — `adminApi` (getWords/addWord/deleteWord), `useTargetWords` / `useAddTargetWord` / `useDeleteTargetWord` TanStack Query hooks
- 제시어 관리 UI — 언어(전체/ko/en/ja) + 난이도(전체/1/2/3) 필터, 최신순/이름순 정렬, 추가 폼(Radix Dropdown), 삭제 확인 Dialog
- i18n `admin` 섹션 추가 — badge, targetWords, CRUD 메시지, 필터/정렬 레이블 등 24개 키 (ko/en/ja)
- `authStore.AccountInfo`에 `is_admin: boolean` 필드 추가
- `game.successOverlayText` i18n 키 추가 (ko/en/ja)

### Changed
- `useGoogleLogin`, `useMyAccount` — 로그인/계정 조회 응답에서 `is_admin` 저장
- `adminApi` — `skipAuth = true` → 제거 (Authorization 헤더 미전송 버그 수정, 403 해소)

========================================================================================================
========================================================================================================
========================================================================================================

## v1.7.0 (2026-03-31)

### Added
- 게임 중 페이지 이동 가드 — Header `guardedNavigate()` 패턴: playing 상태에서 이동 시 "페이지 이동 시 진행중인 게임이 강제로 종료됩니다" 확인 다이얼로그 표시, 확인 시 게임 초기화(`resetGame`) 후 이동
- 빨간 링크 완전 차단 — `isRedLink()` 함수로 Wikipedia Parsoid HTML 빨간 링크(`class="new"`, `redlink=1`) 감지, API 호출 없이 즉시 경고 말풍선 표시
- 게임 시작 오류 처리 — `handleGameStart` catch 블록 추가, API 타임아웃·실패 시 토스트 알림 표시 ("게임을 시작 할 수 없습니다. 잠시 후 다시 시도해 주세요!")
- 문서 이동 API 실패 안전망 — `handleArticleClick` catch 블록 추가, 빨간 링크 포함 API 실패 시 경고 말풍선으로 통일
- i18n 키 추가 — `leaveConfirm`, `startError` 신규 추가 / `externalLinkMessage` 메시지 변경 (ko/en/ja)

### Changed
- Header 네비게이션 — `<Link>` → `<button>` + `guardedNavigate()` 전환 (로고, 홈, 설정, 도움!, 로그인 버튼), `useGameStore(phase)` 구독 추가
- 외부 링크 경고 메시지 — "[제시어-???] 붉은 색 링크는 이동할 수 없습니다" → "[제시어-???] 붉은 색 링크는 외부 링크로 이동 불가합니다"

========================================================================================================
========================================================================================================
========================================================================================================

## v1.6.0 (2026-03-31)

### Added
- 게임 타이머 — 100ms 간격 실시간 경과 시간 표시 (`useGameTimer`), 시간대별 색상 변화 (파랑→초록→주황→빨강)
- 게임 상태 스토어 (`gameStore`) — phase, 제시어, 문서 이동 히스토리, 타이머를 Zustand로 통합 관리
- 타이머 마일스톤 말풍선 — 2분/5분/10분 경과 시 talker 이미지 변경 + 경고 메시지 표시
- talker 캐릭터 7종 추가 — idle, yawn, sleep, good, ok, late, warn (경과 시간·클리어 시간 기반 분기)
- 승리 판정 시스템 — 제시어 문서 도달 시 타이머 정지 + 클리어 시간 표시 + 축하 메시지
- 문서 이동 경로 콘솔 로그 — 클리어 시 `시작문서 → ... → 제시어` 방문 순서 출력
- 외부 링크 차단 — 위키 내부 링크가 아닌 경우 빨간색 표시 + 클릭 불가 + 경고 말풍선
- SpeechBubble 다중 색상 하이라이트 — `highlights` prop으로 빨강/파랑 동시 강조 지원
- 헤더 "도움!" 버튼 — DocPage로 이동, 네비게이션 구분선(NavDivider) 추가
- i18n 게임 키 7종 추가 — navigatedMessage, timer2min/5min/10min, winMessage, helpButton, externalLinkMessage (ko/en/ja)

### Changed
- `HomePage` — 게임 phase를 gameStore로 이관, `completed` 상태 지원
- `GameIntroView` — props 제거 (`phase`, `onGameStart`), gameStore 직접 연동
- `DocFloatingButton` 제거 — 헤더의 "도움!" 버튼으로 대체
- SpeechBubble `whitespace-nowrap` 제거 — 긴 메시지 줄바꿈 허용

========================================================================================================
========================================================================================================
========================================================================================================

## v1.5.0 (2026-03-29)

### Changed
- 게임 다국어 지원 — 설정 페이지 언어에 따라 해당 언어의 제시어 + Wikipedia 문서 사용
- `wikiApi` 4개 함수에 `lang: Language` 파라미터 추가 (`?lang=${lang}` 쿼리)
  - `getRandomArticle(lang)`, `getArticleHtml(title, lang)`, `getArticleSummary(title, lang)`, `getRandomTargetWord(lang)`
- `GameIntroView` — 게임 시작 및 문서 이동 시 현재 언어 설정 전달
- `TargetWordResponse` 타입 — `lang: string` 필드 추가

========================================================================================================
========================================================================================================
========================================================================================================

## v1.4.0 (2026-03-26)

### Added
- Wikipedia REST API 기반 게임 시스템 — 백엔드 프록시를 통해 문서 HTML을 가져와 자체 렌더링
- WikiSprint 소개 문서 추가 및 링크 플로팅 버튼 홈페이지에 추가
- 제시어 시스템 — DB에서 랜덤 제시어 조회 (`getRandomTargetWord()`), 게임 중 제시어 고정
- 말풍선 제시어 강조 — `SpeechBubble`에 `highlightWord` prop 추가 (볼드 + `text-primary` 색상)
- `GameIntroView` 전면 리라이트 — ready/playing 2단계 게임 플로우, Wikipedia HTML 렌더링
- CC BY-SA 3.0 출처 표시 — playing 단계 화면 하단 고정 (`fixed bottom-0`)
- talker+말풍선 영역 상단 고정 — playing 단계 `sticky top-14` 적용
- `sanitizeWikiHtml()` — Wikipedia HTML의 `<base>`, `<head>` 태그 제거 (링크 버그 방지)
- 외부 링크 완전 차단 — 문서 내 모든 링크 `preventDefault()`, 위키 내부 링크만 허용
- `entities/wiki` 타입 확장 — `TargetWordResponse` 추가 (wordId, word, difficulty)
- `features/wiki` API 확장 — `getRandomTargetWord()` 함수 추가
- i18n `game` 네임스페이스 키 추가 — `startButton`, `playingMessage`, `arrivedButton`, `attribution` (ko/en/ja)

========================================================================================================
========================================================================================================
========================================================================================================

## v1.3.0 (2026-03-25)

### Added
- 게스트 모드 도입 — 비로그인 상태에서도 홈·설정 페이지 접근 가능
- 헤더: 비로그인 시 달리는 사람 아이콘 + "게스트" 닉네임 + 로그인 버튼 표시
- 설정 뷰: 비로그인 계정 섹션에 로그인 유도 문구 + 노란색·빨간색 그라데이션 로그인 버튼
- i18n 키 추가: `auth.guest`, `auth.loginPrompt` (ko/en/ja)

### Changed
- `PrivateRoute` 제거 — 홈(`/`)·설정(`/settings`) 라우트 공개로 전환
- 홈페이지: 비로그인 시 "안녕하세요, 게스트님" 인사말 표시
- 헤더 로그인/로그아웃 버튼: 빨간색 계열 글자색 적용, 호버 시 볼드체
- 로그아웃 후 이동 경로: `/auth` → `/` (홈)

========================================================================================================
========================================================================================================
========================================================================================================

## v1.2.0 (2026-03-24)

### Added
- 설정 뷰 계정 섹션 전면 개편
  - 닉네임 인라인 편집 (연필 아이콘 → 편집 모드, Enter/체크 버튼 저장, Esc 취소, 15자 제한 + 카운터)
  - 이메일 마스킹 기본 표시 (`j***@gmail.com`), 눈 아이콘 토글로 원문 확인
  - 프로필 이미지 변경 버튼 (아바타 아래, 버튼 형태)
- 프로필 이미지 편집 모달 (`ProfileImageEditModal`)
  - react-easy-crop 원형 크롭 + 줌 슬라이더
  - nsfwjs 클라이언트 사이드 NSFW 감지 (업로드 전 차단)
  - 커스텀 이미지 미리보기 (구글 기본 이미지 제외)
  - 인라인 이미지 삭제 컨펌 (Radix focus trap 충돌 해결)
- WikiSprint 브랜드 파비콘 (`public/favicon.png`)

### Changed
- 설정 뷰 프로필 아바타 크기 확대 (56px → 96px)
- Dialog z-index 상승 (`z-50` → `z-[60]`) — 모달 위 항상 표시
- i18n 키 추가: 닉네임/프로필/이메일 관련 신규 번역 (ko/en/ja)

### Dependencies
- `react-easy-crop`, `nsfwjs`, `@tensorflow/tfjs` 추가

========================================================================================================
========================================================================================================
========================================================================================================

## v1.1.0 (2026-03-24)

### Added
- 언어별(ko/en/ja) 로고 이미지 추가 (JPG → 투명 배경 PNG 변환, 여백 제거)
- `getLogoByLanguage()` 유틸리티 (`shared/assets/images/index.ts`)

### Changed
- GoogleOAuthProvider를 AuthPage에서 App.tsx 최상위로 이동 (GSI 중복 초기화 경고 해결)
- AuthPage, HomePage, Header 텍스트 로고 → 언어별 이미지 로고로 교체
- Header에 `sticky top-0 z-50` 적용 (스크롤 시 상단 고정)
- Vite 서버 COOP 헤더 `same-origin-allow-popups` 추가 (Google OAuth postMessage 허용)

========================================================================================================
========================================================================================================
========================================================================================================

## v1.0.0 (2026-03-24)

### Added

- WikiSprint 프론트엔드 초기화
- Google OAuth 간편 로그인 (@react-oauth/google)
- JWT 액세스 토큰 + 리프레시 토큰 인증 (자동 갱신 인터셉터)
- 계정 관리 (닉네임 변경, 프로필 이미지 업로드/삭제)
- 다국어 지원 (한국어, English, 日本語)
- 라이트/다크/시스템 테마
- FSD 아키텍처 (app → pages → widgets → features → entities → shared)
- TanStack Query + Zustand 상태 관리
- 웹 기반 레이아웃 (Header 네비게이션)
- 홈 페이지 + 설정 페이지
