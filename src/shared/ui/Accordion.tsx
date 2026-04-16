import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../lib';

type Props = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  id?: string;
  isOpen?: boolean;
  onOpenChange?: (nextOpen: boolean) => void;
  subtitle?: string;
  icon?: ReactNode;
  contentClassName?: string;
  keepMounted?: boolean;
};

// 아코디언(드롭다운) 컴포넌트 — 문서/설명 섹션 공용
export function Accordion({
  title,
  children,
  defaultOpen = false,
  id,
  isOpen,
  onOpenChange,
  subtitle,
  icon,
  contentClassName,
  keepMounted = true,
}: Props): React.ReactElement {
  const generatedId = useId();
  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
  const [hasOpenedOnce, setHasOpenedOnce] = useState<boolean>(defaultOpen);

  const controlled = isOpen !== undefined;
  const open = controlled ? isOpen : internalOpen;
  const contentId = id ?? `accordion-${generatedId}`;
  const shouldRenderContent = keepMounted || open || hasOpenedOnce;

  useEffect(() => {
    if (open) {
      setHasOpenedOnce(true);
    }
  }, [open]);

  const handleToggle = (): void => {
    const nextOpen = !open;

    if (!controlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-gray-200/90 bg-white/90 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90',
        open
          ? 'shadow-amber-100/70 dark:shadow-black/20'
          : '',
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={contentId}
        className={cn(
          'group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200',
          'hover:bg-amber-50/70 dark:hover:bg-gray-750',
        )}
      >
        <div className="flex min-w-0 items-center gap-3 self-center">
          {icon ? (
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0 self-center">
            <div className="font-semibold text-gray-900 transition-colors duration-200 group-hover:text-amber-700 dark:text-gray-100 dark:group-hover:text-amber-300">
              {title}
            </div>
            {subtitle ? (
              <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <span
          className={cn(
            'ui-accordion-chevron inline-flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition-all duration-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300',
            open ? 'rotate-180 border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300' : '',
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      <div
        id={contentId}
        className={cn(
          'ui-accordion-content motion-reduce:transition-none',
          open ? 'ui-accordion-content--open' : 'ui-accordion-content--closed',
        )}
      >
        {shouldRenderContent ? (
          <div
            className="ui-accordion-content-inner"
          >
            <div
              className={cn(
                'border-t border-gray-200/80 bg-gray-50/90 transition-all duration-300 ease-out dark:border-gray-700 dark:bg-gray-900/80 motion-reduce:transition-none',
                open ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
                contentClassName,
              )}
            >
              {children}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
