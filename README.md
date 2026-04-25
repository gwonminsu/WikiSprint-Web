<div align="center">

# 🌐 WikiSprint Web

**WikiSprint 프론트엔드 — React + TypeScript + Vite**

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-5.x-433E38?style=flat-square)](https://zustand-demo.pmnd.rs/)
[![Version](https://img.shields.io/badge/version-v2.13.3-brightgreen?style=flat-square)](./PATCH.md)

</div>

---

## 🎮 WikiSprint이란?

**WikiSprint**는 유튜버 **침착맨**이 소개한 나무위키 스피드런에서 영감을 받아 만들어진 위키 스피드런 게임입니다.

[Wikipedia REST API](https://ko.wikipedia.org/api/rest_v1/) (CC BY-SA 3.0)를 활용해 위키피디아 문서를 제공하며, **제시어**가 주어지면 무작위 위키피디아 문서에서 출발해 문서 내 링크만을 따라 목표 문서에 가장 빠르게 도달하는 것이 목표입니다.

### 게임 규칙

- 게임 시작 버튼을 누르는 순간 타이머가 시작됩니다
- 문서 내 링크만을 이용해 제시어 문서까지 이동해야 합니다
- 비로그인 상태로도 플레이 가능, 랭킹 등록은 로그인 필요

> 📄 콘텐츠 출처: [Wikipedia](https://ko.wikipedia.org/) (CC BY-SA 3.0)

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🎮 위키 스피드런 게임 | 랜덤 문서에서 제시어까지 링크만으로 도달, 타이머 측정 |
| 🎯 난이도 선택 | 쉬움 / 보통 / 어려움 / 오마카세(랜덤) 4단계 |
| 📊 전적 관리 | 게임 기록 자동 저장, 클리어/포기 통계 조회 |
| 🏆 랭킹 시스템 | 일간·주간·월간 × 난이도 Top 100 리더보드 |
| 🔐 Google OAuth 로그인 | Google 계정으로 원클릭 로그인 + 약관 동의 가입 |
| 📋 약관 동의 가입 | 신규 유저 약관 동의 후 회원가입 (필수 3개 + 선택 1개) |
| 🚪 회원탈퇴 | 계정 삭제 요청 및 탈퇴 대기 중 취소 가능 |
| 🔄 JWT 자동 갱신 | Access Token 만료 시 Refresh Token으로 자동 재발급 |
| 👤 계정 관리 | 닉네임 변경, 프로필 이미지 업로드/삭제 |
| 🏳️ 국적 설정 | 프로필 국기 표시, 랭킹 카드 국기 반영 |
| 📘 인터랙티브 문서 가이드 | `/doc` 페이지에 TOC, 플레이형 튜토리얼, FAQ, 영상 아코디언 제공 |
| 🏷️ 전적 난이도 태그 | `/record` 카드에서 제시어 난이도를 함께 표시 |
| 🔗 공유 결과 링크 | 공유 전용 `shareId` 기반 URL 생성, 24시간 유효 공유 페이지 제공 |
| 💖 후원 | Ko-fi 해외 후원(iframe) + 국내 계좌이체(관리자 수동 승인) 2-분기 구조, 티어 글로우 표시 |
| 🌍 다국어 지원 | 한국어 · 영어 · 일본어 (i18n) |
| 🎨 테마 지원 | 라이트 / 다크 / 시스템 자동 테마 |
| 📱 웹뷰 호환 | `window.alert` 없이 커스텀 Dialog/Toast 사용 |

---

## 🛠 기술 스택

| 카테고리 | 기술 | 버전 |
|---------|------|------|
| 프레임워크 | React | 19.x |
| 언어 | TypeScript | 5.x |
| 빌드 도구 | Vite + SWC | 7.x |
| 스타일링 | Tailwind CSS | 4.x |
| 서버 상태 | TanStack Query | 5.x |
| 클라이언트 상태 | Zustand | 5.x |
| 라우팅 | react-router-dom | 7.x |
| Google OAuth | @react-oauth/google | 최신 |
| UI 프리미티브 | Radix UI | 최신 |
| XSS 방어 | DOMPurify | 최신 |

---

## 🏗 아키텍처 — Feature-Sliced Design (FSD)

계층 간 **단방향 의존성**을 강제하는 FSD 아키텍처를 채택합니다.

```
app → pages → widgets → features → entities → shared
```

> 동일 레이어 간 import는 금지됩니다.

### 네임스페이스 import 패턴

```typescript
import { w }      from '@widgets';  // w.Header, w.SettingsView, w.GameIntroView
import { f }      from '@features'; // f.hook.useGoogleLogin, f.api.gameRecord
import { e }      from '@entities'; // e.auth.type.GoogleLoginRequest
import { shared } from '@shared';   // shared.ui.Dialog, shared.store.useAuthStore
```

---

## 📁 디렉토리 구조

```
WikiSprint-Web/
└── src/
    ├── app/
    │   ├── App.tsx
    │   ├── providers/
    │   │   └── QueryProvider.tsx
    │   └── router/
    │       └── Router.tsx
    │
    ├── pages/
    │   ├── AuthPage.tsx          # Google OAuth 로그인 페이지
    │   ├── HomePage.tsx          # 게임 메인 페이지
    │   ├── SettingsPage.tsx      # 설정 페이지
    │   ├── DocPage.tsx           # WikiSprint 소개 문서
    │   ├── RecordPage.tsx        # 전적 조회 페이지
    │   ├── RankingPage.tsx       # 랭킹 페이지
    │   ├── SharePage.tsx         # 공유 결과 페이지 (/share/:shareId)
    │   └── DonationInfoPage.tsx  # 후원 정보 페이지 (/donations)
    │
    ├── widgets/
    │   ├── main-layout/          # Header 네비게이션
    │   ├── settings/             # SettingsView (프로필·테마·언어·관리자·회원탈퇴)
    │   ├── consent/              # ConsentModal (약관 동의 가입 모달)
    │   ├── doc-content/          # DocContentView, DocInteractiveTutorial, DocVideoAccordion
    │   ├── game-intro/           # GameIntroView (게임 진행 화면 + Wikipedia 렌더링)
    │   ├── game-result/          # GameResultView (게임 결과 카드 타임라인)
    │   ├── game-record/          # GameRecordView (전적 목록 + 통계 바)
    │   ├── ranking/              # RankingView (기간×난이도 리더보드)
    │   └── donation/             # 후원 위젯 슬라이스
    │       ├── lib/              # donationSupport.tsx (공용 유틸), donationAlert.ts (알림 로직)
    │       └── ui/               # DonationFloatingButton, DonationSection, DonationInfoListWidget, DonationPendingListWidget, DonationAlertOverlay
    │
    ├── features/
    │   ├── auth/                 # Google OAuth 로그인 훅 & API
    │   ├── account/              # 계정 관리 훅 & API (닉네임·이미지·회원탈퇴)
    │   ├── consent/              # 회원가입 훅 & API (register, useRegister)
    │   ├── wiki/                 # Wikipedia API 클라이언트
    │   ├── admin/                # 관리자 제시어 CRUD
    │   ├── game-record/          # 게임 전적 훅 & API
    │   ├── ranking/              # 랭킹 조회 훅 & API
    │   └── donation.ts           # 후원 API + 훅 (getLatestDonations, createAccountTransferDonation 등)
    │
    ├── entities/
    │   ├── auth/                 # GoogleLoginRequest/Response 타입
    │   ├── account/              # Account, AccountResponse 타입
    │   ├── consent/              # ConsentType, ConsentItem, RegisterRequest 타입
    │   ├── wiki/                 # WikiSummary, TargetWordResponse 타입
    │   ├── game-record/          # GameRecord, RecordSummary 타입
    │   ├── ranking/              # RankingRecord, RankingListResponse 타입
    │   └── donation.ts           # DonationListItem, PendingAccountTransferDonationItem 타입
    │
    └── shared/
        ├── api/                  # JWT 인터셉터, API 클라이언트, 엔드포인트
        ├── config/               # QueryClient 설정
        ├── lib/                  # cn 유틸, i18n (ko/en/ja), countryUtils (국기 이미지)
        ├── store/                # authStore, themeStore, gameStore, pendingRecordStore
        ├── ui/                   # Dialog, Toast, ProfileAvatar, EmbossButton, SuccessOverlay, Accordion
        └── styles/               # 전역 스타일 + 테마 CSS 변수
```

---

## 🚀 시작하기

### 요구사항

- Node.js 20+
- pnpm

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-org/WikiSprint.git
cd WikiSprint/WikiSprint-Web

# 의존성 설치
pnpm install

# 개발 서버 실행 (포트 5969)
pnpm dev -- --port 5969
```

### 빌드

```bash
pnpm build
pnpm preview
```

---

## ⚙️ 환경 설정

프로젝트 루트에 `.env` 파일을 생성하세요:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_KAKAO_JS_KEY=your-kakao-javascript-key
```

| 환경변수 | 설명 |
|---------|------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `VITE_KAKAO_JS_KEY` | 카카오 JavaScript SDK 초기화 키 |

---

## 🗺 라우팅 구조

| 경로 | 페이지 | 인증 필요 |
|------|--------|----------|
| `/` | `HomePage` | ❌ (게스트 포함) |
| `/auth` | `AuthPage` | ❌ |
| `/settings` | `SettingsPage` | ❌ (게스트 포함) |
| `/doc` | `DocPage` | ❌ |
| `/record` | `RecordPage` | ✅ |
| `/ranking` | `RankingPage` | ❌ (게스트 포함) |
| `/share/:shareId` | `SharePage` | ❌ |
| `/donations` | `DonationInfoPage` | ❌ |

> PrivateRoute 없음. 게임 진행 중 이탈은 Header의 `guardedNavigate`로 확인 다이얼로그 처리.

---

## 🔗 백엔드 연동

- 백엔드 서버: `http://localhost:8585`
- API 기본 경로: `/api`
- CORS 허용 오리진: `http://localhost:5969`

→ [WikiSprint-Server README](../WikiSprint-Server/README.md)

---

## 🔗 공유 링크 메모

- 결과 화면에서 공유 직전 `POST /api/record/share`를 호출해 공유 전용 `shareId`를 생성합니다.
- 공유 URL은 전적 ID를 그대로 쓰지 않고, 서버가 발급한 `shareId`를 기반으로 만듭니다.
- 공유 페이지는 24시간 동안 유효하며, 카카오톡 공유, QR 코드, 링크 복사 흐름과 연결됩니다.

---

## 💖 후원 메모

- 전역 플로팅 버튼(`DonationFloatingButton`)은 `app/App.tsx`에서 상시 마운트됩니다.
- 해외 후원: Ko-fi(`https://ko-fi.com/minjoy`) iframe 임베드를 통한 PayPal 결제.
- 국내 후원: Ko-fi가 한국 결제를 지원하지 않아 계좌이체 + 관리자 수동 승인 방식으로 구현됩니다.
  - 커피 1잔 = 2000 KRW, 1~100잔 선택 가능
  - `POST /api/donations/account-transfer/request` 호출 → 관리자가 `/donations` 페이지에서 입금 확인
- 후원 티어(`bronze/silver/gold/rainbow`)는 `widgets/donation-support.tsx`의 `getDonationTierGlowClass`에서 결정됩니다.

---

## 📜 패치 노트

최신 변경사항은 [PATCH.md](./PATCH.md)를 참고하세요.

---

<div align="center">

**WikiSprint** — Built with ❤️ using React & TypeScript

</div>
---

## 🆕 v2.13.3 문서 메모

### 게임 시작 동시성 보정

- 로그인 계정은 다른 창이나 탭에서 이미 진행 중인 게임이 있으면 새 게임을 시작할 수 없습니다.
- `GameIntroView`는 서버의 `409 CONFLICT` 응답을 감지하면 게임 시작을 반려하고 경고 토스트만 표시합니다.
- 시작 반려 문구 `game.startBlockedByAnotherSession`이 `ko`, `en`, `ja` 로케일에 추가됐습니다.

## 🆕 v2.13.1 문서 메모

### 후원/신고 UX 보정

- 신고 제출은 `ReportModal`에서 확인 다이얼로그를 거친 뒤 진행됩니다.
- `/admin/accounts`와 `/donations` 관리자 액션 버튼은 검열, 권한 부여, 처리 완료 전에 한 번 더 확인을 받습니다.
- `/doc` 후원 미리보기는 서포터 네임 기준으로 서로 다른 후원자만 노출합니다.
- 비연동 후원의 첫 글자 아바타는 `/donations`와 같은 컬러 배경 스타일로 맞췄습니다.
- 게임 문서 도착 판정은 링크 문자열이 아니라 실제 문서의 canonical title 기준으로 보강됐습니다.

## 🆕 v2.13.0 문서 메모

### 관리자/신고 기능

- 신고 모달(`widgets/report/ui/ReportModal.tsx`)을 통해 랭킹과 후원 정보에서 사용자 신고를 접수합니다.
- 관리자 전용 `/admin/accounts` 페이지에서 계정 신고 요약, 기타 사유 목록, 프로필/닉네임 검열, 관리자 권한 부여를 처리합니다.
- `/donations` 관리자 화면에서 후원 카드 확장 패널로 신고 요약, 서포터 네임 검열/복구, 후원 내용 검열, 처리 완료, 삭제를 수행합니다.

### 추가 라우트

| 경로 | 페이지 | 접근 |
|------|--------|------|
| `/admin/accounts` | `AdminAccountPage` | 관리자 전용 |

### 추가 슬라이스

- `pages/AdminAccountPage.tsx`
- `widgets/admin-account/`
- `widgets/report/`
- `features/admin-account.ts`
- `features/report.ts`
- `entities/report.ts`
