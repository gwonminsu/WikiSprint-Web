import { useState, useEffect } from 'react';

// 카드 순차 등장 타이밍 제어 훅 결과 타입
type CardSequenceResult = {
  visibleCount: number;
  isComplete: boolean;
};

// 경로 진행률(0~1)에 따른 카드 등장 딜레이(ms) 반환
// 초반(0~20%): 800→600ms (느림), 중반(20~80%): 200ms, 후반(80~100%): 200→800ms (느림)
function getCardDelay(progress: number, fastDelay: number): number {
  if (progress <= 0.2) {
    return 800 - (progress / 0.2) * 200;
  }
  if (progress <= 0.8) {
    return fastDelay;
  }
  return fastDelay + ((progress - 0.8) / 0.2) * 600;
}

// 카드를 순차적으로 등장시키는 훅
// totalCards: 전체 카드 수
// initialDelay: 첫 카드 등장 전 대기 시간(ms) — 헤더 애니메이션 대기
export function useCardSequence(totalCards: number, initialDelay: number = 500): CardSequenceResult {
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    if (totalCards === 0) {
      setIsComplete(true);
      return;
    }

    // 카드 수에 따라 중반 딜레이 조정 (많을수록 빠르게)
    const fastDelay = totalCards > 30 ? 100 : 200;

    // 각 카드의 누적 딜레이 사전 계산
    const cumulativeDelays: number[] = [];
    let accumulated = initialDelay;

    for (let i = 0; i < totalCards; i++) {
      cumulativeDelays.push(accumulated);
      const progress = totalCards <= 1 ? 0 : i / (totalCards - 1);
      accumulated += getCardDelay(progress, fastDelay);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    // 각 카드별 setTimeout 등록
    for (let i = 0; i < totalCards; i++) {
      const timer = setTimeout(() => {
        setVisibleCount(i + 1);
        if (i === totalCards - 1) {
          setIsComplete(true);
        }
      }, cumulativeDelays[i]);
      timers.push(timer);
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [totalCards, initialDelay]);

  return { visibleCount, isComplete };
}
