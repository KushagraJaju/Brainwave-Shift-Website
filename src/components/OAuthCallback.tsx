import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Loader } from 'lucide-react';

export const OAuthCallback: React.FC = () => {
  useEffect(() => {
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      
      if (error) {
        // Handle OAuth error
        console.error('OAuth error:', error);
        window.close();
        return;
      }
      
      if (code && state) {
        // Determine provider from URL path
        const path = window.location.pathname;
        let provider = '';
        
        if (path.includes('/google')) {
          provider = 'google';
        } else if (path.includes('/microsoft')) {
          provider = 'microsoft';
        }
        
        if (provider) {
          // Send message to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'OAUTH_CALLBACK',
              provider,
              code,
              state
            }, window.location.origin);
          }
          
          // Close the popup
          window.close();
        }
      }
    };

    handleOAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-calm-50 dark:bg-calm-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-8 max-w-md w-full text-center border border-calm-200 dark:border-calm-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Processing Authorization
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we complete the calendar integration...
        </p>
      </div>
    </div>
  );
};