import React from 'react';
import { 
  Activity, 
  Smartphone, 
  Heart, 
  Target,
  Clock,
  TrendingUp
} from 'lucide-react';
import { EnhancedInterventionPanel } from './EnhancedInterventionPanel';
import { DigitalWellnessPanel } from './DigitalWellnessPanel';
import { BreathingExercise, BreathingType } from './BreathingExercise';
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
  const { interventions, completeIntervention, dismissIntervention } = useInterventions(cognitiveState, preferences);
  const { data: digitalWellnessData } = useDigitalWellness();
  
  // Breathing exercise state
  const [breathingExercise, setBreathingExercise] = React.useState<{
    isOpen: boolean;
    type: BreathingType | null;
  }>({
    isOpen: false,
    type: null
  });

  const startBreathingExercise = (type: BreathingType) => {
    setBreathingExercise({ isOpen: true, type });
  };

  const closeBreathingExercise = () => {
    setBreathingExercise({ isOpen: false, type: null });
  };

  const handleBreathingComplete = () => {
    // Record mindful break when exercise is completed
    // This could be connected to your analytics system
    console.log('Breathing exercise completed');
  };

  const WellnessCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    description: string;
    children: React.ReactNode;
    badge?: string;
  }> = ({ title, icon, description, children, badge }) => {
    return (
      <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark border border-calm-200 dark:border-calm-700 transition-all duration-300 hover:shadow-gentle dark:hover:shadow-soft-dark h-full flex flex-col">
        {/* Header - No longer clickable */}
        <div className="p-6 border-b border-calm-200 dark:border-calm-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-wellness-100 dark:bg-wellness-900/30 rounded-lg text-wellness-600 dark:text-wellness-400">
                {icon}
              </div>
              <div>
                <h3 className="text-heading-4 text-calm-800 dark:text-calm-200">{title}</h3>
                <p className="text-body-small text-calm-600 dark:text-calm-400 mt-1">{description}</p>
              </div>
            </div>
            {/* Badge - No chevron icons */}
            {badge && (
              <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-800">
                {badge}
              </div>
            )}
          </div>
        </div>
        
        {/* Content - Always visible */}
        <div className="p-6 flex-1 animate-fade-in">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Wellness Overview Header */}
      <div className="bg-gradient-to-r from-wellness-600 to-wellness-700 dark:from-wellness-700 dark:to-wellness-800 rounded-xl shadow-soft dark:shadow-gentle-dark p-6 text-white">
        <h1 className="text-heading-1 mb-2 tracking-tight">Wellness & Digital Health</h1>
        <p className="text-body text-wellness-100 dark:text-wellness-200 leading-relaxed">
          Comprehensive wellness tools to maintain peak cognitive performance and healthy digital habits.
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 dark:bg-white dark:bg-opacity-10 rounded-lg p-4 backdrop-blur-sm border border-white border-opacity-20">
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="w-5 h-5" />
              <span className="text-label font-medium">Digital Wellness</span>
            </div>
            <div className="text-display font-bold">{digitalWellnessData.cognitiveImpactScore}</div>
            <div className="text-body-small text-wellness-100 dark:text-wellness-200">Impact Score</div>
          </div>
          <div className="bg-white bg-opacity-20 dark:bg-white dark:bg-opacity-10 rounded-lg p-4 backdrop-blur-sm border border-white border-opacity-20">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5" />
              <span className="text-label font-medium">Mindful Breaks</span>
            </div>
            <div className="text-display font-bold">{digitalWellnessData.mindfulBreaksTaken}</div>
            <div className="text-body-small text-wellness-100 dark:text-wellness-200">Today</div>
          </div>
          <div className="bg-white bg-opacity-20 dark:bg-white dark:bg-opacity-10 rounded-lg p-4 backdrop-blur-sm border border-white border-opacity-20">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5" />
              <span className="text-label font-medium">Active Interventions</span>
            </div>
            <div className="text-display font-bold">{interventions.filter(i => !i.completed).length}</div>
            <div className="text-body-small text-wellness-100 dark:text-wellness-200">Pending</div>
          </div>
        </div>
      </div>

      {/* Wellness Sections - Reordered 2x2 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Row 1: Digital Wellness & Enhanced Wellness Interventions */}
        <WellnessCard
          title="Digital Wellness"
          icon={<Smartphone className="w-5 h-5" />}
          description="Monitor and optimize your social media usage and digital habits"
          badge={digitalWellnessData.dailySocialMediaTime > 0 ? `${Math.round(digitalWellnessData.dailySocialMediaTime / (1000 * 60))}m today` : undefined}
        >
          <DigitalWellnessPanel />
        </WellnessCard>

        <WellnessCard
          title="Health Recommendations"
          icon={<Activity className="w-5 h-5" />}
          description="Personalized wellness recommendations with persistent tracking"
          badge={interventions.filter(i => !i.completed).length > 0 ? `${interventions.filter(i => !i.completed).length} pending` : undefined}
        >
          <EnhancedInterventionPanel
            interventions={interventions}
            onComplete={completeIntervention}
            onDismiss={dismissIntervention}
          />
        </WellnessCard>

        {/* Row 2: Mindfulness & Breathing & Wellness Insights */}
        <WellnessCard
          title="Mindfulness & Breathing"
          icon={<Heart className="w-5 h-5" />}
          description="Guided breathing exercises and mindfulness practices"
        >
          <div className="grid grid-cols-1 gap-4 h-full">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex flex-col">
              <h4 className="text-heading-4 text-calm-800 dark:text-calm-200 mb-3 flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>4-7-8 Breathing</span>
              </h4>
              <p className="text-body-small text-calm-600 dark:text-calm-400 mb-4 flex-1">
                Inhale for 4, hold for 7, exhale for 8. Perfect for stress relief and focus.
              </p>
              <button 
                onClick={() => startBreathingExercise('4-7-8')}
                className="btn-primary w-full"
              >
                Start Exercise
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 flex flex-col">
              <h4 className="text-heading-4 text-calm-800 dark:text-calm-200 mb-3 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-500 dark:text-green-400" />
                <span>Box Breathing</span>
              </h4>
              <p className="text-body-small text-calm-600 dark:text-calm-400 mb-4 flex-1">
                Equal counts for inhale, hold, exhale, hold. Great for maintaining calm focus.
              </p>
              <button 
                onClick={() => startBreathingExercise('box')}
                className="btn-primary w-full"
              >
                Start Exercise
              </button>
            </div>
          </div>
        </WellnessCard>

        <WellnessCard
          title="Wellness Insights"
          icon={<TrendingUp className="w-5 h-5" />}
          description="Personalized insights and recommendations for optimal wellness"
        >
          <div className="space-y-4 h-full flex flex-col">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <h4 className="font-semibold text-calm-800 dark:text-calm-200 mb-2">Today's Wellness Summary</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-calm-600 dark:text-calm-400">Cognitive State:</span>
                  <span className="font-medium text-calm-800 dark:text-calm-200">{cognitiveState.focusLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-calm-600 dark:text-calm-400">Digital Wellness:</span>
                  <span className="font-medium text-calm-800 dark:text-calm-200">
                    {digitalWellnessData.cognitiveImpactScore >= 80 ? 'Excellent' :
                     digitalWellnessData.cognitiveImpactScore >= 60 ? 'Good' : 'Needs Attention'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-calm-600 dark:text-calm-400">Mindful Breaks:</span>
                  <span className="font-medium text-calm-800 dark:text-calm-200">{digitalWellnessData.mindfulBreaksTaken}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              {digitalWellnessData.cognitiveImpactScore < 60 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 rounded-lg">
                  <h5 className="font-medium text-orange-800 dark:text-orange-300 mb-1 text-sm">Recommendation</h5>
                  <p className="text-xs text-orange-700 dark:text-orange-400">
                    Your digital wellness score suggests high social media usage may be impacting cognitive performance. 
                    Consider taking more frequent breaks or setting usage limits.
                  </p>
                </div>
              )}
              
              {cognitiveState.emotionalState === 'Stressed' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                  <h5 className="font-medium text-red-800 dark:text-red-300 mb-1 text-sm">Stress Alert</h5>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    Elevated stress detected. Try a breathing exercise or take a short walk to reset your mental state.
                  </p>
                </div>
              )}
              
              {digitalWellnessData.mindfulBreaksTaken > 3 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                  <h5 className="font-medium text-green-800 dark:text-green-300 mb-1 text-sm">Great Progress!</h5>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Excellent job taking mindful breaks today. This conscious approach to digital wellness 
                    is helping maintain your cognitive performance.
                  </p>
                </div>
              )}
              
              {/* Default insight when no specific conditions are met */}
              {digitalWellnessData.cognitiveImpactScore >= 60 && 
               cognitiveState.emotionalState !== 'Stressed' && 
               digitalWellnessData.mindfulBreaksTaken <= 3 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                  <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-1 text-sm">Wellness Status</h5>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Your wellness metrics are looking good. Keep maintaining healthy digital habits and taking regular breaks 
                    to sustain optimal cognitive performance.
                  </p>
                </div>
              )}
            </div>
          </div>
        </WellnessCard>
      </div>
      
      {/* Breathing Exercise Modal */}
      {breathingExercise.isOpen && breathingExercise.type && (
        <BreathingExercise
          type={breathingExercise.type}
          isOpen={breathingExercise.isOpen}
          onClose={closeBreathingExercise}
          onComplete={handleBreathingComplete}
        />
      )}
    </div>
  );
};