import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Settings, Timer, Zap, Target, Plus, Minus, Save, X, Volume2, VolumeX, Edit, Check } from 'lucide-react';
import { UserPreferences, FocusPreset } from '../types';
import { soundService } from '../services/SoundService';
import { useSoundSettings } from '../hooks/useSoundSettings';
import { useSharedTimer } from '../hooks/useSharedTimer';
import { SoundControls } from './SoundControls';

interface FocusTimerProps {
  preferences?: UserPreferences;
  onUpdatePreferences?: (updates: Partial<UserPreferences>) => void;
  showPresets?: boolean; // New prop to control preset visibility
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
  onUpdatePreferences,
  showPresets = true // Default to true for backward compatibility
}) => {
  // Use shared timer hook instead of local state
  const {
    isActive,
    isPaused,
    sessionType,
    formattedTime,
    progress,
    currentFocusSession,
    totalFocusSessions,
    start,
    pause,
    resume,
    reset,
    toggle
  } = useSharedTimer(preferences);

  const [showOptions, setShowOptions] = useState(false);
  const [optionsMode, setOptionsMode] = useState<'presets' | 'custom'>('presets');
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  
  // Task name state
  const [taskName, setTaskName] = useState(preferences?.currentTaskName || '');
  const [isEditingTask, setIsEditingTask] = useState(false);
  
  // Custom settings state
  const [customFocusTime, setCustomFocusTime] = useState(preferences?.focusSessionLength || 25);
  const [customBreakTime, setCustomBreakTime] = useState(preferences?.breakLength || 5);
  const [customNumberOfBreaks, setCustomNumberOfBreaks] = useState(preferences?.numberOfBreaks || 1);
  
  // Sound settings hook
  const { settings: soundSettings, toggleSound } = useSoundSettings();

  // Update custom settings when preferences change
  useEffect(() => {
    if (preferences) {
      setCustomFocusTime(preferences.focusSessionLength);
      setCustomBreakTime(preferences.breakLength || 5);
      setCustomNumberOfBreaks(preferences.numberOfBreaks || 1);
      setTaskName(preferences.currentTaskName || '');
    }
  }, [preferences?.focusSessionLength, preferences?.breakLength, preferences?.numberOfBreaks, preferences?.currentTaskName]);

  const handlePresetSelect = (preset: FocusPreset) => {
    if (onUpdatePreferences) {
      console.log('Selecting preset:', preset.name, 'Focus:', preset.focusMinutes, 'Break:', preset.breakMinutes);
      onUpdatePreferences({
        focusSessionLength: preset.focusMinutes,
        breakLength: preset.breakMinutes,
        selectedPreset: preset.id,
        breakReminders: true, // Enable break reminders when selecting a preset
        numberOfBreaks: 1 // Reset to single break for presets
      });
    }
    
    setShowOptions(false);
  };

  const handleCustomApply = () => {
    if (onUpdatePreferences) {
      onUpdatePreferences({
        focusSessionLength: customFocusTime,
        breakLength: customBreakTime,
        selectedPreset: undefined, // Clear preset when using custom
        breakReminders: true,
        numberOfBreaks: customNumberOfBreaks // Save the number of breaks
      });
    }
    
    setShowOptions(false);
  };

  const adjustCustomTime = (type: 'focus' | 'break' | 'breaks', direction: 'up' | 'down') => {
    if (type === 'focus') {
      const newValue = direction === 'up' 
        ? Math.min(120, customFocusTime + 5) 
        : Math.max(5, customFocusTime - 5);
      setCustomFocusTime(newValue);
    } else if (type === 'break') {
      const newValue = direction === 'up' 
        ? Math.min(60, customBreakTime + 5) 
        : Math.max(1, customBreakTime - 5);
      setCustomBreakTime(newValue);
    } else if (type === 'breaks') {
      const newValue = direction === 'up' 
        ? Math.min(5, customNumberOfBreaks + 1) 
        : Math.max(1, customNumberOfBreaks - 1);
      setCustomNumberOfBreaks(newValue);
    }
  };

  const handleToggleTimer = () => {
    // Initialize audio context on first user interaction
    soundService.initializeOnUserInteraction();
    
    // Save the current task name when starting the timer
    if (!isActive && !isPaused && onUpdatePreferences) {
      onUpdatePreferences({
        currentTaskName: taskName
      });
    }
    
    toggle();
  };

  // Task name handlers
  const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskName(e.target.value);
  };

  const handleTaskNameSubmit = () => {
    if (onUpdatePreferences) {
      onUpdatePreferences({
        currentTaskName: taskName
      });
    }
    setIsEditingTask(false);
  };

  const handleTaskNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTaskNameSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingTask(false);
      setTaskName(preferences?.currentTaskName || '');
    }
  };

  // FIXED: Improved preset detection logic
  const getCurrentPreset = () => {
    if (!preferences) return null;
    
    // Find a preset that matches the current time settings
    const matchingPreset = FOCUS_PRESETS.find(preset => 
      preset.focusMinutes === preferences.focusSessionLength &&
      preset.breakMinutes === (preferences.breakLength || 5)
    );
    
    return matchingPreset || null;
  };

  const currentPreset = getCurrentPreset();

  // Helper function to check if a specific preset is currently selected
  const isPresetSelected = (preset: FocusPreset) => {
    if (!preferences) return false;
    
    // Check if this preset matches current settings
    return preset.focusMinutes === preferences.focusSessionLength &&
           preset.breakMinutes === (preferences.breakLength || 5);
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'clock':
        return <Clock className="w-4 h-4" aria-hidden="true" />;
      case 'target':
        return <Target className="w-4 h-4" aria-hidden="true" />;
      case 'zap':
        return <Zap className="w-4 h-4" aria-hidden="true" />;
      default:
        return <Clock className="w-4 h-4" aria-hidden="true" />;
    }
  };

  // Generate enhanced preview text with breaks calculation
  const getCustomPreviewText = () => {
    const totalBreakTime = customNumberOfBreaks * customBreakTime;
    const totalSessionTime = customFocusTime + totalBreakTime;
    
    if (customNumberOfBreaks === 1) {
      return `${customFocusTime} minutes of focused work followed by ${customBreakTime} minute${customBreakTime !== 1 ? 's' : ''} of break time`;
    } else {
      return `${customFocusTime} minutes of focused work with ${customNumberOfBreaks} breaks of ${customBreakTime} minute${customBreakTime !== 1 ? 's' : ''} each`;
    }
  };

  const getCustomSessionSummary = () => {
    const totalBreakTime = customNumberOfBreaks * customBreakTime;
    const totalSessionTime = customFocusTime + totalBreakTime;
    return `Total session: ${totalSessionTime} minutes (${customFocusTime}m work + ${totalBreakTime}m breaks)`;
  };

  // Get session progress text
  const getSessionProgressText = () => {
    if (sessionType === 'Focus') {
      return `Focus Session ${currentFocusSession} of ${totalFocusSessions}`;
    } else {
      return `Break ${currentFocusSession} of ${totalFocusSessions}`;
    }
  };

  return (
    <div className="card-primary h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Focus Timer</h2>
        <div className="flex items-center space-x-3">
          <Timer className="w-5 h-5 text-blue-500 dark:text-blue-400" aria-hidden="true" />
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            sessionType === 'Focus' 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
          }`}>
            {getSessionProgressText()}
          </span>
          
          {/* Sound Toggle Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={toggleSound}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 focus-ring touch-target ${
                soundSettings.enabled 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-800' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
              title={soundSettings.enabled ? 'Sound notifications enabled' : 'Sound notifications disabled'}
              aria-label={soundSettings.enabled ? 'Disable sound notifications' : 'Enable sound notifications'}
            >
              {soundSettings.enabled ? (
                <Volume2 className="w-4 h-4" aria-hidden="true" />
              ) : (
                <VolumeX className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Task Name Input */}
      <div className="mb-4">
        {isEditingTask ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={taskName}
              onChange={handleTaskNameChange}
              onKeyDown={handleTaskNameKeyDown}
              placeholder="What are you working on?"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-calm-700 text-gray-900 dark:text-gray-100 form-input"
              autoFocus
              aria-label="Task name"
              disabled={isActive}
            />
            <button
              onClick={handleTaskNameSubmit}
              className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors focus-ring"
              aria-label="Save task name"
              disabled={isActive}
            >
              <Check className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div 
            className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
              taskName 
                ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Target className={`w-5 h-5 ${
                taskName 
                  ? 'text-blue-500 dark:text-blue-400' 
                  : 'text-gray-400 dark:text-gray-500'
              }`} aria-hidden="true" />
              <span className={`${
                taskName 
                  ? 'text-gray-800 dark:text-gray-200 font-medium' 
                  : 'text-gray-500 dark:text-gray-400 italic'
              }`}>
                {taskName || 'No task set'}
              </span>
            </div>
            <button
              onClick={() => setIsEditingTask(true)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors focus-ring"
              aria-label="Edit task name"
              disabled={isActive}
            >
              <Edit className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Preset Buttons - Only show when showPresets is true and timer is not active */}
      {showPresets && !isActive && !isPaused && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Presets:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSoundSettings(!showSoundSettings)}
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors focus-ring"
              >
                {showSoundSettings ? 'Hide Sound' : 'Sound Settings'}
              </button>
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors focus-ring"
              >
                {showOptions ? 'Hide Options' : 'More Options'}
              </button>
            </div>
          </div>
          
          {/* Sound Settings Panel */}
          {showSoundSettings && (
            <div className="mb-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <SoundControls showAdvanced={true} />
            </div>
          )}
          
          <div className="grid grid-cols-4 gap-2 mb-3">
            {FOCUS_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-center touch-target focus-ring ${
                  isPresetSelected(preset)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-calm-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                aria-label={`Select ${preset.name} preset: ${preset.focusMinutes} minutes focus, ${preset.breakMinutes} minutes break`}
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
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-center touch-target focus-ring ${
                !currentPreset
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-calm-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              aria-label="Customize timer settings"
            >
              <div className="flex items-center justify-center mb-1">
                <Settings className="w-4 h-4" aria-hidden="true" />
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
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors touch-target focus-ring ${
                      optionsMode === 'presets'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    aria-pressed={optionsMode === 'presets'}
                  >
                    Presets
                  </button>
                  <button
                    onClick={() => setOptionsMode('custom')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors touch-target focus-ring ${
                      optionsMode === 'custom'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    aria-pressed={optionsMode === 'custom'}
                  >
                    Custom
                  </button>
                  <button
                    onClick={() => setShowOptions(false)}
                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 touch-target focus-ring"
                    aria-label="Close options panel"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
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
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left touch-target focus-ring ${
                        isPresetSelected(preset)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-calm-800 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      aria-label={`Select ${preset.name} preset: ${preset.description}`}
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
                    <label htmlFor="focus-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Focus Time (minutes)
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => adjustCustomTime('focus', 'down')}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-target focus-ring"
                        aria-label="Decrease focus time by 5 minutes"
                      >
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <div className="flex-1 text-center">
                        <input
                          id="focus-time"
                          type="number"
                          min="5"
                          max="120"
                          value={customFocusTime}
                          onChange={(e) => setCustomFocusTime(Math.max(5, Math.min(120, parseInt(e.target.value) || 5)))}
                          className="w-20 text-center text-lg font-bold bg-white dark:bg-calm-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 form-input focus-ring"
                          aria-label="Focus time in minutes"
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">5-120 minutes</div>
                      </div>
                      <button
                        onClick={() => adjustCustomTime('focus', 'up')}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-target focus-ring"
                        aria-label="Increase focus time by 5 minutes"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Break Time Setting */}
                  <div>
                    <label htmlFor="break-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Break Time (minutes)
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => adjustCustomTime('break', 'down')}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-target focus-ring"
                        aria-label="Decrease break time by 5 minutes"
                      >
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <div className="flex-1 text-center">
                        <input
                          id="break-time"
                          type="number"
                          min="1"
                          max="60"
                          value={customBreakTime}
                          onChange={(e) => setCustomBreakTime(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                          className="w-20 text-center text-lg font-bold bg-white dark:bg-calm-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 form-input focus-ring"
                          aria-label="Break time in minutes"
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">1-60 minutes</div>
                      </div>
                      <button
                        onClick={() => adjustCustomTime('break', 'up')}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-target focus-ring"
                        aria-label="Increase break time by 5 minutes"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Number of Breaks Setting */}
                  <div>
                    <label htmlFor="break-count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Number of Focus Sessions
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => adjustCustomTime('breaks', 'down')}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-target focus-ring"
                        aria-label="Decrease number of focus sessions"
                      >
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <div className="flex-1 text-center">
                        <input
                          id="break-count"
                          type="number"
                          min="1"
                          max="5"
                          value={customNumberOfBreaks}
                          onChange={(e) => setCustomNumberOfBreaks(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                          className="w-20 text-center text-lg font-bold bg-white dark:bg-calm-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 form-input focus-ring"
                          aria-label="Number of focus sessions"
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">1-5 sessions</div>
                      </div>
                      <button
                        onClick={() => adjustCustomTime('breaks', 'up')}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-target focus-ring"
                        aria-label="Increase number of focus sessions"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Preview */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Session Preview</h5>
                    <p className="text-sm text-purple-700 dark:text-purple-400 mb-2">
                      {getCustomPreviewText()}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-500 font-medium">
                      {getCustomSessionSummary()}
                    </p>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={handleCustomApply}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg transition-colors font-medium btn-primary focus-ring"
                    aria-label="Apply custom timer settings"
                  >
                    <Save className="w-4 h-4" aria-hidden="true" />
                    <span>Apply Custom Settings</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* IMPROVED TIMER LAYOUT - Removed Progress Circle, Added Spacing */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Main Timer Display - Centered with More Spacing */}
        <div className="flex items-center justify-center mb-8">
          {/* CENTER: Enlarged Timer Circle with More Space */}
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64 mb-6" role="timer" aria-label={`${sessionType} timer: ${formattedTime}`}>
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 264 264" aria-hidden="true">
                <circle
                  cx="132"
                  cy="132"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="132"
                  cy="132"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${progress * 7.54} 754`}
                  className={`transition-all duration-1000 ease-out ${
                    sessionType === 'Focus' ? 'text-blue-500 dark:text-blue-400' : 'text-green-500 dark:text-green-400'
                  }`}
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* Timer Text with Outfit Font - REDUCED SIZE */}
                <div 
                  className="text-6xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight leading-none select-none"
                  style={{
                    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontWeight: '700',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  aria-hidden="true" // The parent div has the aria-label
                >
                  {formattedTime}
                </div>
                {/* Session counter */}
                {totalFocusSessions > 1 && (
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Session {currentFocusSession} of {totalFocusSessions}
                  </div>
                )}
                
                {/* Display task name if set */}
                {taskName && (
                  <div className="mt-3 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {taskName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Button Group - Play/Pause and Restart Side by Side */}
        <div className="flex justify-center items-center space-x-6 mb-8">
          {/* Play/Pause Button */}
          <button
            onClick={handleToggleTimer}
            className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus-ring touch-target ${
              isActive
                ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
            }`}
            aria-label={isActive ? 'Pause timer' : 'Start timer'}
          >
            {isActive ? <Pause className="w-8 h-8" aria-hidden="true" /> : <Play className="w-8 h-8 ml-1" aria-hidden="true" />}
          </button>

          {/* Restart Button - Now Next to Play/Pause */}
          <button
            onClick={reset}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus-ring touch-target"
            aria-label="Reset timer to original time"
          >
            <RotateCcw className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Status Text with Enhanced Spacing */}
        <div className="text-center text-gray-600 dark:text-gray-400 mb-8" aria-live="polite">
          {isActive ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
              <span className="text-sm font-medium">Session in progress</span>
              {soundSettings.enabled && (
                <span className="text-xs text-green-600 dark:text-green-400">• Sound enabled</span>
              )}
            </div>
          ) : isPaused ? (
            <div className="flex items-center justify-center space-x-2 py-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" aria-hidden="true"></div>
              <span className="text-sm font-medium">Timer paused - click play to resume</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm">Click play to start your {sessionType.toLowerCase()} session</span>
              {soundSettings.enabled && (
                <span className="text-xs text-blue-600 dark:text-blue-400">• Sound notifications ready</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settings Section - At bottom with enhanced spacing */}
      {preferences && (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
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
                {preferences.numberOfBreaks && preferences.numberOfBreaks > 1 ? 
                  ` × ${preferences.numberOfBreaks} sessions` : ''}
              </span>
              <div className="flex items-center space-x-3">
                {preferences.breakReminders && (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></div>
                    <span className="text-xs">Notifications on</span>
                  </div>
                )}
                {soundSettings.enabled && (
                  <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                    <Volume2 className="w-3 h-3" aria-hidden="true" />
                    <span className="text-xs">Sound on</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
