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
