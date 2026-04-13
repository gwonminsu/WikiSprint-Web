# CLAUDE.md

이 문서는 Claude Code가 WikiSprint-Web 프로젝트에서 코드를 생성/수정/삭제할 때 참고하는 핵심 가이드입니다.

모든 설명을 한글로 하십시오.

---

## 연관 프로젝트

| 프로젝트 | 위치 | 용도 |
|---------|------|------|
| WikiSprint-Server | `../WikiSprint-Server` | 백엔드 API 서버 (포트 8585) |

---

## 개발 서버 실행

```bash
npm run dev -- --port 5969
```

---

## Claude Code 명령어

### `patch note` 명령어

1. `PATCH.md`에서 최신 버전 확인
2. git log/diff 분석
3. 버전 결정: Major (아키텍처), Minor (기능), Patch (수정)
4. `PATCH.md` 최상단에 추가 (구분선: `=` 104개 × 3줄)
5. `SettingsView` 앱정보 버전 번호 업데이트 (`widgets/settings/ui/SettingsView.tsx`)
6. 커밋 제목/메시지 제안: `feat: 대표 변경사항 (vX.X.X)` 형식으로 제안만 함 (커밋 · 푸시는 사용자가 직접 수행)

---

## 코드 생성 규칙

### 필수 규칙
1. **엄격한 타입 명시**: 모든 변수, 함수, 파라미터, 반환값에 타입 선언
2. **한글 주석**: 코드 주석과 설명은 한글로 작성
3. **금지 사항**: `any`, `unknown`, `var` 사용 금지

---

## FSD 아키텍처

### 레이어 구조
```
app → pages → widgets → features → entities → shared
```

- **단방향 의존성**: 상위 레이어는 하위 레이어만 import 가능
- **동일 레이어 간 import 금지**

### 프로젝트 구조

```
src/
├── app/                    # 애플리케이션 초기화
│   ├── App.tsx
│   ├── providers/
│   │   └── QueryProvider.tsx
│   └── router/
│       └── Router.tsx
│
├── pages/                  # 페이지 (직접 import)
│   ├── AuthPage.tsx        # Google OAuth 로그인
│   ├── HomePage.tsx
│   ├── SettingsPage.tsx
│   ├── DocPage.tsx         # WikiSprint 소개 문서
│   ├── RankingPage.tsx     # 랭킹 페이지
│   └── SharePage.tsx       # 공유 결과 페이지 (/share/:shareId)
│
├── widgets/                # 독립적 UI 블록
│   ├── index.ts            # 네임스페이스 export (w.*)
│   ├── main-layout/        # Header
│   ├── settings/           # SettingsView
│   ├── game-intro/         # GameIntroView (Wikipedia 렌더링 + 게임 핵심 로직)
│   │   └── lib/            # useTypewriter, useGameTimer
│   ├── game-result/        # GameResultView (게임 결과 화면 — 카드 타임라인 + 요약)
│   │   └── lib/            # useCardSequence, shareUtils (buildShareUrl, shareKakao)
│   ├── game-record/        # GameRecordView (전적 페이지 — 요약 바 + 카드 리스트)
│   │   ├── ui/             # GameRecordView, RecordSummaryBar, RecordCard, RecordPathSegment, EmptyRecordView
│   │   └── lib/            # formatRecordTime
│   └── ranking/            # RankingView (랭킹 페이지 — 아케이드 스타일 리더보드)
│       └── ui/             # RankingView, RankingCard, RankingTabs, RankingMedalFrame, MyRankingCard
│
├── features/               # 비즈니스 로직
│   ├── index.ts            # 네임스페이스 export (f.*)
│   ├── auth/               # Google OAuth (useGoogleLogin, authApi)
│   ├── account/            # 계정 관리 (닉네임, 프로필 이미지)
│   ├── admin/              # 관리자 전용 (제시어 CRUD — adminApi, useTargetWords 등)
│   ├── game-record/        # 게임 전적 (useGameRecord, useGameRecords, gameRecordApi)
│   └── ranking/            # 랭킹 조회 (getRanking, useRanking)
│
├── entities/               # 도메인 모델
│   ├── index.ts            # 네임스페이스 export (e.*)
│   ├── auth/               # GoogleLoginRequest, GoogleLoginResponse
│   ├── account/            # Account, AccountResponse 등
│   ├── game-record/        # GameRecord, RecordSummary, GameRecordListResponse, SharedGameRecord 등
│   └── ranking/            # RankingPeriod, RankingDifficulty, RankingRecord, RankingListResponse 등
│
└── shared/                 # 공용 코드
    ├── index.ts            # 네임스페이스 export (shared.*)
    ├── api/                # JWT 인터셉터 + API 클라이언트
    │   ├── core/           # interceptor, client, token
    │   ├── types/          # ApiResponse, ApiException
    │   └── constants/      # API_BASE_URL (8585), API_ENDPOINTS
    ├── assets/
    │   └── images/         # 언어별 로고 PNG (ko/en/ja) + getLogoByLanguage()
    ├── config/             # QueryClient 설정
    ├── lib/                # cn, i18n (ko/en/ja), countryUtils (국가 목록 + 국기 이미지 URL), kakao (kakaoSdk, kakao.d.ts)
    ├── store/              # authStore (is_admin, nationality 포함), themeStore, gameStore (difficulty·popDoc 포함, persist), pendingRecordStore
    ├── ui/                 # Dialog, Toast, ProfileAvatar, EmbossButton, SuccessOverlay
    └── styles/             # 전역 스타일 + 테마 CSS 변수
```

---

## 네임스페이스 패턴

```typescript
// pages는 직접 import
import HomePage from '@/pages/HomePage';

// 나머지는 네임스페이스 사용
import { w } from '@widgets';     // w.Header, w.SettingsView
import { f } from '@features';    // f.hook.useGoogleLogin, f.api.auth
import { e } from '@entities';    // e.auth.type.GoogleLoginRequest
import { shared } from '@shared'; // shared.ui.Dialog, shared.store.useAuthStore
```

### 현재 네임스페이스 구조

```typescript
// w (widgets)
w.Header
w.SettingsView
w.GameIntroView  // DifficultyDropdown 포함 (ready 상태 우상단 난이도 선택)
w.GameResultView
w.GameRecordView
w.RankingView    // 기간×난이도 Top 100 리더보드

// f (features)
f.hook.useGoogleLogin
f.hook.useMyAccount, f.hook.useGetAccount
f.hook.useUpdateNick, f.hook.useUpdateNationality
f.hook.useUploadProfileImage, f.hook.useRemoveProfileImage
f.hook.useTargetWords, f.hook.useAddTargetWord, f.hook.useDeleteTargetWord
f.hook.useGameRecord   // startRecord / updatePath / completeRecord / abandonRecord
f.hook.useGameRecords  // 전적 목록 + 통계 조회 (TanStack Query)
f.hook.useSharedRecord // 공유 전적 조회 (TanStack Query, skipAuth, staleTime 5분)
f.hook.useRanking      // 기간×난이도 Top 100 조회 (TanStack Query, staleTime 30s)
f.api.auth, f.api.account, f.api.admin, f.api.gameRecord
f.api.gameRecord.getSharedRecord  // POST /api/record/share/{shareId} (JWT 불필요)
f.api.ranking          // getRanking (POST /api/ranking/list)

// e (entities)
e.auth.type.GoogleLoginRequest, e.auth.type.GoogleLoginResponse
e.account.type.*  // AccountResponse(is_admin 포함), AddTargetWordRequest, DeleteTargetWordRequest
e.wiki.type.*     // WikiSummary, WikiArticle, TargetWordResponse
e.gameRecord.type.*  // GameRecord, GameRecordStatus, RecordSummary, GameRecordListResponse, SharedGameRecord, StartGameRecordRequest 등
e.ranking.type.*     // RankingPeriod, RankingDifficulty, RankingRecord, RankingListResponse, RankingListRequest

// shared
shared.ui.Dialog, shared.ui.ToastContainer
shared.ui.useDialog, shared.ui.useToast, shared.ui.ProfileAvatar, shared.ui.EmbossButton, shared.ui.SuccessOverlay
shared.store.useAuthStore, shared.store.useThemeStore, shared.store.useGameStore, shared.store.usePendingRecordStore
// Difficulty 타입 (0=오마카세, 1=쉬움, 2=보통, 3=어려움) — shared에서 직접 import 가능
shared.lib.cn, shared.lib.useTranslation, shared.lib.useLanguageStore, shared.lib.LANGUAGES
// countryUtils — 국가 코드 유틸 (직접 import)
getCountryFlagUrl, getCountryFlagSrcSet, COUNTRY_LIST  // 국기 이미지 URL + 국가 목록
shared.api.client, shared.api.getTokenStorage, shared.api.setAuthUpdateCallback, shared.api.setAuthFailureCallback
shared.config.queryClient

// 개별 export (직접 import)
getLogoByLanguage  // 언어(Language)를 인수로 받아 해당 로고 PNG URL 반환
tutoDoc            // 도움말 아이콘 이미지 (Header "도움!" 버튼)
talkerStart, talkerFinger, talkerIdle, talkerYawn, talkerSleep, talkerGood, talkerOk, talkerLate, talkerWarn  // talker 캐릭터 이미지 9종
initKakaoSdk       // 카카오 JS SDK 동적 로드 + 초기화 (VITE_KAKAO_JS_KEY 필요)
```

---

## 라우팅 구조

```
/           → HomePage      (게스트 포함 누구나 접근 가능)
/auth       → AuthPage      (로그인 페이지)
/settings   → SettingsPage  (게스트 포함 누구나 접근 가능)
/doc        → DocPage       (WikiSprint 소개)
/ranking    → RankingPage   (게스트 포함 누구나 접근 가능)
```

> PrivateRoute 없음. 게임 진행 중(`playing`) 이탈은 Header의 `guardedNavigate`로 확인 다이얼로그 처리.
> `completed`/`result` 상태에서는 확인 없이 즉시 초기화 후 이동.
> 새로고침/탭 종료 후 재접속 시 `phase === 'playing'`이 감지되면 자동 포기 처리 후 toast 표시.

---

## 파일명 규칙

| 파일 유형 | 규칙 | 예시 |
|----------|------|------|
| 컴포넌트 (.tsx) | PascalCase | `HomePage.tsx`, `Header.tsx` |
| 로직 파일 (.ts) | camelCase | `useGoogleLogin.ts`, `authApi.ts` |
| 특수 파일 | 소문자 | `index.ts`, `types.ts` |
| 슬라이스 폴더 | kebab-case | `main-layout/`, `auth/` |

---

## 웹뷰 호환성 (중요)

- `window.alert()`, `window.confirm()`, `window.prompt()` **사용 금지**
- 대체: `shared.ui.Toast`, `shared.ui.Dialog` 사용

---

## 다국어 (i18n)

- 한국어 (ko, 기본), 영어 (en), 일본어 (ja)
- 파일 위치: `shared/lib/i18n/locales/{lang}.ts`

---

## API 통신

- Base URL: `http://localhost:8585`
- 모든 엔드포인트 POST 메서드
- JWT Bearer 토큰 자동 갱신 (interceptor.ts)
