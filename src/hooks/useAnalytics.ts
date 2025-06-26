import { useState, useEffect } from 'react';
import { AnalyticsData, CognitiveState } from '../types';

export const useAnalytics = (cognitiveState: CognitiveState) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    dailyFocusTime: 0,
    weeklyFocusTime: 0,
    averageFocusQuality: 0,
    totalInterventions: 0,
    streakDays: 0,
    peakHours: [],
    distractionTriggers: []
  });

  useEffect(() => {
    // Simulate analytics data based on current cognitive state
    const updateAnalytics = () => {
      const hour = new Date().getHours();
      
      setAnalyticsData(prev => ({
        ...prev,
        dailyFocusTime: Math.min(480, prev.dailyFocusTime + (cognitiveState.focusLevel === 'Deep' ? 2 : 0.5)),
        weeklyFocusTime: Math.min(2400, prev.weeklyFocusTime + (cognitiveState.focusLevel === 'Deep' ? 2 : 0.5)),
        averageFocusQuality: Math.round((prev.averageFocusQuality + cognitiveState.score) / 2),
        totalInterventions: prev.totalInterventions + (Math.random() > 0.95 ? 1 : 0),
        streakDays: Math.min(30, prev.streakDays + (Math.random() > 0.98 ? 1 : 0)),
        peakHours: prev.peakHours.includes(hour) ? prev.peakHours : 
          cognitiveState.score > 80 ? [...prev.peakHours, hour].slice(-5) : prev.peakHours,
        distractionTriggers: ['Email notifications', 'Social media', 'Meetings', 'Noise']
      }));
    };

    const interval = setInterval(updateAnalytics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [cognitiveState]);

  return analyticsData;
};