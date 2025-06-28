import { useState, useEffect } from 'react';
import { timerService, TimerState } from '../services/TimerService';
import { UserPreferences } from '../types';
import { soundService } from '../services/SoundService';

export const useSharedTimer = (preferences?: UserPreferences) => {
  const [timerState, setTimerState] = useState<TimerState>(timerService.getState());

  useEffect(() => {
    // Subscribe to timer state changes
    const unsubscribe = timerService.subscribe((state) => {
      setTimerState(state);
    });

    return unsubscribe;
  }, []);

  // Update timer settings when preferences change
  useEffect(() => {
    if (preferences) {
      // Update timer service settings
      timerService.updateSettings({
        focusSessionLength: preferences.focusSessionLength,
        breakLength: preferences.breakLength || 5,
        breakReminders: preferences.breakReminders,
        numberOfBreaks: preferences.numberOfBreaks || 1
      });
      
      // Force update the timer to reflect new settings immediately
      timerService.forceUpdateToCurrentSettings();
    }
  }, [
    preferences?.focusSessionLength, 
    preferences?.breakLength, 
    preferences?.breakReminders,
    preferences?.numberOfBreaks
  ]);

  // Request notification permission when break reminders are enabled
  useEffect(() => {
    if (preferences?.breakReminders && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, [preferences?.breakReminders]);

  // Initialize audio context on first render
  useEffect(() => {
    // Initialize audio context on component mount
    soundService.initializeOnUserInteraction();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return timerState.initialTime > 0 
      ? ((timerState.initialTime - timerState.time) / timerState.initialTime) * 100 
      : 0;
  };

  return {
    // Timer state
    isActive: timerState.isActive,
    isPaused: timerState.isPaused,
    sessionType: timerState.sessionType,
    time: timerState.time,
    initialTime: timerState.initialTime,
    currentFocusSession: timerState.currentFocusSession,
    totalFocusSessions: timerState.totalFocusSessions,
    
    // Computed values
    formattedTime: formatTime(timerState.time),
    progress: getProgress(),
    
    // Timer controls
    start: () => {
      soundService.initializeOnUserInteraction();
      timerService.start();
    },
    pause: () => timerService.pause(),
    resume: () => timerService.resume(),
    reset: () => timerService.reset(),
    toggle: () => {
      soundService.initializeOnUserInteraction();
      timerService.toggle();
    }
  };
};