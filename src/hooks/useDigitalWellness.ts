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
    // Store dismissed state in localStorage
    const dismissedInterventions = JSON.parse(localStorage.getItem('dismissedDigitalInterventions') || '[]');
    if (!dismissedInterventions.includes(id)) {
      dismissedInterventions.push(id);
      localStorage.setItem('dismissedDigitalInterventions', JSON.stringify(dismissedInterventions));
    }
    
    setInterventions(prev => prev.filter(intervention => intervention.id !== id));
  };

  const handleInterventionAction = (id: string, action: string) => {
    // Record the action
    if (action.includes('break') || action.includes('Break') || action === 'breathing-complete') {
      digitalWellnessMonitor.recordMindfulBreak();
    }
    
    // Store completed action in localStorage
    const completedInterventions = JSON.parse(localStorage.getItem('completedDigitalInterventions') || '[]');
    if (!completedInterventions.includes(id)) {
      completedInterventions.push(id);
      localStorage.setItem('completedDigitalInterventions', JSON.stringify(completedInterventions));
    }
    
    // Remove the intervention
    dismissIntervention(id);
  };

  const updateSettings = (updates: any) => {
    digitalWellnessMonitor.updateSettings(updates);
  };

  // Filter out interventions that have been dismissed or completed
  useEffect(() => {
    const dismissedInterventions = JSON.parse(localStorage.getItem('dismissedDigitalInterventions') || '[]');
    const completedInterventions = JSON.parse(localStorage.getItem('completedDigitalInterventions') || '[]');
    
    setInterventions(prev => 
      prev.filter(intervention => 
        !dismissedInterventions.includes(intervention.id) && 
        !completedInterventions.includes(intervention.id)
      )
    );
  }, []);

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