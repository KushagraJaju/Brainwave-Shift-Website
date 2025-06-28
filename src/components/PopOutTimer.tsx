import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, Minimize2 } from 'lucide-react';
import { UserPreferences } from '../types';
import { soundService } from '../services/SoundService';
import { useSoundSettings } from '../hooks/useSoundSettings';

interface PopOutTimerProps {
  preferences: UserPreferences;
  onClose: () => void;
}

export const PopOutTimer: React.FC<PopOutTimerProps> = ({ 
  preferences, 
  onClose 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionType, setSessionType] = useState<'Focus' | 'Break'>('Focus');
  
  // Sound settings hook
  const { settings: soundSettings, toggleSound } = useSoundSettings();
  
  // Use preferences for initial time
  const defaultFocusTime = preferences.focusSessionLength * 60;
  const defaultBreakTime = (preferences.breakLength || 5) * 60;
  
  const [time, setTime] = useState(defaultFocusTime);
  const [initialTime, setInitialTime] = useState(defaultFocusTime);
  
  // Use ref to track the interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only start interval if timer is active and not paused
    if (isActive && !isPaused && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime - 1;
          
          // Play tick sound if enabled
          if (soundSettings.tickSound && newTime % 1 === 0) {
            soundService.playTickSound();
          }
          
          // Check if timer reached zero
          if (newTime <= 0) {
            // Clear interval immediately
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            
            // Stop the timer completely
            setIsActive(false);
            setIsPaused(false);
            
            // Play completion sound
            if (sessionType === 'Focus') {
              soundService.playFocusCompleteSound();
            } else {
              soundService.playBreakCompleteSound();
            }
            
            // Show notification
            if (preferences.breakReminders) {
              if (sessionType === 'Focus') {
                new Notification('Focus session complete!', {
                  body: `Time for a ${preferences.breakLength || 5}-minute break.`,
                  icon: '/BrainwaveShift.png'
                });
              } else {
                new Notification('Break time over!', {
                  body: 'Ready to start another focus session?',
                  icon: '/BrainwaveShift.png'
                });
              }
            }
            
            // Auto-switch between focus and break
            setTimeout(() => {
              if (sessionType === 'Focus') {
                setSessionType('Break');
                const breakTime = (preferences.breakLength || 5) * 60;
                setTime(breakTime);
                setInitialTime(breakTime);
              } else {
                setSessionType('Focus');
                const focusTime = preferences.focusSessionLength * 60;
                setTime(focusTime);
                setInitialTime(focusTime);
              }
            }, 100);
            
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isPaused, time, sessionType, preferences, soundSettings.tickSound]);

  const toggleTimer = () => {
    // Initialize audio context on first user interaction
    soundService.initializeOnUserInteraction();
    
    if (isActive) {
      setIsActive(false);
      setIsPaused(true);
    } else {
      setIsActive(true);
      setIsPaused(false);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    
    if (sessionType === 'Focus') {
      const focusTime = preferences.focusSessionLength * 60;
      setTime(focusTime);
      setInitialTime(focusTime);
    } else {
      const breakTime = (preferences.breakLength || 5) * 60;
      setTime(breakTime);
      setInitialTime(breakTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = initialTime > 0 ? ((initialTime - time) / initialTime) * 100 : 0;

  // Get current preset info for display
  const getCurrentPresetName = () => {
    if (preferences.focusSessionLength === 25 && preferences.breakLength === 5) return 'Pomodoro';
    if (preferences.focusSessionLength === 45 && preferences.breakLength === 15) return 'Deep Work';
    if (preferences.focusSessionLength === 90 && preferences.breakLength === 15) return 'Flow State';
    return 'Custom';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4 flex flex-col">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Brainwave Shift Timer
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg transition-colors ${
              soundSettings.enabled 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
            }`}
            title={soundSettings.enabled ? 'Sound enabled' : 'Sound disabled'}
          >
            {soundSettings.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            title="Close pop-out timer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Session Info */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${
          sessionType === 'Focus' 
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
        }`}>
          {sessionType} Session
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {getCurrentPresetName()} • {preferences.focusSessionLength}m/{preferences.breakLength || 5}m
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Timer Circle */}
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${progress * 5.65} 565`}
              className={`transition-all duration-1000 ease-out ${
                sessionType === 'Focus' ? 'text-blue-500 dark:text-blue-400' : 'text-green-500 dark:text-green-400'
              }`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Timer Text */}
            <div 
              className="text-4xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight leading-none select-none"
              style={{
                fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontWeight: '700'
              }}
            >
              {formatTime(time)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
              {sessionType} Time
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-4 mb-4">
          {/* Play/Pause Button */}
          <button
            onClick={toggleTimer}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isActive
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            aria-label={isActive ? 'Pause timer' : 'Start timer'}
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          {/* Reset Button */}
          <button
            onClick={resetTimer}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            aria-label="Reset timer"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Status Text */}
        <div className="text-center text-gray-600 dark:text-gray-400">
          {isActive ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Session in progress</span>
            </div>
          ) : isPaused ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium">Paused</span>
            </div>
          ) : (
            <span className="text-sm">Click play to start</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
        <div className="flex items-center justify-center space-x-4">
          {soundSettings.enabled && (
            <div className="flex items-center space-x-1">
              <Volume2 className="w-3 h-3" />
              <span>Sound on</span>
            </div>
          )}
          {preferences.breakReminders && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Notifications on</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};