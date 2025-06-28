import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Database, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  FileText,
  HardDrive,
  Trash2,
  Settings,
  Activity,
  Smartphone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useUserData } from '../hooks/useUserData';

export const DataManagement: React.FC = () => {
  const { 
    userData, 
    exportData, 
    importData, 
    resetAllData, 
    getDataSize, 
    error, 
    clearError 
  } = useUserData();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const dataSize = getDataSize();

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleExport = async () => {
    setIsExporting(true);
    setImportError(null);
    clearError();
    
    try {
      const jsonData = await exportData();
      
      // Create and download file
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `brainwave-shift-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccessMessage('Data exported successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    clearError();

    try {
      const text = await file.text();
      await importData(text);
      
      setSuccessMessage('Data imported successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import data');
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    setImportError(null);
    clearError();

    try {
      await resetAllData();
      setShowResetConfirm(false);
      setSuccessMessage('All data has been reset to defaults!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to reset data');
    } finally {
      setIsResetting(false);
    }
  };

  // Group data into main categories
  const getGroupedDataSize = () => {
    const breakdown = dataSize.breakdown;
    
    return {
      userPreferencesSettings: (breakdown.preferences || 0) + (breakdown.soundSettings || 0) + (breakdown.appState || 0),
      sessionAnalytics: (breakdown.analytics || 0) + (breakdown.focusSessions || 0) + (breakdown.interventions || 0),
      deviceIntegration: (breakdown.deviceIntegrations || 0) + (breakdown.digitalWellness || 0)
    };
  };

  const groupedData = getGroupedDataSize();

  if (!userData) {
    return (
      <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Data Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Backup, restore, and manage your user data</p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {(error || importError) && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Error</p>
                <p className="text-sm text-red-700 dark:text-red-400">{error || importError}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Success</p>
                <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Simplified Data Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <HardDrive className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Data Size</span>
            </div>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{formatBytes(dataSize.total)}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Focus Sessions</span>
            </div>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{userData.focusSessions.length}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</span>
            </div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {new Date(userData.analytics.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Grouped Storage Breakdown */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Storage Overview</h4>
            <button
              onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
              className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <span>{showDetailedBreakdown ? 'Hide Details' : 'Show Details'}</span>
              {showDetailedBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
          
          {/* Simplified grouped breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Settings className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">User Preferences & Settings</span>
              </div>
              <span className="font-medium text-gray-800 dark:text-gray-200">{formatBytes(groupedData.userPreferencesSettings)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Activity className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Session & Analytics Data</span>
              </div>
              <span className="font-medium text-gray-800 dark:text-gray-200">{formatBytes(groupedData.sessionAnalytics)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Device & Integration Data</span>
              </div>
              <span className="font-medium text-gray-800 dark:text-gray-200">{formatBytes(groupedData.deviceIntegration)}</span>
            </div>
          </div>

          {/* Detailed breakdown (collapsible) */}
          {showDetailedBreakdown && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Detailed Breakdown</h5>
              <div className="space-y-1">
                {Object.entries(dataSize.breakdown).map(([key, size]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{formatBytes(size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Export Data */}
        <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Export Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Download your data as JSON</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Create a backup of all your settings, analytics, and session history.
          </p>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
          </button>
        </div>

        {/* Import Data */}
        <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Import Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Restore from backup file</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload a previously exported JSON file to restore your data.
          </p>
          
          <label className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors font-medium cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{isImporting ? 'Importing...' : 'Import Data'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>

        {/* Reset Data */}
        <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <RotateCcw className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Reset Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clear all data and start fresh</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This will permanently delete all your data and reset to defaults.
          </p>
          
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset All Data</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Are you sure?</p>
                <p className="text-xs text-red-700 dark:text-red-400">This action cannot be undone.</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isResetting ? 'Resetting...' : 'Confirm'}</span>
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  disabled={isResetting}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Privacy & Security</h4>
            <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <p>• All data is stored locally in your browser's localStorage</p>
              <p>• No data is transmitted to external servers</p>
              <p>• Exported files contain only your personal usage data</p>
              <p>• You have complete control over your data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};