import React from 'react';
import { Volume2, VolumeX, Play, TestTube } from 'lucide-react';
import { useSoundSettings } from '../hooks/useSoundSettings';

interface SoundControlsProps {
  className?: string;
  showAdvanced?: boolean;
}

export const SoundControls: React.FC<SoundControlsProps> = ({ 
  className = '', 
  showAdvanced = false 
}) => {
  const { 
    settings, 
    updateSettings, 
    toggleSound, 
    setVolume, 
    testFocusSound, 
    testBreakSound 
  } = useSoundSettings();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Sound Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${settings.enabled ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
            {settings.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sound Notifications</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {settings.enabled ? 'Enabled' : 'Disabled'} • Timer completion sounds
            </p>
          </div>
        </div>
        <button
          onClick={toggleSound}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-ring ${
            settings.enabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
          }`}
          aria-label={settings.enabled ? 'Disable sound notifications' : 'Enable sound notifications'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Volume Control */}
      {settings.enabled && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Volume: {Math.round(settings.volume * 100)}%
          </label>
          <div className="flex items-center space-x-3">
            <VolumeX className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      {showAdvanced && settings.enabled && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Sound Preferences</h4>
          
          {/* Focus Complete Sound */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Focus Session Complete
            </label>
            <div className="flex items-center space-x-3">
              <select
                value={settings.focusCompleteSound}
                onChange={(e) => updateSettings({ focusCompleteSound: e.target.value })}
                className="flex-1 form-select text-sm min-h-[44px]"
              >
                <option value="chime">Gentle Chime</option>
                <option value="bell">Meditation Bell</option>
              </select>
              <div className="flex items-center justify-center">
                <button
                  onClick={testFocusSound}
                  className="flex items-center justify-center w-11 h-11 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors touch-target focus-ring"
                  title="Test focus complete sound"
                  aria-label="Test focus complete sound"
                >
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Break Complete Sound */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Break Session Complete
            </label>
            <div className="flex items-center space-x-3">
              <select
                value={settings.breakCompleteSound}
                onChange={(e) => updateSettings({ breakCompleteSound: e.target.value })}
                className="flex-1 form-select text-sm min-h-[44px]"
              >
                <option value="chime">Gentle Chime</option>
                <option value="notification">Soft Notification</option>
                <option value="bell">Light Bell</option>
              </select>
              <div className="flex items-center justify-center">
                <button
                  onClick={testBreakSound}
                  className="flex items-center justify-center w-11 h-11 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors touch-target focus-ring"
                  title="Test break complete sound"
                  aria-label="Test break complete sound"
                >
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tick Sound Option */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtle Tick Sound</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Very quiet tick every second</p>
            </div>
            <button
              onClick={() => updateSettings({ 
                tickSound: settings.tickSound ? undefined : 'enabled' 
              })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-ring ${
                settings.tickSound ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
              }`}
              aria-label={settings.tickSound ? 'Disable tick sound' : 'Enable tick sound'}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  settings.tickSound ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Sound Info */}
      {settings.enabled && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-2">
            <TestTube className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Sound Features:</p>
              <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                <li>• Pleasant, non-jarring notification sounds</li>
                <li>• Different tones for focus vs break completion</li>
                <li>• Generated using Web Audio API for quality</li>
                <li>• Respects browser autoplay policies</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};