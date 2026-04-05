import { useState, useRef, useCallback, useEffect } from 'react';
import {
  SpeechBubble,
  EmbossButton,
  SuccessOverlay,
  talkerStart,
  talkerFinger,
  talkerIdle,
  talkerYawn,
  talkerSleep,
  talkerGood,
  talkerOk,
  talkerLate,
  talkerWarn,
  useTranslation,
  useGameStore,
  useToast,
} from '@shared';
import { getRandomArticle, getArticleHtml, getRandomTargetWord, useGameRecord } from '@features';
import { useTypewriter, useGameTimer } from '../lib';

// SpeechBubble에 전달하는 하이라이트 항목 타입
type HighlightItem = {
  word: string;
  color: 'red' | 'blue';
};

// Wikipedia HTML에서 브라우저에 영향을 주는 태그 제거 + redlink 비활성화 처리
function sanitizeWikiHtml(html: string): string {
  // 기본 태그 정제
  const cleaned = html
    .replace(/<base[^>]*>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');

  // DOMParser로 파싱 후 redlink 앵커에 wiki-redlink 클래스 부여 + href 제거
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, 'text/html');
  const anchors = doc.querySelectorAll('a');
  
  anchors.forEach((anchor: HTMLAnchorElement) => {
    const href = anchor.getAttribute('href') ?? '';
    const isRed =
      anchor.classList.contains('new') ||
      href.includes('redlink=1') ||
      href.includes('action=edit');
    const isInternalWikiLink =
      href.startsWith('./') ||
      href.startsWith('/wiki/') ||
      href.startsWith('#');
    const isExternal = href !== '' && !isInternalWikiLink;

    if (isRed) {
      // redlink: 클릭 불가 텍스트로 변환 (href 제거, data 속성 및 클래스 추가)
      anchor.removeAttribute('href');
      anchor.setAttribute('data-redlink', 'true');
      anchor.classList.add('wiki-redlink');
      return;
    }
    if (isExternal) {
      anchor.removeAttribute('href');
      anchor.setAttribute('data-external-link', 'true');
      anchor.classList.add('wiki-external-link-disabled');
    }
  });

  // 직렬화하여 반환 (<body> 내부만 추출)
  return doc.body.innerHTML;
}

// 위키피디아 문서 링크 클릭 시 제목 추출
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

// 제시어와 문서 제목 비교를 위한 정규화 (대소문자, 밑줄, 공백 무시)
function normalizeTitle(title: string): string {
  return decodeURIComponent(title).trim().toLowerCase().replace(/_/g, ' ');
}

// 경과 시간 기반 talker 이미지 반환 (문서 이동 성공 시)
function getTalkerByElapsedMs(ms: number): string {
  if (ms < 2 * 60000) return talkerIdle;
  if (ms < 5 * 60000) return talkerFinger;
  if (ms < 10 * 60000) return talkerYawn;
  return talkerSleep;
}

// 클리어 시간 기반 talker 이미지 반환
function getWinTalker(ms: number): string {
  if (ms < 2 * 60000) return talkerGood;
  if (ms < 10 * 60000) return talkerOk;
  return talkerLate;
}

// 경과 밀리초를 \"n분 nn.nn초\" 형식으로 변환 (winMessage 치환용)
function formatWinTime(ms: number): { minutes: number; seconds: string } {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(2).padStart(5, '0');
  return { minutes, seconds };
}

// 타이머 표시 전용 컴포넌트 — 100ms 리렌더를 이 컴포넌트 내부로만 격리
function TimerDisplay(): React.ReactElement {
  const { formattedTime, timerColorClass } = useGameTimer();
  return (
    <div className={`text-lg font-mono font-bold tabular-nums shrink-0 ${timerColorClass}`}>
      {formattedTime}
    </div>
  );
}

// 홈 게임 플로우 위젯 — Wikipedia API 기반 문서 렌더링 + 게임 핵심 시스템
export function GameIntroView(): React.ReactElement {
  const { t, language } = useTranslation();
  const toast = useToast();
  const articleRef = useRef<HTMLDivElement>(null);
  const { startRecord, updatePath, completeRecord, abandonRecord } = useGameRecord();

  // 자주 바뀌지 않는 값만 React 구독 (re-render 최소화)
  // elapsedMs는 구독하지 않음 — 마일스톤 체크는 1초 인터벌에서 getState()로 처리
  const phase = useGameStore((s) => s.phase);
  const targetWord = useGameStore((s) => s.targetWord);
  const setPhase = useGameStore((s) => s.setPhase);
  const startGame = useGameStore((s) => s.startGame);
  const navigateToDoc = useGameStore((s) => s.navigateToDoc);
  const completeGame = useGameStore((s) => s.completeGame);
  const resetGame = useGameStore((s) => s.resetGame);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [articleHtml, setArticleHtml] = useState<string>('');
  // 성공 오버레이 표시 여부
  const [showSuccessOverlay, setShowSuccessOverlay] = useState<boolean>(false);

  // 현재 말풍선 텍스트 (플레이스홀더 치환 완료)
  const [speechText, setSpeechText] = useState<string>('');
  // 현재 말풍선 하이라이트
  const [speechHighlights, setSpeechHighlights] = useState<HighlightItem[]>([]);
  // 현재 talker 이미지
  const [currentTalkerImage, setCurrentTalkerImage] = useState<string>(talkerStart);

  // 이미 표시한 타이머 마일스톤 추적 (재트리거 방지)
  const shownMilestones = useRef<Set<number>>(new Set());

  // ready 상태 말풍선 텍스트
  const readyText = t('game.readyMessage');
  // playing/completed 상태에서는 speechText 기반 typewriter (빠른 속도 30ms)
  const activeText = (phase === 'ready' || phase === 'intro') ? readyText : speechText;
  const { displayedText, isTyping } = useTypewriter(activeText, phase === 'ready' ? 60 : 30);

  // 마운트 시 크래시 복구 — 이전 게임이 비정상 종료되었으면 자동 포기 처리
  useEffect(() => {
    const { phase: storedPhase } = useGameStore.getState();
    if (storedPhase === 'playing') {
      abandonRecord();
      resetGame();
      toast.info(t('game.autoClosed'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 타이머 마일스톤 감시 — 1초 간격 인터벌에서 getState()로 체크 (elapsedMs 구독 없이)
  useEffect(() => {
    if (phase !== 'playing') return;

    type MilestoneEntry = {
      threshold: number;
      key: 'game.timer2min' | 'game.timer5min' | 'game.timer10min';
      image: string;
    };
    const milestones: MilestoneEntry[] = [
      { threshold: 2 * 60000, key: 'game.timer2min', image: talkerFinger },
      { threshold: 5 * 60000, key: 'game.timer5min', image: talkerYawn },
      { threshold: 10 * 60000, key: 'game.timer10min', image: talkerSleep },
    ];

    const interval = setInterval(() => {
      const { elapsedMs, isTimerRunning } = useGameStore.getState();
      if (!isTimerRunning) return;

      for (const milestone of milestones) {
        if (elapsedMs >= milestone.threshold && !shownMilestones.current.has(milestone.threshold)) {
          shownMilestones.current.add(milestone.threshold);
          const text = t(milestone.key).replace('???', targetWord);
          setSpeechText(text);
          setSpeechHighlights([{ word: targetWord, color: 'red' }]);
          setCurrentTalkerImage(milestone.image);
          break; // 한 번에 하나의 마일스톤만 처리
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, targetWord, t]);

  // 문서 내 링크 클릭 이벤트 위임
  // — elapsedMs/navigationHistory는 클릭 시 getState()로 최신값 가져옴 (useCallback 재생성 방지)
  const handleArticleClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>): Promise<void> => {
    // 클리어 후에는 링크 클릭 비활성화
    if (phase === 'completed') return;

    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;

    // 모든 링크 기본 동작 차단 (외부 이동 방지)
    e.preventDefault();

    // data-redlink 속성이 있으면 존재하지 않는 문서 — 전용 안내 말풍선
    if (anchor.hasAttribute('data-redlink')) {
      const redlinkText = t('game.redlinkMessage').replace('???', targetWord);
      setSpeechText(redlinkText);
      setSpeechHighlights([{ word: targetWord, color: 'red' }]);
      setCurrentTalkerImage(talkerWarn);
      return;
    }
    // 외부 링크 비활성화 안내
    if (anchor.hasAttribute('data-external-link')) {
      const warnText = t('game.externalLinkMessage').replace('???', targetWord);
      setSpeechText(warnText);
      setSpeechHighlights([{ word: targetWord, color: 'red' }]);
      setCurrentTalkerImage(talkerWarn);
      return;
    }

    const href = anchor.getAttribute('href');
    if (!href) return;

    const title = extractTitleFromHref(href);
    if (!title) return;

    setIsLoading(true);
    try {
      const html = await getArticleHtml(title, language);
      const sanitizedHtml = sanitizeWikiHtml(html);
      setArticleHtml(sanitizedHtml);

      // 페이지 + 문서 영역 스크롤 최상단으로
      window.scrollTo({ top: 0, behavior: 'smooth' });
      articleRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

      // 클릭 시점의 최신 상태를 스토어에서 직접 조회 (stale closure 방지)
      const { elapsedMs: currentElapsedMs, navigationHistory } = useGameStore.getState();

      // 제시어 도달 여부 확인 (대소문자, 밑줄 무시)
      const isTargetReached = normalizeTitle(title) === normalizeTitle(targetWord);

      if (isTargetReached) {
        // 클리어 처리
        navigateToDoc(title);
        completeGame();
        const fullHistory = [...navigationHistory, title];
        // 전적 클리어 처리 — fire-and-forget
        completeRecord(fullHistory, currentElapsedMs);
        // 성공 오버레이 표시
        setShowSuccessOverlay(true);

        const winTalker = getWinTalker(currentElapsedMs);
        const { minutes, seconds } = formatWinTime(currentElapsedMs);
        const winText = t('game.winMessage')
          .replace('???', targetWord)
          .replace('@분', `${minutes}분`)
          .replace('@@.@@초', `${seconds}초`);

        setSpeechText(winText);
        setSpeechHighlights([{ word: targetWord, color: 'red' }]);
        setCurrentTalkerImage(winTalker);

        // 방문 경로 콘솔 출력 (시작 문서 → ... → 제시어 문서)
        console.log(`제시어-${targetWord}, ${fullHistory.join(' -> ')}`);
      } else {
        // 일반 문서 이동 — 경로 갱신 + talker 업데이트
        navigateToDoc(title);
        // 서버 경로 업데이트 (디바운스 적용)
        updatePath([...navigationHistory, title], title);

        const talkerImg = getTalkerByElapsedMs(currentElapsedMs);
        const navigatedText = t('game.navigatedMessage')
          .replace('???', targetWord)
          .replace('@@@', title);

        setSpeechText(navigatedText);
        setSpeechHighlights([
          { word: targetWord, color: 'red' },
          { word: title, color: 'blue' },
        ]);
        setCurrentTalkerImage(talkerImg);
      }
    } catch {
      // API 호출 실패 시 (빨간 링크 등) — 경고 말풍선으로 안전하게 처리
      const warnText = t('game.externalLinkMessage').replace('???', targetWord);
      setSpeechText(warnText);
      setSpeechHighlights([{ word: targetWord, color: 'red' }]);
      setCurrentTalkerImage(talkerWarn);
    } finally {
      setIsLoading(false);
    }
  }, [language, phase, targetWord, navigateToDoc, completeGame, completeRecord, updatePath, t]);

  // 게임 시작 — DB에서 제시어 가져온 후 랜덤 시작 문서 fetch
  const handleGameStart = async (): Promise<void> => {
    setIsLoading(true);
    // 마일스톤 초기화
    shownMilestones.current = new Set();
    try {
      const targetWordData = await getRandomTargetWord(language);
      const word = targetWordData.word;

      // 시작 문서는 제시어와 관계없는 랜덤 문서
      const summary = await getRandomArticle(language);
      const html = await getArticleHtml(summary.title, language);
      setArticleHtml(sanitizeWikiHtml(html));

      // 서버에 in_progress 전적 생성 후 recordId를 스토어에 저장
      const recordId = await startRecord(word, summary.title);

      // 게임 시작: 스토어 초기화 + 타이머 시작 (recordId 포함)
      startGame(word, summary.title, recordId);

      // 초기 말풍선 설정
      const initialText = t('game.playingMessage').replace('???', word);
      setSpeechText(initialText);
      setSpeechHighlights([{ word, color: 'red' }]);
      setCurrentTalkerImage(talkerFinger);
    } catch {
      // 게임 시작 실패 (타임아웃, 네트워크 오류 등) — 토스트 알림
      toast.error(t('game.startError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* 목적지 도달 성공 오버레이 */}
      <SuccessOverlay
        isVisible={showSuccessOverlay}
        text={t('game.successOverlayText')}
        onAnimationEnd={() => setShowSuccessOverlay(false)}
      />

      {/* ── ready 상태: 화면 중앙 배치 ── */}
      {phase === 'ready' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 pb-8">
          {/* 말풍선 */}
          <SpeechBubble text={displayedText} isTyping={isTyping} />

          {/* talker + 게임 시작 버튼 */}
          <div className="flex justify-center items-center gap-4">
            <img
              src={talkerStart}
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

      {/* ── playing / completed 상태: talker 상단 고정 + 문서 영역 ── */}
      {(phase === 'playing' || phase === 'completed') && (
        <div className="flex flex-col flex-1">
          {/* talker + 말풍선 + 타이머 — sticky 상단 고정 */}
          <div className="sticky top-14 z-20 flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <img
              src={currentTalkerImage}
              alt="talker"
              className="w-16 h-16 min-w-16 min-h-16 object-contain shrink-0"
            />
            <div className="flex-1 min-w-0">
              <SpeechBubble
                text={displayedText}
                isTyping={isTyping}
                highlights={speechHighlights}
              />
            </div>
            {/* completed 상태: "결과 확인" 버튼 / playing 상태: 타이머 표시 */}
            {phase === 'completed' ? (
              <EmbossButton
                onClick={() => setPhase('result')}
                variant="primary"
                className="px-4 h-10 text-sm shrink-0"
              >
                {t('game.resultButton')}
              </EmbossButton>
            ) : (
              <TimerDisplay />
            )}
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
