import { useState, useRef, useCallback } from 'react';
import { SpeechBubble, EmbossButton, talkerStart, talkerFinger, useTranslation } from '@shared';
import { getRandomArticle, getArticleHtml, getRandomTargetWord } from '@features';
import { useTypewriter } from '../lib';

type GamePhase = 'ready' | 'playing';

type Props = {
  phase: GamePhase;
  onGameStart: () => void;
};

// Wikipedia HTML에서 브라우저에 영향을 주는 태그 제거
function sanitizeWikiHtml(html: string): string {
  return html
    .replace(/<base[^>]*>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
}

// 위키피디아 문서 타이틀에서 링크 클릭 시 제목 추출
function extractTitleFromHref(href: string): string | null {
  // ./제목 형태의 위키 내부 링크
  if (href.startsWith('./')) {
    return decodeURIComponent(href.slice(2));
  }
  // /wiki/제목 형태
  const wikiMatch = href.match(/\/wiki\/([^#?]+)/);
  if (wikiMatch) {
    return decodeURIComponent(wikiMatch[1]);
  }
  return null;
}

// 홈 게임 플로우 위젯 — Wikipedia API 기반 문서 렌더링
export function GameIntroView({ phase, onGameStart }: Props): React.ReactElement {
  const { t } = useTranslation();
  const articleRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 제시어 — 게임 시작 시 고정, 클리어까지 변경하지 않음
  const [targetWord, setTargetWord] = useState<string>('');
  const [articleHtml, setArticleHtml] = useState<string>('');

  // 페이즈별 말풍선 텍스트
  const readyText = t('game.readyMessage');
  const playingText = targetWord
    ? t('game.playingMessage').replace('???', targetWord)
    : t('game.playingMessage');

  const speechText = phase === 'ready' ? readyText : playingText;
  const { displayedText, isTyping } = useTypewriter(speechText);

  // 문서 내 링크 클릭 이벤트 위임
  const handleArticleClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;

    // 모든 링크 기본 동작 차단 (외부 이동 방지)
    e.preventDefault();

    const href = anchor.getAttribute('href');
    if (!href) return;

    const title = extractTitleFromHref(href);
    // 위키 내부 링크가 아니면 무시
    if (!title) return;

    setIsLoading(true);
    try {
      const html = await getArticleHtml(title);
      // 제시어는 변경하지 않고 문서 HTML만 업데이트
      setArticleHtml(sanitizeWikiHtml(html));
      // 문서 영역 스크롤 최상단으로
      articleRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 게임 시작 — DB에서 제시어 가져온 후 랜덤 시작 문서 fetch
  const handleGameStart = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // DB에서 랜덤 제시어 조회
      const targetWordData = await getRandomTargetWord();
      setTargetWord(targetWordData.word);

      // 시작 문서는 제시어와 관계없는 랜덤 문서
      const summary = await getRandomArticle();
      const html = await getArticleHtml(summary.title);
      setArticleHtml(sanitizeWikiHtml(html));
      onGameStart();
    } finally {
      setIsLoading(false);
    }
  };

  // 페이즈별 talker 이미지
  const talkerImage = phase === 'ready' ? talkerStart : talkerFinger;

  return (
    <div className="flex flex-col flex-1">

      {/* ── ready 상태: 화면 중앙 배치 ── */}
      {phase === 'ready' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 pb-8">
          {/* 말풍선 */}
          <SpeechBubble text={displayedText} isTyping={isTyping} />

          {/* talker + 게임 시작 버튼 */}
          <div className="flex justify-center items-center gap-4">
            <img
              src={talkerImage}
              alt="talker"
              className="w-28 h-28 object-contain shrink-0"
            />
            <EmbossButton
              onClick={handleGameStart}
              variant="primary"
              className="px-8 h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? '⏳ 로딩 중...' : `${t('game.startButton')}`}
            </EmbossButton>
          </div>
        </div>
      )}

      {/* ── playing 상태: talker 상단 고정 + 문서 영역 ── */}
      {phase === 'playing' && (
        <div className="flex flex-col flex-1">
          {/* talker + 말풍선 — sticky 상단 고정 */}
          <div className="sticky top-14 z-20 flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <img
              src={talkerImage}
              alt="talker"
              className="w-16 h-16 min-w-16 min-h-16 object-contain shrink-0"
            />
            <div className="flex-1 min-w-0">
              <SpeechBubble text={displayedText} isTyping={isTyping} highlightWord={targetWord} />
            </div>
          </div>

          {/* 위키피디아 문서 렌더링 영역 */}
          <div
            ref={articleRef}
            className="flex-1 overflow-y-auto px-4 py-4 pb-10 bg-white dark:bg-gray-900"
            onClick={handleArticleClick}
          >
            <div className="relative">
              {/* 로딩 시 기존 문서 위에 오버레이 (깜빡임 방지) */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10 min-h-40">
                  <span className="text-lg text-gray-500">⏳ 문서를 불러오는 중...</span>
                </div>
              )}
              {articleHtml && (
                <div
                  className="wiki-article prose dark:prose-invert max-w-none"
                  // Wikipedia HTML 렌더링
                  dangerouslySetInnerHTML={{ __html: articleHtml }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
