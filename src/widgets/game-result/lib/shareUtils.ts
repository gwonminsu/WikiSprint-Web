import { initKakaoSdk, gameClear } from '@shared';

// 공유 URL 생성 — recordId에서 "REC-" prefix 제거 후 /share/{uuid} 경로 구성
export function buildShareUrl(recordId: string): string {
  const shareId = recordId.startsWith('REC-') ? recordId.slice(4) : recordId;
  return `${window.location.origin}/share/${shareId}`;
}

// 카카오톡 공유 파라미터 타입
type KakaoShareParams = {
  nick: string;
  targetWord: string;
  shareUrl: string;
  elapsedMs: number;
  pathCount: number;
};

// 경과 시간 포맷 헬퍼
function formatElapsed(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(2);
  return minutes > 0 ? `${minutes}분 ${seconds}초` : `${seconds}초`;
}

// 카카오톡 공유 실행 — 성공 시 true, 실패 시 false 반환
export async function shareKakao(params: KakaoShareParams): Promise<boolean> {
  try {
    const initialized = await initKakaoSdk();
    if (!initialized || !window.Kakao) return false;

    const timeText = formatElapsed(params.elapsedMs);

    // gameClear를 절대 URL로 변환
    const imageUrl = new URL(gameClear, window.location.origin).toString();

    // 디버깅
    console.log('gameClear:', gameClear);
    console.log('imageUrl:', imageUrl);

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `${params.nick}님이 WikiSprint를 클리어했습니다!`,
        description: `제시어 "${params.targetWord}"에 ${params.pathCount}개 경로, ${timeText} 만에 도달!`,

        // 이미지 적용
        imageUrl: imageUrl,

        link: {
          mobileWebUrl: params.shareUrl,
          webUrl: params.shareUrl,
        },
      },
      buttons: [
        {
          title: '결과 보러가기',
          link: {
            mobileWebUrl: params.shareUrl,
            webUrl: params.shareUrl,
          },
        },
      ],
    });

    return true;
  } catch (error) {
    console.error('shareKakao error:', error);
    return false;
  }
}