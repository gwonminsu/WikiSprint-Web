import { initKakaoSdk, gameClear } from '@shared';

export function buildShareUrl(recordId: string): string {
  const shareId = recordId.startsWith('REC-') ? recordId.slice(4) : recordId;
  return `${window.location.origin}/share/${shareId}`;
}

type KakaoShareParams = {
  nick: string;
  targetWord: string;
  shareUrl: string;
  elapsedMs: number;
  pathCount: number;
};

export function formatElapsed(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(2);

  return minutes > 0 ? `${minutes}분 ${seconds}초` : `${seconds}초`;
}

export async function shareKakao(params: KakaoShareParams): Promise<boolean> {
  try {
    const initialized = await initKakaoSdk();
    if (!initialized || !window.Kakao) return false;

    const timeText = formatElapsed(params.elapsedMs);
    const imageUrl = new URL(gameClear, window.location.origin).toString();
    const shareLink = {
      mobileWebUrl: params.shareUrl,
      webUrl: params.shareUrl,
    };

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `${params.nick}님이 WikiSprint를 클리어했습니다!`,
        description: `목표 "${params.targetWord}"에 ${params.pathCount}개 경로, ${timeText} 만에 도달했습니다.`,
        imageUrl,
        link: shareLink,
      },
      buttons: [
        {
          title: '결과 보러가기',
          link: shareLink,
        },
      ],
    });

    return true;
  } catch (error) {
    console.error('shareKakao error:', error);
    return false;
  }
}
