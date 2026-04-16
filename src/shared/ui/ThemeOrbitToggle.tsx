import { NightStarfield } from './NightStarfield';

type ThemeOrbitToggleProps = {
  checked: boolean;
  onCheckedChange: (nextChecked: boolean) => void;
  resolvedTheme: 'light' | 'dark';
  disabled?: boolean;
  ariaLabel: string;
  size?: 'md' | 'lg';
};

export function ThemeOrbitToggle({
  checked,
  onCheckedChange,
  resolvedTheme,
  disabled = false,
  ariaLabel,
  size = 'md',
}: ThemeOrbitToggleProps): React.ReactElement {
  const sizeClass = size === 'lg'
    ? 'theme-orbit-toggle--lg'
    : 'theme-orbit-toggle--md';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${ariaLabel}: ${resolvedTheme}`}
      disabled={disabled}
      data-state={checked ? 'dark' : 'light'}
      data-resolved-theme={resolvedTheme}
      className={`theme-orbit-toggle ${sizeClass}`}
      onClick={() => onCheckedChange(!checked)}
    >
      <span className="theme-orbit-toggle__track">
        <span className="theme-orbit-toggle__world">
          <span className="theme-orbit-toggle__world-disc">
            <span className="theme-orbit-toggle__hemisphere theme-orbit-toggle__hemisphere--day">
              <span className="theme-orbit-toggle__sky-fill theme-orbit-toggle__sky-fill--day" />
              <span className="theme-orbit-toggle__sun" />
              <span className="theme-orbit-toggle__glow theme-orbit-toggle__glow--day" />
            </span>

            <span className="theme-orbit-toggle__hemisphere theme-orbit-toggle__hemisphere--night">
              <span className="theme-orbit-toggle__sky-fill theme-orbit-toggle__sky-fill--night" />
              <NightStarfield
                active={checked}
                variant="toggle"
                className="theme-orbit-toggle__starfield"
                starClassName="theme-orbit-toggle__star"
              />
              <span className="theme-orbit-toggle__glow theme-orbit-toggle__glow--night" />
            </span>

            <span className="theme-orbit-toggle__terminator" />
          </span>
        </span>

        <span className="theme-orbit-toggle__thumb">
          <span className="theme-orbit-toggle__thumb-face" />
          <span className="theme-orbit-toggle__thumb-crater theme-orbit-toggle__thumb-crater--one" />
          <span className="theme-orbit-toggle__thumb-crater theme-orbit-toggle__thumb-crater--two" />
          <span className="theme-orbit-toggle__thumb-highlight" />
        </span>
      </span>
    </button>
  );
}
