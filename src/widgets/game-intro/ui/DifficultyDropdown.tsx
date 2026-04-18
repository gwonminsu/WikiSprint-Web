import { useRef, useState } from 'react';
import { WidgetDropdown, useGameStore, useToast, useTranslation, type Difficulty } from '@shared';

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
  { value: 1, emoji: '🟢', labelKey: 'game.difficultyEasy', toastKey: 'game.difficultyEasyToast' },
  { value: 2, emoji: '🟡', labelKey: 'game.difficultyNormal', toastKey: 'game.difficultyNormalToast' },
  { value: 3, emoji: '🔴', labelKey: 'game.difficultyHard', toastKey: 'game.difficultyHardToast' },
];

type PanelState = 'open' | 'closing' | 'closed';

export function DifficultyDropdown(): React.ReactElement {
  const { t } = useTranslation();
  const toast = useToast();
  const difficulty = useGameStore((s) => s.difficulty);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const lastToastedRef = useRef<Difficulty | null>(null);
  const [panelState, setPanelState] = useState<PanelState>('closed');

  const currentItem = DIFFICULTY_ITEMS.find((item) => item.value === difficulty) ?? DIFFICULTY_ITEMS[0];

  const handleSelect = (item: DifficultyItem): void => {
    if (item.value !== difficulty) {
      setDifficulty(item.value);
    }

    if (lastToastedRef.current !== item.value) {
      toast.info(t(item.toastKey));
      lastToastedRef.current = item.value;
    }
  };

  const handleOpenChange = (open: boolean): void => {
    if (open) {
      setPanelState('open');
      return;
    }

    setPanelState('closing');
    window.setTimeout(() => setPanelState('closed'), 180);
  };

  return (
    <WidgetDropdown
      open={panelState === 'open'}
      forceMount={panelState === 'closing'}
      onOpenChange={handleOpenChange}
      align="end"
      sideOffset={6}
      contentClassName={`
        min-w-[140px]
        whitespace-nowrap
        bg-white dark:bg-gray-800
        border border-gray-150 dark:border-gray-700
        rounded-2xl
        shadow-xl shadow-black/10 dark:shadow-black/30
        p-1.5
        outline-none
        ${panelState === 'open' ? 'animate-dropdown-gravity-drop' : 'animate-dropdown-gravity-up'}
      `}
      trigger={(triggerProps) => (
        <button
          {...triggerProps}
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
      )}
    >
      {({ getItemProps }) => DIFFICULTY_ITEMS.map((item, index) => {
        const isSelected = item.value === difficulty;

        return (
          <button
            key={item.value}
            {...getItemProps({
              index,
              onSelect: () => handleSelect(item),
            })}
            className={`
              animate-dropdown-item-fade
              relative flex w-full items-center gap-2.5 px-3 py-2
              rounded-xl text-left text-sm font-medium
              cursor-pointer outline-none
              transition-colors duration-150
              ${isSelected
                ? 'bg-amber-50 dark:bg-amber-900/25 text-amber-700 dark:text-amber-300'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60'}
            `}
            style={{ animationDelay: `${0.055 * (index + 1)}s` }}
          >
            <span
              className={`
                w-1.5 h-1.5 rounded-full shrink-0
                transition-opacity duration-150
                ${isSelected ? 'bg-amber-400 opacity-100' : 'opacity-0'}
              `}
            />
            <span className="text-base leading-none">{item.emoji}</span>
            <span>{t(item.labelKey)}</span>
          </button>
        );
      })}
    </WidgetDropdown>
  );
}
