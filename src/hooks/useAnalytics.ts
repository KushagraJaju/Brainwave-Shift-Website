import { useState, useEffect } from 'react';
import { AnalyticsData, CognitiveState } from '../types';
import { digitalWellnessMonitor, DigitalWellnessData } from '../services/DigitalWellnessMonitor';

export const useAnalytics = (cognitiveState: CognitiveState) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    dailyFocusTime: 0,
    weeklyFocusTime: 0,
    averageFocusQuality: 0,
    totalInterventions: 0,
    streakDays: 0,
    peakHours: [],
    distractionTriggers: [],
    // Digital wellness analytics
    dailySocialMediaTime: 0,
    mindfulBreaksTaken: 0,
    digitalWellnessScore: 0
  });

  const [digitalWellnessData, setDigitalWellnessData] = useState<DigitalWellnessData>(
    digitalWellnessMonitor.getData()
  );

  useEffect(() => {
    // Subscribe to digital wellness data updates
    const unsubscribeDigital = digitalWellnessMonitor.subscribe((newData) => {
      setDigitalWellnessData(newData);
    });

    return unsubscribeDigital;
  }, []);

  useEffect(() => {
    // Simulate analytics data based on current cognitive state and digital wellness
    // Updated to refresh every 15 seconds to match the new monitoring interval
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
        distractionTriggers: ['Email notifications', 'Social media', 'Meetings', 'Noise'],
        // Update digital wellness analytics from real data
        dailySocialMediaTime: Math.round(digitalWellnessData.dailySocialMediaTime / (1000 * 60)), // Convert to minutes
        mindfulBreaksTaken: digitalWellnessData.mindfulBreaksTaken,
        digitalWellnessScore: digitalWellnessData.cognitiveImpactScore
      }));
    };

    // Update analytics every 15 seconds to match the new monitoring interval
    const interval = setInterval(updateAnalytics, 15000);
    updateAnalytics(); // Initial update
    return () => clearInterval(interval);
  }, [cognitiveState, digitalWellnessData]);

  return { ...analyticsData, digitalWellnessData };
};