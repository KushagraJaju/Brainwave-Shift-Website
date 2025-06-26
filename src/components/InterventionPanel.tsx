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
        return 'border-red-300 bg-red-50';
      case 'Medium':
        return 'border-yellow-300 bg-yellow-50';
      case 'Low':
        return 'border-blue-300 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getIconColor = (priority: Intervention['priority']) => {
    switch (priority) {
      case 'High':
        return 'text-red-500';
      case 'Medium':
        return 'text-yellow-500';
      case 'Low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const activeInterventions = interventions.filter(i => !i.completed);

  if (activeInterventions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-heading-2 text-calm-800 mb-6">Wellness Interventions</h2>
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-wellness-500 mx-auto mb-4" />
          <h3 className="text-heading-4 text-calm-800 mb-2">All Caught Up!</h3>
          <p className="text-body text-calm-600">No interventions needed right now. We'll notify you when it's time for a break.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-heading-2 text-calm-800">Wellness Interventions</h2>
        <span className="bg-focus-100 text-focus-800 text-label font-medium px-3 py-1 rounded-full">
          {activeInterventions.length} pending
        </span>
      </div>

      <div className="space-y-4">
        {activeInterventions.map((intervention) => (
          <div
            key={intervention.id}
            className={`border-2 rounded-lg p-4 transition-all duration-200 ${getPriorityColor(intervention.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`${getIconColor(intervention.priority)} mt-1`}>
                  {getInterventionIcon(intervention.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-heading-4 text-calm-800 mb-1">
                    {intervention.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-body-small text-calm-500">
                    <span>• {intervention.duration} min</span>
                    <span>• {intervention.priority} priority</span>
                    <span>• {intervention.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onComplete(intervention.id)}
                  className="p-2 text-wellness-600 hover:bg-wellness-100 rounded-full transition-colors duration-200 focus-ring"
                  title="Complete intervention"
                  aria-label="Complete intervention"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDismiss(intervention.id)}
                  className="p-2 text-calm-400 hover:bg-calm-100 rounded-full transition-colors duration-200 focus-ring"
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
    </div>
  );
};