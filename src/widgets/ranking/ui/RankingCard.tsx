import { useState } from 'react';
import {
  useTranslation,
  ProfileAvatar,
  getCountryFlagUrl,
  getCountryFlagSrcSet,
} from '@shared';
import { getProfileImageUrl } from '@features';
import type { RankingRecord } from '@/entities/ranking/types';
import { ReportModal } from '@/widgets/report';
import { RankingMedalFrame } from './RankingMedalFrame';

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

type RankingCardProps = {
  record: RankingRecord;
  rank: number;
  index: number;
  isMe?: boolean;
};

const RANK_BADGE: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  all: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  normal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

// 개별 랭킹 카드 — 클릭 시 상세 확장
export function RankingCard({
  record,
  rank,
  index,
  isMe = false,
}: RankingCardProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { t } = useTranslation();

  const profileImageUrl = record.profileImageUrl
    ? getProfileImageUrl(record.profileImageUrl)
    : null;

  // 국기 이미지 URL 계산
  const flagUrl = getCountryFlagUrl(record.nationality);

  // 국기 이미지 srcSet 계산
  const flagSrcSet = getCountryFlagSrcSet(record.nationality);

  const cardBody = (
    <div
      className={[
        'ranking-card-base rounded-2xl px-4 py-3.5 cursor-pointer',
        'hover:-translate-y-0.5 transition-all duration-200',
        'animate-ranking-drop',
        expanded ? 'ranking-card-expanded' : '',
        isMe
          ? 'ranking-card-me border border-primary/30'
          : 'border border-gray-200/90 dark:border-gray-700/90',
      ].join(' ')}
      style={{ animationDelay: `${index * 70}ms` }}
      onClick={() => setExpanded((v) => !v)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); // Space 스크롤 방지
          setExpanded((v) => !v);
        }
      }}
      aria-expanded={expanded} // 접근성 추가
    >
      {/* 카드 상단: 순위 + 아바타 + 닉네임 + 시간 */}
      <div className="flex items-center gap-3">
        {/* 순위 */}
        <div className="w-10 shrink-0 text-center">
          {rank <= 3 ? (
            <span className="text-xl leading-none">{RANK_BADGE[rank]}</span>
          ) : (
            <span className="ranking-rank-pill">
              {t('ranking.rank').replace('{{rank}}', String(rank))}
            </span>
          )}
        </div>

        {/* 아바타 */}
        <div className="ranking-avatar-wrap">
          <ProfileAvatar
            imageUrl={profileImageUrl}
            name={record.nickname}
            size="sm"
          />
        </div>

        {/* 닉네임 */}
        <div className="flex-1 min-w-0">
          <p
            className={[
              // 국기 이미지와 닉네임 세로 정렬 위해 flex 추가
              'text-sm font-semibold truncate tracking-tight flex items-center gap-1',
              isMe ? 'text-primary' : 'text-gray-900 dark:text-white',
            ].join(' ')}
          >
            {/* 국기 이미지*/}
            {flagUrl ? (
              <img
                src={flagUrl}
                srcSet={flagSrcSet}
                alt={record.nationality ?? 'flag'}
                width={16}
                height={12}
                className="shrink-0 rounded-xs object-cover"
                loading="lazy"
              />
            ) : (
              // 국적이 없으면 기존처럼 지구본 유지
              <span className="shrink-0 text-xs leading-none">🌐</span>
            )}

            <span className="truncate ml-1">{record.nickname}</span>
          </p>

          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
            {record.targetWord}
          </p>
        </div>

        {/* 클리어 시간 */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsReportOpen(true);
            }}
            aria-label="🚨"
            title="🚨"
            className="appearance-none bg-transparent px-1 py-1 text-[12px] leading-none text-rose-600 transition-colors hover:text-rose-700 dark:text-rose-200 dark:hover:text-rose-100"
          >
            🚨
          </button>

          <span className="ranking-time-pill">
            {formatMs(record.elapsedMs)}
          </span>

          <span
            className={[
              'hidden sm:inline-flex text-[10px] font-bold px-2 py-1 rounded-full shadow-sm',
              DIFFICULTY_COLORS[record.difficulty] ?? '',
            ].join(' ')}
          >
            {t(`ranking.difficultyTag.${record.difficulty}` as Parameters<typeof t>[0])}
          </span>
        </div>

        {/* 확장 화살표 */}
        <span
          className={[
            'text-gray-400 transition-all duration-300 text-xs shrink-0 ranking-chevron',
            expanded ? 'rotate-180 text-primary' : '',
          ].join(' ')}
        >
          ▼
        </span>
      </div>

      {/* 열고 닫는 애니메이션 적용 */}
      <div
        className={[
          'ranking-expand-wrapper',
          expanded ? 'ranking-expand-wrapper--open' : 'ranking-expand-wrapper--closed',
        ].join(' ')}
      >
        <div className="ranking-expand-inner">
          <div className="ranking-expand-panel">
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex gap-2">
                <span className="text-gray-400 dark:text-gray-500 shrink-0">
                  {t('ranking.time')}
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {formatRankCreatedAt(record.createdAt)}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="text-gray-400 dark:text-gray-500 shrink-0">
                  {t('ranking.targetWord')}
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {record.targetWord}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="text-gray-400 dark:text-gray-500 shrink-0">
                  {t('ranking.startDoc')}
                </span>
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  {record.startDoc}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="text-gray-400 dark:text-gray-500 shrink-0">경로</span>
                <span className="font-mono text-gray-700 dark:text-gray-300">
                  {t('ranking.steps').replace('{{count}}', String(record.pathLength))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (rank <= 3) {
    return (
      <>
        <RankingMedalFrame rank={rank}>{cardBody}</RankingMedalFrame>
        <ReportModal
          isOpen={isReportOpen}
          targetNick={record.nickname}
          targetType="ACCOUNT"
          targetAccountId={record.accountId}
          onClose={() => setIsReportOpen(false)}
        />
      </>
    );
  }
  return (
    <>
      {cardBody}
      <ReportModal
        isOpen={isReportOpen}
        targetNick={record.nickname}
        targetType="ACCOUNT"
        targetAccountId={record.accountId}
        onClose={() => setIsReportOpen(false)}
      />
    </>
  );
}
