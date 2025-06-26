import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();

  const getThemeIcon = (themeMode: Theme) => {
    switch (themeMode) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getThemeLabel = (themeMode: Theme) => {
    switch (themeMode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
    }
  };

  const themeOptions: Theme[] = ['light', 'dark', 'system'];

  return (
    <div className={`relative ${className}`}>
      {/* Simple Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 
          bg-calm-100 hover:bg-calm-200 dark:bg-calm-800 dark:hover:bg-calm-700
          text-calm-700 dark:text-calm-300 focus-ring
        `}
        title={`Current theme: ${getThemeLabel(theme)} (${resolvedTheme})`}
      >
        <div className="relative">
          {getThemeIcon(theme)}
          {theme === 'system' && (
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </div>
        {showLabel && (
          <span className="text-sm font-medium">{getThemeLabel(theme)}</span>
        )}
      </button>
    </div>
  );
};

export const ThemeSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun className="w-4 h-4" />,
      description: 'Light theme'
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon className="w-4 h-4" />,
      description: 'Dark theme'
    },
    {
      value: 'system',
      label: 'System',
      icon: <Monitor className="w-4 h-4" />,
      description: 'Follow system preference'
    }
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-medium text-calm-700 dark:text-calm-300">Theme Preference</h4>
      <div className="grid grid-cols-3 gap-2">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`
              flex flex-col items-center space-y-2 p-3 rounded-lg border-2 transition-all duration-200
              ${theme === option.value
                ? 'border-focus-500 bg-focus-50 dark:bg-focus-900/20 text-focus-700 dark:text-focus-300'
                : 'border-calm-200 dark:border-calm-700 bg-white dark:bg-calm-800 text-calm-600 dark:text-calm-400 hover:border-calm-300 dark:hover:border-calm-600'
              }
            `}
          >
            <div className={`p-2 rounded-lg ${
              theme === option.value 
                ? 'bg-focus-100 dark:bg-focus-800 text-focus-600 dark:text-focus-400' 
                : 'bg-calm-100 dark:bg-calm-700 text-calm-500 dark:text-calm-400'
            }`}>
              {option.icon}
            </div>
            <div className="text-center">
              <div className="text-xs font-medium">{option.label}</div>
              <div className="text-xs opacity-75">{option.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};