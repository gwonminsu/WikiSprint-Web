import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

// 아코디언(드롭다운) 컴포넌트 — DocPage 상세 설명 섹션용
export function Accordion({ title, children, defaultOpen = false }: Props): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  // 콘텐츠 높이 측정
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  const handleToggle = (): void => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* 헤더 버튼 */}
      <button
        type="button"
        onClick={handleToggle}
        className="
          w-full flex items-center justify-between
          px-5 py-4
          bg-white dark:bg-gray-800
          hover:bg-gray-50 dark:hover:bg-gray-750
          transition-colors duration-200
          text-left
        "
      >
        <span className="font-semibold text-gray-800 dark:text-gray-100">{title}</span>
        {/* 쉐브론 아이콘 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 콘텐츠 영역 — max-height 트랜지션 */}
      <div
        style={{ maxHeight: isOpen ? `${contentHeight}px` : '0px' }}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
      >
        <div ref={contentRef} className="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}
