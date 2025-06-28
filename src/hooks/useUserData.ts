import { useState, useEffect } from 'react';
import { userDataManager, UserData } from '../services/UserDataManager';

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to user data changes
    const unsubscribe = userDataManager.subscribe((data) => {
      setUserData(data);
      setIsLoading(false);
      setError(null);
    });

    // Check if data is already loaded
    if (userDataManager.isDataLoaded()) {
      const data = userDataManager.getUserData();
      if (data) {
        setUserData(data);
        setIsLoading(false);
      }
    }

    return unsubscribe;
  }, []);

  const updatePreferences = (updates: Partial<UserData['preferences']>) => {
    try {
      userDataManager.updatePreferences(updates);
    } catch (err) {
      setError('Failed to update preferences');
      console.error('Failed to update preferences:', err);
    }
  };

  const recordFocusSession = (session: Parameters<typeof userDataManager.recordFocusSession>[0]) => {
    try {
      userDataManager.recordFocusSession(session);
    } catch (err) {
      setError('Failed to record focus session');
      console.error('Failed to record focus session:', err);
    }
  };

  const recordIntervention = (intervention: Parameters<typeof userDataManager.recordIntervention>[0]) => {
    try {
      userDataManager.recordIntervention(intervention);
    } catch (err) {
      setError('Failed to record intervention');
      console.error('Failed to record intervention:', err);
    }
  };

  const recordMindfulBreak = () => {
    try {
      userDataManager.recordMindfulBreak();
    } catch (err) {
      setError('Failed to record mindful break');
      console.error('Failed to record mindful break:', err);
    }
  };

  const recordCognitiveScore = (score: Parameters<typeof userDataManager.recordCognitiveScore>[0]) => {
    try {
      userDataManager.recordCognitiveScore(score);
    } catch (err) {
      setError('Failed to record cognitive score');
      console.error('Failed to record cognitive score:', err);
    }
  };

  const recordDailyUsage = (usage: Parameters<typeof userDataManager.recordDailyUsage>[0]) => {
    try {
      userDataManager.recordDailyUsage(usage);
    } catch (err) {
      setError('Failed to record daily usage');
      console.error('Failed to record daily usage:', err);
    }
  };

  const recordFeatureUsage = (feature: string) => {
    try {
      userDataManager.recordFeatureUsage(feature);
    } catch (err) {
      console.error('Failed to record feature usage:', err);
    }
  };

  const completeOnboarding = () => {
    try {
      userDataManager.completeOnboarding();
    } catch (err) {
      setError('Failed to complete onboarding');
      console.error('Failed to complete onboarding:', err);
    }
  };

  const resetOnboarding = () => {
    try {
      userDataManager.resetOnboarding();
    } catch (err) {
      setError('Failed to reset onboarding');
      console.error('Failed to reset onboarding:', err);
    }
  };

  const exportData = () => {
    try {
      return userDataManager.exportUserData();
    } catch (err) {
      setError('Failed to export data');
      console.error('Failed to export data:', err);
      return '';
    }
  };

  const importData = (jsonData: string) => {
    try {
      const success = userDataManager.importUserData(jsonData);
      if (!success) {
        setError('Failed to import data - invalid format');
      }
      return success;
    } catch (err) {
      setError('Failed to import data');
      console.error('Failed to import data:', err);
      return false;
    }
  };

  const resetAllData = () => {
    try {
      userDataManager.resetAllData();
    } catch (err) {
      setError('Failed to reset data');
      console.error('Failed to reset data:', err);
    }
  };

  const getStorageInfo = () => {
    try {
      return userDataManager.getStorageInfo();
    } catch (err) {
      console.error('Failed to get storage info:', err);
      return { used: 0, available: 0, percentage: 0 };
    }
  };

  const clearError = () => setError(null);

  return {
    userData,
    isLoading,
    error,
    updatePreferences,
    recordFocusSession,
    recordIntervention,
    recordMindfulBreak,
    recordCognitiveScore,
    recordDailyUsage,
    recordFeatureUsage,
    completeOnboarding,
    resetOnboarding,
    exportData,
    importData,
    resetAllData,
    getStorageInfo,
    clearError
  };
};