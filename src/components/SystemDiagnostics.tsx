import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity, 
  Database, 
  Wifi,
  RefreshCw,
  Settings,
  Monitor,
  Brain,
  Smartphone
} from 'lucide-react';
import { cognitiveMonitor } from '../services/CognitiveMonitor';
import { digitalWellnessMonitor } from '../services/DigitalWellnessMonitor';
import { timerService } from '../services/TimerService';
import { userDataManager } from '../services/UserDataManager';

interface DiagnosticResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: string;
  lastCheck: Date;
  resolution?: string;
}

export const SystemDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<Date | null>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // 1. Check Cognitive Monitor Service
    try {
      const isMonitoringActive = cognitiveMonitor.isActive();
      const monitoringData = cognitiveMonitor.getData();
      const dataSourceStatus = cognitiveMonitor.getDataSourceStatus();
      
      if (!isMonitoringActive) {
        results.push({
          component: 'Cognitive Monitor',
          status: 'warning',
          message: 'Monitoring service is not active',
          details: 'The cognitive monitoring service has been paused or stopped',
          lastCheck: new Date(),
          resolution: 'Start monitoring from the Dashboard or Monitor tab'
        });
      } else if (Object.values(dataSourceStatus).every(status => status === 'Disconnected')) {
        results.push({
          component: 'Cognitive Monitor',
          status: 'error',
          message: 'All data sources disconnected',
          details: 'Browser activity, keyboard, and mouse tracking are not functioning',
          lastCheck: new Date(),
          resolution: 'Check browser permissions and restart monitoring'
        });
      } else {
        results.push({
          component: 'Cognitive Monitor',
          status: 'healthy',
          message: 'Monitoring service operational',
          details: `Active data sources: ${Object.entries(dataSourceStatus).filter(([,status]) => status === 'Active').length}/4`,
          lastCheck: new Date()
        });
      }
    } catch (error) {
      results.push({
        component: 'Cognitive Monitor',
        status: 'error',
        message: 'Service initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date(),
        resolution: 'Restart the application'
      });
    }

    // 2. Check Digital Wellness Monitor
    try {
      const isDigitalWellnessActive = digitalWellnessMonitor.isActive();
      const digitalData = digitalWellnessMonitor.getData();
      
      if (!isDigitalWellnessActive) {
        results.push({
          component: 'Digital Wellness Monitor',
          status: 'warning',
          message: 'Digital wellness monitoring paused',
          details: 'Social media usage tracking is not active',
          lastCheck: new Date(),
          resolution: 'Enable monitoring in the Wellness section'
        });
      } else {
        results.push({
          component: 'Digital Wellness Monitor',
          status: 'healthy',
          message: 'Digital wellness tracking active',
          details: `Tracking ${digitalData.sessionCount} sessions today`,
          lastCheck: new Date()
        });
      }
    } catch (error) {
      results.push({
        component: 'Digital Wellness Monitor',
        status: 'error',
        message: 'Digital wellness service error',
        details: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date(),
        resolution: 'Check browser permissions for URL monitoring'
      });
    }

    // 3. Check Timer Service
    try {
      const timerState = timerService.getState();
      const isTimerFunctional = timerState.formattedTime !== undefined;
      
      if (!isTimerFunctional) {
        results.push({
          component: 'Timer Service',
          status: 'error',
          message: 'Timer service malfunction',
          details: 'Timer state is corrupted or uninitialized',
          lastCheck: new Date(),
          resolution: 'Reset timer or restart application'
        });
      } else {
        results.push({
          component: 'Timer Service',
          status: 'healthy',
          message: 'Timer service operational',
          details: `Current state: ${timerState.isActive ? 'Active' : 'Inactive'}, Time: ${timerState.formattedTime}`,
          lastCheck: new Date()
        });
      }
    } catch (error) {
      results.push({
        component: 'Timer Service',
        status: 'error',
        message: 'Timer service initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date(),
        resolution: 'Clear browser storage and restart'
      });
    }

    // 4. Check Data Persistence
    try {
      const isUserDataInitialized = userDataManager.isInitialized();
      const userData = userDataManager.getUserData();
      
      if (!isUserDataInitialized) {
        results.push({
          component: 'Data Persistence',
          status: 'error',
          message: 'User data manager not initialized',
          details: 'Local storage access may be blocked',
          lastCheck: new Date(),
          resolution: 'Check browser storage permissions'
        });
      } else if (!userData) {
        results.push({
          component: 'Data Persistence',
          status: 'warning',
          message: 'User data not loaded',
          details: 'Settings and preferences may not persist',
          lastCheck: new Date(),
          resolution: 'Clear browser cache and reload'
        });
      } else {
        const dataSize = userDataManager.getDataSize();
        results.push({
          component: 'Data Persistence',
          status: 'healthy',
          message: 'Data persistence operational',
          details: `Storage size: ${Math.round(dataSize.total / 1024)}KB, Sessions: ${userData.focusSessions.length}`,
          lastCheck: new Date()
        });
      }
    } catch (error) {
      results.push({
        component: 'Data Persistence',
        status: 'error',
        message: 'Data persistence service error',
        details: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date(),
        resolution: 'Check localStorage availability'
      });
    }

    // 5. Check Browser Compatibility
    try {
      const hasLocalStorage = typeof Storage !== 'undefined';
      const hasNotifications = 'Notification' in window;
      const hasAudioContext = 'AudioContext' in window || 'webkitAudioContext' in window;
      const hasVisibilityAPI = typeof document.hidden !== 'undefined';
      
      const missingFeatures = [];
      if (!hasLocalStorage) missingFeatures.push('localStorage');
      if (!hasNotifications) missingFeatures.push('Notifications');
      if (!hasAudioContext) missingFeatures.push('Web Audio API');
      if (!hasVisibilityAPI) missingFeatures.push('Page Visibility API');
      
      if (missingFeatures.length > 0) {
        results.push({
          component: 'Browser Compatibility',
          status: 'warning',
          message: 'Some browser features unavailable',
          details: `Missing: ${missingFeatures.join(', ')}`,
          lastCheck: new Date(),
          resolution: 'Update browser or use a modern browser'
        });
      } else {
        results.push({
          component: 'Browser Compatibility',
          status: 'healthy',
          message: 'All browser features available',
          details: 'Full functionality supported',
          lastCheck: new Date()
        });
      }
    } catch (error) {
      results.push({
        component: 'Browser Compatibility',
        status: 'error',
        message: 'Browser compatibility check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date(),
        resolution: 'Try refreshing the page'
      });
    }

    // 6. Check Cross-Tab Synchronization
    try {
      const tabManager = (window as any).browserTabManager;
      if (tabManager) {
        const isVisible = tabManager.isTabVisible();
        results.push({
          component: 'Cross-Tab Sync',
          status: 'healthy',
          message: 'Tab synchronization active',
          details: `Current tab visible: ${isVisible}`,
          lastCheck: new Date()
        });
      } else {
        results.push({
          component: 'Cross-Tab Sync',
          status: 'warning',
          message: 'Tab manager not initialized',
          details: 'Cross-tab data sync may not work',
          lastCheck: new Date(),
          resolution: 'Restart application'
        });
      }
    } catch (error) {
      results.push({
        component: 'Cross-Tab Sync',
        status: 'error',
        message: 'Tab synchronization error',
        details: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date(),
        resolution: 'Close other tabs and restart'
      });
    }

    setDiagnostics(results);
    setLastFullCheck(new Date());
    setIsRunning(false);
  };

  const fixIssue = async (component: string) => {
    switch (component) {
      case 'Cognitive Monitor':
        cognitiveMonitor.startMonitoring();
        break;
      case 'Digital Wellness Monitor':
        digitalWellnessMonitor.startMonitoring();
        break;
      case 'Timer Service':
        timerService.reset();
        break;
      case 'Data Persistence':
        userDataManager.reloadFromStorage();
        break;
      default:
        console.log(`No automatic fix available for ${component}`);
    }
    
    // Re-run diagnostics after fix attempt
    setTimeout(runDiagnostics, 1000);
  };

  useEffect(() => {
    // Run initial diagnostics
    runDiagnostics();
    
    // Set up periodic health checks every 5 minutes
    const healthCheckInterval = setInterval(runDiagnostics, 5 * 60 * 1000);
    
    return () => clearInterval(healthCheckInterval);
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'healthy':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
    }
  };

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'Cognitive Monitor':
        return <Brain className="w-4 h-4" />;
      case 'Digital Wellness Monitor':
        return <Smartphone className="w-4 h-4" />;
      case 'Timer Service':
        return <Clock className="w-4 h-4" />;
      case 'Data Persistence':
        return <Database className="w-4 h-4" />;
      case 'Browser Compatibility':
        return <Monitor className="w-4 h-4" />;
      case 'Cross-Tab Sync':
        return <Wifi className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const healthyCount = diagnostics.filter(d => d.status === 'healthy').length;
  const warningCount = diagnostics.filter(d => d.status === 'warning').length;
  const errorCount = diagnostics.filter(d => d.status === 'error').length;

  return (
    <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">System Diagnostics</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monitoring system health and performance
          </p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors focus-ring"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running...' : 'Run Diagnostics'}</span>
        </button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
            <span className="font-semibold text-green-800 dark:text-green-300">Healthy: {healthyCount}</span>
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            <span className="font-semibold text-yellow-800 dark:text-yellow-300">Warnings: {warningCount}</span>
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
            <span className="font-semibold text-red-800 dark:text-red-300">Errors: {errorCount}</span>
          </div>
        </div>
      </div>

      {/* Diagnostic Results */}
      <div className="space-y-4">
        {diagnostics.map((result, index) => (
          <div key={index} className={`border-2 rounded-lg p-4 ${getStatusColor(result.status)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  {getComponentIcon(result.component)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    {result.component}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {result.message}
                  </p>
                  {result.details && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {result.details}
                    </p>
                  )}
                  {result.resolution && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2 mt-2">
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        <strong>Resolution:</strong> {result.resolution}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Last checked: {result.lastCheck.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              {(result.status === 'warning' || result.status === 'error') && (
                <button
                  onClick={() => fixIssue(result.component)}
                  className="ml-4 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors focus-ring"
                >
                  Auto Fix
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Last Check Info */}
      {lastFullCheck && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Last full system check: {lastFullCheck.toLocaleString()}
            </span>
            <span className="text-gray-500 dark:text-gray-500">
              Next automatic check in 5 minutes
            </span>
          </div>
        </div>
      )}

      {/* System Health Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">System Health Summary</h4>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {errorCount === 0 && warningCount === 0 ? (
            <p className="text-green-700 dark:text-green-400">
              ✅ All systems operational. The monitoring platform is functioning optimally.
            </p>
          ) : errorCount > 0 ? (
            <p className="text-red-700 dark:text-red-400">
              ⚠️ Critical issues detected. Immediate attention required to restore full functionality.
            </p>
          ) : (
            <p className="text-yellow-700 dark:text-yellow-400">
              ⚡ Minor issues detected. System is functional but could benefit from optimization.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};