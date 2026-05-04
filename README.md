<div align="center">

# WikiSprint Web

**Wikipedia 링크를 따라 목표 문서까지 가장 빠르게 도달하는 WikiSprint의 프론트엔드입니다.**

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-5.x-433E38?style=flat-square)](https://zustand-demo.pmnd.rs/)
[![Version](https://img.shields.io/badge/version-v2.16.3-brightgreen?style=flat-square)](./PATCH.md)

</div>

---

## 소개

WikiSprint Web은 게임 플레이, 기록 조회, 랭킹, 공유, 후원, 관리자 화면까지 연결하는 사용자 인터페이스입니다.  
Wikipedia REST API와 WikiSprint 서버 API를 함께 사용하며, 빠른 탐색 UX와 실시간에 가까운 상태 반영을 목표로 합니다.

> 콘텐츠 출처: [Wikipedia](https://ko.wikipedia.org/) (CC BY-SA 3.0)

### 게임 방식

1. 시작 문서와 목표 문서를 받습니다.
2. 현재 문서 안의 링크만 따라 이동합니다.
3. 가장 짧은 시간 안에 목표 문서에 도달하면 승리합니다.
4. 결과는 기록, 랭킹, 공유 페이지로 이어집니다.

---

## 핵심 기능

| 영역 | 설명 |
|---|---|
| 게임 플레이 | Wikipedia 문서 링크를 따라 목표 문서까지 이동하는 메인 게임 흐름 |
| 난이도 선택 | `easy`, `normal`, `hard`, `random` 기반 시작/목표 문서 조합 |
| 기록 관리 | 최근 기록, 통계, 최고 기록, 중단 기록 정리 |
| 랭킹 | 일간, 주간, 월간, 전체 랭킹 Top 100 조회 |
| 랭킹 알림 | 선택한 기간의 쉬움, 보통, 어려움 랭킹 진입과 추월을 오버레이로 표시 |
| 후원 알림 | 최신 후원 알림 재생과 관리자용 후원 확인 흐름 제공 |
| 알림 설정 | 설정 화면에서 랭킹/후원 알림을 각각 on/off로 제어 |
| 공유 | `shareId` 기반 결과 공유 페이지와 QR, 링크 복사, 카카오 공유 지원 |
| 인증 | Google OAuth 로그인, 회원가입, 탈퇴 취소 |
| 다국어 | 한국어, 영어, 일본어, 중국어(간체) 지원 |
| 테마 | 라이트, 다크, 시스템 테마 지원 |

---

## 주요 사용자 흐름

### 게임 플레이 흐름

1. 홈 화면에서 난이도와 모드를 확인합니다.
2. 시작 문서와 목표 문서를 받아 게임을 시작합니다.
3. 문서 내 링크를 따라 이동하며 경로를 누적합니다.
4. 완료 또는 포기 시 기록과 통계가 서버에 반영됩니다.
5. 결과 화면에서 기록 공유, 랭킹 확인, 다음 플레이로 이어집니다.

### 계정 및 설정 흐름

- Google OAuth로 로그인합니다.
- 최초 로그인 사용자는 약관 동의 후 회원가입을 완료합니다.
- 설정 화면에서 프로필, 언어, 테마, 알림 설정을 변경합니다.
- 탈퇴 요청 계정은 로그인 시 탈퇴 취소 플로우로 복구할 수 있습니다.

### 후원 및 알림 흐름

- 랭킹 알림은 설정에서 고른 기간의 쉬움, 보통, 어려움 랭킹 진입과 추월 이벤트를 오버레이로 표시합니다.
- 후원 알림은 최신 후원 이벤트를 순차 재생합니다.
- 두 알림은 설정 화면에서 독립적으로 끌 수 있습니다.
- 후원 알림은 설정을 다시 켠 시점 이후에 생성된 항목만 재생합니다.

---

## 기술 스택

| 구분 | 사용 기술 |
|---|---|
| 프레임워크 | React 19 |
| 언어 | TypeScript 5 |
| 빌드 | Vite 7 |
| 스타일 | Tailwind CSS 4 |
| 서버 상태 | TanStack Query 5 |
| 클라이언트 상태 | Zustand 5 |
| 라우팅 | React Router DOM 7 |
| UI 보조 | Radix UI |
| HTML 정제 | DOMPurify |

---

## 구조

WikiSprint Web은 FSD(Feature-Sliced Design) 구조를 기준으로 구성합니다.

```text
app -> pages -> widgets -> features -> entities -> shared
```

### 디렉터리 개요

```text
WikiSprint-Web/
├─ src/
│  ├─ app/
│  ├─ pages/
│  ├─ widgets/
│  ├─ features/
│  ├─ entities/
│  └─ shared/
├─ public/
└─ dist/
```

### 자주 보는 위치

| 경로 | 설명 |
|---|---|
| `src/widgets/settings/ui/SettingsView.tsx` | 설정 화면과 앱 버전 표기 |
| `src/widgets/ranking-alert/ui/RankingAlertOverlay.tsx` | 랭킹 알림 오버레이 |
| `src/widgets/donation/ui/DonationAlertOverlay.tsx` | 후원 알림 오버레이 |
| `src/shared/store/settingsStore.ts` | 알림 on/off 설정 저장 |
| `src/shared/lib/i18n/locales/` | 한국어, 영어, 일본어, 중국어 번역 리소스 |

### 핵심 위젯

| 위젯 | 설명 |
|---|---|
| `widgets/game-intro` | 게임 시작 전 흐름과 진입 UI |
| `widgets/game-record` | 기록 목록, 통계 요약, 결과 카드 UI |
| `widgets/ranking` | 기간별 랭킹 목록과 카드 표시 |
| `widgets/ranking-alert` | 전체 랭킹 진입/추월 알림 오버레이 |
| `widgets/donation` | 후원 버튼, 후원 목록, 후원 알림, 관리자 후원 UI |
| `widgets/doc-content` | `/` 가이드 페이지 본문, TOC, 인터랙션 구성 |

### 상태 저장소 메모

- `authStore`: 로그인 상태와 사용자 정보
- `themeStore`: 라이트, 다크, 시스템 테마
- `gameStore`: 진행 중 게임 상태와 경로
- `settingsStore`: 랭킹/후원 알림 on/off와 랭킹 알림 기간 설정
- 오버레이 상태는 각 위젯 내부 상태와 서버 조회 결과를 조합해 제어합니다.

---

## 화면 구성

| 경로 | 페이지 | 설명 |
|---|---|---|
| `/` | `DocPage` | 서비스 가이드 (랜딩 페이지) |
| `/play` | `HomePage` | 게임 메인 화면 |
| `/auth` | `AuthPage` | 로그인과 회원가입 진입 |
| `/settings` | `SettingsPage` | 계정, 테마, 언어, 알림 설정 |
| `/record` | `RecordPage` | 최근 기록과 통계 |
| `/ranking` | `RankingPage` | 기간별 랭킹 조회 |
| `/share/:shareId` | `SharePage` | 공유 결과 페이지 |
| `/donations` | `DonationInfoPage` | 후원 안내와 관리자 후원 확인 |
| `/admin/accounts` | `AdminAccountPage` | 관리자 계정 관리 |
| `/doc` | — | `/`로 리다이렉트 (구 경로 호환) |
| `/patch` | `PatchPage` | 패치노트 |
| `/podo` | `PodoPage` | 캐릭터 및 부가 소개 페이지 |

`PrivateRoute`는 사용하지 않고, 게임 진행 중 이탈 같은 상황은 확인 다이얼로그 기반 흐름으로 제어합니다.

### 라우팅 메모

- `pages`만 직접 import합니다.
- 나머지 레이어는 가능한 한 namespace export를 유지합니다.
- 게임 진행 중에는 헤더 이동이나 특정 라우팅에서 이탈 확인 흐름이 개입합니다.

---

## 실행 방법

### 요구 사항

- Node.js 20 이상
- npm 또는 pnpm

### 설치 및 개발 서버 실행

```bash
git clone <repository-url>
cd WikiSprint/WikiSprint-Web
npm install
npm run dev -- --port 5969
```

### 빌드

```bash
npm run build
npm run preview
```

---

## 환경 변수

프로젝트 루트에 `.env` 파일을 생성합니다.

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_KAKAO_JS_KEY=your-kakao-javascript-key
```

| 변수 | 설명 |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `VITE_KAKAO_JS_KEY` | 카카오 공유용 JavaScript SDK 키 |

---

## 백엔드 연동

- 프론트엔드 개발 서버: `http://localhost:5969`
- 백엔드 API 서버: `http://localhost:8585`
- 기본 API prefix: `/api`

주요 API 범주는 다음과 같습니다.

- 인증: `/api/auth/**`
- 계정: `/api/account/**`
- 기록: `/api/record/**`
- 랭킹: `/api/ranking/**`
- 후원: `/api/donations/**`
- 관리자: `/api/admin/**`

서버 상세 설명은 [WikiSprint-Server README](../WikiSprint-Server/README.md)에서 확인할 수 있습니다.

---

## 운영 메모

### 공유 기능

- 결과 화면에서 `POST /api/record/share` 호출 후 `shareId`를 발급받습니다.
- 공유 페이지는 기록 ID가 아니라 `shareId` 기반으로 조회합니다.
- 공유 링크는 24시간 동안 유효합니다.

### 후원 및 알림

- 해외 후원은 Ko-fi iframe을 사용합니다.
- 국내 후원은 계좌이체 요청 후 관리자 확인으로 이어집니다.
- 후원 알림은 설정을 다시 켠 시점 이후에 생성된 항목만 재생합니다.
- 랭킹 알림과 후원 알림은 설정 화면에서 각각 독립적으로 제어할 수 있습니다.

### 문서 및 다국어

- 텍스트 리소스는 `ko`, `en`, `ja`, `zh` locale을 함께 관리합니다.
- `/doc` 페이지는 고정 TOC, 모바일 드로어 TOC, 튜토리얼/비디오 섹션을 포함합니다.
- `/patch` 페이지 원문은 `src/shared/lib/i18n/locales/patchNotes.ts`에서 관리합니다.

---

## 문서

- 변경 이력: [PATCH.md](./PATCH.md)
- 작업 메모: [CLAUDE.md](./CLAUDE.md)

---

<div align="center">

**WikiSprint** · Built with React & TypeScript

</div>
