import React, { useState } from 'react';
import { CheckCircle, X, AlertCircle, Clock, Activity, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Intervention } from '../types';
import { useRecommendationState } from '../hooks/useRecommendationState';
import { useFilteredRecommendations } from '../hooks/useFilteredRecommendations';

interface EnhancedInterventionPanelProps {
  interventions: Intervention[];
  onComplete: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const EnhancedInterventionPanel: React.FC<EnhancedInterventionPanelProps> = ({
  interventions,
  onComplete,
  onDismiss
}) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [showDismissed, setShowDismissed] = useState(false);
  
  const {
    markAsCompleted,
    markAsDismissed,
    resetSession,
    sessionId,
    totalActions
  } = useRecommendationState();

  const {
    activeRecommendations,
    completedRecommendations,
    dismissedRecommendations,
    totalActive,
    totalCompleted,
    totalDismissed
  } = useFilteredRecommendations(interventions);

  const handleComplete = (id: string) => {
    markAsCompleted(id);
    onComplete(id);
  };

  const handleDismiss = (id: string) => {
    markAsDismissed(id);
    onDismiss(id);
  };

  const getInterventionIcon = (type: Intervention['type']) => {
    switch (type) {
      case 'Break':
        return <Clock className="w-5 h-5" aria-hidden="true" />;
      case 'Breathing':
        return <Activity className="w-5 h-5" aria-hidden="true" />;
      case 'Posture':
        return <AlertCircle className="w-5 h-5" aria-hidden="true" />;
      case 'Movement':
        return <Activity className="w-5 h-5" aria-hidden="true" />;
      default:
        return <AlertCircle className="w-5 h-5" aria-hidden="true" />;
    }
  };

  const getPriorityColor = (priority: Intervention['priority']) => {
    switch (priority) {
      case 'High':
        return 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20';
      case 'Medium':
        return 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20';
      case 'Low':
        return 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getIconColor = (priority: Intervention['priority']) => {
    switch (priority) {
      case 'High':
        return 'text-red-500 dark:text-red-400';
      case 'Medium':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'Low':
        return 'text-blue-500 dark:text-blue-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const RecommendationCard: React.FC<{
    intervention: Intervention;
    showActions?: boolean;
    isCompleted?: boolean;
    isDismissed?: boolean;
  }> = ({ intervention, showActions = true, isCompleted = false, isDismissed = false }) => (
    <div
      className={`border-2 rounded-lg p-4 transition-all duration-200 ${
        isCompleted 
          ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 opacity-75'
          : isDismissed
            ? 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 opacity-60'
            : getPriorityColor(intervention.priority)
      }`}
      role="region"
      aria-label={`${intervention.priority} priority ${intervention.type} recommendation`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`${getIconColor(intervention.priority)} mt-1`}>
            {getInterventionIcon(intervention.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-heading-4 mb-1 ${
              isCompleted || isDismissed 
                ? 'text-gray-600 dark:text-gray-400' 
                : 'text-calm-800 dark:text-calm-200'
            }`}>
              {intervention.title}
              {isCompleted && <span className="ml-2 text-green-600 dark:text-green-400">✓ Completed</span>}
              {isDismissed && <span className="ml-2 text-gray-500 dark:text-gray-400">✗ Dismissed</span>}
            </h4>
            <p className={`text-body-small mb-2 ${
              isCompleted || isDismissed 
                ? 'text-gray-500 dark:text-gray-500' 
                : 'text-calm-600 dark:text-calm-400'
            }`}>
              {intervention.description}
            </p>
            <div className={`flex items-center space-x-4 text-body-small ${
              isCompleted || isDismissed 
                ? 'text-gray-400 dark:text-gray-500' 
                : 'text-calm-500 dark:text-calm-400'
            }`}>
              <span>{intervention.duration} min</span>
              <span>{intervention.priority} priority</span>
              <span>{intervention.timestamp.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        {showActions && !isCompleted && !isDismissed && (
          <div className="flex items-center space-x-2 ml-2">
            <button
              onClick={() => handleComplete(intervention.id)}
              className="p-2 text-wellness-600 dark:text-wellness-400 hover:bg-wellness-100 dark:hover:bg-wellness-900/30 rounded-full transition-colors duration-200 focus-ring"
              title="Complete recommendation"
              aria-label={`Complete ${intervention.title}`}
            >
              <CheckCircle className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => handleDismiss(intervention.id)}
              className="p-2 text-calm-400 dark:text-calm-500 hover:bg-calm-100 dark:hover:bg-calm-700 rounded-full transition-colors duration-200 focus-ring"
              title="Dismiss recommendation"
              aria-label={`Dismiss ${intervention.title}`}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header with Statistics */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-heading-3 text-calm-800 dark:text-calm-200">Health Recommendations</h3>
        <div className="flex items-center space-x-4">
          <span className="bg-wellness-100 dark:bg-wellness-900/30 text-wellness-800 dark:text-wellness-300 text-label font-medium px-3 py-1 rounded-full border border-wellness-200 dark:border-wellness-800">
            {totalActive} active
          </span>
          {totalActions > 0 && (
            <span className="text-body-small text-calm-600 dark:text-calm-400">
              {totalCompleted} completed • {totalDismissed} dismissed
            </span>
          )}
        </div>
      </div>

      {/* Action Controls */}
      {totalActions > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors focus-ring ${
                showCompleted 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {showCompleted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showCompleted ? 'Hide' : 'Show'} Completed ({totalCompleted})</span>
            </button>
            
            <button
              onClick={() => setShowDismissed(!showDismissed)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors focus-ring ${
                showDismissed 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {showDismissed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showDismissed ? 'Hide' : 'Show'} Dismissed ({totalDismissed})</span>
            </button>
          </div>
          
          <button
            onClick={resetSession}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus-ring"
            title="Reset all actions for this session"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Session</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Active Recommendations */}
        {totalActive === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <CheckCircle className="w-16 h-16 text-wellness-500 dark:text-wellness-400 mx-auto mb-4" aria-hidden="true" />
            <h4 className="text-heading-4 text-calm-800 dark:text-calm-200 mb-2">All Caught Up!</h4>
            <p className="text-body text-calm-600 dark:text-calm-400">
              {totalActions > 0 
                ? 'You\'ve addressed all current recommendations. New ones will appear as needed.'
                : 'No recommendations needed right now. We\'ll notify you when it\'s time for a wellness break.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-y-auto">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Active Recommendations ({totalActive})
            </h4>
            {activeRecommendations.map((intervention) => (
              <RecommendationCard
                key={intervention.id}
                intervention={intervention}
                showActions={true}
              />
            ))}
          </div>
        )}

        {/* Completed Recommendations */}
        {showCompleted && completedRecommendations.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3">
              Completed This Session ({totalCompleted})
            </h4>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {completedRecommendations.map((intervention) => (
                <RecommendationCard
                  key={intervention.id}
                  intervention={intervention}
                  showActions={false}
                  isCompleted={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Dismissed Recommendations */}
        {showDismissed && dismissedRecommendations.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              Dismissed This Session ({totalDismissed})
            </h4>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {dismissedRecommendations.map((intervention) => (
                <RecommendationCard
                  key={intervention.id}
                  intervention={intervention}
                  showActions={false}
                  isDismissed={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Session Info */}
      {totalActions > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Session ID: {sessionId.slice(-8)} • Actions persist for 24 hours
          </p>
        </div>
      )}
    </div>
  );
};