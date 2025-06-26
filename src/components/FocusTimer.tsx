import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Settings, Timer } from 'lucide-react';
import { UserPreferences, FocusPreset } from '../types';
import { FocusPresets } from './FocusPresets';

interface FocusTimerProps {
  preferences?: UserPreferences;
  onUpdatePreferences?: (updates: Partial<UserPreferences>) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ 
  preferences, 
  onUpdatePreferences 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'Focus' | 'Break'>('Focus');
  
  // Use preferences for initial time, fallback to default
  const defaultFocusTime = (preferences?.focusSessionLength || 25) * 60;
  const defaultBreakTime = (preferences?.breakLength || 5) * 60;
  
  const [time, setTime] = useState(defaultFocusTime);
  const [initialTime, setInitialTime] = useState(defaultFocusTime);

  // Update timer when preferences change
  useEffect(() => {
    if (preferences && !isActive) {
      const newFocusTime = preferences.focusSessionLength * 60;
      const newBreakTime = (preferences.breakLength || 5) * 60;
      
      if (sessionType === 'Focus') {
        setTime(newFocusTime);
        setInitialTime(newFocusTime);
      } else {
        setTime(newBreakTime);
        setInitialTime(newBreakTime);
      }
    }
  }, [preferences?.focusSessionLength, preferences?.breakLength, isActive, sessionType]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      
      // Show notification if break reminders are enabled
      if (preferences?.breakReminders) {
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
      if (sessionType === 'Focus') {
        setSessionType('Break');
        const breakTime = (preferences?.breakLength || 5) * 60;
        setTime(breakTime);
        setInitialTime(breakTime);
      } else {
        setSessionType('Focus');
        const focusTime = (preferences?.focusSessionLength || 25) * 60;
        setTime(focusTime);
        setInitialTime(focusTime);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, time, sessionType, preferences?.breakReminders, preferences?.focusSessionLength, preferences?.breakLength]);

  // Request notification permission on component mount
  useEffect(() => {
    if (preferences?.breakReminders && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, [preferences?.breakReminders]);

  const handlePresetSelect = (preset: FocusPreset) => {
    if (onUpdatePreferences) {
      onUpdatePreferences({
        focusSessionLength: preset.focusMinutes,
        breakLength: preset.breakMinutes,
        selectedPreset: preset.id,
        breakReminders: true // Enable break reminders when selecting a preset
      });
    }
    
    // Reset timer if not active
    if (!isActive) {
      if (sessionType === 'Focus') {
        const newTime = preset.focusMinutes * 60;
        setTime(newTime);
        setInitialTime(newTime);
      } else {
        const newTime = preset.breakMinutes * 60;
        setTime(newTime);
        setInitialTime(newTime);
      }
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (sessionType === 'Focus') {
      const focusTime = (preferences?.focusSessionLength || 25) * 60;
      setTime(focusTime);
      setInitialTime(focusTime);
    } else {
      const breakTime = (preferences?.breakLength || 5) * 60;
      setTime(breakTime);
      setInitialTime(breakTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialTime - time) / initialTime) * 100;

  return (
    <div className="space-y-6">
      {/* Main Timer Component */}
      <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        {/* Header Section - Consistent with other dashboard sections */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Focus Timer</h2>
          <div className="flex items-center space-x-3">
            <Timer className="w-5 h-5 text-blue-500" />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              sessionType === 'Focus' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {sessionType} Session
            </span>
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6">
          {/* Circular Progress - Smaller and more proportional */}
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${progress * 4.4} 440`}
                className={`transition-all duration-1000 ease-out ${
                  sessionType === 'Focus' ? 'text-blue-500' : 'text-green-500'
                }`}
                strokeLinecap="round"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-mono font-bold text-gray-800 mb-1">
                {formatTime(time)}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {sessionType} Time
              </span>
            </div>
          </div>

          {/* Controls - Better positioned and styled */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={toggleTimer}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                isActive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Square className="w-5 h-5" />
            </button>
          </div>

          {/* Status Text - More subtle */}
          <div className="text-gray-600">
            {isActive ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Session in progress</span>
              </div>
            ) : (
              <span className="text-sm">Click play to start your {sessionType.toLowerCase()} session</span>
            )}
          </div>
        </div>

        {/* Settings Section - Better integrated */}
        {preferences && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Current Settings:</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-800">
                  {preferences.focusSessionLength}m focus / {preferences.breakLength || 5}m break
                </span>
                {preferences.breakReminders && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Notifications on</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session Presets - Now positioned below the timer */}
      {preferences && onUpdatePreferences && (
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
          <FocusPresets
            selectedPreset={preferences.selectedPreset}
            onPresetSelect={handlePresetSelect}
            preferences={preferences}
          />
        </div>
      )}
    </div>
  );
};