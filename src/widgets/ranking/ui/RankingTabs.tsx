import { useTranslation } from '@shared';
import type { RankingPeriod, RankingDifficulty } from '@/entities/ranking/types';

type RankingTabsProps = {
  period: RankingPeriod;
  difficulty: RankingDifficulty;
  onPeriodChange: (p: RankingPeriod) => void;
  onDifficultyChange: (d: RankingDifficulty) => void;
};

const PERIODS: RankingPeriod[] = ['daily', 'weekly', 'monthly'];
const DIFFICULTIES: RankingDifficulty[] = ['all', 'easy', 'normal', 'hard'];

// 랭킹 2단 탭 — 기간 탭(상단) + 난이도 탭(하단)
export function RankingTabs({
  period,
  difficulty,
  onPeriodChange,
  onDifficultyChange,
}: RankingTabsProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2.5 mb-5">
      {/* 기간 탭 */}
      <div className="ranking-tabs-shell ranking-tabs-shell--period">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPeriodChange(p)}
            className={[
              'ranking-tab-btn ranking-tab-btn--period',
              period === p
                ? 'ranking-tab-btn--active'
                : 'ranking-tab-btn--inactive',
            ].join(' ')}
          >
            <span className="relative z-1">
              {t(`ranking.${p}` as Parameters<typeof t>[0])}
            </span>
          </button>
        ))}
      </div>

      {/* 난이도 탭 */}
      <div className="ranking-tabs-shell ranking-tabs-shell--difficulty">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDifficultyChange(d)}
            className={[
              'ranking-tab-btn ranking-tab-btn--difficulty',
              difficulty === d
                ? 'ranking-tab-btn--active'
                : 'ranking-tab-btn--inactive',
            ].join(' ')}
          >
            <span className="relative z-1">
              {t(`ranking.${d}` as Parameters<typeof t>[0])}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}