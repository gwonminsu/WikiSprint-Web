// Top 3 메달 테두리 래퍼 — 금/은/동 + 광택 애니메이션
type RankingMedalFrameProps = {
  rank: number;
  children: React.ReactNode;
};

const MEDAL_STYLES: Record<number, string> = {
  1: 'border-2 border-yellow-400 dark:border-yellow-500',
  2: 'border-2 border-gray-300 dark:border-gray-400',
  3: 'border-2 border-amber-600 dark:border-amber-700',
};

const MEDAL_GLOSS: Record<number, string> = {
  1: 'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-transparent before:via-yellow-200/30 before:to-transparent before:animate-[medal-gloss_2.5s_ease-in-out_infinite] before:bg-[length:200%_100%] before:pointer-events-none',
  2: 'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-transparent before:via-gray-100/30 before:to-transparent before:animate-[medal-gloss_3s_ease-in-out_infinite] before:bg-[length:200%_100%] before:pointer-events-none',
  3: 'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-transparent before:via-amber-200/30 before:to-transparent before:animate-[medal-gloss_3.5s_ease-in-out_infinite] before:bg-[length:200%_100%] before:pointer-events-none',
};

export function RankingMedalFrame({ rank, children }: RankingMedalFrameProps): React.ReactElement {
  const medalBorder = MEDAL_STYLES[rank] ?? '';
  const medalGloss  = MEDAL_GLOSS[rank] ?? '';
  const isFirst = rank === 1;

  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl',
        medalBorder,
        medalGloss,
        isFirst ? 'animate-gold-glow' : '',
      ].join(' ')}
    >
      {children}
    </div>
  );
}
