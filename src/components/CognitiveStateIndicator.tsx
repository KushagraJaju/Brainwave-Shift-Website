import React from 'react';
import { Brain, Activity, Heart } from 'lucide-react';
import { CognitiveState } from '../types';

interface CognitiveStateIndicatorProps {
  cognitiveState: CognitiveState;
  isMonitoring: boolean;
}

export const CognitiveStateIndicator: React.FC<CognitiveStateIndicatorProps> = ({
  cognitiveState,
  isMonitoring
}) => {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'Deep':
      case 'Fresh':
      case 'Engaged':
        return 'text-wellness-600 dark:text-wellness-400';
      case 'Moderate':
      case 'Fatigued':
      case 'Calm':
        return 'text-amber-600 dark:text-amber-400';
      case 'Distracted':
      case 'Overloaded':
      case 'Stressed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-calm-500 dark:text-calm-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-wellness-500 to-wellness-600 dark:from-wellness-400 dark:to-wellness-500';
    if (score >= 60) return 'from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400';
    return 'from-red-500 to-red-600 dark:from-red-400 dark:to-red-500';
  };

  return (
    <div className="card-primary p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-heading-2 text-calm-800 dark:text-calm-200">Cognitive State</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-wellness-500 animate-pulse-gentle' : 'bg-calm-400 dark:bg-calm-600'}`}></div>
          <span className="text-label text-calm-600 dark:text-calm-400">{isMonitoring ? 'Monitoring' : 'Paused'}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* Cognitive Score - Centered */}
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-calm-200 dark:text-calm-700"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(cognitiveState.score / 100) * 314} 314`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={`${getScoreColor(cognitiveState.score).split(' ')[0].replace('from-', 'stop-')}`} />
                  <stop offset="100%" className={`${getScoreColor(cognitiveState.score).split(' ')[1].replace('to-', 'stop-')}`} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-display font-bold text-calm-800 dark:text-calm-200">{cognitiveState.score}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-body-small text-calm-600 dark:text-calm-400 mb-2">Overall Cognitive Score</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                <span className="text-xs">↗</span>
                <span className="text-xs font-medium">+12% vs last week</span>
              </div>
            </div>
            <p className="text-xs text-calm-500 dark:text-calm-400 mt-2">
              {cognitiveState.score >= 80 ? 'Excellent performance!' : 
               cognitiveState.score >= 60 ? 'Good focus level' : 'Room for improvement'}
            </p>
          </div>
        </div>

        {/* State Indicators */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between p-4 card-secondary">
            <div className="flex items-center space-x-3">
              <Brain className="w-5 h-5 text-focus-500 dark:text-focus-400" />
              <span className="text-label text-calm-700 dark:text-calm-300">Focus Level</span>
            </div>
            <span className={`text-label font-semibold ${getStateColor(cognitiveState.focusLevel)}`}>
              {cognitiveState.focusLevel}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 card-secondary">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              <span className="text-label text-calm-700 dark:text-calm-300">Cognitive Load</span>
            </div>
            <span className={`text-label font-semibold ${getStateColor(cognitiveState.cognitiveLoad)}`}>
              {cognitiveState.cognitiveLoad}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 card-secondary">
            <div className="flex items-center space-x-3">
              <Heart className="w-5 h-5 text-pink-500 dark:text-pink-400" />
              <span className="text-label text-calm-700 dark:text-calm-300">Emotional State</span>
            </div>
            <span className={`text-label font-semibold ${getStateColor(cognitiveState.emotionalState)}`}>
              {cognitiveState.emotionalState}
            </span>
          </div>
        </div>

        <div className="text-center pt-4 mt-auto">
          <p className="text-body-small text-calm-500 dark:text-calm-400">
            Last updated: {cognitiveState.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};