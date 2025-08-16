import React, { useState, useRef, useEffect } from 'react';
import { 
  Monitor, 
  Bell, 
  Shield, 
  Smartphone,
  Save,
  RotateCcw,
  CheckCircle,
  Watch,
  Calendar,
  Wifi,
  WifiOff,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Palette,
  Database,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { UserPreferences } from '../types';
import { useDeviceIntegration } from '../hooks/useDeviceIntegration';
import { DeviceConnectionModal } from './DeviceConnectionModal';
import { ThemeSelector } from './ThemeToggle';
import { SoundControls } from './SoundControls';
import { useOnboarding } from '../hooks/useOnboarding';
import { DataManagement } from './DataManagement';

interface SettingsProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onResetPreferences: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  preferences,
  onUpdatePreferences,
  onResetPreferences
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [connectionModal, setConnectionModal] = useState<{
    isOpen: boolean;
    deviceType: 'smartwatch' | 'calendar';
  }>({ isOpen: false, deviceType: 'smartwatch' });
  const [activeSection, setActiveSection] = useState<'general' | 'data'>('general');
  
  // Ref to maintain scroll position
  const settingsContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const {
    integrations,
    isConnecting,
    connectSmartwatch,
    connectCalendar,
    disconnectDevice,
    updatePrivacyLevel
  } = useDeviceIntegration();

  const { resetOnboarding } = useOnboarding();

  // Save scroll position before any state update
  useEffect(() => {
    const saveScrollPosition = () => {
      if (settingsContainerRef.current) {
        setScrollPosition(settingsContainerRef.current.scrollTop);
      }
    };

    const container = settingsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', saveScrollPosition);
      return () => container.removeEventListener('scroll', saveScrollPosition);
    }
  }, []);

  // Restore scroll position after render
  useEffect(() => {
    if (settingsContainerRef.current) {
      settingsContainerRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition, preferences, activeSection, showSaveConfirmation]);

  const handleSave = async () => {
    // Save current scroll position
    if (settingsContainerRef.current) {
      setScrollPosition(settingsContainerRef.current.scrollTop);
    }
    
    setIsSaving(true);
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 2000);
  };

  const handleReset = () => {
    // Save current scroll position
    if (settingsContainerRef.current) {
      setScrollPosition(settingsContainerRef.current.scrollTop);
    }
    
    onResetPreferences();
    setShowSaveConfirmation(false);
  };

  const handleRestartOnboarding = () => {
    if (confirm('This will restart the onboarding tour. Are you sure?')) {
      resetOnboarding();
      // The app will automatically show onboarding when the page reloads
      window.location.reload();
    }
  };

  const handleDeviceConnect = async (provider: string) => {
    if (connectionModal.deviceType === 'smartwatch') {
      return await connectSmartwatch(provider);
    } else {
      return await connectCalendar(provider);
    }
  };

  const getIntegrationStatus = (type: string) => {
    const integration = integrations.find(i => i.type === type);
    return integration?.status || 'disconnected';
  };

  const getIntegrationProvider = (type: string) => {
    const integration = integrations.find(i => i.type === type);
    return integration?.provider;
  };

  const getIntegrationLastSync = (type: string) => {
    const integration = integrations.find(i => i.type === type);
    return integration?.lastSync;
  };

  const handleSectionChange = (section: 'general' | 'data') => {
    // Save current scroll position before changing section
    if (settingsContainerRef.current) {
      setScrollPosition(0); // Reset to top for new section
    }
    setActiveSection(section);
  };

  const SettingCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
  }> = ({ icon, title, description, children }) => (
    <div className="bg-white dark:bg-calm-800 rounded-lg shadow-md dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <div className="text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6" ref={settingsContainerRef}>
      <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Settings</h2>
          <div className="flex items-center space-x-3">
            {showSaveConfirmation && (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Settings saved!</span>
              </div>
            )}
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors focus-ring"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 focus-ring"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => handleSectionChange('general')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus-ring ${
              activeSection === 'general'
                ? 'bg-white dark:bg-calm-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>General Settings</span>
          </button>
          <button
            onClick={() => handleSectionChange('data')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus-ring ${
              activeSection === 'data'
                ? 'bg-white dark:bg-calm-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Data Management</span>
          </button>
        </div>

        {activeSection === 'general' ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Theme Settings */}
            <SettingCard
              icon={<Palette className="w-5 h-5" />}
              title="Appearance"
              description="Customize the visual appearance of your workspace"
            >
              <ThemeSelector />
            </SettingCard>

            {/* Sound Settings */}
            <SettingCard
              icon={<Monitor className="w-5 h-5" />}
              title="Sound Notifications"
              description="Configure audio notifications for timer events and focus sessions"
            >
              <SoundControls showAdvanced={true} />
            </SettingCard>

            <SettingCard
              icon={<Bell className="w-5 h-5" />}
              title="Notifications"
              description="Control how and when you receive wellness reminders"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Break Reminders</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get notified when it's time for a break</p>
                  </div>
                  <button
                    onClick={() => onUpdatePreferences({
                      breakReminders: !preferences.breakReminders
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-ring ${
                      preferences.breakReminders ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.breakReminders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ambient Notifications</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Subtle visual cues instead of pop-ups</p>
                  </div>
                  <button
                    onClick={() => onUpdatePreferences({
                      ambientNotifications: !preferences.ambientNotifications
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-ring ${
                      preferences.ambientNotifications ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.ambientNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </SettingCard>

            <SettingCard
              icon={<Monitor className="w-5 h-5" />}
              title="Cognitive Monitoring"
              description="Configure how your cognitive state is tracked and analyzed"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Intervention Frequency
                  </label>
                  <select
                    value={preferences.interventionFrequency}
                    onChange={(e) => onUpdatePreferences({
                      interventionFrequency: e.target.value as UserPreferences['interventionFrequency']
                    })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-calm-700 text-gray-900 dark:text-gray-100 form-select"
                  >
                    <option value="Minimal">Minimal - Only critical interventions</option>
                    <option value="Normal">Normal - Balanced approach</option>
                    <option value="Frequent">Frequent - Proactive wellness</option>
                  </select>
                </div>
              </div>
            </SettingCard>

            <SettingCard
              icon={<Smartphone className="w-5 h-5" />}
              title="Device Integration"
              description="Connect your devices for enhanced cognitive monitoring"
            >
              <div className="space-y-4">
                {/* Browser Integration */}
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Browser Integration</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Built-in monitoring active</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Connected</span>
                  </div>
                </div>

                {/* Smartwatch Integration */}
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-calm-700">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      getIntegrationStatus('smartwatch') === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Smartwatch</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getIntegrationStatus('smartwatch') === 'connected' 
                          ? `${getIntegrationProvider('smartwatch')} • Last sync: ${getIntegrationLastSync('smartwatch')?.toLocaleTimeString()}`
                          : 'Heart rate, sleep, and stress monitoring'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getIntegrationStatus('smartwatch') === 'connected' ? (
                      <>
                        <Wifi className="w-4 h-4 text-green-500" />
                        <button 
                          onClick={() => disconnectDevice('smartwatch')}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium focus-ring"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 text-gray-400" />
                        <button 
                          onClick={() => setConnectionModal({ isOpen: true, deviceType: 'smartwatch' })}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium focus-ring"
                          disabled={isConnecting === 'smartwatch'}
                        >
                          {isConnecting === 'smartwatch' ? 'Connecting...' : 'Connect'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Calendar Integration - Enhanced */}
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-calm-700">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      getIntegrationStatus('calendar') === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Calendar</span>
                        {getIntegrationStatus('calendar') === 'connected' && getIntegrationProvider('calendar') && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-800">
                            OAuth Connected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getIntegrationStatus('calendar') === 'connected' 
                          ? `${getIntegrationProvider('calendar')} • Last sync: ${getIntegrationLastSync('calendar')?.toLocaleTimeString()}`
                          : 'Google Calendar & Microsoft Calendar available'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getIntegrationStatus('calendar') === 'connected' ? (
                      <>
                        <Wifi className="w-4 h-4 text-green-500" />
                        <button 
                          onClick={() => disconnectDevice('calendar')}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium focus-ring"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 text-gray-400" />
                        <button 
                          onClick={() => setConnectionModal({ isOpen: true, deviceType: 'calendar' })}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium focus-ring"
                          disabled={isConnecting === 'calendar'}
                        >
                          {isConnecting === 'calendar' ? 'Connecting...' : 'Connect'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* OAuth Setup Notice */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <ExternalLink className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">🚀 Unlock Smart Scheduling</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                        Connect your calendar to get AI-powered focus time optimization and meeting density analysis.
                      </p>
                      <div className="text-xs text-blue-600 dark:text-blue-500 space-y-1">
                        <div>• ✅ Google Calendar - Instant setup with OAuth 2.0</div>
                        <div>• ✅ Microsoft Calendar - Coming Soon</div>
                        <div>• ⏳ Apple Calendar - Coming Soon</div>
                        <div>• ⏳ Notion Calendar - Coming Soon</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SettingCard>

            <SettingCard
              icon={<Shield className="w-5 h-5" />}
              title="Privacy & Data"
              description="Control your data privacy and sharing preferences"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Anonymous Data Sharing</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Help improve the AI model with anonymous usage data</p>
                  </div>
                  <button
                    onClick={() => onUpdatePreferences({
                      dataSharing: !preferences.dataSharing
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-ring ${
                      preferences.dataSharing ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.dataSharing ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {getIntegrationStatus('smartwatch') === 'connected' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Smartwatch Data Sharing</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Share physiological data for enhanced insights</p>
                    </div>
                    <button
                      onClick={() => onUpdatePreferences({
                        smartwatchDataSharing: !preferences.smartwatchDataSharing
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-ring ${
                        preferences.smartwatchDataSharing ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.smartwatchDataSharing ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {getIntegrationStatus('calendar') === 'connected' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Calendar Data Sharing</label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Share calendar patterns for cognitive load prediction</p>
                    </div>
                    <button
                      onClick={() => onUpdatePreferences({
                        calendarDataSharing: !preferences.calendarDataSharing
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-ring ${
                        preferences.calendarDataSharing ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.calendarDataSharing ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            </SettingCard>

            {/* Onboarding Settings */}
            <SettingCard
              icon={<RotateCcw className="w-5 h-5" />}
              title="Onboarding & Help"
              description="Restart the welcome tour or access help resources"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Welcome Tour</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Restart the onboarding flow to learn about features</p>
                  </div>
                  <button
                    onClick={handleRestartOnboarding}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors border border-purple-200 dark:border-purple-800 focus-ring"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-sm font-medium">Restart Tour</span>
                  </button>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <Eye className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Need Help?</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        The welcome tour provides a comprehensive overview of all Brainwave Shift features, 
                        including cognitive monitoring, focus timer, digital wellness tracking, and analytics.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SettingCard>
          </div>
        ) : (
          <DataManagement />
        )}
      </div>

      <DeviceConnectionModal
        isOpen={connectionModal.isOpen}
        onClose={() => setConnectionModal({ ...connectionModal, isOpen: false })}
        deviceType={connectionModal.deviceType}
        onConnect={handleDeviceConnect}
        isConnecting={isConnecting !== null}
      />
    </div>
  );
};