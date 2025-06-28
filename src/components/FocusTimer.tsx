import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Settings, Timer, Zap, Target, Plus, Minus, Save, X } from 'lucide-react';
import { UserPreferences, FocusPreset } from '../types';

interface FocusTimerProps {
  preferences?: UserPreferences;
  onUpdatePreferences?: (updates: Partial<UserPreferences>) => void;
}

// Focus presets with the current 90/15 as Flow State
const FOCUS_PRESETS: FocusPreset[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    focusMinutes: 25,
    breakMinutes: 5,
    description: 'Classic productivity technique',
    icon: 'clock',
    color: 'from-red-500 to-pink-600',
    features: ['25-minute focus sessions', '5-minute breaks', 'Frequent momentum']
  },
  {
    id: 'deep-work',
    name: 'Deep Work',
    focusMinutes: 45,
    breakMinutes: 15,
    description: 'Extended concentration periods',
    icon: 'target',
    color: 'from-blue-500 to-indigo-600',
    features: ['45-minute focus sessions', '15-minute breaks', 'Balanced intensity']
  },
  {
    id: 'flow-state',
    name: 'Flow State',
    focusMinutes: 90,
    breakMinutes: 15,
    description: 'Maximum deep work immersion',
    icon: 'zap',
    color: 'from-purple-500 to-violet-600',
    features: ['90-minute focus sessions', '15-minute breaks', 'Peak performance']
  }
];

export const FocusTimer: React.FC<FocusTimerProps> = ({ 
  preferences, 
  onUpdatePreferences 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'Focus' | 'Break'>('Focus');
  const [showOptions, setShowOptions] = useState(false);
  const [optionsMode, setOptionsMode] = useState<'presets' | 'custom'>('presets');
  
  // Custom settings state
  const [customFocusTime, setCustomFocusTime] = useState(preferences?.focusSessionLength || 25);
  const [customBreakTime, setCustomBreakTime] = useState(preferences?.breakLength || 5);
  
  // Use preferences for initial time, fallback to default (25 minutes for Pomodoro)
  const defaultFocusTime = (preferences?.focusSessionLength || 25) * 60;
  const defaultBreakTime = (preferences?.breakLength || 5) * 60;
  
  const [time, setTime] = useState(defaultFocusTime);
  const [initialTime, setInitialTime] = useState(defaultFocusTime);

  // Update custom settings when preferences change
  useEffect(() => {
    if (preferences) {
      setCustomFocusTime(preferences.focusSessionLength);
      setCustomBreakTime(preferences.breakLength || 5);
    }
  }, [preferences?.focusSessionLength, preferences?.breakLength]);

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
    
    setShowOptions(false);
  };

  const handleCustomApply = () => {
    if (onUpdatePreferences) {
      onUpdatePreferences({
        focusSessionLength: customFocusTime,
        breakLength: customBreakTime,
        selectedPreset: undefined, // Clear preset when using custom
        breakReminders: true
      });
    }
    
    // Reset timer if not active
    if (!isActive) {
      if (sessionType === 'Focus') {
        const newTime = customFocusTime * 60;
        setTime(newTime);
        setInitialTime(newTime);
      } else {
        const newTime = customBreakTime * 60;
        setTime(newTime);
        setInitialTime(newTime);
      }
    }
    
    setShowOptions(false);
  };

  const adjustCustomTime = (type: 'focus' | 'break', direction: 'up' | 'down') => {
    if (type === 'focus') {
      const newValue = direction === 'up' 
        ? Math.min(120, customFocusTime + 5) 
        : Math.max(5, customFocusTime - 5);
      setCustomFocusTime(newValue);
    } else {
      const newValue = direction === 'up' 
        ? Math.min(60, customBreakTime + 5) 
        : Math.max(1, customBreakTime - 5);
      setCustomBreakTime(newValue);
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

  // Get current preset info
  const getCurrentPreset = () => {
    if (!preferences) return null;
    return FOCUS_PRESETS.find(preset => 
      preset.focusMinutes === preferences.focusSessionLength &&
      preset.breakMinutes === (preferences.breakLength || 5)
    );
  };

  const currentPreset = getCurrentPreset();

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'clock':
        return <Clock className="w-4 h-4" />;
      case 'target':
        return <Target className="w-4 h-4" />;
      case 'zap':
        return <Zap className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="card-primary p-6 h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Focus Timer</h2>
        <div className="flex items-center space-x-3">
          <Timer className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            sessionType === 'Focus' 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
          }`}>
            {sessionType} Session
          </span>
        </div>
      </div>

      {/* Quick Preset Buttons */}
      {!isActive && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Presets:</span>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              {showOptions ? 'Hide Options' : 'More Options'}
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            {FOCUS_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                  currentPreset?.id === preset.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-calm-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {getPresetIcon(preset.icon)}
                </div>
                <div className="text-xs font-medium">{preset.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {preset.focusMinutes}m/{preset.breakMinutes}m
                </div>
              </button>
            ))}
            
            {/* Custom Button */}
            <button
              onClick={() => {
                setShowOptions(true);
                setOptionsMode('custom');
              }}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                !currentPreset
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-calm-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <Settings className="w-4 h-4" />
              </div>
              <div className="text-xs font-medium">Custom</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {preferences?.focusSessionLength}m/{preferences?.breakLength || 5}m
              </div>
            </button>
          </div>

          {/* Expanded Options */}
          {showOptions && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {optionsMode === 'presets' ? 'Choose Your Focus Style:' : 'Custom Timer Settings:'}
                </h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setOptionsMode('presets')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      optionsMode === 'presets'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Presets
                  </button>
                  <button
                    onClick={() => setOptionsMode('custom')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      optionsMode === 'custom'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Custom
                  </button>
                  <button
                    onClick={() => setShowOptions(false)}
                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {optionsMode === 'presets' ? (
                /* Preset Options */
                <div className="space-y-3">
                  {FOCUS_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                        currentPreset?.id === preset.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-calm-800 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${preset.color} text-white`}>
                          {getPresetIcon(preset.icon)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 dark:text-gray-200">{preset.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{preset.description}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {preset.focusMinutes} min focus • {preset.breakMinutes} min break
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Custom Settings Interface */
                <div className="space-y-6">
                  {/* Focus Time Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Focus Time (minutes)
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => adjustCustomTime('focus', 'down')}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 text-center">
                        <input
                          type="number"
                          min="5"
                          max="120"
                          value={customFocusTime}
                          onChange={(e) => setCustomFocusTime(Math.max(5, Math.min(120, parseInt(e.target.value) || 5)))}
                          className="w-20 text-center text-lg font-bold bg-white dark:bg-calm-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200"
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">5-120 minutes</div>
                      </div>
                      <button
                        onClick={() => adjustCustomTime('focus', 'up')}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Break Time Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Break Time (minutes)
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => adjustCustomTime('break', 'down')}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 text-center">
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={customBreakTime}
                          onChange={(e) => setCustomBreakTime(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                          className="w-20 text-center text-lg font-bold bg-white dark:bg-calm-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200"
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">1-60 minutes</div>
                      </div>
                      <button
                        onClick={() => adjustCustomTime('break', 'up')}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Preview</h5>
                    <p className="text-sm text-purple-700 dark:text-purple-400">
                      {customFocusTime} minutes of focused work followed by {customBreakTime} minute{customBreakTime !== 1 ? 's' : ''} of break time.
                    </p>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={handleCustomApply}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    <span>Apply Custom Settings</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Timer Display - Centered and Flexible */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          {/* Circular Progress */}
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
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
                  sessionType === 'Focus' ? 'text-blue-500 dark:text-blue-400' : 'text-green-500 dark:text-green-400'
                }`}
                strokeLinecap="round"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-mono font-bold text-gray-800 dark:text-gray-200 mb-1">
                {formatTime(time)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {sessionType} Time
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              onClick={toggleTimer}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                isActive
                  ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
              }`}
            >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Square className="w-5 h-5" />
            </button>
          </div>

          {/* Status Text */}
          <div className="text-gray-600 dark:text-gray-400">
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
      </div>

      {/* Settings Section - At bottom */}
      {preferences && (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Current:</span>
              {currentPreset ? (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {currentPreset.name}
                </span>
              ) : (
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  Custom
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {preferences.focusSessionLength}m focus / {preferences.breakLength || 5}m break
              </span>
              {preferences.breakReminders && (
                <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs">Notifications on</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};