import { useTranslation } from '@shared';
import type { RecordSummary } from '@/entities/game-record';
import { formatElapsedMs } from '../lib/formatRecordTime';

type RecordSummaryBarProps = {
  summary: RecordSummary;
};

type StatCardProps = {
  label: string;
  value: string;
  colorClass: string;
  icon: string;
};

// 개별 스탯 카드
function StatCard({ label, value, colorClass, icon }: StatCardProps): React.ReactElement {
  return (
    <div className="flex-1 min-w-20 flex flex-col items-center gap-1 bg-white dark:bg-gray-800 rounded-xl px-3 py-3 border border-gray-100 dark:border-gray-700 shadow-sm">
      <span className="text-xl">{icon}</span>
      <span className={`text-lg font-bold tabular-nums ${colorClass}`}>{value}</span>
      <span className="text-[11px] text-gray-400 dark:text-gray-500 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

// 상단 요약 스탯 바 (총 플레이, 클리어, 포기, 최고 기록) — 누적 통계 기반
export function RecordSummaryBar({ summary }: RecordSummaryBarProps): React.ReactElement {
  const { t } = useTranslation();
  const { totalPlays, clearCount, giveUpCount, bestTimeMs } = summary;

  const bestTimeStr = bestTimeMs != null ? formatElapsedMs(bestTimeMs) : t('record.noBestTime');

  return (
    <div className="flex gap-2.5 animate-record-summary-in">
      <StatCard
        label={t('record.totalGames')}
        value={String(totalPlays)}
        colorClass="text-gray-700 dark:text-gray-200"
        icon="🎮"
      />
      <StatCard
        label={t('record.totalClears')}
        value={String(clearCount)}
        colorClass="text-emerald-600 dark:text-emerald-400"
        icon="✓"
      />
      <StatCard
        label={t('record.totalAbandons')}
        value={String(giveUpCount)}
        colorClass="text-amber-600 dark:text-amber-400"
        icon="✗"
      />
      <StatCard
        label={t('record.bestTime')}
        value={bestTimeStr}
        colorClass="text-amber-500 dark:text-amber-400 font-extrabold"
        icon="🏆"
      />
    </div>
  );
}
