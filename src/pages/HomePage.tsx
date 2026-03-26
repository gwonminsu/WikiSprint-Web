import { useState, useEffect } from 'react';
import { w } from '@widgets';
import { useAuthStore, useTranslation, getLogoByLanguage } from '@shared';

// 홈 게임 플로우 단계
type GamePhase = 'intro' | 'ready' | 'playing';

// WikiSprint 홈 페이지 — 인트로 페이드아웃 후 게임 플로우 진입
export default function HomePage(): React.ReactElement {
  const { accountInfo } = useAuthStore();
  const { language } = useTranslation();

  const [phase, setPhase] = useState<GamePhase>('intro');
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    // 0.5초 후 페이드아웃 시작 (로고가 잠깐 보이도록)
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 500);

    return () => clearTimeout(fadeTimer);
  }, []);

  // 페이드아웃 애니메이션 종료 시 ready 단계로 전환
  const handleFadeOutEnd = (): void => {
    if (isFadingOut) {
      setPhase('ready');
    }
  };

  const handleGameStart = (): void => {
    setPhase('playing');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <w.Header />

      {/* intro 단계 — 로고 + 인사 (페이드아웃) */}
      {phase === 'intro' && (
        <main
          className={`flex-1 flex flex-col items-center justify-center px-4 pb-20 ${isFadingOut ? 'animate-fade-out' : ''}`}
          onAnimationEnd={handleFadeOutEnd}
        >
          <div className="text-center">
            <img
              src={getLogoByLanguage(language)}
              alt="WikiSprint"
              className="h-16 mx-auto mb-2 object-contain"
            />
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              안녕하세요, {accountInfo?.nick ?? '게스트'}님
            </p>
            <div className="w-16 h-1 bg-primary rounded-full mx-auto opacity-30" />
          </div>
        </main>
      )}

      {/* CC BY-SA 출처 표시 — playing 단계에서만, 화면 하단 고정 */}
      {phase === 'playing' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-1.5 py-1 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            콘텐츠 출처:
          </span>
          <a
            href="https://ko.wikipedia.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-2 transition-colors"
          >
            Wikipedia
          </a>
          <span className="text-xs text-gray-400 dark:text-gray-500">(CC BY-SA 3.0)</span>
        </div>
      )}

      {/* ready/playing 단계 — talker + 말풍선 + Wikipedia 문서 */}
      {(phase === 'ready' || phase === 'playing') && (
        <w.GameIntroView phase={phase} onGameStart={handleGameStart} />
      )}

      {/* 소개 페이지 플로팅 버튼 — 항상 표시 */}
      <w.DocFloatingButton />
    </div>
  );
}
