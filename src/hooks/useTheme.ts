import { useState, useEffect } from 'react';
import { userDataManager } from '../services/UserDataManager';

export type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Wait for user data manager to initialize
    const checkInitialization = () => {
      if (userDataManager.isInitialized()) {
        const userData = userDataManager.getUserData();
        setThemeState(userData.appState.theme);
      } else {
        setTimeout(checkInitialization, 100);
      }
    };

    checkInitialization();

    // Subscribe to data changes
    const unsubscribe = userDataManager.subscribe((userData) => {
      setThemeState(userData.appState.theme);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const updateTheme = () => {
      let newResolvedTheme: 'light' | 'dark' = 'light';
      
      if (theme === 'system') {
        newResolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        newResolvedTheme = theme;
      }
      
      setResolvedTheme(newResolvedTheme);
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      // Add new theme class
      root.classList.add(newResolvedTheme);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', newResolvedTheme === 'dark' ? '#1e293b' : '#ffffff');
      }
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    userDataManager.setTheme(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    toggleTheme,
    setTheme
  };
};