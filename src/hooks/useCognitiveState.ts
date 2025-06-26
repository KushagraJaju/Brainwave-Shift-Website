import { useState, useEffect } from 'react';
import { CognitiveState } from '../types';
import { cognitiveMonitor, MonitoringData } from '../services/CognitiveMonitor';

export const useCognitiveState = () => {
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>({
    focusLevel: 'Moderate',
    cognitiveLoad: 'Fresh',
    emotionalState: 'Calm',
    score: 60,
    timestamp: new Date()
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Start monitoring automatically when component mounts
    cognitiveMonitor.startMonitoring();
    setIsMonitoring(true);

    // Subscribe to monitoring data updates
    const unsubscribe = cognitiveMonitor.subscribe((data: MonitoringData) => {
      const newState = mapMonitoringDataToCognitiveState(data);
      setCognitiveState(newState);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const mapMonitoringDataToCognitiveState = (data: MonitoringData): CognitiveState => {
    const { cognitiveMetrics } = data;
    
    // Map focus score to focus level
    let focusLevel: CognitiveState['focusLevel'] = 'Moderate';
    if (cognitiveMetrics.focusScore >= 75) {
      focusLevel = 'Deep';
    } else if (cognitiveMetrics.focusScore < 50) {
      focusLevel = 'Distracted';
    }

    // Map load score to cognitive load
    let cognitiveLoad: CognitiveState['cognitiveLoad'] = 'Fresh';
    if (cognitiveMetrics.loadScore < 40) {
      cognitiveLoad = 'Overloaded';
    } else if (cognitiveMetrics.loadScore < 60) {
      cognitiveLoad = 'Fatigued';
    }

    // Map stress score to emotional state
    let emotionalState: CognitiveState['emotionalState'] = 'Calm';
    if (cognitiveMetrics.stressScore < 40) {
      emotionalState = 'Stressed';
    } else if (cognitiveMetrics.focusScore >= 75 && cognitiveMetrics.loadScore >= 70) {
      emotionalState = 'Engaged';
    }

    return {
      focusLevel,
      cognitiveLoad,
      emotionalState,
      score: cognitiveMetrics.overallScore,
      timestamp: new Date()
    };
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      cognitiveMonitor.stopMonitoring();
      setIsMonitoring(false);
    } else {
      cognitiveMonitor.startMonitoring();
      setIsMonitoring(true);
    }
  };

  return { 
    cognitiveState, 
    isMonitoring: cognitiveMonitor.isActive(), 
    toggleMonitoring 
  };
};