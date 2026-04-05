import { useState } from 'react';
import { useTranslation } from '@shared';
import type { GameRecordStatus } from '@/entities/game-record';

type RecordPathSegmentProps = {
  navPath: string[];
  status: GameRecordStatus;
  targetWord: string;
};

// 경로 pill/tag 세그먼트 + 접이식 아코디언
export function RecordPathSegment({
  navPath,
  status,
  targetWord,
}: RecordPathSegmentProps): React.ReactElement {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const isCleared = status === 'cleared';
  const pathCount = navPath.length;

  // 경로 보기 버튼 레이블 — "경로 보기 (n개)"
  const viewLabel = t('record.viewPath').replace('{{count}}', String(pathCount));

  return (
    <div className="mt-3">
      {/* 토글 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        {/* chevron 아이콘 — isOpen 시 180도 회전 */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span>{viewLabel}</span>
      </button>

      {/* 경로 세그먼트 목록 — CSS transition으로 펼침/접힘 */}
      <div
        style={{
          maxHeight: isOpen ? '600px' : '0px',
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease, opacity 0.25s ease',
        }}
      >
        <div className="flex flex-wrap items-center gap-1.5 pt-3 pb-1">
          {navPath.map((doc, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === navPath.length - 1;

            // 세그먼트 색상 결정
            let pillClass = 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
            if (isFirst) {
              pillClass = 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium';
            } else if (isLast && isCleared) {
              pillClass = 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium';
            } else if (isLast && !isCleared) {
              pillClass = 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-medium';
            }

            return (
              <span key={`${doc}-${idx}`} className="flex items-center gap-1.5">
                {/* pill 태그 */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${pillClass}`}
                >
                  {/* 시작 문서: 파란 원 점 */}
                  {isFirst && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  )}
                  {/* 제시어(마지막, 클리어): 에메랄드 별 */}
                  {isLast && isCleared && (
                    <span className="text-emerald-500 text-xs">★</span>
                  )}
                  <span className="max-w-[120px] truncate">{doc}</span>
                  {/* 포기 배지: 마지막 + abandoned */}
                  {isLast && !isCleared && (
                    <span className="ml-0.5 text-red-500 text-[10px] font-bold">
                      {t('record.giveUpBadge')}
                    </span>
                  )}
                </span>

                {/* 구분 화살표 (마지막 세그먼트 이후는 제외) */}
                {idx < navPath.length - 1 && (
                  <span className="text-gray-300 dark:text-gray-600 text-xs select-none">→</span>
                )}
              </span>
            );
          })}

          {/* 포기인 경우 마지막에 제시어 표시 */}
          {!isCleared && (
            <span className="flex items-center gap-1.5">
              <span className="text-gray-300 dark:text-gray-600 text-xs select-none">→</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span className="max-w-[120px] truncate">{targetWord}</span>
                <span className="text-amber-500 text-[10px]">?</span>
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
