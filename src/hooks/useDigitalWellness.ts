import { useState, useEffect } from 'react';
import { digitalWellnessMonitor, DigitalWellnessData, SocialMediaActivity } from '../services/DigitalWellnessMonitor';

export const useDigitalWellness = () => {
  const [data, setData] = useState<DigitalWellnessData>(digitalWellnessMonitor.getData());
  const [currentActivity, setCurrentActivity] = useState<SocialMediaActivity | null>(digitalWellnessMonitor.getCurrentActivity());
  const [interventions, setInterventions] = useState<any[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(digitalWellnessMonitor.isActive());

  useEffect(() => {
    // Start monitoring automatically
    digitalWellnessMonitor.startMonitoring();
    setIsMonitoring(true);

    // Subscribe to data updates
    const unsubscribeData = digitalWellnessMonitor.subscribe((newData) => {
      setData(newData);
    });

    // Subscribe to interventions
    const unsubscribeInterventions = digitalWellnessMonitor.subscribeToInterventions((intervention) => {
      setInterventions(prev => [intervention, ...prev.slice(0, 2)]); // Keep max 3 interventions
    });

    // Update current activity periodically
    const activityInterval = setInterval(() => {
      setCurrentActivity(digitalWellnessMonitor.getCurrentActivity());
    }, 1000);

    return () => {
      unsubscribeData();
      unsubscribeInterventions();
      clearInterval(activityInterval);
    };
  }, []);

  const toggleMonitoring = () => {
    if (isMonitoring) {
      digitalWellnessMonitor.stopMonitoring();
    } else {
      digitalWellnessMonitor.startMonitoring();
    }
    setIsMonitoring(!isMonitoring);
  };

  const dismissIntervention = (id: string) => {
    setInterventions(prev => prev.filter(intervention => intervention.id !== id));
  };

  const handleInterventionAction = (id: string, action: string) => {
    // Record the action
    if (action.includes('break') || action.includes('Break') || action === 'breathing-complete') {
      digitalWellnessMonitor.recordMindfulBreak();
    }
    
    // Remove the intervention
    dismissIntervention(id);
  };

  const updateSettings = (updates: any) => {
    digitalWellnessMonitor.updateSettings(updates);
  };

  return {
    data,
    currentActivity,
    interventions,
    isMonitoring,
    toggleMonitoring,
    dismissIntervention,
    handleInterventionAction,
    updateSettings,
    settings: digitalWellnessMonitor.getSettings()
  };
};