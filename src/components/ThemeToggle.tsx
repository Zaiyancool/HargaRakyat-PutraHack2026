import { Sun, Moon } from 'lucide-react';
import { useThemeToggle } from '@/hooks/useThemeToggle';

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useThemeToggle();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-all duration-200 hover:opacity-70 dark:hover:opacity-70
        bg-gray-200 dark:bg-gray-700
        text-gray-800 dark:text-yellow-500"
      aria-label="Toggle dark mode"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};
