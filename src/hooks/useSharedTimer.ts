import { useState, useEffect } from 'react';
import { timerService, TimerState } from '../services/TimerService';
import { UserPreferences } from '../types';

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
      timerService.updateSettings({
        focusSessionLength: preferences.focusSessionLength,
        breakLength: preferences.breakLength || 5,
        breakReminders: preferences.breakReminders
      });
      
      // Force update the timer to reflect new settings immediately
      timerService.forceUpdateToCurrentSettings();
    }
  }, [preferences?.focusSessionLength, preferences?.breakLength, preferences?.breakReminders]);

  // Request notification permission when break reminders are enabled
  useEffect(() => {
    if (preferences?.breakReminders && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, [preferences?.breakReminders]);

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
    
    // Computed values
    formattedTime: formatTime(timerState.time),
    progress: getProgress(),
    
    // Timer controls
    start: () => timerService.start(),
    pause: () => timerService.pause(),
    resume: () => timerService.resume(),
    reset: () => timerService.reset(),
    toggle: () => timerService.toggle()
  };
};