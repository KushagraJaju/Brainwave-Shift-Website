import React, { useState, useEffect } from 'react';
import { X, Clock, Target, Pause, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { digitalWellnessMonitor } from '../services/DigitalWellnessMonitor';

interface DigitalWellnessInterventionProps {
  intervention: {
    id: string;
    type: string;
    subtype: string;
    title: string;
    description: string;
    options: string[];
    priority: 'Low' | 'Medium' | 'High';
    timestamp: Date;
    platform?: string;
    sessionLength?: number;
    escalationLevel: number;
  };
  onDismiss: (id: string) => void;
  onAction: (id: string, action: string) => void;
}

export const DigitalWellnessIntervention: React.FC<DigitalWellnessInterventionProps> = ({
  intervention,
  onDismiss,
  onAction
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [breathingCount, setBreathingCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const formatTime = (milliseconds?: number) => {
    if (!milliseconds) return '';
    const minutes = Math.floor(milliseconds / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const getPriorityColor = () => {
    switch (intervention.priority) {
      case 'High': return 'border-red-300 bg-red-50';
      case 'Medium': return 'border-yellow-300 bg-yellow-50';
      case 'Low': return 'border-blue-300 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getEscalationMessage = () => {
    if (intervention.escalationLevel >= 3) {
      return "This is your third reminder. Consider taking a longer break.";
    } else if (intervention.escalationLevel >= 2) {
      return "This is your second reminder about this session.";
    }
    return "";
  };

  const handleBreathingExercise = () => {
    setIsBreathing(true);
    setBreathingCount(0);
    
    const breathingInterval = setInterval(() => {
      setBreathingCount(prev => {
        if (prev >= 3) {
          clearInterval(breathingInterval);
          setIsBreathing(false);
          digitalWellnessMonitor.recordMindfulBreak();
          onAction(intervention.id, 'breathing-complete');
          return prev;
        }
        return prev + 1;
      });
    }, 4000); // 4 seconds per breath cycle
  };

  const handleAction = (action: string) => {
    if (action === 'Take a breath' || action === 'Do breathing exercise') {
      handleBreathingExercise();
    } else {
      if (action.includes('break') || action.includes('Break')) {
        digitalWellnessMonitor.recordMindfulBreak();
      }
      onAction(intervention.id, action);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`
        bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out
        ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        ${getPriorityColor()} border-2
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              intervention.priority === 'High' ? 'bg-red-100 text-red-600' :
              intervention.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {intervention.subtype === 'focus-mode-violation' ? <Target className="w-5 h-5" /> :
               intervention.subtype.includes('time-limit') ? <Clock className="w-5 h-5" /> :
               <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{intervention.title}</h3>
              {intervention.platform && (
                <p className="text-sm text-gray-600">
                  {intervention.platform} • {formatTime(intervention.sessionLength)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => onDismiss(intervention.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4 leading-relaxed">{intervention.description}</p>
          
          {getEscalationMessage() && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700 font-medium">{getEscalationMessage()}</p>
            </div>
          )}

          {/* Breathing Exercise UI */}
          {isBreathing && (
            <div className="mb-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping"></div>
                <div className="relative w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{breathingCount + 1}</span>
                </div>
              </div>
              <p className="text-lg font-medium text-gray-800 mb-2">
                {breathingCount < 3 ? 'Breathe deeply...' : 'Well done!'}
              </p>
              <p className="text-sm text-gray-600">
                {breathingCount < 3 ? `Breath ${breathingCount + 1} of 3` : 'You took a mindful moment'}
              </p>
            </div>
          )}

          {/* Action Options */}
          {!isBreathing && (
            <div className="space-y-3">
              {intervention.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAction(option)}
                  className={`
                    w-full p-3 rounded-lg text-left transition-all duration-200 border-2
                    ${index === 0 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500 font-medium' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {option.includes('break') && (
                      <CheckCircle className="w-4 h-4 opacity-70" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Mindful Reminder */}
          <div className="mt-6 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-700 text-center">
              <span className="font-medium">Remember:</span> Mindful usage enhances your cognitive performance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};