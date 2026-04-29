## v2.16.0 (2026-04-30)

### Added
- 설정 화면에 알림 설정 섹션이 추가되었습니다.
  - 랭킹 알림과 후원 알림을 각각 켜고 끌 수 있습니다.
  - 공용 토글 UI `shared/ui/Switch.tsx`와 `settings-storage` persist 설정이 함께 도입되었습니다.

### Changed
- 후원 알림 재생 기준을 정리했습니다.
  - 후원 알림을 다시 켠 뒤에는 그 시점 이후에 생성된 알림만 재생됩니다.
  - `alertCreatedAt` 기준 정렬과 필터링을 적용해 오래된 알림이 한꺼번에 다시 뜨지 않도록 보정했습니다.
- 랭킹 알림도 설정에서 비활성화하면 즉시 오버레이 재생과 폴링을 중단합니다.
- SettingsView 버전 표기를 `2.16.0`으로 갱신했습니다.

### Notes
- Web 버전을 `2.15.0`에서 `2.16.0`으로 올렸습니다.

========================================================================================================
========================================================================================================
========================================================================================================

## v2.15.0 (2026-04-29)

### Added
- 게임 클리어 직후 일일 전체 랭킹에 진입하거나 순위가 오르면 전체 클라이언트에 알림 오버레이를 표시하도록 추가했습니다.
  - 랭킹에 처음 진입하는 신규 입성과 기존 순위권 플레이어를 추월하는 두 가지 장면을 시각적으로 구분합니다.
  - `widgets/ranking-alert/RankingAlertOverlay` 신규 추가. 알림 큐 상태 머신(`idle` → `showing` → `exiting`)은 `shared/store/rankingAlertStore.ts`에서 관리합니다.
  - 본인 클리어 시 서버 응답에서 즉시 enqueue, 다른 클라이언트는 `POST /api/ranking/alerts/recent` 15초 폴링으로 수신합니다.
  - `localStorage` + zustand `handledIds` 이중 중복 방지로 같은 알림이 반복 표시되지 않습니다.
  - 랭킹 카드 시각 표현을 `widgets/ranking/ui/RankingCardDisplay.tsx`로 추출해 알림 오버레이와 랭킹 페이지가 동일 카드 스타일을 공유합니다.
  - `ranking.alertEntryHeadline / alertOvertakeHeadline / alertSkip / alertNewBadge` 로케일 키를 ko/en/ja에 추가했습니다.

### Changed
- 게임 클리어 응답이 `CompleteRecordResponse { rankingAlert }` 형태로 변경됐습니다.
  - `rankingAlert`가 null이면 기존과 동일하게 동작합니다.
- SettingsView 버전 표기를 `2.15.0`으로 갱신했습니다.

### Notes
- Web 버전을 `2.14.0`에서 `2.15.0`으로 올렸습니다.

========================================================================================================
========================================================================================================
========================================================================================================

## v2.14.0 (2026-04-25)

### Added
- 설정 화면에 `패치노트` 버튼과 권포도 이스터에그를 추가했습니다.
  - `개발자 문의/건의` 텍스트에 마우스를 올리면 고양이 얼굴 이모지 스파크가 퍼지고, 누르면 `/podo` 페이지로 이동합니다.
  - `개인정보 처리방침` 위에 `/patch` 페이지로 이동하는 버튼을 추가했습니다.
- 개발자의 반려고양이 권포도를 소개하는 `/podo` 페이지를 추가했습니다.
  - 상단 헤더를 유지한 채 사진 갤러리 카드, 스크롤 등장 애니메이션, 사진 확대 보기를 제공합니다.
  - 사진은 `podoXX` 숫자 기준으로 큰 번호부터 먼저 보이도록 정렬됩니다.

### Changed
- 사용자용 패치노트를 마크다운 기반 문서 페이지로 볼 수 있게 정리했습니다.
- 개인정보 처리방침 페이지와 동일한 문서 레이아웃 계층을 재사용하도록 정리했습니다.

### Notes
- Web 버전을 `2.14.0`으로 올렸습니다.

========================================================================================================
========================================================================================================
========================================================================================================

## v2.13.3 (2026-04-25)

### Changed
- 게임 시작 요청 실패를 `useGameRecord.startRecord()`에서 상위로 전달하도록 정리했습니다.
  - `GameIntroView`가 시작 실패 유형을 직접 분기해 토스트를 선택할 수 있습니다.

### Fixed
- 다른 창이나 탭에서 이미 진행 중인 게임이 있을 때 새 창에서 게임이 시작되던 문제를 수정했습니다.
  - 서버 `409 CONFLICT` 응답을 감지하면 게임 시작을 반려하고 현재 화면은 `ready` 상태를 유지합니다.
  - `game.startBlockedByAnotherSession` 로케일 키를 `ko`, `en`, `ja` 3종에 추가했습니다.

### Notes
- Web 버전 `2.13.2`에서 `2.13.3`으로 올립니다.

========================================================================================================
========================================================================================================
========================================================================================================

## v2.13.2 (2026-04-25)

### Fixed
- 비로그인 클리어 후 로그인 시 공유 전적의 목적지가 제시어와 달라지던 문제를 수정했습니다.
  - 게스트 클리어 시 `pendingRecordStore`에 최종 `navPath`와 `lastArticle`이 저장되지 않던 누락을 보강했습니다.
  - 로그인/회원가입 직후 전적 복구 분기에 `isRecoverableClearedPendingGame` 가드를 추가해, 마지막 경로가 제시어와 일치하지 않는 게스트 클리어 기록은 서버에 `abandoned`로 저장합니다.

### Changed
- 경로 불일치로 복구가 중단된 케이스는 `toast.success` 대신 `toast.warning('record.savedAfterLoginFailed')`로 구분해 알립니다.
  - `record.savedAfterLoginFailed` 로케일 키를 `ko`, `en`, `ja` 3종에 추가했습니다.

### Notes
- Web 버전 `2.13.1`에서 `2.13.2`로 올립니다.

========================================================================================================
========================================================================================================
========================================================================================================

## v2.13.1 (2026-04-24)

### Changed
- 신고 제출과 관리자 조치 버튼에 확인 다이얼로그를 추가했습니다.
  - `ReportModal`은 신고 전 한 번 더 확인을 받고 제출합니다.
  - 계정 관리 페이지와 후원 정보 관리자 패널의 검열/권한 부여/처리 완료도 확인 후 실행됩니다.
- 관리자 계정 관리 페이지 검색 영역을 정리했습니다.
  - 검색 입력창에서 Enter로 바로 검색할 수 있습니다.
  - 현재 전체 계정 수 또는 검색 결과 수를 화면 상단에 함께 표시합니다.
- `/doc` 후원 미리보기의 중복 기준을 서포터 네임 기준으로 정리했습니다.
  - 같은 계정이라도 서로 다른 서포터 네임이면 별도 미리보기로 노출됩니다.
  - 비연동 후원의 첫 글자 아바타는 `/donations`와 같은 컬러 배경 스타일을 사용합니다.
- 게임 클리어 판정은 클릭한 링크 제목이 아니라 실제 도착 문서의 canonical title 기준으로 보강했습니다.
  - `getArticleSummary()` 결과 제목을 사용해 리다이렉트/별칭 문서 오판정을 줄입니다.
- 공용 `Dialog` 레이어 우선순위를 올려 신고 모달과 관리자 화면 위에서도 안정적으로 표시되도록 정리했습니다.

### Fixed
- `/doc` 후원 섹션에서 서로 다른 서포터 네임이 같은 계정으로 잘못 합쳐지던 문제를 수정했습니다.
- 관리자 후원 카드의 서포터 네임 검열/복구, 후원 내용 검열, 신고 처리 완료 액션이 실수로 즉시 실행되던 흐름을 확인 다이얼로그 기반으로 보강했습니다.

### Notes
- Web 버전 `2.13.0`에서 `2.13.1`로 올립니다.

========================================================================================================
========================================================================================================
========================================================================================================

## v2.13.0 (2026-04-24)

### Added
- 신고 시스템을 추가했습니다.
  - `entities/report.ts`, `features/report.ts`, `widgets/report/ui/ReportModal.tsx`
  - 랭킹 카드와 후원 정보 카드에서 사용자 신고 모달을 열 수 있습니다.
  - 기타 사유는 100자 제한과 글자 수 표시를 지원합니다.
- 관리자 계정 관리 페이지(`/admin/accounts`)를 추가했습니다.
  - 신고된 계정/전체 계정 목록, 정렬, 검색, 페이지네이션을 지원합니다.
  - 계정 카드 확장 시 신고 요약, 기타 사유 목록, 프로필 검열, 닉네임 검열, 관리자 권한 부여, 처리 완료를 수행할 수 있습니다.
- 후원 정보 관리자 모더레이션을 확장했습니다.
  - 후원 카드에서 신고 수 배지, 사유별 신고 요약, 기타 사유 목록을 확인할 수 있습니다.
  - 서포터 네임 검열/복구, 후원 내용 검열, 처리 완료, 후원 정보 삭제를 수행할 수 있습니다.
  - 계정 연동 후원에는 `계정 연동` 배지를 표시합니다.
- 설정 화면에 관리자 전용 `사용자 계정 관리` 진입 버튼과 대기 신고 카운트 배지를 추가했습니다.

### Changed
- 후원 익명/계정 연동 판정을 클라이언트 휴리스틱 대신 서버 계산 필드 `isAccountLinkedDisplay` 기준으로 통일했습니다.
- 후원 메시지가 비어 있을 때 더 이상 대체 문구를 표시하지 않고 공백으로 렌더링합니다.
- 후원 카드와 계정 카드의 관리자 확장 패널이 부드럽게 열리고 닫히도록 공용 확장 애니메이션 구조를 적용했습니다.
- 설정 화면 버전 표기를 `2.13.0`으로 갱신했습니다.

### Fixed
- 비회원이 `/donations`에서 신고할 때 성공 후 관리자 전용 요약 API를 호출해 403이 나던 문제를 수정했습니다.
- 계정 연동 후원 신고가 `ACCOUNT`로 저장되더라도 해당 후원 카드에서 신고 수와 요약이 바로 반영되도록 수정했습니다.
- 관리자 후원 카드에서 `BadNameSupporter` 상태인 계정 연동 후원은 `계정 닉네임 복구` 버튼으로 현재 계정 닉네임 복구가 가능하도록 수정했습니다.
- 신고 버튼을 `🚨` 이모지 버튼으로 통일하고 기본 border/background를 제거했습니다.

### Notes
- Web 버전 `2.12.0`에서 `2.13.0`으로 올렸습니다.

========================================================================================================
========================================================================================================
========================================================================================================

## v2.12.0 (2026-04-23)

### Added
- 후원 알림 오버레이(`DonationAlertOverlay`) 신규 추가
  - `widgets/donation/lib/donationAlert.ts` 신규 — 후원 발생 시 단계별 알림 메시지 생성 로직
  - `widgets/donation/ui/DonationAlertOverlay.tsx` 신규 — 커피 단계(coffee/barrel/overdose/awake)에 따른 오버레이 UI
  - `app/App.tsx`에 `<DonationAlertOverlay />` 상시 마운트
  - 후원 이미지 4종 추가 (`shared/assets/images/donation-{awake|barrel|coffee|overdose}.png`)
  - i18n 후원 알림 관련 키 추가 (ko/en/ja)
  - 후원 알림 관련 전역 CSS 애니메이션 추가 (`shared/styles/index.css`)
- `w.DonationAlertOverlay` 네임스페이스 등록 (`widgets/donation/index.ts`)

### Changed
- `widgets/donation/` FSD 슬라이스 정리 — 기존에 `widgets/` 루트에 분산되어 있던 donation 관련 파일을 단일 슬라이스(`widgets/donation/`)로 통합
  - 제거: `widgets/donation-floating.tsx`, `widgets/donation-floating/`, `widgets/donation-support.tsx`, `widgets/donation-info-list.tsx`, `widgets/donation-pending-list.tsx`, `widgets/donation-section.tsx`
  - 통합 후 구조:
    - `widgets/donation/lib/donationSupport.tsx` — AnonymousSupporterIcon, resolveDonationDisplayName, getDonationTierGlowClass 공용 유틸
    - `widgets/donation/lib/donationAlert.ts` — 후원 알림 로직
    - `widgets/donation/ui/DonationFloatingButton.tsx`
    - `widgets/donation/ui/DonationInfoListWidget.tsx`
    - `widgets/donation/ui/DonationPendingListWidget.tsx`
    - `widgets/donation/ui/DonationSection.tsx`
    - `widgets/donation/ui/DonationAlertOverlay.tsx`
  - `widgets/index.ts` — donation export 경로 갱신
- 후원자 목록 페이지(`/donations`) UI 개선
  - `DonationInfoPage` 레이아웃 개선
  - `DonationPendingListWidget` UI 및 i18n 보강
  - `DonationInfoListWidget` UI 및 i18n 보강
- 설정 화면 버전 표기를 `2.12.0`으로 갱신

### Fixed
- 서포터 닉네임과 계정 닉네임이 다를 경우 익명 아바타로 처리하도록 수정
  - `resolveDonationDisplayName()` — 서포터명/계정닉 불일치 시 `isAnonymous: true` 처리
  - `DonationInfoListWidget`, `DonationPendingListWidget`, `DonationSection` 적용
- 닉네임 불일치 후원의 아바타를 익명 아이콘 → 첫 글자 아바타로 변경
  - `DonationInfoListWidget`, `DonationPendingListWidget`, `DonationSection` 적용

========================================================================================================
========================================================================================================
========================================================================================================

## v2.11.0 (2026-04-22)

### Added
- 게임 진행 중 브라우저 뒤로가기 이탈 가드 추가
  - `features/game-record/lib/useGameLeaveGuard.ts` 신규 — `GameLeaveGuard` 전역 컴포넌트가 `phase === 'playing'` 진입 시 history에 sentinel 상태를 삽입하고, `popstate` 발생 시 이탈 확인 다이얼로그를 띄움
  - 확인 시 `abandonRecord()` + `resetGame()` 실행 후 이동, 취소 시 sentinel을 다시 push해 현재 화면 유지
  - `Router.tsx` 최상단에 `<GameLeaveGuard />` 상시 마운트
- Header 네비게이션 이탈 가드 훅 공개: `useGameLeaveGuard()` → `guardedNavigate(path)` 형태로 외부 위젯/페이지에서도 재사용 가능
- 네임스페이스 등록: `f.hook.useGameLeaveGuard`, `f.GameLeaveGuard`

### Changed
- `widgets/main-layout/ui/Header.tsx`: 자체적으로 관리하던 `guardedNavigate` 로컬 구현을 제거하고 `useGameLeaveGuard` 훅 사용으로 전환 (중복 제거)
- `app/router/Router.tsx` `GlobalModals`의 탈퇴 취소 `useEffect` 의존성 배열을 실제 참조하는 값으로 보강
- 설정 화면 버전 표기를 `2.11.0`으로 갱신

========================================================================================================
========================================================================================================
========================================================================================================

## v2.10.0 (2026-04-22)

### Added
- 후원 기능 신규 도입
  - 전역 플로팅 "Support me" 버튼(`widgets/donation-floating/ui/DonationFloatingButton.tsx`)을 `app/App.tsx`에 상시 마운트. `intro` / `overseas` / `domestic` 3-패널 전환식 UI
  - 해외 후원: Ko-fi(`https://ko-fi.com/minjoy`) iframe 임베드 + `openKofiPage` 새 탭 이동 지원
  - 국내 후원: Ko-fi가 한국 결제를 미지원하여 계좌이체 요청 + 관리자 수동 승인 방식 (IM뱅크 `508-13-061547-7 권민수`). 커피잔 수(1~100) × `KRW_PER_COFFEE = 2000` 스텝퍼, 표시 닉네임·입금자명·메시지·익명 체크박스 입력
- 신규 라우트 `/donations` 및 `pages/DonationInfoPage.tsx` 추가 (`app/router/Router.tsx` lazy 로딩 및 Route 등록)
  - 관리자(`is_admin`)에게만 `DonationPendingListWidget`과 후원 금액 공개
- 위젯 4종 신규
  - `DonationFloatingButton` — 후원 진입 플로팅 버튼
  - `DonationSection` — `/doc` 페이지 하단 최근 후원자 5명 프리뷰
  - `DonationInfoListWidget` — 전체 후원 목록(티어 글로우 적용, 금액은 관리자만 노출)
  - `DonationPendingListWidget` — 관리자 전용 대기 목록 + "입금 확인 완료" 처리
- 후원 티어 글로우 스타일(`shared/styles/index.css`)
  - `.donation-tier-{bronze|silver|gold|rainbow}` 클래스 + `@keyframes donationRainbowShift`
  - `source === 'account transfer'`이면 KRW 기준(≤5000/≤10000/≤20000/>20000), Ko-fi면 USD 기준(≤5/≤10/≤20/>20)
- 엔드포인트 상수(`shared/api/constants/endpoints.ts` `DONATION.*`): `ALL`, `LATEST`, `DETAIL`, `ACCOUNT_TRANSFER_REQUEST`, `ADMIN_PENDING_ACCOUNT_TRANSFER`, `ADMIN_CONFIRM_ACCOUNT_TRANSFER`, `WEBHOOK_KOFI`
- API/훅(`features/donation.ts`): `getLatestDonations`, `getAllDonations`, `createAccountTransferDonation`, `getPendingAccountTransferDonations`, `confirmAccountTransferDonation` + 훅 3종(`useLatestDonations`, `useAllDonations`, `usePendingAccountTransferDonations`)
- 엔티티(`entities/donation.ts`): `DonationListItem`, `PendingAccountTransferDonationItem`, `AccountTransferDonationCreateRequest` (별도 status enum 없이 `source` + `currency` 필드로 분기)
- 네임스페이스 등록: `w.DonationFloatingButton`, `w.DonationSection`, `w.DonationInfoListWidget`, `w.DonationPendingListWidget`, `f.hook.useLatestDonations`, `f.hook.useAllDonations`, `f.hook.usePendingAccountTransferDonations`, `f.api.donation.*`, `e.donation.type.*`
- i18n(`ko/en/ja`) `donation.*` + `doc.donation.*` 약 50여 키 추가 (해외/국내 분기 문구 포함)

### Changed
- `shared/ui/ProfileAvatar.tsx`: `fallbackContent?: React.ReactNode` prop 추가 — 이미지 없을 때 이니셜 대신 `AnonymousSupporterIcon` 등 커스텀 노드 렌더 가능. 익명 후원자 표시에 활용
- `widgets/doc-content/ui/DocContentView.tsx`: TOC `DocSectionId`에 `'donation'` 추가, `<DonationSection />`을 `/doc` 페이지 흐름 하단에 삽입
- 설정 화면 버전 표기를 `2.10.0`으로 갱신

### Fixed
- 국내 후원 분기 보강(`942a80f`): Ko-fi가 한국 결제를 지원하지 않는 문제를 계좌이체 요청 + 관리자 승인 플로우로 보정
  - `DonationFloatingButton`에 `'domestic'` 패널, 입금자명 필수 검증, 제출 전 확인 다이얼로그 추가
  - 쿼리 캐시 3종(`latest`/`all`/`pending-account-transfer`) 무효화 처리

========================================================================================================
========================================================================================================
========================================================================================================

## v2.9.1 (2026-04-18)

### Fixed
- 난이도 선택 드롭다운 메뉴 박스 내 옵션 라벨이 줄바꿈되던 문제 수정
  - 팝업 `contentClassName`에 `whitespace-nowrap`을 적용해 다국어(영어 `Omakase`, 일본어 `おまかせ` 등 긴 라벨 포함) 환경에서도 텍스트가 한 줄로 유지되도록 보정
  - `min-w-[140px]`는 유지해 짧은 라벨에서도 최소 너비를 보장하고, 박스 너비는 가장 긴 옵션에 맞춰 자연스럽게 늘어나도록 정리

### Changed
- 설정 화면 버전 표기를 `2.9.1`로 갱신

========================================================================================================
========================================================================================================
========================================================================================================

## v2.9.0 (2026-04-17)

### Added
- 공유 링크 생성 흐름 개편
  - 결과 화면에서 공유 직전에 `POST /api/record/share`를 호출해 공유 전용 `shareId`와 `expiresAt`을 발급받도록 변경
  - 같은 전적은 24시간 안에 기존 공유 스냅샷을 재사용하고, 만료 후에는 새 공유 링크를 다시 생성
  - 공유 페이지 안내 문구에 24시간 유효 안내와 만료 예정 시각 표기를 추가
- 공유 국제화(i18n) 보강
  - 공유 메시지와 공유 페이지 안내 문구를 `ko/en/ja` 로케일 파일 기준으로 관리
  - 영어/일본어 공유 문구의 시간 단위 표기를 각 언어 형식에 맞게 정리

### Changed
- 공유 URL 구조를 전적 ID 직접 노출 방식에서 공유 스냅샷 기반 URL로 전환
  - 결과 화면, QR 코드, 링크 복사, 카카오톡 공유, Web Share가 모두 새 `shareId` 기반 URL을 사용
- 공유 페이지 UI/동작 정리
  - 만료 안내 박스 너비와 강조 스타일을 조정하고, 만료 안내는 카드 애니메이션과 분리해 항상 먼저 노출되도록 정리
  - 안내 시각은 서버 만료 정리 스케줄을 고려해 다음 정각 기준으로 표시
- 설정 화면 버전 표기를 `2.9.0`으로 갱신

### Fixed
- 로그인 직후 `/record`, `/ranking` 진입 시 이전 인증 상태가 남아 빈 전적 또는 로그인 유도 카드가 보이던 문제 수정
- 비로그인 상태에서 게임 클리어 후 로그인해 결과 화면으로 돌아왔을 때 카카오톡 공유/링크 복사 버튼이 동작하지 않던 문제 수정
- 공유 페이지에서 잘못된 링크 생성 타이밍 때문에 새로고침 전까지 데이터가 어긋나던 문제를 보정

========================================================================================================
========================================================================================================
========================================================================================================

## v2.8.0 (2026-04-16)

### Added
- `/doc` 페이지를 인터랙티브 가이드 구조로 전면 개편
  - 히어로, 개요, 튜토리얼, 규칙, FAQ, 영상, 바로 시작하기 섹션 추가
  - 실제 게임 흐름을 눌러보며 이해할 수 있는 `DocInteractiveTutorial` 추가
  - 데스크톱 고정 TOC와 모바일 플로팅 TOC 토글 추가
- 전적 카드에 제시어 난이도 태그 노출
  - `/record` 페이지 카드에서 쉬움/보통/어려움 난이도 표시

### Changed
- `/doc` 페이지 정보 구조와 문서 UX 재구성
  - 문단 가독성, CTA, 섹션 분리, 목차 탐색 흐름 개선
  - i18n 문구를 줄바꿈 가능한 안내형 문장으로 확장
- 공용 아코디언 컴포넌트 범용화
  - 문서 페이지와 약관 모달이 같은 `Accordion`과 공용 애니메이션 클래스를 사용하도록 정리

### Fixed
- 유튜브 아코디언을 닫을 때 플레이어가 자동 일시정지되도록 개선
- 아코디언 열림/닫힘 애니메이션을 부드럽게 보정
- `/doc` TOC 활성화 표시를 스크롤 위치 기준으로 동작하도록 개선

========================================================================================================
========================================================================================================
========================================================================================================

## v2.7.0 (2026-04-16)

### Added
- 약관 동의 기반 회원가입 플로우
  - 신규 유저 Google 로그인 시 약관 동의 모달(`ConsentModal`) 표시
  - 필수 3개(서비스 이용약관, 개인정보처리방침, 만 14세 이상) + 선택 1개(마케팅 알림) 아코디언 형식
  - 전체 동의 토글, 필수 모두 체크 시 가입 버튼 활성화 (그라데이션 애니메이션)
  - ESC / 외부 클릭 시 닫기 컨펌 다이얼로그 표시
  - `POST /api/auth/register` — Google ID 토큰 + 동의 항목 전송 후 계정 생성
- 회원탈퇴 기능
  - 설정 페이지 하단 "회원탈퇴" 버튼 추가 (회색 낮은 강조, 호버 시 빨간색)
  - 컨펌 다이얼로그 확인 시 `POST /api/account/delete/request` 호출 후 로그아웃 및 `/auth` 이동
- 탈퇴 취소 기능
  - 탈퇴 대기(7일 유예) 계정 재로그인 시 취소/유지 선택 다이얼로그 표시
  - "탈퇴 취소" 선택 시 `POST /api/auth/cancel-deletion` 호출 후 정상 로그인 복귀
- `consent` 도메인 신규 추가
  - `entities/consent/` — `ConsentType`, `ConsentItem`, `RegisterRequest` 타입
  - `features/consent/` — `register()` API 함수 + `useRegister` 훅
  - `widgets/consent/` — `ConsentModal` 컴포넌트
- i18n `consent` / `account` 네임스페이스 추가 (ko/en/ja 3개국어)
- `GlobalModals` 컴포넌트 추가 — Router 내 전역 모달(ConsentModal, 탈퇴 취소 다이얼로그) 통합 관리

### Fixed
- `Dialog` z-index 문제 수정 — `z-60` → `z-100`으로 상향, 모달 중첩 시에도 컨펌 다이얼로그가 정상 표시되도록 개선
- `ResultSummary` 공유 링크 미생성 시 null 처리 — `shareUrl`이 없을 때 링크 패널 토글 대신 `onCopyLink?.()`를 호출하도록 수정
- 닉네임 변경 실패 시 서버 에러 메시지 직접 표시 — `ApiException`인 경우 서버가 반환한 구체적 메시지(중복 닉네임 등)를 토스트에 표시

### Changed
- `GoogleLoginResponse`에 `is_new_user`, `is_deletion_pending`, `deletion_scheduled_at`, `id_token_string` 필드 추가
- 로그인 성공 처리 로직 `handleSuccessfulLogin()`으로 공통화 — GIS credential, iOS code flow, 약관 동의 후 가입 3곳에서 재사용
- `authStore`에 `pendingConsent`, `pendingCredential`, `pendingDeletionCancel`, `deletionScheduledAt` 상태 추가 (persist 대상 포함)
- 버전 2.6.0 → **2.7.0**

========================================================================================================
========================================================================================================
========================================================================================================

## v2.6.0 (2026-04-13)

### Added
- 공유 전용 결과 페이지 추가 (`/share/:shareId`)
  - 게임 기록 ID 기반 고유 공유 URL (`REC-{uuid}` → `/share/{uuid}`)
  - 기존 결과 화면과 동일한 PathTimeline + ResultSummary UI 재사용
  - 헤더 문구: "OOO님의 목적지(제시어)까지의 여정을 한번 살펴봅시다!"
  - "나도 도전하기" 버튼 → 홈으로 이동, 공유 버튼 미표시
  - 모바일 환경: `navigator.share` Web Share API로 네이티브 공유 시트 호출 (디스코드·카카오 등 앱 선택)
  - PC 환경: 공유 링크 복사 버튼 표시
  - 잘못된 링크 / 미클리어 기록 접근 시 에러 UI 표시
- 카카오톡 공유 기능 구현
  - Kakao JavaScript SDK 동적 로드 + 초기화 (`VITE_KAKAO_JS_KEY` 환경변수)
  - `Kakao.Share.sendDefault` feed 메시지 전송 (닉네임, 제시어, 공유 URL 포함)
  - SDK 실패 시 링크 클립보드 복사 fallback
- 공유 링크 복사 + QR 코드 토글 패널 추가 (결과 화면)
  - 디스코드 공유 버튼 → "공유 링크 복사" 버튼으로 교체
  - 클릭 시 URL + 복사 아이콘 + QR 코드 패널 토글 표시
  - `qrcode.react` 라이브러리로 공유 URL QR 코드 SVG 렌더링
  - QR 스캔 → 공유 페이지 접속 후 모바일에서 네이티브 공유 가능
- `SharedGameRecord` 타입 추가 (`entities/game-record`)
- `getSharedRecord` API 함수 추가 (`features/game-record` — `skipAuth=true`)
- `useSharedRecord` TanStack Query 훅 추가 (staleTime 5분, retry false)
- 카카오 SDK 유틸 모듈 추가 (`shared/lib/kakao/kakaoSdk.ts`, `kakao.d.ts`)
- 공유 유틸리티 추가 (`widgets/game-result/lib/shareUtils.ts` — `buildShareUrl`, `shareKakao`)
- i18n `share` 네임스페이스 추가 (ko/en/ja)
- `SharePage` 코드 스플리팅 청크 분리

### Fixed
- 로그인 상태에서 게임 결과 화면 하단에 비로그인 로그인 안내 섹션이 렌더링되는 버그 수정
  - 원인: Zustand persist hydration과 렌더링 경합으로 `isAuthenticated` 초기값 불일치
  - 수정: `GameResultView` 마운트 시 `checkAuth()` 호출로 토큰 존재 여부 재확인

### Changed
- `ResultSummary` props 확장: `mode`, `onShareKakao`, `shareUrl`, `onCopyLink` 추가
- 라우터에 `/share/:shareId` 라우트 추가 (`SharePage`)
- `widgets/game-result` — `PathTimeline`, `ResultSummary` 외부 export 추가 (pages 레이어 재사용)
- 버전 2.5.0 → **2.6.0**

========================================================================================================
========================================================================================================
========================================================================================================

## v2.5.0 (2026-04-12)

### Added
- 페이지 코드 스플리팅 (`lazy()` + `Suspense`) 적용 — 초기 번들 크기 절감
  - AuthPage, HomePage, SettingsPage, DocPage, RecordPage, RankingPage 모두 지연 로딩
- DOMPurify 도입으로 Wikipedia HTML XSS 방어 강화 (`sanitizeWikiHtml`)
  - `FORBID_TAGS`: script, iframe, object, embed, form, input 차단
  - `FORBID_ATTR`: onerror, onload, onclick, onmouseover, onmouseout 차단
- 인증 실패 시 SPA 내 `react-router navigate` 처리 (`window.location.href` 대체)
  - `setAuthFailureCallback` 함수 + `AuthFailureHandler` 컴포넌트 추가
  - Router 마운트 시 navigate 등록, 미등록 시 window.location.href 폴백
- AuthPage — JWT 만료 토큰 검증 추가 (`isTokenExpired`, base64 디코딩)
  - 만료된 access token이 있어도 홈으로 리다이렉트되지 않도록 수정
- sanitizedHtmlCache 최대 크기 50건 FIFO 제한 (`setCachedHtml` 함수)

### Changed
- API 응답 null-assertion(`!`) 전면 제거 → `ApiException` throw로 안전한 에러 처리 통일
  - 대상: `accountApi`, `gameRecordApi`, `wikiApi`
- `TargetWordResponse` 타입 `account` 엔티티 → `wiki` 엔티티로 이동 (도메인 정합성)
- `WikiResponse<T>` 내부 래퍼 타입 제거, `apiClient` 응답 직접 참조
- `AuthResponseData` — 미사용 `user`, `account` 필드 제거
- `useSystemThemeListener` 훅 제거 (App.tsx `ThemeInitializer`로 이전됨)
- `apiClient.post/put` 시그니처 `unknown` → `object` 타입 강화
- Dialog ESC 키 핸들러 — stale closure 수정 (`useDialogStore.getState()` 직접 참조)
- `filteredCountries` → `useMemo` 적용 (검색어 변경 시만 재계산)
- useGameRecord — catch 블록 에러 로깅 + 실패 토스트 추가
- useGoogleLogin import 경로 정리 (gameRecordApi 직접 → index 경유)
- AuthPage 주석 이모지 제거
- token.ts — localStorage 보안 한계 및 httpOnly 쿠키 전환 권장 주석 추가
- package.json version `0.0.0` → `2.4.0` → `2.5.0`
- 앱 버전 2.4.0 → **2.5.0**

========================================================================================================
========================================================================================================
========================================================================================================

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
