import { useEffect, useState, useMemo } from 'react';

// 성공 오버레이 컴포넌트 Props
type SuccessOverlayProps = {
  isVisible: boolean;
  text: string;
  onAnimationEnd: () => void;
};

// 파편(spark) 하나의 데이터
type SparkItem = {
  id: number;
  x: string;
  y: string;
  color: string;
  size: number;
  delay: number;
};

// 링 파동 하나의 색상
const RING_COLORS: string[] = [
  '#ef4444', // 빨강
  '#f97316', // 주황
  '#f59e0b', // 황주황
  '#eab308', // 노랑
  '#facc15', // 밝은 노랑
];

// 파편 색상 팔레트
const SPARK_COLORS: string[] = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#facc15',
  '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#ffffff',
];

// spark 위치 계산 (중심에서 방사상으로 퍼짐)
function generateSparks(count: number): SparkItem[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360 + Math.random() * (360 / count);
    const distance = 80 + Math.random() * 80; // 80~160px
    const rad = (angle * Math.PI) / 180;
    return {
      id: i,
      x: `${Math.cos(rad) * distance}px`,
      y: `${Math.sin(rad) * distance}px`,
      color: SPARK_COLORS[i % SPARK_COLORS.length],
      size: 6 + Math.random() * 6, // 6~12px
      delay: Math.random() * 0.2,
    };
  });
}

// 목적지 도달 성공 오버레이 — Impact Burst + Ring Pulse + Spark 3종 합성
export function SuccessOverlay({ isVisible, text, onAnimationEnd }: SuccessOverlayProps): React.ReactElement | null {
  // 페이드아웃 진행 여부
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  // spark 데이터는 표시될 때 한 번만 생성
  const sparks: SparkItem[] = useMemo(() => generateSparks(16), []);

  useEffect(() => {
    if (!isVisible) return;

    setIsFadingOut(false);

    // 1.8s 후 fade-out 시작
    const fadeTimer = window.setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    // 2.3s 후 완전 종료 콜백
    const endTimer = window.setTimeout(() => {
      onAnimationEnd();
    }, 2300);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(endTimer);
    };
  }, [isVisible, onAnimationEnd]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none ${
        isFadingOut ? 'animate-success-overlay-fade-out' : ''
      }`}
    >
      {/* 반투명 배경 */}
      <div className="absolute inset-0 bg-black/25 dark:bg-black/45" />

      {/* 중앙 이펙트 컨테이너 */}
      <div className="relative flex items-center justify-center">

        {/* Ring Pulse — 5개 원형 파동 */}
        {RING_COLORS.map((color, i) => (
          <div
            key={i}
            className="animate-success-ring absolute rounded-full"
            style={{
              width: '120px',
              height: '120px',
              border: `4px solid ${color}`,
              animationDelay: `${i * 0.1}s`,
              opacity: 0,
            }}
          />
        ))}

        {/* Spark 파편 — 방사상으로 퍼짐 */}
        {sparks.map((spark) => (
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

        {/* Impact Burst 텍스트 */}
        <div
          className="animate-success-impact relative z-10 select-none"
          style={{
            fontSize: 'clamp(2rem, 8vw, 4rem)',
            fontWeight: 900,
            color: '#ffffff',
            textShadow: '0 0 20px rgba(253,183,85,0.9), 0 2px 8px rgba(0,0,0,0.8)',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </div>

      </div>
    </div>
  );
}
