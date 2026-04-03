import { useRef, useEffect, useMemo } from 'react';
import { talkerStart, useTranslation } from '@shared';
import { useCardSequence } from '../lib';

// spark 파티클 데이터 타입
type SparkItem = {
  id: number;
  x: string;
  y: string;
  color: string;
  size: number;
  delay: number;
};

// 마지막 카드 spark 색상 팔레트 (기존 SuccessOverlay와 유사하나 amber 계열 강조)
const SPARK_COLORS: string[] = [
  '#fdb755', '#f59e0b', '#ef4444', '#f97316',
  '#facc15', '#fdb755', '#f59e0b', '#ef4444',
];

// 마지막 카드 spark 파티클 생성 (8개, 40~80px)
function generateResultSparks(): SparkItem[] {
  return Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 360 + Math.random() * (360 / 8);
    const distance = 80 + Math.random() * 80;
    const rad = (angle * Math.PI) / 180;
    return {
      id: i,
      x: `${Math.cos(rad) * distance}px`,
      y: `${Math.sin(rad) * distance}px`,
      color: SPARK_COLORS[i % SPARK_COLORS.length],
      size: 8 + Math.random() * 8,
      delay: Math.random() * 0.15,
    };
  });
}

// PathTimeline Props
type PathTimelineProps = {
  history: string[];
  onAllCardsShown: () => void;
};

// 문서 경로 카드 타임라인 — 카드를 순차적으로 등장시킴
export function PathTimeline({ history, onAllCardsShown }: PathTimelineProps): React.ReactElement {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { visibleCount, isComplete } = useCardSequence(history.length, 600);

  // 마지막 카드 spark 데이터 — 한 번만 생성
  const sparks = useMemo(() => generateResultSparks(), []);

  // 모든 카드 등장 완료 시 콜백 호출 (결과 요약 표시용)
  useEffect(() => {
    if (isComplete) {
      // 마지막 카드 애니메이션이 끝날 여유 시간 후 호출
      const timer = setTimeout(() => {
        onAllCardsShown();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onAllCardsShown]);

  // 새 카드 등장 시 스크롤 자동 추적
  useEffect(() => {
    if (containerRef.current && visibleCount > 0) {
      const cards = containerRef.current.querySelectorAll('[data-card]');
      const lastVisible = cards[visibleCount - 1];
      if (lastVisible) {
        lastVisible.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [visibleCount]);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center w-full max-w-sm">
      {history.map((title: string, index: number) => {
        if (index >= visibleCount) return null;

        const isFirst = index === 0;
        const isLast = index === history.length - 1;
        // 짝수 인덱스(0 제외): 오른쪽에서, 홀수: 왼쪽에서
        const isEven = index % 2 === 0;

        // 카드 등장 애니메이션 클래스
        const animationClass = isFirst
          ? 'animate-result-card-scale-in'
          : isLast
            ? 'animate-result-card-arrive'
            : isEven
              ? 'animate-result-card-from-right'
              : 'animate-result-card-from-left';

        return (
          <div key={index} className="flex flex-col items-center w-full">
            {/* 연결선 (첫 카드 제외) */}
            {index > 0 && (
              <div className="animate-result-connector w-0.5 h-8 bg-amber-400 dark:bg-amber-500 rounded-full" />
            )}

            {/* 카드 행 */}
            <div data-card className="relative flex items-center gap-2 w-full">
              {/* 첫 카드 왼쪽: talkerStart 이미지 */}
              {isFirst && (
                <img
                  src={talkerStart}
                  alt="출발"
                  className="w-12 h-12 object-contain shrink-0 animate-result-card-scale-in"
                />
              )}

              {/* 카드 본체 */}
              <div className={[
                'flex-1 px-4 py-3 rounded-xl border-2 shadow-md',
                animationClass,
                isFirst
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500'
                  : isLast
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-500'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
              ].join(' ')}>
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  {/* 태그 */}
                  {isFirst && (
                    <span className="text-xs font-bold text-blue-500 dark:text-blue-400 shrink-0">
                      {t('game.resultTagStart')}
                    </span>
                  )}
                  {isLast && (
                    <span className="text-xs font-bold text-amber-500 dark:text-amber-400 shrink-0">
                      {t('game.resultTagArrive')}
                    </span>
                  )}
                  {/* 문서 제목 */}
                  <span className={[
                    'text-sm font-medium break-all',
                    isFirst ? 'text-blue-800 dark:text-blue-200' : '',
                    isLast ? 'text-amber-800 dark:text-amber-200 font-bold' : '',
                    !isFirst && !isLast ? 'text-gray-800 dark:text-gray-100' : '',
                  ].join(' ')}>
                    {title.replaceAll("_"," ")}
                  </span>
                </div>
              </div>

              {/* 마지막 카드: spark 파티클 효과 */}
              {isLast && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {sparks.map((spark: SparkItem) => (
                    <div
                      key={spark.id}
                      className="animate-success-spark absolute rounded-sm"
                      style={{
                        width: `${spark.size}px`,
                        height: `${spark.size}px`,
                        backgroundColor: spark.color,
                        ['--spark-x' as string]: spark.x,
                        ['--spark-y' as string]: spark.y,
                        animationDelay: `${spark.delay}s`,
                        opacity: 0,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
