import React, { useState, useEffect } from 'react';
import { X, Watch, Calendar, Smartphone, Heart, Clock, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

interface DeviceConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceType: 'smartwatch' | 'calendar';
  onConnect: (provider: string) => Promise<boolean>;
  isConnecting: boolean;
}

export const DeviceConnectionModal: React.FC<DeviceConnectionModalProps> = ({
  isOpen,
  onClose,
  deviceType,
  onConnect,
  isConnecting
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [connectionStep, setConnectionStep] = useState<'select' | 'connecting' | 'success'>('select');

  if (!isOpen) return null;

  const smartwatchProviders = [
    { 
      id: 'apple', 
      name: 'Apple Watch', 
      icon: '⌚', 
      description: 'Heart rate, activity, sleep data',
      enabled: false,
      comingSoon: true
    },
    { 
      id: 'fitbit', 
      name: 'Fitbit', 
      icon: '🏃', 
      description: 'Comprehensive health tracking',
      enabled: false,
      comingSoon: true
    },
    { 
      id: 'garmin', 
      name: 'Garmin', 
      icon: '🏔️', 
      description: 'Advanced fitness metrics',
      enabled: false,
      comingSoon: true
    },
    { 
      id: 'samsung', 
      name: 'Samsung Galaxy Watch', 
      icon: '⌚', 
      description: 'Health and wellness data',
      enabled: false,
      comingSoon: true
    }
  ];

  const calendarProviders = [
    { 
      id: 'google', 
      name: 'Google Calendar', 
      icon: '📅', 
      description: 'Meetings, events, focus blocks',
      enabled: true,
      oauth: true
    },
    { 
      id: 'microsoft', 
      name: 'Microsoft Calendar', 
      icon: '📧', 
      description: 'Outlook calendar integration',
      enabled: false,
      comingSoon: true
    },
    { 
      id: 'apple', 
      name: 'Apple Calendar', 
      icon: '🍎', 
      description: 'Personal and work events',
      enabled: false,
      comingSoon: true
    },
    { 
      id: 'notion', 
      name: 'Notion Calendar', 
      icon: '📝', 
      description: 'Task and event management',
      enabled: false,
      comingSoon: true
    }
  ];

  const providers = deviceType === 'smartwatch' ? smartwatchProviders : calendarProviders;

  const handleConnect = async () => {
    if (!selectedProvider) return;
    
    setConnectionStep('connecting');
    const success = await onConnect(selectedProvider);
    
    if (success) {
      setConnectionStep('success');
      setTimeout(() => {
        onClose();
        setConnectionStep('select');
        setSelectedProvider(null);
      }, 2000);
    } else {
      setConnectionStep('select');
    }
  };

  const getDeviceIcon = () => {
    return deviceType === 'smartwatch' ? <Watch className="w-6 h-6" /> : <Calendar className="w-6 h-6" />;
  };

  const getDeviceTitle = () => {
    return deviceType === 'smartwatch' ? 'Connect Smartwatch' : 'Connect Calendar';
  };

  const getDeviceDescription = () => {
    return deviceType === 'smartwatch' 
      ? 'Connect your smartwatch to monitor physiological data and enhance cognitive insights'
      : 'Connect your calendar to analyze meeting patterns and optimize focus time';
  };

  const getDataTypes = () => {
    return deviceType === 'smartwatch'
      ? ['Heart rate monitoring', 'Sleep quality analysis', 'Stress level detection', 'Activity tracking']
      : ['Meeting schedule analysis', 'Focus time optimization', 'Deadline tracking', 'Cognitive load prediction'];
  };

  const ThemePreview: React.FC<{ theme: 'light' | 'dark'; isSelected: boolean; onSelect: () => void }> = ({ 
    theme, 
    isSelected, 
    onSelect 
  }) => (
    <button
      onClick={onSelect}
      className={`relative w-full p-6 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-105 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      )}
      
      {/* Theme icon */}
      <div className={`inline-flex p-3 rounded-xl mb-4 shadow-lg ${
        theme === 'light' 
          ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
          : 'bg-gradient-to-r from-indigo-500 to-purple-600'
      }`}>
        {theme === 'light' ? (
          <Calendar className="w-6 h-6 text-white" />
        ) : (
          <Watch className="w-6 h-6 text-white" />
        )}
      </div>
      
      {/* Theme info */}
      <div className="space-y-3">
        <div>
          <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
            {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {theme === 'light' 
              ? 'Clean and bright interface perfect for daytime use' 
              : 'Easy on the eyes with reduced strain for extended sessions'
            }
          </p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="modal-overlay-critical flex items-center justify-center p-4">
      <div 
        className="relative bg-white dark:bg-calm-800 rounded-xl shadow-2xl dark:shadow-gentle-dark max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-calm-200 dark:border-calm-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-calm-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              {getDeviceIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{getDeviceTitle()}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{getDeviceDescription()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-calm-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {connectionStep === 'select' && (
          <div className="p-6">
            {/* Data Benefits */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500 dark:text-red-400" />
                <span>Enhanced Cognitive Insights</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                {getDataTypes().map((dataType, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    <span>{dataType}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Provider Selection */}
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Choose your {deviceType === 'smartwatch' ? 'smartwatch' : 'calendar'} provider:</h3>
              {providers.map((provider) => {
                const isEnabled = 'enabled' in provider ? provider.enabled : true;
                const isComingSoon = 'comingSoon' in provider ? provider.comingSoon : false;
                const hasOAuth = 'oauth' in provider ? provider.oauth : false;
                
                return (
                  <button
                    key={provider.id}
                    onClick={() => isEnabled && setSelectedProvider(provider.id)}
                    disabled={!isEnabled}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      !isEnabled
                        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed'
                        : selectedProvider === provider.id
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-calm-700 bg-white dark:bg-calm-800'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{provider.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-medium ${isEnabled ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                            {provider.name}
                          </h4>
                          {hasOAuth && isEnabled && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full border border-green-200 dark:border-green-800">
                              OAuth 2.0
                            </span>
                          )}
                          {isComingSoon && (
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full border border-yellow-200 dark:border-yellow-800">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isEnabled ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                          {provider.description}
                        </p>
                        {hasOAuth && isEnabled && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Secure authentication via {provider.name} OAuth
                          </p>
                        )}
                      </div>
                      {isEnabled && selectedProvider === provider.id && (
                        <CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* OAuth Information for Calendar - Only show for Google */}
            {deviceType === 'calendar' && selectedProvider === 'google' && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Secure OAuth Connection</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                      You'll be redirected to {providers.find(p => p.id === selectedProvider)?.name} to authorize access to your calendar data.
                    </p>
                    <div className="text-xs text-blue-600 dark:text-blue-500 space-y-1">
                      <div>• Read-only access to calendar events</div>
                      <div>• Meeting schedule analysis</div>
                      <div>• Focus time optimization</div>
                      <div>• No ability to create or modify events</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Coming Soon Notice for Smartwatch */}
            {deviceType === 'smartwatch' && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Smartwatch Integration Coming Soon</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">
                      We're working on secure integrations with major smartwatch providers to bring you physiological monitoring capabilities.
                    </p>
                    <div className="text-xs text-yellow-600 dark:text-yellow-500 space-y-1">
                      <div>• Apple Watch - Health data integration</div>
                      <div>• Fitbit - Comprehensive wellness tracking</div>
                      <div>• Garmin - Advanced fitness metrics</div>
                      <div>• Samsung Galaxy Watch - Health monitoring</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-calm-700 rounded-lg border border-gray-200 dark:border-calm-600">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Privacy & Security</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your data is processed locally and encrypted. You can control what data is shared 
                    and disconnect at any time. No personal information is stored on external servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Connect Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              {deviceType === 'calendar' ? (
                <button
                  onClick={handleConnect}
                  disabled={!selectedProvider || !providers.find(p => p.id === selectedProvider && ('enabled' in p ? p.enabled : true))}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {selectedProvider && providers.find(p => p.id === selectedProvider && ('oauth' in p ? p.oauth : false))
                    ? `Connect via OAuth`
                    : `Connect ${selectedProvider ? providers.find(p => p.id === selectedProvider)?.name : 'Device'}`
                  }
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </div>
          </div>
        )}

        {connectionStep === 'connecting' && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {providers.find(p => p.id === selectedProvider && ('oauth' in p ? p.oauth : false))
                ? 'Redirecting to OAuth...'
                : 'Connecting...'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {providers.find(p => p.id === selectedProvider && ('oauth' in p ? p.oauth : false))
                ? `You'll be redirected to ${providers.find(p => p.id === selectedProvider)?.name} to authorize access`
                : `Establishing secure connection with ${providers.find(p => p.id === selectedProvider)?.name}`
              }
            </p>
          </div>
        )}

        {connectionStep === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Successfully Connected!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {providers.find(p => p.id === selectedProvider)?.name} is now integrated with your cognitive monitoring system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};