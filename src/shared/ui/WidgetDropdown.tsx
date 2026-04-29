import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactElement } from 'react';
import { cn } from '../lib';

type Align = 'start' | 'end';

type ItemParams = {
  index: number;
  onSelect: () => void;
  disabled?: boolean;
};

type ItemButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ref: (node: HTMLButtonElement | null) => void;
  role: 'menuitem';
};

type RenderChildrenArgs = {
  close: () => void;
  getItemProps: (params: ItemParams) => ItemButtonProps;
};

type TriggerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ref: React.Ref<HTMLButtonElement>;
};

type Props = {
  trigger: (props: TriggerButtonProps) => ReactElement;
  children: (args: RenderChildrenArgs) => React.ReactNode;
  contentClassName: string;
  wrapperClassName?: string;
  align?: Align;
  sideOffset?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  forceMount?: boolean;
};

function findNextEnabledIndex(
  itemRefs: Array<HTMLButtonElement | null>,
  startIndex: number,
  direction: 1 | -1,
): number | null {
  if (itemRefs.length === 0) return null;

  let currentIndex = startIndex;

  for (let checked = 0; checked < itemRefs.length; checked += 1) {
    currentIndex = (currentIndex + direction + itemRefs.length) % itemRefs.length;
    const candidate = itemRefs[currentIndex];
    if (candidate && !candidate.disabled) {
      return currentIndex;
    }
  }

  return null;
}

function findBoundaryEnabledIndex(
  itemRefs: Array<HTMLButtonElement | null>,
  direction: 1 | -1,
): number | null {
  const indices = direction === 1
    ? itemRefs.map((_, index) => index)
    : itemRefs.map((_, index) => itemRefs.length - 1 - index);

  for (const index of indices) {
    const candidate = itemRefs[index];
    if (candidate && !candidate.disabled) {
      return index;
    }
  }

  return null;
}

export function WidgetDropdown({
  trigger,
  children,
  contentClassName,
  wrapperClassName,
  align = 'start',
  sideOffset = 4,
  open: controlledOpen,
  onOpenChange,
  forceMount = false,
}: Props): React.ReactElement {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const shouldRenderMenu = open || forceMount;
  const menuId = useMemo(() => `widget-dropdown-${generatedId}`, [generatedId]);

  const setOpen = (nextOpen: boolean): void => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  const close = (): void => {
    setOpen(false);
    setActiveIndex(null);
  };

  const closeAndFocusTrigger = (): void => {
    triggerRef.current?.focus();
    close();
  };

  const focusIndex = (index: number | null): void => {
    if (index === null) return;

    setActiveIndex(index);
    window.requestAnimationFrame(() => {
      itemRefs.current[index]?.focus();
    });
  };

  useEffect(() => {
    if (!open) {
      itemRefs.current = [];
      return;
    }

    const firstEnabledIndex = findBoundaryEnabledIndex(itemRefs.current, 1);
    if (firstEnabledIndex !== null) {
      focusIndex(firstEnabledIndex);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      close();
    };

    const handleFocusIn = (event: FocusEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      close();
    };

    const handleWindowKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      close();
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('focusin', handleFocusIn);
    window.addEventListener('keydown', handleWindowKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [open]);

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        const nextIndex = findBoundaryEnabledIndex(itemRefs.current, 1);
        focusIndex(nextIndex);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        const nextIndex = findBoundaryEnabledIndex(itemRefs.current, -1);
        focusIndex(nextIndex);
      }
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(!open);
    }
  };

  const getItemProps = ({ index, onSelect, disabled = false }: ItemParams): ItemButtonProps => ({
    ref: (node) => {
      itemRefs.current[index] = node;
    },
    type: 'button',
    role: 'menuitem',
    tabIndex: open && activeIndex === index ? 0 : -1,
    disabled,
    onMouseEnter: () => {
      if (disabled) return;
      setActiveIndex(index);
    },
    onFocus: () => {
      if (disabled) return;
      setActiveIndex(index);
    },
    onClick: () => {
      if (disabled) return;
      onSelect();
      closeAndFocusTrigger();
    },
    onKeyDown: (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = findNextEnabledIndex(itemRefs.current, index, 1);
        focusIndex(nextIndex);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const nextIndex = findNextEnabledIndex(itemRefs.current, index, -1);
        focusIndex(nextIndex);
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        focusIndex(findBoundaryEnabledIndex(itemRefs.current, 1));
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        focusIndex(findBoundaryEnabledIndex(itemRefs.current, -1));
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndFocusTrigger();
        return;
      }

      if (event.key === 'Tab') {
        close();
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (disabled) return;
        onSelect();
        closeAndFocusTrigger();
      }
    },
  });

  return (
    <div
      ref={rootRef}
      className={cn('relative inline-block', wrapperClassName)}
    >
      {trigger({
        ref: triggerRef,
        type: 'button',
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': shouldRenderMenu ? menuId : undefined,
        onClick: () => {
          setOpen(!open);
        },
        onKeyDown: handleTriggerKeyDown,
      })}
      {shouldRenderMenu ? (
        <div
          id={menuId}
          role="menu"
          aria-hidden={!open}
          className={cn(
            'absolute top-full z-50',
            align === 'end' ? 'right-0' : 'left-0',
            !open ? 'pointer-events-none' : '',
            contentClassName,
          )}
          style={{ marginTop: sideOffset }}
        >
          {children({ close, getItemProps })}
        </div>
      ) : null}
    </div>
  );
}
