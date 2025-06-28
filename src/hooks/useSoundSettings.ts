import { useState, useEffect } from 'react';
import { soundService, SoundSettings } from '../services/SoundService';

export const useSoundSettings = () => {
  const [settings, setSettings] = useState<SoundSettings>(soundService.getSettings());

  useEffect(() => {
    // Initialize audio context on component mount
    const handleUserInteraction = () => {
      soundService.initializeOnUserInteraction();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  const updateSettings = (updates: Partial<SoundSettings>) => {
    soundService.updateSettings(updates);
    setSettings(soundService.getSettings());
  };

  const toggleSound = () => {
    const newEnabled = soundService.toggleSound();
    setSettings(soundService.getSettings());
    return newEnabled;
  };

  const setVolume = (volume: number) => {
    soundService.setVolume(volume);
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