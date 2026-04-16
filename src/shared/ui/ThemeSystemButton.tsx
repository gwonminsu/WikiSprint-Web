type ThemeSystemButtonProps = {
  active: boolean;
  resolvedTheme: 'light' | 'dark';
  onToggle: () => void;
  label: string;
  disabled?: boolean;
};

export function ThemeSystemButton({
  active,
  resolvedTheme,
  onToggle,
  label,
  disabled = false,
}: ThemeSystemButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${label}${active ? `: ${resolvedTheme}` : ''}`}
      disabled={disabled}
      data-active={active ? 'true' : 'false'}
      data-resolved-theme={resolvedTheme}
      className="theme-system-button"
      onClick={onToggle}
    >
      <span className="theme-system-button__surface">
        <span className="theme-system-button__ambient theme-system-button__ambient--day" />
        <span className="theme-system-button__ambient theme-system-button__ambient--night" />

        <span className="theme-system-button__star theme-system-button__star--one" />
        <span className="theme-system-button__star theme-system-button__star--two" />
        <span className="theme-system-button__star theme-system-button__star--three" />

        <span className="theme-system-button__orbit-ring" />
        <span className="theme-system-button__orbit-track">
          <span className="theme-system-button__orbit-body">
            <span className="theme-system-button__orbit-core" />
          </span>
        </span>
      </span>

      <span className="theme-system-button__label">{label}</span>
    </button>
  );
}
