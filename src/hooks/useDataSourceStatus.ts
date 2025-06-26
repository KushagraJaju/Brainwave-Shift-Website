import { useState, useEffect } from 'react';
import { cognitiveMonitor, DataSourceStatus } from '../services/CognitiveMonitor';

export const useDataSourceStatus = () => {
  const [status, setStatus] = useState<DataSourceStatus>({
    browserActivity: 'Disconnected',
    keyboardPatterns: 'Disconnected',
    mouseMovement: 'Disconnected',
    smartwatch: 'Disconnected'
  });

  useEffect(() => {
    // Get initial status
    setStatus(cognitiveMonitor.getDataSourceStatus());

    // Subscribe to status updates
    const unsubscribe = cognitiveMonitor.subscribeToStatus((newStatus: DataSourceStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, []);

  return status;
};