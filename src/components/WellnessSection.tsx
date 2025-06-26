import React, { useState } from 'react';
import { 
  Activity, 
  Smartphone, 
  Heart, 
  ChevronDown, 
  ChevronUp,
  Target,
  Clock,
  TrendingUp
} from 'lucide-react';
import { InterventionPanel } from './InterventionPanel';
import { DigitalWellnessPanel } from './DigitalWellnessPanel';
import { useInterventions } from '../hooks/useInterventions';
import { useDigitalWellness } from '../hooks/useDigitalWellness';
import { CognitiveState, UserPreferences } from '../types';

interface WellnessSectionProps {
  cognitiveState: CognitiveState;
  preferences: UserPreferences;
}

export const WellnessSection: React.FC<WellnessSectionProps> = ({
  cognitiveState,
  preferences
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['interventions']));
  const { interventions, completeIntervention, dismissIntervention } = useInterventions(cognitiveState, preferences);
  const { data: digitalWellnessData } = useDigitalWellness();

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const WellnessCard: React.FC<{
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
  }> = ({ id, title, icon, description, children, defaultExpanded = false }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <div className="bg-white rounded-xl shadow-lg border border-calm-200 transition-all duration-300 hover:shadow-gentle h-full flex flex-col">
        <button
          onClick={() => toggleSection(id)}
          className="w-full p-6 text-left focus-ring rounded-t-xl hover:bg-calm-50 transition-colors duration-200 flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-wellness-100 rounded-lg text-wellness-600">
                {icon}
              </div>
              <div>
                <h3 className="text-heading-3 text-calm-800">{title}</h3>
                <p className="text-body-small text-calm-600 mt-1">{description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {id === 'digital-wellness' && digitalWellnessData.dailySocialMediaTime > 0 && (
                <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                  {Math.round(digitalWellnessData.dailySocialMediaTime / (1000 * 60))}m today
                </div>
              )}
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-calm-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-calm-500" />
              )}
            </div>
          </div>
        </button>
        
        {isExpanded && (
          <div className="px-6 pb-6 animate-fade-in flex-1 flex flex-col">
            <div className="border-t border-calm-200 pt-6 flex-1">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Wellness Overview Header - Full Width */}
      <div className="bg-gradient-to-r from-wellness-600 to-wellness-700 rounded-xl shadow-soft p-6 text-white">
        <h1 className="text-heading-1 mb-2 tracking-tight">Wellness & Digital Health</h1>
        <p className="text-body text-wellness-100 leading-relaxed">
          Comprehensive wellness tools to maintain peak cognitive performance and healthy digital habits.
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5" />
              <span className="text-label font-medium">Active Interventions</span>
            </div>
            <div className="text-display font-bold">{interventions.filter(i => !i.completed).length}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="w-5 h-5" />
              <span className="text-label font-medium">Digital Wellness</span>
            </div>
            <div className="text-display font-bold">{digitalWellnessData.cognitiveImpactScore}</div>
            <div className="text-body-small text-wellness-100">Impact Score</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5" />
              <span className="text-label font-medium">Mindful Breaks</span>
            </div>
            <div className="text-display font-bold">{digitalWellnessData.mindfulBreaksTaken}</div>
            <div className="text-body-small text-wellness-100">Today</div>
          </div>
        </div>
      </div>

      {/* 2x2 Grid Layout for Wellness Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
        {/* Top Row */}
        {/* Top Left: Wellness Interventions */}
        <WellnessCard
          id="interventions"
          title="Wellness Interventions"
          icon={<Activity className="w-5 h-5" />}
          description="Personalized wellness recommendations based on your cognitive state"
          defaultExpanded={true}
        >
          <InterventionPanel
            interventions={interventions}
            onComplete={completeIntervention}
            onDismiss={dismissIntervention}
          />
        </WellnessCard>

        {/* Top Right: Digital Wellness */}
        <WellnessCard
          id="digital-wellness"
          title="Digital Wellness"
          icon={<Smartphone className="w-5 h-5" />}
          description="Monitor and optimize your social media usage and digital habits"
        >
          <DigitalWellnessPanel />
        </WellnessCard>

        {/* Bottom Row */}
        {/* Bottom Left: Mindfulness & Breathing */}
        <WellnessCard
          id="mindfulness"
          title="Mindfulness & Breathing"
          icon={<Heart className="w-5 h-5" />}
          description="Guided breathing exercises and mindfulness practices"
        >
          <div className="grid grid-cols-1 gap-4 h-full">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 flex flex-col">
              <h4 className="text-heading-4 text-calm-800 mb-2 flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span>4-7-8 Breathing</span>
              </h4>
              <p className="text-body-small text-calm-600 mb-4 flex-1">
                Inhale for 4, hold for 7, exhale for 8. Perfect for stress relief and focus.
              </p>
              <button className="btn-primary w-full">
                Start Exercise
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 flex flex-col">
              <h4 className="text-heading-4 text-calm-800 mb-2 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span>Box Breathing</span>
              </h4>
              <p className="text-body-small text-calm-600 mb-4 flex-1">
                Equal counts for inhale, hold, exhale, hold. Great for maintaining calm focus.
              </p>
              <button className="btn-primary w-full">
                Start Exercise
              </button>
            </div>
          </div>
        </WellnessCard>

        {/* Bottom Right: Wellness Insights */}
        <WellnessCard
          id="insights"
          title="Wellness Insights"
          icon={<TrendingUp className="w-5 h-5" />}
          description="Personalized insights and recommendations for optimal wellness"
        >
          <div className="space-y-4 h-full flex flex-col">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-calm-800 mb-2">Today's Wellness Summary</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-calm-600">Cognitive State:</span>
                  <span className="font-medium text-calm-800">{cognitiveState.focusLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-calm-600">Digital Wellness:</span>
                  <span className="font-medium text-calm-800">
                    {digitalWellnessData.cognitiveImpactScore >= 80 ? 'Excellent' :
                     digitalWellnessData.cognitiveImpactScore >= 60 ? 'Good' : 'Needs Attention'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-calm-600">Mindful Breaks:</span>
                  <span className="font-medium text-calm-800">{digitalWellnessData.mindfulBreaksTaken}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              {digitalWellnessData.cognitiveImpactScore < 60 && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                  <h5 className="font-medium text-orange-800 mb-1 text-sm">Recommendation</h5>
                  <p className="text-xs text-orange-700 leading-relaxed">
                    Your digital wellness score suggests high social media usage may be impacting cognitive performance. 
                    Consider taking more frequent breaks or setting usage limits.
                  </p>
                </div>
              )}
              
              {cognitiveState.emotionalState === 'Stressed' && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <h5 className="font-medium text-red-800 mb-1 text-sm">Stress Alert</h5>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Elevated stress detected. Try a breathing exercise or take a short walk to reset your mental state.
                  </p>
                </div>
              )}
              
              {digitalWellnessData.mindfulBreaksTaken > 3 && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-1 text-sm">Great Progress!</h5>
                  <p className="text-xs text-green-700 leading-relaxed">
                    Excellent job taking mindful breaks today. This conscious approach to digital wellness 
                    is helping maintain your cognitive performance.
                  </p>
                </div>
              )}
            </div>
          </div>
        </WellnessCard>
      </div>
    </div>
  );
};