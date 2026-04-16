import { useTranslation } from '@shared';
import type { GameRecord } from '@/entities/game-record';
import { formatElapsedMs, getRelativeTimeKey } from '../lib/formatRecordTime';
import { RecordPathSegment } from './RecordPathSegment';

type RecordCardProps = {
  record: GameRecord;
  index: number;
};

// 개별 전적 카드 — cleared(초록) / abandoned(amber) 구분
export function RecordCard({ record, index }: RecordCardProps): React.ReactElement {
  const { t } = useTranslation();

  const { targetWord, difficulty, startDoc, navPath, elapsedMs, status, playedAt } = record;
  const isCleared = status === 'cleared';

  // 상대 시간 문자열 생성
  const relTime = getRelativeTimeKey(playedAt);
  const relTimeStr =
    relTime.count !== undefined
      ? t(relTime.key as Parameters<typeof t>[0]).replace('{{count}}', String(relTime.count))
      : t(relTime.key as Parameters<typeof t>[0]);

  // 클리어 시간 포맷 (elapsedMs가 null인 경우 abandoned)
  const formattedTime = elapsedMs != null ? formatElapsedMs(elapsedMs) : null;
  const difficultyLabel = difficulty === 1
    ? t('game.difficultyEasy')
    : difficulty === 2
      ? t('game.difficultyNormal')
      : difficulty === 3
        ? t('game.difficultyHard')
        : null;

  const difficultyClassName = difficulty === 1
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
    : difficulty === 2
      ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
      : difficulty === 3
        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
        : '';

  return (
    <div
      className={[
        'rounded-xl border bg-white dark:bg-gray-800',
        'px-4 py-3.5 shadow-sm',
        'hover:-translate-y-0.5 hover:shadow-md transition-all duration-200',
        'animate-record-fade-up',
        isCleared
          ? 'border-l-4 border-l-emerald-500 border-gray-200 dark:border-gray-700'
          : 'border-l-4 border-l-amber-500 border-gray-200 dark:border-gray-700',
      ].join(' ')}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* 카드 상단: 상태 배지 + 상대 시간 */}
      <div className="flex items-center justify-between mb-2.5">
        {/* 상태 배지 */}
        <span
          className={[
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide',
            isCleared
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
          ].join(' ')}
        >
          {isCleared ? (
            <>
              <span>✓</span>
              <span>{t('record.cleared')}</span>
            </>
          ) : (
            <>
              <span>✗</span>
              <span>{t('record.abandoned')}</span>
            </>
          )}
        </span>

        {/* 상대 시간 */}
        <span className="text-xs text-gray-400 dark:text-gray-500">{relTimeStr}</span>
      </div>

      {/* 카드 본문 */}
      <div className="flex flex-col gap-1.5">
        {/* 제시어 (강조) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">제시어</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {targetWord}
          </span>
          {difficultyLabel ? (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${difficultyClassName}`}
            >
              {difficultyLabel}
            </span>
          ) : null}
        </div>

        {/* 시작 문서 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
            {t('record.startDoc')}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{startDoc}</span>
        </div>

        {/* 클리어 시간 or 중도 포기 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
            {isCleared ? t('record.elapsedLabel') : ''}
          </span>
          {isCleared && formattedTime != null ? (
            <span className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              {formattedTime}
            </span>
          ) : (
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {t('record.giveUpLabel')}
            </span>
          )}
        </div>
      </div>

      {/* 경로 세그먼트 아코디언 */}
      <RecordPathSegment
        navPath={navPath}
        status={status}
        targetWord={targetWord}
      />
    </div>
  );
}
