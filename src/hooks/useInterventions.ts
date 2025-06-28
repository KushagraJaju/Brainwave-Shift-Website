import { useState, useEffect } from 'react';
import { Intervention, CognitiveState, UserPreferences } from '../types';

export const useInterventions = (cognitiveState: CognitiveState, preferences: UserPreferences) => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [lastInterventionTime, setLastInterventionTime] = useState<Date>(new Date());
  const [hasInitialized, setHasInitialized] = useState(false);

  const interventionTemplates = {
    Break: [
      { title: 'Take a 5-minute break', description: 'Step away from your screen and rest your eyes', duration: 5 },
      { title: 'Stretch break', description: 'Do some gentle stretches to relieve tension', duration: 3 },
      { title: 'Hydration reminder', description: 'Drink a glass of water to stay hydrated', duration: 1 },
      { title: 'Fresh air break', description: 'Step outside or open a window for fresh air', duration: 3 },
      { title: 'Eye rest exercise', description: 'Look at something 20 feet away for 20 seconds', duration: 1 }
    ],
    Breathing: [
      { title: 'Deep breathing exercise', description: '4-7-8 breathing technique for relaxation', duration: 2 },
      { title: 'Box breathing', description: 'Inhale, hold, exhale, hold for 4 counts each', duration: 3 },
      { title: 'Mindful breathing', description: 'Focus on your breath for 2 minutes', duration: 2 },
      { title: 'Stress relief breathing', description: 'Slow, deep breaths to reduce stress', duration: 3 }
    ],
    Posture: [
      { title: 'Posture check', description: 'Adjust your sitting position and ergonomics', duration: 1 },
      { title: 'Neck and shoulder rolls', description: 'Relieve tension in your neck and shoulders', duration: 2 },
      { title: 'Spinal alignment', description: 'Check and correct your spine alignment', duration: 1 },
      { title: 'Ergonomic adjustment', description: 'Adjust your monitor and chair height', duration: 2 }
    ],
    Movement: [
      { title: 'Walk around', description: 'Take a short walk to boost circulation', duration: 10 },
      { title: 'Desk exercises', description: 'Simple exercises you can do at your desk', duration: 5 },
      { title: 'Gentle stretching', description: 'Full body stretch routine', duration: 7 },
      { title: 'Stair climbing', description: 'Take the stairs for a quick energy boost', duration: 3 }
    ]
  };

  // Initialize with some example interventions on first load
  useEffect(() => {
    if (!hasInitialized) {
      const now = new Date();
      const exampleInterventions: Intervention[] = [
        {
          id: 'example-1',
          type: 'Breathing',
          title: 'Deep breathing exercise',
          description: '4-7-8 breathing technique for relaxation and stress relief',
          duration: 2,
          priority: 'Medium',
          timestamp: new Date(now.getTime() - 5 * 60 * 1000) // 5 minutes ago
        },
        {
          id: 'example-2',
          type: 'Posture',
          title: 'Posture check',
          description: 'Adjust your sitting position and check your ergonomics',
          duration: 1,
          priority: 'Low',
          timestamp: new Date(now.getTime() - 15 * 60 * 1000) // 15 minutes ago
        },
        {
          id: 'example-3',
          type: 'Break',
          title: 'Hydration reminder',
          description: 'Time to drink a glass of water to stay hydrated',
          duration: 1,
          priority: 'Low',
          timestamp: new Date(now.getTime() - 25 * 60 * 1000) // 25 minutes ago
        }
      ];

      setInterventions(exampleInterventions);
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  useEffect(() => {
    if (!hasInitialized) return;

    const checkForInterventions = () => {
      const now = new Date();
      const timeSinceLastIntervention = now.getTime() - lastInterventionTime.getTime();
      const minutesSinceLastIntervention = timeSinceLastIntervention / (1000 * 60);

      // Adjust intervention frequency based on user preferences
      let baseInterval = 60; // Default: 60 minutes
      switch (preferences.interventionFrequency) {
        case 'Minimal':
          baseInterval = 120; // 2 hours
          break;
        case 'Normal':
          baseInterval = 60; // 1 hour
          break;
        case 'Frequent':
          baseInterval = 30; // 30 minutes
          break;
      }

      // Determine if intervention is needed based on cognitive state
      let shouldIntervene = false;
      let priority: Intervention['priority'] = 'Low';
      let interventionType: keyof typeof interventionTemplates = 'Break';

      if (cognitiveState.cognitiveLoad === 'Overloaded' && minutesSinceLastIntervention > 15) {
        shouldIntervene = true;
        priority = 'High';
        interventionType = 'Break';
      } else if (cognitiveState.focusLevel === 'Distracted' && minutesSinceLastIntervention > baseInterval / 2) {
        shouldIntervene = true;
        priority = 'Medium';
        interventionType = 'Breathing';
      } else if (cognitiveState.emotionalState === 'Stressed' && minutesSinceLastIntervention > baseInterval / 3) {
        shouldIntervene = true;
        priority = 'Medium';
        interventionType = 'Breathing';
      } else if (minutesSinceLastIntervention > baseInterval) {
        shouldIntervene = true;
        priority = 'Low';
        interventionType = Math.random() > 0.5 ? 'Posture' : 'Movement';
      }

      if (shouldIntervene) {
        const templates = interventionTemplates[interventionType];
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        const newIntervention: Intervention = {
          id: Date.now().toString(),
          type: interventionType,
          title: template.title,
          description: template.description,
          duration: template.duration,
          priority,
          timestamp: now
        };

        setInterventions(prev => [newIntervention, ...prev.slice(0, 4)]);
        setLastInterventionTime(now);
      }
    };

    // Check for interventions every 15 seconds to match the new monitoring interval
    const interval = setInterval(checkForInterventions, 15000);
    return () => clearInterval(interval);
  }, [cognitiveState, lastInterventionTime, preferences.interventionFrequency, hasInitialized]);

  const completeIntervention = (id: string) => {
    setInterventions(prev => 
      prev.map(intervention => 
        intervention.id === id 
          ? { ...intervention, completed: true }
          : intervention
      )
    );

    // Remove completed intervention after a short delay
    setTimeout(() => {
      setInterventions(prev => prev.filter(intervention => intervention.id !== id));
    }, 2000);
  };

  const dismissIntervention = (id: string) => {
    setInterventions(prev => prev.filter(intervention => intervention.id !== id));
  };

  return { interventions, completeIntervention, dismissIntervention };
};