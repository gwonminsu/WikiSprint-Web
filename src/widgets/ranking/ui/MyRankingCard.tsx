import {
  useTranslation,
  useAuthStore,
  ProfileAvatar,
  // 수정: countryCodeToEmoji 제거
  getCountryFlagUrl,
  getCountryFlagSrcSet,
} from '@shared';
import { getProfileImageUrl } from '@features';
import type { RankingRecord } from '@/entities/ranking/types';

// 밀리초 → "n분 nn.nn초" 포맷
function formatMs(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(2).padStart(5, '0');
  if (minutes === 0) return `${seconds}초`;
  return `${minutes}분 ${seconds}초`;
}

// 랭크 등록 시각 포맷
function formatRankCreatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

type MyRankingCardProps = {
  me: RankingRecord | null;
  top100: RankingRecord[];
  isAuthenticated: boolean;
};

// 수정: 리더보드와 동일한 난이도 태그 색상
const DIFFICULTY_COLORS: Record<string, string> = {
  all: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  normal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

// 내 랭킹 카드 — 항상 상단에 별도 표시
export function MyRankingCard({
  me,
  top100,
  isAuthenticated,
}: MyRankingCardProps): React.ReactElement {
  const { t } = useTranslation();
  const { accountInfo } = useAuthStore();

  const profileImageUrl = accountInfo?.profile_img_url
    ? getProfileImageUrl(accountInfo.profile_img_url)
    : null;

  const nickname = accountInfo?.nick ?? me?.nickname ?? '?';

  // 수정: 분기 전에 국적 코드 먼저 안전하게 계산
  const myNationality: string | null = accountInfo?.nationality ?? me?.nationality ?? null;

  // 수정: 분기 전에 국기 이미지 URL / srcSet 계산
  const myFlagUrl: string | null = getCountryFlagUrl(myNationality);
  const myFlagSrcSet: string | undefined = getCountryFlagSrcSet(myNationality);

  if (!isAuthenticated) {
    // 비로그인 상태도 패널형 안내로 표시
    return (
      <section className="my-rank-panel my-rank-panel--guest mb-5">
        <div className="my-rank-panel__header">
          <span className="my-rank-panel__badge">MY RANK</span>
        </div>

        <div className="rounded-2xl border border-dashed border-gray-300/70 dark:border-white/15 bg-white/60 dark:bg-white/5 px-4 py-4 text-center">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('ranking.loginToSeeMyRank')}
          </p>
        </div>
      </section>
    );
  }

  // 내 순위 계산 (top100에서 account_id로 찾음)
  const myIndex = me ? top100.findIndex((r) => r.accountId === me.accountId) : -1;
  const myRank = myIndex >= 0 ? myIndex + 1 : null;

  // 순위권 밖 계산
  const worst100Ms = top100.length >= 100 ? top100[top100.length - 1].elapsedMs : null;
  const diffMs = me && worst100Ms !== null ? me.elapsedMs - worst100Ms : null;
  const diffSec = diffMs !== null ? Math.ceil(diffMs / 1000) : null;

  // 내 기록이 없는 경우
  if (!me) {
    return (
      <section className="my-rank-panel mb-5 animate-my-rank-float">
        <div className="my-rank-panel__header">
          <span className="my-rank-panel__badge">MY RANK</span>
          <span className="my-rank-panel__status">{t('ranking.outOfRank')}</span>
        </div>

        <div className="my-rank-panel__body">
          <div className="flex items-center gap-3 min-w-0">
            <div className="my-rank-panel__avatar-ring">
              <ProfileAvatar imageUrl={profileImageUrl} name={nickname} size="rg" />
            </div>

            <div className="min-w-0">
              <p className="text-base font-extrabold text-gray-900 dark:text-white truncate tracking-tight flex items-center gap-1">
                {/* 국기 이미지 */}
                {myFlagUrl ? (
                  <img
                    src={myFlagUrl}
                    srcSet={myFlagSrcSet}
                    alt={myNationality ?? 'flag'}
                    width={16}
                    height={12}
                    className="shrink-0 rounded-xs object-cover"
                    loading="lazy"
                  />
                ) : (
                  // 국적이 없으면 지구본 유지
                  <span className="shrink-0 text-xs leading-none">🌐</span>
                )}

                <span className="truncate ml-1">{nickname}</span>
              </p>

              <p className="text-xs text-sky-700/80 dark:text-cyan-100/80 truncate">
                {t('ranking.outOfRank')}
              </p>
            </div>
          </div>

          <div className="my-rank-panel__time-box">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700/70 dark:text-cyan-200/70">
              Record
            </p>

            <p className="text-lg font-black font-mono tabular-nums text-amber-600 dark:text-yellow-300 whitespace-nowrap">
              --
            </p>

            <p className="mt-1 text-[10px] leading-none text-gray-500 dark:text-gray-400 whitespace-nowrap">
              --
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="my-rank-panel mb-5 animate-my-rank-float">
      <div className="my-rank-panel__header">
        <span className="my-rank-panel__badge">MY RANK</span>
        <span className="my-rank-panel__status">
          {myRank !== null
            ? t('ranking.rank').replace('{{rank}}', String(myRank))
            : t('ranking.outOfRank')}
        </span>
      </div>

      <div className="my-rank-panel__body">
        {/* 왼쪽 프로필/이름 영역 */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="my-rank-panel__avatar-ring">
            <ProfileAvatar imageUrl={profileImageUrl} name={nickname} size="rg" />
          </div>

          <div className="min-w-0">
            <p className="text-base font-extrabold text-gray-900 dark:text-white truncate tracking-tight flex items-center gap-1">
              {/* 수정: 닉네임 앞 국기 이미지 추가 */}
              {myFlagUrl ? (
                <img
                  src={myFlagUrl}
                  srcSet={myFlagSrcSet}
                  alt={myNationality ?? 'flag'} // 수정: 공통 변수 재사용
                  width={16}
                  height={12}
                  className="shrink-0 rounded-xs object-cover"
                  loading="lazy"
                />
              ) : (
                // 국적이 없으면 지구본 유지
                <span className="shrink-0 text-xs leading-none">🌐</span>
              )}

              <span className="truncate ml-1">{nickname}</span>
            </p>

            {myRank === null && diffSec !== null && (
              <p className="text-xs text-sky-700/80 dark:text-cyan-100/80 truncate">
                {t('ranking.toTop100').replace('{{seconds}}', String(diffSec))}
              </p>
            )}

            {myRank === null && diffSec === null && (
              <p className="text-xs text-sky-700/80 dark:text-cyan-100/80 truncate">
                {t('ranking.outOfRank')}
              </p>
            )}

            {myRank !== null && (
              <div className="flex items-center gap-1.5 min-w-0">
                {/* 제시어 + 난이도 태그 */}
                <span className="text-xs text-sky-700/80 dark:text-cyan-100/80 truncate">
                  {me.targetWord}
                </span>

                <span
                  className={[
                    'shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full',
                    DIFFICULTY_COLORS[me.difficulty] ?? '',
                  ].join(' ')}
                >
                  {t(`ranking.difficultyTag.${me.difficulty}` as Parameters<typeof t>[0])}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽 기록 박스 */}
        <div className="my-rank-panel__time-box">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-700/70 dark:text-cyan-200/70">
            Record
          </p>
          <p className="text-lg font-black font-mono tabular-nums text-amber-600 dark:text-yellow-300 whitespace-nowrap">
            {formatMs(me.elapsedMs)}
          </p>
          <p className="mt-1 text-[10px] leading-none text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatRankCreatedAt(me.createdAt)}
          </p>
        </div>
      </div>

      {/* 하단 보조 정보 줄 */}
      <div className="my-rank-panel__footer">
        <span className="truncate">
          <span className="text-sky-700/65 dark:text-cyan-200/65 mr-1">START</span>
          <span className="text-gray-800 dark:text-white/90">{me.startDoc}</span>
        </span>

        <span className="hidden sm:inline text-gray-300 dark:text-white/20">•</span>

        <span className="truncate">
          <span className="text-sky-700/65 dark:text-cyan-200/65 mr-1">PATH</span>
          <span className="text-gray-800 dark:text-white/90">{me.pathLength} steps</span>
        </span>
      </div>
    </section>
  );
}