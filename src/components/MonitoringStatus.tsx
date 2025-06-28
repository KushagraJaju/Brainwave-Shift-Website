import React from 'react';
import { Activity, Mouse, Keyboard, Watch, Wifi, WifiOff } from 'lucide-react';
import { useDataSourceStatus } from '../hooks/useDataSourceStatus';
import { cognitiveMonitor } from '../services/CognitiveMonitor';

export const MonitoringStatus: React.FC = () => {
  const status = useDataSourceStatus();

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <Wifi className="w-4 h-4 text-green-500" />
    ) : (
      <WifiOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
    );
  };

  const getStatusColor = (statusValue: string) => {
    return statusValue === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500';
  };

  const dataSourceItems = [
    {
      name: 'Browser Activity',
      status: status.browserActivity,
      icon: <Activity className="w-5 h-5" />,
      description: 'Tab focus and switching patterns'
    },
    {
      name: 'Keyboard Patterns',
      status: status.keyboardPatterns,
      icon: <Keyboard className="w-5 h-5" />,
      description: 'Typing speed and rhythm analysis'
    },
    {
      name: 'Mouse Movement',
      status: status.mouseMovement,
      icon: <Mouse className="w-5 h-5" />,
      description: 'Movement patterns and click frequency'
    },
    {
      name: 'Smartwatch',
      status: status.smartwatch,
      icon: <Watch className="w-5 h-5" />,
      description: 'Heart rate and activity data'
    }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center space-x-2">
        <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        <span>Data Sources</span>
      </h3>
      <div className="space-y-3">
        {dataSourceItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-calm-700 rounded-lg border border-gray-100 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className={`${getStatusColor(item.status)}`}>
                {item.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                  {getStatusIcon(item.status === 'Active')}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
              </div>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
      
      {/* Real-time indicator with updated interval */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Real-time monitoring active
          </span>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Cognitive metrics update every {cognitiveMonitor.getMonitoringIntervalSeconds()} seconds
        </p>
      </div>
    </div>
  );
};