import React from 'react';
import { CheckCircle, X, AlertCircle, Clock, Activity } from 'lucide-react';
import { Intervention } from '../types';

interface InterventionPanelProps {
  interventions: Intervention[];
  onComplete: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const InterventionPanel: React.FC<InterventionPanelProps> = ({
  interventions,
  onComplete,
  onDismiss
}) => {
  const getInterventionIcon = (type: Intervention['type']) => {
    switch (type) {
      case 'Break':
        return <Clock className="w-5 h-5" />;
      case 'Breathing':
        return <Activity className="w-5 h-5" />;
      case 'Posture':
        return <AlertCircle className="w-5 h-5" />;
      case 'Movement':
        return <Activity className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
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

  const activeInterventions = interventions.filter(i => !i.completed);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-heading-3 text-calm-800 dark:text-calm-200">Active Recommendations</h3>
        <span className="bg-wellness-100 dark:bg-wellness-900/30 text-wellness-800 dark:text-wellness-300 text-label font-medium px-3 py-1 rounded-full border border-wellness-200 dark:border-wellness-800">
          {activeInterventions.length} pending
        </span>
      </div>

      <div className="flex-1 flex flex-col">
        {activeInterventions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <CheckCircle className="w-16 h-16 text-wellness-500 dark:text-wellness-400 mx-auto mb-4" />
            <h4 className="text-heading-4 text-calm-800 dark:text-calm-200 mb-2">All Caught Up!</h4>
            <p className="text-body text-calm-600 dark:text-calm-400">No interventions needed right now. We'll notify you when it's time for a break.</p>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-y-auto">
            {activeInterventions.map((intervention) => (
              <div
                key={intervention.id}
                className={`border-2 rounded-lg p-4 transition-all duration-200 ${getPriorityColor(intervention.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`${getIconColor(intervention.priority)} mt-1`}>
                      {getInterventionIcon(intervention.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-heading-4 text-calm-800 dark:text-calm-200 mb-1">
                        {intervention.title}
                      </h4>
                      <p className="text-body-small text-calm-600 dark:text-calm-400 mb-2">
                        {intervention.description}
                      </p>
                      <div className="flex items-center space-x-4 text-body-small text-calm-500 dark:text-calm-400">
                        <span>{intervention.duration} min</span>
                        <span>{intervention.priority} priority</span>
                        <span>{intervention.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <button
                      onClick={() => onComplete(intervention.id)}
                      className="p-2 text-wellness-600 dark:text-wellness-400 hover:bg-wellness-100 dark:hover:bg-wellness-900/30 rounded-full transition-colors duration-200 focus-ring"
                      title="Complete intervention"
                      aria-label="Complete intervention"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDismiss(intervention.id)}
                      className="p-2 text-calm-400 dark:text-calm-500 hover:bg-calm-100 dark:hover:bg-calm-700 rounded-full transition-colors duration-200 focus-ring"
                      title="Dismiss intervention"
                      aria-label="Dismiss intervention"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};