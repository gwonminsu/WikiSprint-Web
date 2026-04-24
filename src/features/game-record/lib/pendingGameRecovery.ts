import type { PendingGameState } from '@/entities/game-record';

type RecoverableClearedPendingGame = PendingGameState & {
  status: 'cleared';
  elapsedMs: number;
};

// 위키 문서 제목 비교를 위해 대소문자, 공백, 언더스코어 차이를 무시한다.
function normalizeTitle(title: string): string {
  return decodeURIComponent(title).trim().toLowerCase().replace(/_/g, ' ');
}

export function isRecoverableClearedPendingGame(
  pending: PendingGameState
): pending is RecoverableClearedPendingGame {
  if (pending.status !== 'cleared' || pending.elapsedMs == null) {
    return false;
  }

  const lastArticle = pending.navPath[pending.navPath.length - 1];
  if (!lastArticle) {
    return false;
  }

  return normalizeTitle(lastArticle) === normalizeTitle(pending.targetWord);
}
