import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  HardDrive, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Database,
  RefreshCw,
  Save,
  X
} from 'lucide-react';
import { useUserData } from '../hooks/useUserData';

export const DataManagement: React.FC = () => {
  const { 
    userData, 
    exportData, 
    importData, 
    resetAllData, 
    getStorageInfo,
    error,
    clearError
  } = useUserData();
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [exportedData, setExportedData] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resetConfirmText, setResetConfirmText] = useState('');

  const storageInfo = getStorageInfo();

  const handleExport = () => {
    const data = exportData();
    setExportedData(data);
    setShowExportModal(true);
  };

  const handleDownloadExport = () => {
    const blob = new Blob([exportedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brainwave-shift-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportedData);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setImportStatus('error');
      return;
    }

    const success = importData(importText);
    setImportStatus(success ? 'success' : 'error');
    
    if (success) {
      setTimeout(() => {
        setShowImportModal(false);
        setImportText('');
        setImportStatus('idle');
      }, 2000);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (resetConfirmText !== 'RESET ALL DATA') {
      return;
    }

    resetAllData();
    setShowResetModal(false);
    setResetConfirmText('');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Storage Usage */}
      <div className="bg-white dark:bg-calm-800 rounded-lg shadow-md dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
          <HardDrive className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <span>Storage Usage</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Data Storage</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.available)}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getStorageColor(storageInfo.percentage)}`}
              style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
            ></div>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {storageInfo.percentage.toFixed(1)}% of available storage used
          </div>
          
          {storageInfo.percentage > 80 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  Storage is getting full. Consider exporting and resetting old data.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Summary */}
      {userData && (
        <div className="bg-white dark:bg-calm-800 rounded-lg shadow-md dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
            <Database className="w-5 h-5 text-green-500 dark:text-green-400" />
            <span>Your Data Summary</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {userData.focusData.totalSessions}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Focus Sessions</div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round(userData.focusData.totalFocusTime / 60)}h
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Total Focus Time</div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {userData.wellnessData.totalInterventionsCompleted}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Interventions</div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {userData.wellnessData.mindfulBreaksTotal}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Mindful Breaks</div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Member since: {userData.firstVisit.toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Data Management Actions */}
      <div className="bg-white dark:bg-calm-800 rounded-lg shadow-md dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          <span>Data Management</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export Data */}
          <button
            onClick={handleExport}
            className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
          >
            <Download className="w-8 h-8 text-blue-500 dark:text-blue-400 mb-2" />
            <span className="font-medium text-gray-800 dark:text-gray-200">Export Data</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
              Download your complete data as JSON
            </span>
          </button>

          {/* Import Data */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
          >
            <Upload className="w-8 h-8 text-green-500 dark:text-green-400 mb-2" />
            <span className="font-medium text-gray-800 dark:text-gray-200">Import Data</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
              Restore from exported JSON file
            </span>
          </button>

          {/* Reset Data */}
          <button
            onClick={() => setShowResetModal(true)}
            className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <Trash2 className="w-8 h-8 text-red-500 dark:text-red-400 mb-2" />
            <span className="font-medium text-gray-800 dark:text-gray-200">Reset All Data</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
              Permanently delete all stored data
            </span>
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-calm-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-calm-200 dark:border-calm-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Export Your Data</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Your complete Brainwave Shift data has been exported. You can download it as a file or copy it to clipboard.
                </p>
                
                <div className="flex space-x-3 mb-4">
                  <button
                    onClick={handleDownloadExport}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </button>
                  
                  <button
                    onClick={handleCopyExport}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Copy to Clipboard</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                  {exportedData.substring(0, 500)}...
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-calm-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-calm-200 dark:border-calm-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Import Your Data</h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportText('');
                    setImportStatus('idle');
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Import your previously exported Brainwave Shift data. This will replace all current data.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload JSON File
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Or Paste JSON Data
                  </label>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste your exported JSON data here..."
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-calm-700 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>
                
                {importStatus === 'success' && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                      <span className="text-sm text-green-700 dark:text-green-300">Data imported successfully!</span>
                    </div>
                  </div>
                )}
                
                {importStatus === 'error' && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
                      <span className="text-sm text-red-700 dark:text-red-300">Failed to import data. Please check the format.</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportText('');
                    setImportStatus('idle');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importText.trim() || importStatus === 'success'}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-calm-800 rounded-xl shadow-2xl max-w-md w-full border border-calm-200 dark:border-calm-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Reset All Data</h3>
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setResetConfirmText('');
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
                  <span className="font-medium text-red-600 dark:text-red-400">Warning: This action cannot be undone!</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  This will permanently delete all your data including:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                  <li>• All focus session history</li>
                  <li>• Wellness intervention records</li>
                  <li>• Digital wellness tracking data</li>
                  <li>• Analytics and performance data</li>
                  <li>• User preferences and settings</li>
                </ul>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Type <strong>RESET ALL DATA</strong> to confirm:
                </p>
                
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="Type: RESET ALL DATA"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-calm-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setResetConfirmText('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetConfirmText !== 'RESET ALL DATA'}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset All Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};