import { useState, useEffect } from 'react';
import { UserPreferences } from '../types';

const DEFAULT_PREFERENCES: UserPreferences = {
  interventionFrequency: 'Normal',
  focusSessionLength: 25, // Changed to 25 minutes (Pomodoro default)
  breakReminders: true,
  ambientNotifications: false,
  dataSharing: false,
  breakLength: 5, // Changed to 5 minutes (Pomodoro default)
  selectedPreset: 'pomodoro', // Set Pomodoro as default preset
  // Device integration preferences
  smartwatchDataSharing: true,
  calendarDataSharing: true,
  physiologicalMonitoring: true,
  calendarInsights: true
};

export const useSettings = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('brainwave-shift-preferences');
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        // Merge with defaults to ensure all new properties are included
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load preferences from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage whenever preferences change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('brainwave-shift-preferences', JSON.stringify(preferences));
      } catch (error) {
        console.error('Failed to save preferences to localStorage:', error);
      }
    }
  }, [preferences, isLoading]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    isLoading
  };
};