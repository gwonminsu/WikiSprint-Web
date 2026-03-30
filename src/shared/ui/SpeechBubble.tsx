type Props = {
  text: string;
  isTyping: boolean;
  // 강조할 단어 (볼드 + 크기 업 + 색상)
  highlightWord?: string;
};

// 텍스트에서 highlightWord를 찾아 강조 렌더링
function renderTextWithHighlight(text: string, highlightWord: string): React.ReactNode {
  const index = text.indexOf(highlightWord);
  if (index === -1) return text;

  const before = text.slice(0, index);
  const after = text.slice(index + highlightWord.length);

  return (
    <>
      {before}
      <span className="font-bold text-base text-red-400">{highlightWord}</span>
      {after}
    </>
  );
}

// 말풍선 (텍스트 길이에 자동 맞춤)
export function SpeechBubble({ text, isTyping, highlightWord }: Props): React.ReactElement {
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
          whitespace-nowrap
          z-10
        "
      >
        {highlightWord ? renderTextWithHighlight(text, highlightWord) : text}
        {/* 타이핑 중 깜빡이는 커서 */}
        {isTyping && (
          <span className="animate-cursor-blink ml-0.5 inline-block w-0.5 h-4 bg-gray-700 dark:bg-gray-300 align-middle" />
        )}
      </div>

    </div>
  );
}
