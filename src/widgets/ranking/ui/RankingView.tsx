import { useState, useRef } from 'react';
import { useTranslation, useAuthStore } from '@shared';
import { useRanking } from '@features';
import type { RankingPeriod, RankingDifficulty } from '@/entities/ranking/types';
import { RankingTabs } from './RankingTabs';
import { MyRankingCard } from './MyRankingCard';
import { RankingCard } from './RankingCard';
import { mockRankingData } from '@/features/ranking/model/mockRankingData';


const INITIAL_SHOW = 10;

// 랭킹 메인 뷰 — 기간/난이도 탭 + 내 랭킹 카드 + 리더보드
export function RankingView(): React.ReactElement {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  const [period, setPeriod] = useState<RankingPeriod>('daily');
  const [difficulty, setDifficulty] = useState<RankingDifficulty>('all');
  const [showAll, setShowAll] = useState(false);

  const { data: apiData, isLoading, isError } = useRanking(period, difficulty);

  const useMock = false;
  const data = useMock ? mockRankingData[period][difficulty] : apiData;

  console.log(data);

  // 리더보드 시작 위치로 스크롤하기 위한 ref
  const leaderboardRef = useRef<HTMLDivElement | null>(null);

  const top100 = data?.top100 ?? [];
  const me = data?.me ?? null;
  const visibleList = showAll ? top100 : top100.slice(0, INITIAL_SHOW);

  const handlePeriodChange = (p: RankingPeriod): void => {
    setPeriod(p);
    setShowAll(false);
  };

  const handleDifficultyChange = (d: RankingDifficulty): void => {
    setDifficulty(d);
    setShowAll(false);
  };

  // 접을 때 리더보드 시작 위치로 스크롤
  const handleToggleShowAll = (): void => {
    if (showAll) {
      setShowAll(false);

      window.setTimeout(() => {
        leaderboardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 50); // 상태 반영 직후 자연스럽게 스크롤
      return;
    }

    setShowAll(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">
        🏆 {t('ranking.title')}
      </h1>

      {data?.serverNow && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
          {t('ranking.leaderboardInfo')}
        </p>
      )}

      <RankingTabs
        period={period}
        difficulty={difficulty}
        onPeriodChange={handlePeriodChange}
        onDifficultyChange={handleDifficultyChange}
      />

      <MyRankingCard
        me={me}
        top100={top100}
        isAuthenticated={isAuthenticated}
      />

      {isLoading && (
        <div className="text-center py-10 text-gray-400 text-sm animate-pulse">
          {t('common.loading')}
        </div>
      )}

      {isError && (
        <div className="text-center py-10 text-red-400 text-sm">
          {t('common.error')}
        </div>
      )}

      {!isLoading && !isError && top100.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎮</p>
          <p className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-1">
            {t('ranking.noRecord')}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {t('ranking.noRecordDesc')}
          </p>
        </div>
      )}

      {!isLoading && !isError && top100.length > 0 && (
        // 리더보드 시작점 ref
        <div ref={leaderboardRef} className="flex flex-col gap-3">
          {visibleList.map((record, i) => (
            <RankingCard
              key={`${record.accountId}-${record.periodType}-${record.difficulty}-${record.createdAt}`} // key 안전하게 변경
              record={record}
              rank={i + 1}
              index={i}
              isMe={isAuthenticated && record.accountId === me?.accountId}
            />
          ))}

          {top100.length > INITIAL_SHOW && (
            <button
              type="button"
              onClick={handleToggleShowAll} // 전용 핸들러 사용
              className="mt-2 w-full py-2.5 text-sm font-semibold text-primary border border-primary/40 rounded-xl hover:bg-primary/10 transition-colors"
            >
              {showAll
                ? t('ranking.showLess')
                : `${t('ranking.showMore')} (${top100.length - INITIAL_SHOW}+)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
