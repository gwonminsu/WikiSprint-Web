// 하이라이트 항목 타입
type HighlightItem = {
  word: string;
  color: 'red' | 'blue';
};

type Props = {
  text: string;
  isTyping: boolean;
  // 단일 강조 (하위 호환 — 빨간색)
  highlightWord?: string;
  // 다중 색상 강조 (새로운)
  highlights?: HighlightItem[];
};

// 색상별 Tailwind 클래스 맵
const colorClassMap: Record<HighlightItem['color'], string> = {
  red: 'font-bold text-base text-red-400',
  blue: 'font-bold text-base text-blue-500',
};

// 텍스트에서 여러 하이라이트 단어를 찾아 각각 다른 색상으로 렌더링
function renderTextWithHighlights(text: string, highlights: HighlightItem[]): React.ReactNode {
  // 유효한 하이라이트만 필터링 (빈 단어 제외)
  const validHighlights = highlights.filter((h) => h.word.length > 0);
  if (validHighlights.length === 0) return text;

  // 텍스트에서 각 하이라이트 위치를 찾아 정렬
  type MatchEntry = { index: number; length: number; color: HighlightItem['color'] };
  const matches: MatchEntry[] = [];

  for (const { word, color } of validHighlights) {
    let searchFrom = 0;
    while (searchFrom < text.length) {
      const idx = text.indexOf(word, searchFrom);
      if (idx === -1) break;
      matches.push({ index: idx, length: word.length, color });
      searchFrom = idx + word.length;
    }
  }

  if (matches.length === 0) return text;

  // 위치 순서로 정렬 (같은 위치면 긴 매칭 우선 — 문서 제목이 제시어를 포함할 때 긴 쪽이 먼저 처리되어야 함)
  matches.sort((a, b) => a.index - b.index || b.length - a.length);

  // 결과 노드 배열 구성
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of matches) {
    // 겹치는 매칭 건너뜀
    if (match.index < cursor) continue;

    // 이전 텍스트 조각
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    // 하이라이트 스팬
    const word = text.slice(match.index, match.index + match.length);
    nodes.push(
      <span key={`${match.index}-${word}`} className={colorClassMap[match.color]}>
        {word}
      </span>
    );

    cursor = match.index + match.length;
  }

  // 남은 텍스트
  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return <>{nodes}</>;
}

// 말풍선 (텍스트 길이에 자동 맞춤)
export function SpeechBubble({ text, isTyping, highlightWord, highlights }: Props): React.ReactElement {
  // 하이라이트 목록 결정: highlights prop 우선, 없으면 highlightWord → red 변환
  const resolvedHighlights: HighlightItem[] = highlights
    ?? (highlightWord ? [{ word: highlightWord, color: 'red' }] : []);

  return (
    <div className="relative inline-flex flex-col">
      {/* 말풍선 본체 */}
      <div
        className="
          relative
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-600
          rounded-2xl
          px-5 py-3
          shadow-lg shadow-black/10 dark:shadow-black/30
          text-gray-800 dark:text-gray-100
          text-sm font-medium
          z-10
        "
      >
        {resolvedHighlights.length > 0
          ? renderTextWithHighlights(text, resolvedHighlights)
          : text}
        {/* 타이핑 중 깜빡이는 커서 */}
        {isTyping && (
          <span className="animate-cursor-blink ml-0.5 inline-block w-0.5 h-4 bg-gray-700 dark:bg-gray-300 align-middle" />
        )}
      </div>
    </div>
  );
}
