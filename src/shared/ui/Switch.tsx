import { cn } from '../lib';

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  id?: string;
};

export function Switch({ checked, onCheckedChange, disabled, ariaLabel, id }: SwitchProps): React.ReactElement {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      data-state={checked ? 'checked' : 'unchecked'}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'notification-switch relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
        'focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      )}
    >
      <span
        aria-hidden="true"
        className="notification-switch__track"
      >
        <span className="notification-switch__track-glow" />
        <span className="notification-switch__track-shine" />
        <span className="notification-switch__thumb-shadow" />
        <span className="notification-switch__thumb">
          <span className="notification-switch__thumb-core" />
          <span className="notification-switch__thumb-highlight" />
        </span>
      </span>
    </button>
  );
}
