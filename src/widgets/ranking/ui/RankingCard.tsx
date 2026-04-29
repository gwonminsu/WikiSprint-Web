import { useState } from 'react';
import { useTranslation } from '@shared';
import type { RankingRecord } from '@/entities/ranking/types';
import { ReportModal } from '@/widgets/report';
import { RankingMedalFrame } from './RankingMedalFrame';
import { DIFFICULTY_COLORS, RankingCardDisplay, formatRankCreatedAt, formatRankingMs } from './RankingCardDisplay';

type RankingCardProps = {
  record: RankingRecord;
  rank: number;
  index: number;
  isMe?: boolean;
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

  const cardBody = (
    <RankingCardDisplay
      record={record}
      rank={rank}
      index={index}
      isMe={isMe}
      className={expanded ? 'ranking-card-expanded' : ''}
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
      trailingSlot={(
        <>
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
            {formatRankingMs(record.elapsedMs)}
          </span>

          <span
            className={[
              'hidden sm:inline-flex text-[10px] font-bold px-2 py-1 rounded-full shadow-sm',
              DIFFICULTY_COLORS[record.difficulty] ?? '',
            ].join(' ')}
          >
            {t(`ranking.difficultyTag.${record.difficulty}` as Parameters<typeof t>[0])}
          </span>

          <span
            className={[
              'text-gray-400 transition-all duration-300 text-xs shrink-0 ranking-chevron',
              expanded ? 'rotate-180 text-primary' : '',
            ].join(' ')}
          >
            ▼
          </span>
        </>
      )}
      footerSlot={(
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
      )}
    />
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
