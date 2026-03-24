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
5. 커밋: `feat: 대표 변경사항 (vX.X.X)` 형식 + 푸시

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
│   └── SettingsPage.tsx
│
├── widgets/                # 독립적 UI 블록
│   ├── index.ts            # 네임스페이스 export (w.*)
│   ├── main-layout/        # Header
│   └── settings/           # SettingsView
│
├── features/               # 비즈니스 로직
│   ├── index.ts            # 네임스페이스 export (f.*)
│   ├── auth/               # Google OAuth (useGoogleLogin, authApi)
│   └── account/            # 계정 관리 (닉네임, 프로필 이미지)
│
├── entities/               # 도메인 모델
│   ├── index.ts            # 네임스페이스 export (e.*)
│   ├── auth/               # GoogleLoginRequest, GoogleLoginResponse
│   └── account/            # Account, AccountResponse 등
│
└── shared/                 # 공용 코드
    ├── index.ts            # 네임스페이스 export (shared.*)
    ├── api/                # JWT 인터셉터 + API 클라이언트
    │   ├── core/           # interceptor, client, token
    │   ├── types/          # ApiResponse, ApiException
    │   └── constants/      # API_BASE_URL (8585), API_ENDPOINTS
    ├── config/             # QueryClient 설정
    ├── lib/                # cn, i18n (ko/en/ja)
    ├── store/              # authStore, themeStore
    ├── ui/                 # Dialog, Toast, ProfileAvatar, EmbossButton
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

// f (features)
f.hook.useGoogleLogin
f.hook.useMyAccount, f.hook.useGetAccount
f.hook.useUpdateNick
f.hook.useUploadProfileImage, f.hook.useRemoveProfileImage
f.api.auth, f.api.account

// e (entities)
e.auth.type.GoogleLoginRequest, e.auth.type.GoogleLoginResponse
e.account.type.*

// shared
shared.ui.Dialog, shared.ui.ToastContainer
shared.ui.useDialog, shared.ui.useToast, shared.ui.ProfileAvatar, shared.ui.EmbossButton
shared.store.useAuthStore, shared.store.useThemeStore
shared.lib.cn, shared.lib.useTranslation, shared.lib.useLanguageStore, shared.lib.LANGUAGES
shared.api.client, shared.api.getTokenStorage, shared.api.setAuthUpdateCallback
shared.config.queryClient
```

---

## 라우팅 구조

```
/           → HomePage      (인증 필요, PrivateRoute)
/auth       → AuthPage      (인증 불필요)
/settings   → SettingsPage  (인증 필요)
```

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
