import { useState, useRef, useCallback, useEffect } from 'react';
import DOMPurify from 'dompurify';
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
import { DifficultyDropdown } from './DifficultyDropdown';

// SpeechBubble에 전달하는 하이라이트 항목 타입
type HighlightItem = {
  word: string;
  color: 'red' | 'blue';
};

// 문서 제목 → sanitized HTML 프론트엔드 캐시 (세션 내 재방문 시 DOMParser 재실행 방지)
// Map은 삽입 순서를 유지하므로, 최대 크기 초과 시 가장 먼저 삽입된 항목을 제거하는 FIFO 방식 사용
const sanitizedHtmlCache = new Map<string, string>();
const MAX_HTML_CACHE_SIZE = 50;

function setCachedHtml(key: string, value: string): void {
  if (sanitizedHtmlCache.size >= MAX_HTML_CACHE_SIZE) {
    const firstKey = sanitizedHtmlCache.keys().next().value;
    if (firstKey !== undefined) sanitizedHtmlCache.delete(firstKey);
  }
  sanitizedHtmlCache.set(key, value);
}

// Wikipedia HTML에서 브라우저에 영향을 주는 태그 제거 + redlink 비활성화 처리
function sanitizeWikiHtml(html: string, cacheKey?: string): string {
  if (cacheKey) {
    const cached = sanitizedHtmlCache.get(cacheKey);
    if (cached !== undefined) return cached;
  }
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

  // 이미지 lazy loading — 대형 문서에서 초기 렌더링 부담 감소
  doc.querySelectorAll('img').forEach((img: HTMLImageElement) => {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  });

  // Wikipedia 메타데이터/네비게이션 요소 제거 (문서 콘텐츠 섹션 아님, DOM 노드만 낭비)
  const metaSelectors = [
    '.navbox', '.navbox-inner', '.navbox-subgroup',  // 하단 네비게이션 박스
    '.authority-control',                              // 전거 통제
    '.sistersitebox',                                  // 자매 사이트 박스
    '.mbox-small', '.ambox', '.tmbox', '.ombox',       // 알림 박스
    '.metadata',                                       // 메타데이터 박스
    '.printfooter',                                    // 인쇄 푸터
  ];
  doc.querySelectorAll(metaSelectors.join(', ')).forEach((el: Element) => el.remove());

  // 직렬화 후 DOMPurify로 최종 XSS 방어 (script, iframe, onerror 등 악성 태그/속성 제거)
  const sanitized = DOMPurify.sanitize(doc.body.innerHTML, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout'],
  });
  if (cacheKey) setCachedHtml(cacheKey, sanitized);
  return sanitized;
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
  const difficulty = useGameStore((s) => s.difficulty);
  const setPhase = useGameStore((s) => s.setPhase);
  const startGame = useGameStore((s) => s.startGame);
  const navigateToDoc = useGameStore((s) => s.navigateToDoc);
  const completeGame = useGameStore((s) => s.completeGame);
  const resetGame = useGameStore((s) => s.resetGame);
  const setDifficulty = useGameStore((s) => s.setDifficulty);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [articleHtml, setArticleHtml] = useState<string>('');
  // 성공 오버레이 표시 여부
  const [showSuccessOverlay, setShowSuccessOverlay] = useState<boolean>(false);
  // 링크 없는 문서 진입 시 뒤로가기 버튼 표시 여부
  const [showBackButton, setShowBackButton] = useState<boolean>(false);

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

  // 문서 로드 후 이동 가능한 링크가 없으면 talkerFinger + 뒤로가기 버튼 표시
  useEffect(() => {
    if (phase !== 'playing') return;
    if (!articleHtml) return;

    // DOM 렌더 완료 후 카운트
    const rafId = requestAnimationFrame(() => {
      const root = articleRef.current;
      if (!root) return;
      const navigableCount = root.querySelectorAll(
        'a[href]:not([data-redlink]):not([data-external-link])'
      ).length;
      if (navigableCount === 0) {
        const { navigationHistory } = useGameStore.getState();
        const text = t('game.noLinksMessage').replace('???', targetWord);
        setSpeechText(text);
        setSpeechHighlights([{ word: targetWord, color: 'red' }]);
        setCurrentTalkerImage(talkerFinger);
        setShowBackButton(navigationHistory.length > 1);
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [articleHtml, phase, targetWord, t]);

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

    // bare #fragment 앵커 이동 (목차 등)
    if (href.startsWith('#')) {
      const fragment = decodeURIComponent(href.slice(1));
      articleRef.current?.querySelector(`[id="${CSS.escape(fragment)}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const rawTitle = extractTitleFromHref(href);
    if (!rawTitle) return;

    // ./Title#fragment 형태에서 fragment 분리
    const hashIdx = rawTitle.indexOf('#');
    const title = hashIdx !== -1 ? rawTitle.slice(0, hashIdx) : rawTitle;
    const fragment = hashIdx !== -1 ? rawTitle.slice(hashIdx + 1) : null;

    // fragment만 있고 같은 문서 내 이동 (각주 역방향 포함)
    if (fragment !== null && title === '') {
      articleRef.current?.querySelector(`[id="${CSS.escape(fragment)}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // fragment가 있어도 title이 있으면 → title로 이동 후 fragment 스크롤
    // fragment만 있는 경우(각주 등)는 API 호출 없이 스크롤만
    if (fragment !== null) {
      // 현재 문서와 같은 문서인지 확인 — 같으면 스크롤만
      const { navigationHistory } = useGameStore.getState();
      const currentDoc = navigationHistory[navigationHistory.length - 1] ?? '';
      if (normalizeTitle(title) === normalizeTitle(currentDoc)) {
        articleRef.current?.querySelector(`[id="${CSS.escape(fragment)}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      // 다른 문서 + fragment → 문서만 이동 (fragment는 무시)
    }

    setIsLoading(true);
    try {
      const html = await getArticleHtml(title, language);
      const sanitizedHtml = sanitizeWikiHtml(html, `${language}:${title}`);
      setArticleHtml(sanitizedHtml);
      // 새 문서로 이동했으므로 뒤로가기 버튼 초기화 (링크 없음 useEffect가 재판단)
      setShowBackButton(false);

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
      // API 호출 실패 시 (타임아웃, 네트워크 오류 등) — 일시적 오류 말풍선으로 안내
      const warnText = t('game.fetchErrorMessage').replace('???', targetWord);
      setSpeechText(warnText);
      setSpeechHighlights([{ word: targetWord, color: 'red' }]);
      setCurrentTalkerImage(talkerWarn);
    } finally {
      setIsLoading(false);
    }
  }, [language, phase, targetWord, navigateToDoc, completeGame, completeRecord, updatePath, t]);

  // 뒤로가기 버튼 클릭 — 직전 문서로 복귀하고 talker를 경과시간 기반 이미지로 재설정
  const handleGoBack = useCallback(async (): Promise<void> => {
    const { navigationHistory, elapsedMs } = useGameStore.getState();
    if (navigationHistory.length <= 1) return;

    const prevHistory = navigationHistory.slice(0, -1);
    const prevTitle = prevHistory[prevHistory.length - 1];
    setIsLoading(true);
    try {
      const html = await getArticleHtml(prevTitle, language);
      setArticleHtml(sanitizeWikiHtml(html, `${language}:${prevTitle}`));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      articleRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

      // 스토어 히스토리에서 마지막 항목 제거
      useGameStore.getState().popDoc();
      updatePath(prevHistory, prevTitle);

      // 이전 문서 도착 시 표시되었어야 할 말풍선·talker 복원
      const navigatedText = t('game.navigatedMessage')
        .replace('???', targetWord)
        .replace('@@@', prevTitle);
      setSpeechText(navigatedText);
      setSpeechHighlights([
        { word: targetWord, color: 'red' },
        { word: prevTitle, color: 'blue' },
      ]);
      setCurrentTalkerImage(getTalkerByElapsedMs(elapsedMs));
      setShowBackButton(false);
    } catch {
      const warnText = t('game.fetchErrorMessage').replace('???', targetWord);
      setSpeechText(warnText);
      setSpeechHighlights([{ word: targetWord, color: 'red' }]);
      setCurrentTalkerImage(talkerWarn);
    } finally {
      setIsLoading(false);
    }
  }, [language, targetWord, updatePath, t]);

  // 게임 시작 — DB에서 제시어 가져온 후 랜덤 시작 문서 fetch
  const handleGameStart = async (): Promise<void> => {
    setIsLoading(true);
    // 마일스톤·뒤로가기 버튼 초기화
    shownMilestones.current = new Set();
    setShowBackButton(false);
    try {
      // 선택된 난이도 파라미터 결정 (오마카세=0이면 파라미터 미전송)
      const { difficulty: currentDifficulty } = useGameStore.getState();
      const difficultyParam = currentDifficulty === 0 ? undefined : currentDifficulty;

      let targetWordData = await getRandomTargetWord(language, difficultyParam);
      // 선택한 난이도에 제시어가 없으면 오마카세로 자동 전환
      if (!targetWordData) {
        toast.warning(t('game.difficultyNoWord'));
        setDifficulty(0);
        targetWordData = await getRandomTargetWord(language);
      }
      const word = targetWordData.word;

      // 시작 문서는 제시어와 관계없는 랜덤 문서
      const summary = await getRandomArticle(language);
      const html = await getArticleHtml(summary.title, language);
      setArticleHtml(sanitizeWikiHtml(html, `${language}:${summary.title}`));

      // 서버에 in_progress 전적 생성 후 recordId를 스토어에 저장
      const recordId = await startRecord(word, summary.title);

      // 게임 시작: 스토어 초기화 + 타이머 시작 (recordId 포함)
      startGame(word, summary.title, recordId);

      // 초기 말풍선 설정
      const initialText = t('game.playingMessage').replace('???', word);
      setSpeechText(initialText);
      setSpeechHighlights([{ word, color: 'red' }]);
      setCurrentTalkerImage(talkerIdle);
    } catch (err) {
      // 404: 해당 난이도에 제시어 없음 — 오마카세로 전환 후 재시도
      const isNotFound = err instanceof Error && err.message.includes('404');
      if (isNotFound) {
        toast.warning(t('game.difficultyNoWord'));
        setDifficulty(0);
        try {
          const fallbackData = await getRandomTargetWord(language);
          const word = fallbackData.word;
          const summary = await getRandomArticle(language);
          const html = await getArticleHtml(summary.title, language);
          setArticleHtml(sanitizeWikiHtml(html, `${language}:${summary.title}`));
          const recordId = await startRecord(word, summary.title);
          startGame(word, summary.title, recordId);
          const initialText = t('game.playingMessage').replace('???', word);
          setSpeechText(initialText);
          setSpeechHighlights([{ word, color: 'red' }]);
          setCurrentTalkerImage(talkerFinger);
          return;
        } catch {
          // 오마카세 폴백도 실패
        }
      }
      // 그 외 게임 시작 실패 (타임아웃, 네트워크 오류 등) — 토스트 알림
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
        <div className="relative flex-1 flex flex-col items-center justify-center gap-6 px-4 pb-8">
          {/* 난이도 선택 드롭다운 (우상단 배치) */}
          <div className="absolute top-4 right-4">
            <p className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300 truncate">난이도 선택</p>
            <DifficultyDropdown />
          </div>

          {/* 현재 난이도 pill 태그 (말풍선 바로 위) */}
          <div className="flex items-center gap-1.5 -mt-3">
            {difficulty === 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                🎲 {t('game.difficultyOmakase')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                {difficulty === 1 ? '🟢' : difficulty === 2 ? '🟡' : '🔴'}
                {' '}{t('game.currentDifficulty')}: {t(
                  difficulty === 1 ? 'game.difficultyEasy' :
                  difficulty === 2 ? 'game.difficultyNormal' :
                  'game.difficultyHard'
                )}
              </span>
            )}
          </div>

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
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <SpeechBubble
                text={displayedText}
                isTyping={isTyping}
                highlights={speechHighlights}
              />
              {/* 링크 없는 문서 진입 시 뒤로가기 버튼 */}
              {showBackButton && (
                <button
                  type="button"
                  onClick={handleGoBack}
                  aria-label={t('game.goBack')}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
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
