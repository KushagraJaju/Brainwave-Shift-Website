import React from 'react';
import { Clock, Zap, Target, CheckCircle } from 'lucide-react';
import { FocusPreset, UserPreferences } from '../types';

interface FocusPresetsProps {
  selectedPreset?: string;
  onPresetSelect: (preset: FocusPreset) => void;
  preferences: UserPreferences;
}

const FOCUS_PRESETS: FocusPreset[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    focusMinutes: 25,
    breakMinutes: 5,
    description: 'Classic productivity technique',
    icon: 'clock',
    color: 'from-red-500 to-pink-600',
    features: ['25-minute focus sessions', '5-minute breaks', 'Automatic break reminders']
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    focusMinutes: 90,
    breakMinutes: 15,
    description: 'Extended concentration periods',
    icon: 'target',
    color: 'from-purple-500 to-indigo-600',
    features: ['90-minute focus sessions', '15-minute breaks', 'Minimal interruptions']
  },
  {
    id: 'sprint',
    name: 'Sprint',
    focusMinutes: 25,
    breakMinutes: 10,
    description: 'Intense bursts with longer recovery',
    icon: 'zap',
    color: 'from-orange-500 to-red-600',
    features: ['25-minute focus sessions', '10-minute breaks', 'Frequent break reminders']
  }
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'clock':
      return <Clock className="w-7 h-7 text-white" />;
    case 'target':
      return <Target className="w-7 h-7 text-white" />;
    case 'zap':
      return <Zap className="w-7 h-7 text-white" />;
    default:
      return <Clock className="w-7 h-7 text-white" />;
  }
};

export const FocusPresets: React.FC<FocusPresetsProps> = ({
  selectedPreset,
  onPresetSelect,
  preferences
}) => {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Quick Session Presets</h3>
        <p className="text-gray-600">Choose a preset to instantly configure your focus session, or use custom settings above</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FOCUS_PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset.id;
          const isCurrentSettings = 
            preferences.focusSessionLength === preset.focusMinutes &&
            (preferences.breakLength || 5) === preset.breakMinutes;
          
          return (
            <button
              key={preset.id}
              onClick={() => onPresetSelect(preset)}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left group hover:shadow-lg transform hover:-translate-y-1 ${
                isSelected || isCurrentSettings
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Selected indicator */}
              {(isSelected || isCurrentSettings) && (
                <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
              
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${preset.color} mb-4 shadow-lg`}>
                {getIcon(preset.icon)}
              </div>
              
              {/* Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-1">{preset.name}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{preset.description}</p>
                </div>
                
                {/* Duration info */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">{preset.focusMinutes}m focus</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">{preset.breakMinutes}m break</span>
                  </div>
                </div>
                
                {/* Features */}
                <div className="space-y-2">
                  {preset.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                      <span className="leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Hover effect overlay */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${preset.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            </button>
          );
        })}
      </div>
      
      {/* Custom settings indicator */}
      {!FOCUS_PRESETS.some(preset => 
        preferences.focusSessionLength === preset.focusMinutes &&
        (preferences.breakLength || 5) === preset.breakMinutes
      ) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gradient-to-r from-gray-500 to-blue-500 rounded-full"></div>
            <span className="text-sm font-semibold text-gray-700">Custom Configuration Active</span>
          </div>
          <p className="text-xs text-gray-600 mt-2 ml-7">
            Currently using {preferences.focusSessionLength} minutes focus / {preferences.breakLength || 5} minutes break
          </p>
        </div>
      )}
    </div>
  );
};