import { useState, useEffect } from 'react';

type TypewriterResult = {
  displayedText: string;
  isTyping: boolean;
};

// 타자기 효과 훅 — 텍스트를 한 글자씩 순차적으로 표시
export function useTypewriter(text: string, speed: number = 60): TypewriterResult {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);

  useEffect(() => {
    // text 변경 시 초기화
    setDisplayedText('');
    setIsTyping(true);

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isTyping };
}
