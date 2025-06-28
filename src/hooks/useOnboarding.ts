import { useState, useEffect } from 'react';
import { userDataManager } from '../services/UserDataManager';

export const useOnboarding = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for user data manager to initialize
    const checkInitialization = () => {
      if (userDataManager.isInitialized()) {
        const userData = userDataManager.getUserData();
        setHasCompletedOnboarding(userData.appState.onboardingCompleted);
        setIsLoading(false);
      } else {
        setTimeout(checkInitialization, 100);
      }
    };

    checkInitialization();

    // Subscribe to data changes
    const unsubscribe = userDataManager.subscribe((userData) => {
      setHasCompletedOnboarding(userData.appState.onboardingCompleted);
    });

    return unsubscribe;
  }, []);

  const completeOnboarding = () => {
    userDataManager.completeOnboarding();
  };

  const resetOnboarding = () => {
    userDataManager.resetOnboarding();
  };

  const skipOnboarding = () => {
    userDataManager.completeOnboarding();
  };

  return {
    hasCompletedOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
    skipOnboarding
  };
};