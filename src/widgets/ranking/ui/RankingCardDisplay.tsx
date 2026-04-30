import {
  useTranslation,
  ProfileAvatar,
  getCountryFlagUrl,
  getCountryFlagSrcSet,
} from '@shared';
import { getProfileImageUrl } from '@features';
import type { RankingRecord } from '@/entities/ranking/types';

export function formatRankingMs(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(2).padStart(5, '0');
  if (minutes === 0) return `${seconds}초`;
  return `${minutes}분 ${seconds}초`;
}

export function formatRankCreatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

export const RANK_BADGE: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  all: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  normal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

type RankingCardDisplayProps = {
  record: RankingRecord;
  rank: number;
  index?: number;
  isMe?: boolean;
  className?: string;
  style?: React.CSSProperties;
  infoLine?: React.ReactNode;
  rankSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
  trailingSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  role?: React.AriaRole;
  tabIndex?: number;
  ariaExpanded?: boolean;
};

export function RankingCardDisplay({
  record,
  rank,
  index = 0,
  isMe = false,
  className = '',
  style,
  infoLine,
  rankSlot,
  actionSlot,
  trailingSlot,
  footerSlot,
  onClick,
  onKeyDown,
  role,
  tabIndex,
  ariaExpanded,
}: RankingCardDisplayProps): React.ReactElement {
  const { t } = useTranslation();
  const profileImageUrl = record.profileImageUrl
    ? getProfileImageUrl(record.profileImageUrl)
    : null;
  const flagUrl = getCountryFlagUrl(record.nationality);
  const flagSrcSet = getCountryFlagSrcSet(record.nationality);

  return (
    <div
      className={[
        'ranking-card-base rounded-2xl px-4 py-3.5 transition-all duration-200',
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : '',
        'animate-ranking-drop',
        isMe
          ? 'ranking-card-me border border-primary/30'
          : 'border border-gray-200/90 dark:border-gray-700/90',
        className,
      ].join(' ')}
      style={{ animationDelay: `${index * 70}ms`, ...style }}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
      aria-expanded={ariaExpanded}
    >
      <div className="flex items-center gap-3">
        <div className={`${rankSlot ? 'w-15' : 'w-10'} shrink-0 text-center`}>
          {rankSlot ?? (
            rank <= 3 ? (
              <span className="text-xl leading-none">{RANK_BADGE[rank]}</span>
            ) : (
              <span className="ranking-rank-pill">
                {t('ranking.rank').replace('{{rank}}', String(rank))}
              </span>
            )
          )}
        </div>

        <div className="ranking-avatar-wrap">
          <ProfileAvatar
            imageUrl={profileImageUrl}
            name={record.nickname}
            size="sm"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={[
              'text-sm font-semibold truncate tracking-tight flex items-center gap-1',
              isMe ? 'text-primary' : 'text-gray-900 dark:text-white',
            ].join(' ')}
          >
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
              <span className="shrink-0 text-xs leading-none">🌐</span>
            )}

            <span className="truncate ml-1">{record.nickname}</span>
          </p>

          <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
            {infoLine ?? record.targetWord}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {actionSlot}
          {trailingSlot ?? (
            <span className="ranking-time-pill">
              {formatRankingMs(record.elapsedMs)}
            </span>
          )}
        </div>
      </div>

      {footerSlot}
    </div>
  );
}
