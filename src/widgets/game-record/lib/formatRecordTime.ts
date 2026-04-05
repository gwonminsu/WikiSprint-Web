// 밀리초를 "n분 nn.nn초" 형태로 포맷
export function formatElapsedMs(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(2).padStart(5, '0');
  if (minutes === 0) return `${seconds}초`;
  return `${minutes}분 ${seconds}초`;
}

// ISO 날짜 문자열을 상대 시간 문자열로 변환 (i18n 키 반환)
export function getRelativeTimeKey(playedAt: string): { key: string; count?: number } {
  const now = Date.now();
  const played = new Date(playedAt).getTime();
  const diffMs = now - played;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));

  if (diffMs < 1000 * 60) return { key: 'time.justNow' };
  if (minutes < 60) return { key: 'time.minutesAgo', count: minutes };
  if (hours < 24) return { key: 'time.hoursAgo', count: hours };
  if (days < 30) return { key: 'time.daysAgo', count: days };
  return { key: 'time.monthsAgo', count: months };
}
