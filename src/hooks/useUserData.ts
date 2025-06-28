import { useState, useEffect } from 'react';
import { userDataManager, UserData } from '../services/UserDataManager';

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for initialization
    const checkInitialization = () => {
      if (userDataManager.isInitialized()) {
        setUserData(userDataManager.getUserData());
        setIsLoading(false);
      } else {
        setTimeout(checkInitialization, 100);
      }
    };

    checkInitialization();

    // Subscribe to data changes
    const unsubscribe = userDataManager.subscribe((data) => {
      setUserData(data);
      setError(null);
    });

    return unsubscribe;
  }, []);

  const updatePreferences = (updates: Partial<UserData['preferences']>) => {
    try {
      userDataManager.updatePreferences(updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  };

  const updateAnalytics = (updates: Partial<UserData['analytics']>) => {
    try {
      userDataManager.updateAnalytics(updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update analytics');
    }
  };

  const addFocusSession = (session: Parameters<typeof userDataManager.addFocusSession>[0]) => {
    try {
      userDataManager.addFocusSession(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add focus session');
    }
  };

  const recordMindfulBreak = () => {
    try {
      userDataManager.recordMindfulBreak();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record mindful break');
    }
  };

  const exportData = async (): Promise<string> => {
    try {
      return await userDataManager.exportData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const importData = async (jsonData: string): Promise<void> => {
    try {
      await userDataManager.importData(jsonData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import data';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetAllData = async (): Promise<void> => {
    try {
      await userDataManager.resetAllData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset data';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    userData,
    isLoading,
    error,
    updatePreferences,
    updateAnalytics,
    addFocusSession,
    recordMindfulBreak,
    exportData,
    importData,
    resetAllData,
    getDataSize: () => userDataManager.getDataSize(),
    clearError: () => setError(null)
  };
};