<div align="center">

# 🌐 WikiSprint Web

**WikiSprint 프론트엔드 — React + TypeScript + Vite**

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-5.x-433E38?style=flat-square)](https://zustand-demo.pmnd.rs/)
[![Version](https://img.shields.io/badge/version-v1.0.0-brightgreen?style=flat-square)](./PATCH.md)

</div>

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🔐 Google OAuth 로그인 | Google 계정으로 원클릭 로그인 및 자동 회원가입 |
| 🔄 JWT 자동 갱신 | Access Token 만료 시 Refresh Token으로 자동 재발급 |
| 👤 계정 관리 | 닉네임 변경, 프로필 이미지 업로드/삭제 |
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

---

## 🏗 아키텍처 — Feature-Sliced Design (FSD)

계층 간 **단방향 의존성**을 강제하는 FSD 아키텍처를 채택합니다.

```
app → pages → widgets → features → entities → shared
```

> 동일 레이어 간 import는 금지됩니다.

### 네임스페이스 import 패턴

```typescript
import { w }      from '@widgets';  // w.Header, w.SettingsView
import { f }      from '@features'; // f.hook.useGoogleLogin, f.api.auth
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
    │   ├── HomePage.tsx
    │   └── SettingsPage.tsx
    │
    ├── widgets/
    │   ├── main-layout/          # Header 네비게이션
    │   └── settings/             # SettingsView
    │
    ├── features/
    │   ├── auth/                 # Google OAuth 로그인 훅 & API
    │   └── account/              # 계정 관리 훅 & API
    │
    ├── entities/
    │   ├── auth/                 # GoogleLoginRequest/Response 타입
    │   └── account/              # Account, AccountResponse 타입
    │
    └── shared/
        ├── api/                  # JWT 인터셉터, API 클라이언트, 엔드포인트
        ├── config/               # QueryClient 설정
        ├── lib/                  # cn 유틸, i18n (ko/en/ja)
        ├── store/                # authStore, themeStore (Zustand)
        ├── ui/                   # Dialog, Toast, ProfileAvatar, EmbossButton
        └── styles/               # 전역 스타일 + 테마 CSS 변수
```

---

## 🚀 시작하기

### 요구사항

- Node.js 20+
- npm 또는 pnpm

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-org/WikiSprint.git
cd WikiSprint/WikiSprint-Web

# 의존성 설치
npm install

# 개발 서버 실행 (포트 5969)
npm run dev -- --port 5969
```

### 빌드

```bash
npm run build
npm run preview
```

---

## ⚙️ 환경 설정

프로젝트 루트에 `.env` 파일을 생성하세요:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:8585
```

| 환경변수 | 설명 |
|---------|------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `VITE_API_BASE_URL` | 백엔드 API 주소 |

---

## 🗺 라우팅 구조

| 경로 | 페이지 | 인증 필요 |
|------|--------|----------|
| `/` | `HomePage` | ✅ |
| `/auth` | `AuthPage` | ❌ |
| `/settings` | `SettingsPage` | ✅ |

---

## 🔗 백엔드 연동

- 백엔드 서버: `http://localhost:8585`
- API 기본 경로: `/api`
- CORS 허용 오리진: `http://localhost:5969`

→ [WikiSprint-Server README](../WikiSprint-Server/README.md)

---

## 📜 패치 노트

최신 변경사항은 [PATCH.md](./PATCH.md)를 참고하세요.

---

<div align="center">

**WikiSprint** — Built with ❤️ using React & TypeScript

</div>
