import { useRef, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useGameStore } from '@shared';
import type { Difficulty } from '@shared';
import { useToast } from '@shared';
import { useTranslation } from '@shared';

// 난이도 항목 정의
type DifficultyItem = {
  value: Difficulty;
  emoji: string;
  labelKey:
    | 'game.difficultyOmakase'
    | 'game.difficultyEasy'
    | 'game.difficultyNormal'
    | 'game.difficultyHard';
  toastKey:
    | 'game.difficultyOmakaseToast'
    | 'game.difficultyEasyToast'
    | 'game.difficultyNormalToast'
    | 'game.difficultyHardToast';
};

const DIFFICULTY_ITEMS: DifficultyItem[] = [
  { value: 0, emoji: '🎲', labelKey: 'game.difficultyOmakase', toastKey: 'game.difficultyOmakaseToast' },
  { value: 1, emoji: '🟢', labelKey: 'game.difficultyEasy',    toastKey: 'game.difficultyEasyToast' },
  { value: 2, emoji: '🟡', labelKey: 'game.difficultyNormal',  toastKey: 'game.difficultyNormalToast' },
  { value: 3, emoji: '🔴', labelKey: 'game.difficultyHard',    toastKey: 'game.difficultyHardToast' },
];

// 드롭다운이 열렸다 닫힐 때 애니메이션 클래스 결정용 상태
type PanelState = 'open' | 'closing' | 'closed';

export function DifficultyDropdown(): React.ReactElement {
  const { t } = useTranslation();
  const toast = useToast();
  const difficulty = useGameStore((s) => s.difficulty);
  const setDifficulty = useGameStore((s) => s.setDifficulty);

  // 마지막으로 토스트를 띄운 난이도 추적 (같은 난이도 재선택 시 토스트 비반복)
  const lastToastedRef = useRef<Difficulty | null>(null);
  const [panelState, setPanelState] = useState<PanelState>('closed');

  // 현재 선택된 항목 정보
  const currentItem = DIFFICULTY_ITEMS.find((item) => item.value === difficulty) ?? DIFFICULTY_ITEMS[0];

  // 난이도 선택 핸들러
  const handleSelect = (item: DifficultyItem): void => {
    if (item.value !== difficulty) {
      setDifficulty(item.value);
    }
    // 이전과 다른 난이도만 토스트 표시
    if (lastToastedRef.current !== item.value) {
      toast.info(t(item.toastKey));
      lastToastedRef.current = item.value;
    }
  };

  // 드롭다운 열림/닫힘 핸들러
  const handleOpenChange = (open: boolean): void => {
    if (open) {
      setPanelState('open');
    } else {
      // 닫힘 애니메이션 후 실제 닫기
      setPanelState('closing');
      setTimeout(() => setPanelState('closed'), 180);
    }
  };

  return (
    <DropdownMenu.Root
      onOpenChange={handleOpenChange}
      open={panelState !== 'closed'}
    >
      {/* 트리거 버튼 */}
      <DropdownMenu.Trigger asChild>
        <button
          className="
            inline-flex items-center gap-1.5 px-3 py-1.5
            bg-white/80 dark:bg-gray-700/70
            border border-gray-200 dark:border-gray-600
            rounded-xl
            text-sm font-medium text-gray-700 dark:text-gray-200
            shadow-sm
            hover:bg-white dark:hover:bg-gray-700
            hover:border-amber-300 dark:hover:border-amber-500
            hover:-translate-y-[1px]
            active:scale-[0.97]
            transition-all duration-200
            backdrop-blur-sm
            outline-none
            focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1
          "
          aria-label={t('game.currentDifficulty')}
        >
          <span>{currentItem.emoji}</span>
          <span>{t(currentItem.labelKey)}</span>
          {/* chevron 아이콘 */}
          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${panelState === 'open' ? 'rotate-180' : 'rotate-0'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      {/* 드롭다운 패널 */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={6}
          align="end"
          className={`
            z-50 min-w-[140px]
            bg-white dark:bg-gray-800
            border border-gray-150 dark:border-gray-700
            rounded-2xl
            shadow-xl shadow-black/10 dark:shadow-black/30
            p-1.5
            outline-none
            ${panelState === 'open' ? 'animate-dropdown-gravity-drop' : 'animate-dropdown-gravity-up'}
          `}
        >
          {DIFFICULTY_ITEMS.map((item, idx) => {
            const isSelected = item.value === difficulty;
            return (
              <DropdownMenu.Item
                key={item.value}
                className={`
                  animate-dropdown-item-fade
                  relative flex items-center gap-2.5 px-3 py-2
                  rounded-xl text-sm font-medium
                  cursor-pointer outline-none
                  transition-colors duration-150
                  ${isSelected
                    ? 'bg-amber-50 dark:bg-amber-900/25 text-amber-700 dark:text-amber-300'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60'}
                `}
                style={{ animationDelay: `${0.055 * (idx + 1)}s` }}
                onSelect={() => handleSelect(item)}
              >
                {/* 선택된 항목 표시 dot */}
                <span
                  className={`
                    w-1.5 h-1.5 rounded-full shrink-0
                    transition-opacity duration-150
                    ${isSelected ? 'bg-amber-400 opacity-100' : 'opacity-0'}
                  `}
                />
                <span className="text-base leading-none">{item.emoji}</span>
                <span>{t(item.labelKey)}</span>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
