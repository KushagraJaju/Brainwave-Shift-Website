import { useState, useEffect } from 'react';
import { useUserData } from './useUserData';

export const useOnboarding = () => {
  const { userData, completeOnboarding: completeUserOnboarding, resetOnboarding: resetUserOnboarding, isLoading: userDataLoading } = useUserData();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Once user data is loaded, we're ready
    if (!userDataLoading) {
      setIsLoading(false);
    }
  }, [userDataLoading]);

  const hasCompletedOnboarding = userData?.onboardingCompleted ?? false;

  const completeOnboarding = () => {
    completeUserOnboarding();
  };

  const resetOnboarding = () => {
    resetUserOnboarding();
  };

  const skipOnboarding = () => {
    // Same as completing onboarding - mark as done
    completeOnboarding();
  };

  return {
    hasCompletedOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
    skipOnboarding
  };
};