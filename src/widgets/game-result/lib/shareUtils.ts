import { initKakaoSdk, gameClear } from '@shared';

export function buildShareUrl(shareId: string): string {
  return `${window.location.origin}/share/${shareId}`;
}

type KakaoShareParams = {
  title: string;
  description: string;
  buttonTitle: string;
  shareUrl: string;
};

type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

export function formatElapsed(ms: number, language: SupportedLanguage): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(2);

  if (language === 'en') {
    return minutes > 0 ? `${minutes} min ${seconds} sec` : `${seconds} sec`;
  }

  if (language === 'ja') {
    return minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
  }

  if (language === 'zh') {
    return minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
  }

  return minutes > 0 ? `${minutes}분${seconds}초` : `${seconds}초`;
}

function copyWithExecCommand(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }

  return copied;
}

export async function copyShareText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 최신 API가 막히면 구형 복사 방식으로 대체합니다.
  }

  return copyWithExecCommand(text);
}

export async function shareKakao(params: KakaoShareParams): Promise<boolean> {
  try {
    const initialized = await initKakaoSdk();
    if (!initialized || !window.Kakao) return false;

    const imageUrl = new URL(gameClear, window.location.origin).toString();
    const shareLink = {
      mobileWebUrl: params.shareUrl,
      webUrl: params.shareUrl,
    };

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: params.title,
        description: params.description,
        imageUrl,
        link: shareLink,
      },
      buttons: [
        {
          title: params.buttonTitle,
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
