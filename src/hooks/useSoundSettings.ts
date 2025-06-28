import { useState, useEffect } from 'react';
import { soundService, SoundSettings } from '../services/SoundService';
import { userDataManager } from '../services/UserDataManager';

export const useSoundSettings = () => {
  const [settings, setSettings] = useState<SoundSettings>(soundService.getSettings());

  useEffect(() => {
    // Load settings from user data manager
    const checkInitialization = () => {
      if (userDataManager.isInitialized()) {
        const userData = userDataManager.getUserData();
        const savedSettings = userData.soundSettings;
        
        // Update sound service with saved settings
        soundService.updateSettings(savedSettings);
        setSettings(soundService.getSettings());
      } else {
        setTimeout(checkInitialization, 100);
      }
    };

    checkInitialization();

    // Subscribe to user data changes
    const unsubscribe = userDataManager.subscribe((userData) => {
      const savedSettings = userData.soundSettings;
      soundService.updateSettings(savedSettings);
      setSettings(soundService.getSettings());
    });

    // Initialize audio context on component mount
    const handleUserInteraction = () => {
      soundService.initializeOnUserInteraction();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      unsubscribe();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  const updateSettings = (updates: Partial<SoundSettings>) => {
    soundService.updateSettings(updates);
    userDataManager.updateSoundSettings(updates);
    setSettings(soundService.getSettings());
  };

  const toggleSound = () => {
    const newEnabled = soundService.toggleSound();
    userDataManager.updateSoundSettings({ enabled: newEnabled });
    setSettings(soundService.getSettings());
    return newEnabled;
  };

  const setVolume = (volume: number) => {
    soundService.setVolume(volume);
    userDataManager.updateSoundSettings({ volume });
    setSettings(soundService.getSettings());
  };

  const testFocusSound = () => {
    soundService.testFocusSound();
  };

  const testBreakSound = () => {
    soundService.testBreakSound();
  };

  return {
    settings,
    updateSettings,
    toggleSound,
    setVolume,
    testFocusSound,
    testBreakSound
  };
};