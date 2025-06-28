import { useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { userDataManager } from '../services/UserDataManager';

export const useSettings = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for user data manager to initialize
    const checkInitialization = () => {
      if (userDataManager.isInitialized()) {
        const userData = userDataManager.getUserData();
        setPreferences(userData.preferences);
        setIsLoading(false);
      } else {
        setTimeout(checkInitialization, 100);
      }
    };

    checkInitialization();

    // Subscribe to data changes
    const unsubscribe = userDataManager.subscribe((userData) => {
      setPreferences(userData.preferences);
    });

    return unsubscribe;
  }, []);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    userDataManager.updatePreferences(updates);
  };

  const resetPreferences = () => {
    const defaultPreferences: UserPreferences = {
      interventionFrequency: 'Normal',
      focusSessionLength: 25,
      breakLength: 5,
      breakReminders: true,
      ambientNotifications: false,
      dataSharing: false,
      selectedPreset: 'pomodoro',
      smartwatchDataSharing: true,
      calendarDataSharing: true,
      physiologicalMonitoring: true,
      calendarInsights: true,
      digitalWellnessEnabled: true,
      mindfulnessReminders: true
    };
    
    userDataManager.updatePreferences(defaultPreferences);
  };

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    isLoading
  };
};