import { Sun, Moon } from '@phosphor-icons/react';
import { IconButton } from '@/components/IconButton';
import { useTheme } from '@/hooks/useTheme';

/** Light/dark theme toggle for the top bar. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <IconButton
      icon={theme === 'dark' ? Sun : Moon}
      label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
    />
  );
}
