import { useTheme } from 'next-themes';

interface UseThemeToggleReturn {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

/**
 * useThemeToggle Hook
 * Wrapper around next-themes useTheme hook for convenient theme management
 * Automatically persists to localStorage and respects system preference
 */
export const useThemeToggle = (): UseThemeToggleReturn => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
  };
};
