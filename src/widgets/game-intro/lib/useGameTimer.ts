import { useEffect, useRef } from 'react';
import { useGameStore } from '@shared';

type TimerResult = {
  formattedTime: string;    // "0:00.00" 형식
  timerColorClass: string;  // 경과 시간대별 색상 Tailwind 클래스
};

// 경과 밀리초를 "분:초.소수점(2자리)" 형식으로 변환
function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  const paddedSeconds = String(seconds).padStart(2, '0');
  const paddedCenti = String(centiseconds).padStart(2, '0');

  return `${minutes}:${paddedSeconds}.${paddedCenti}`;
}

// 경과 시간대에 따른 타이머 색상 클래스 반환
// 0~2분: 파랑, 2~5분: 초록, 5~10분: 주황, 10분+: 빨강
function getTimerColorClass(ms: number): string {
  const minutes = ms / 60000;
  if (minutes < 2) return 'text-blue-500';
  if (minutes < 5) return 'text-green-500';
  if (minutes < 10) return 'text-orange-500';
  return 'text-red-500';
}

// 게임 타이머 훅 — 100ms 간격으로 경과 시간을 측정하여 gameStore에 저장
export function useGameTimer(): TimerResult {
  const isTimerRunning = useGameStore((s) => s.isTimerRunning);
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const tickTimer = useGameStore((s) => s.tickTimer);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isTimerRunning) {
      // 타이머 시작: 현재 시각을 기준점으로 기록
      startTimeRef.current = Date.now() - elapsedMs;

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        tickTimer(elapsed);
      }, 100);
    } else {
      // 타이머 정지: interval 해제
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isTimerRunning]);

  return {
    formattedTime: formatElapsedTime(elapsedMs),
    timerColorClass: getTimerColorClass(elapsedMs),
  };
}
