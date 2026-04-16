import { useThemeStore } from '../store';
import { useTranslation } from '../lib';
import { ThemeOrbitToggle } from './ThemeOrbitToggle';
import { ThemeSystemButton } from './ThemeSystemButton';

export function ThemeControlGroup(): React.ReactElement {
  const { theme, resolvedTheme, setTheme } = useThemeStore();
  const { t } = useTranslation();

  const isDark = resolvedTheme === 'dark';
  const isSystem = theme === 'system';

  const handleToggle = (nextChecked: boolean): void => {
    setTheme(nextChecked ? 'dark' : 'light');
  };

  const handleSystemToggle = (): void => {
    if (isSystem) {
      setTheme(resolvedTheme);
      return;
    }
    setTheme('system');
  };

  return (
    <div className="theme-control-group">
      <ThemeOrbitToggle
        checked={isDark}
        onCheckedChange={handleToggle}
        resolvedTheme={resolvedTheme}
        ariaLabel={t('settings.themeToggleLabel')}
        size="lg"
      />

      <ThemeSystemButton
        active={isSystem}
        resolvedTheme={resolvedTheme}
        onToggle={handleSystemToggle}
        label={t('settings.themeSystem')}
      />
    </div>
  );
}
