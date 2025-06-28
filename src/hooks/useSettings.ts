import { useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { useUserData } from './useUserData';

const DEFAULT_PREFERENCES: UserPreferences = {
  interventionFrequency: 'Normal',
  focusSessionLength: 25,
  breakReminders: true,
  ambientNotifications: false,
  dataSharing: false,
  breakLength: 5,
  selectedPreset: 'pomodoro',
  smartwatchDataSharing: true,
  calendarDataSharing: true,
  physiologicalMonitoring: true,
  calendarInsights: true,
  digitalWellnessEnabled: true,
  mindfulnessReminders: true,
  focusModeSchedule: [
    { start: '09:00', end: '12:00' },
    { start: '14:00', end: '17:00' }
  ]
};

export const useSettings = () => {
  const { userData, updatePreferences: updateUserPreferences, isLoading: userDataLoading } = useUserData();
  const [isLoading, setIsLoading] = useState(true);

  // Get preferences from user data or use defaults
  const preferences = userData?.preferences || DEFAULT_PREFERENCES;

  useEffect(() => {
    // Once user data is loaded, we're ready
    if (!userDataLoading) {
      setIsLoading(false);
    }
  }, [userDataLoading]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    updateUserPreferences(updates);
  };

  const resetPreferences = () => {
    updateUserPreferences(DEFAULT_PREFERENCES);
  };

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    isLoading
  };
};