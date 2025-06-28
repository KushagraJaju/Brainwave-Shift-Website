import { useState, useEffect } from 'react';

const ONBOARDING_STORAGE_KEY = 'brainwave-shift-onboarding-completed';

export const useOnboarding = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    try {
      const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      setHasCompletedOnboarding(completed === 'true');
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      // If localStorage fails, assume first-time user
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
      // Still mark as completed in state even if localStorage fails
      setHasCompletedOnboarding(true);
    }
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Failed to reset onboarding status:', error);
    }
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