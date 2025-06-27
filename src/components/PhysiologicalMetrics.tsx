import React from 'react';
import { Heart, Activity, Moon, Zap, TrendingUp, Clock } from 'lucide-react';
import { SmartwatchData } from '../types';

interface PhysiologicalMetricsProps {
  data: SmartwatchData;
}

export const PhysiologicalMetrics: React.FC<PhysiologicalMetricsProps> = ({ data }) => {
  const getHeartRateColor = (hr: number) => {
    if (hr < 60) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    if (hr < 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (hr < 100) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'High': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getSleepColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className="bg-white dark:bg-calm-800 rounded-lg shadow-md dark:shadow-gentle-dark p-6 h-full flex flex-col border border-calm-200 dark:border-calm-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-500 dark:text-red-400" />
          <span>Physiological Metrics</span>
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{formatLastUpdate(data.lastUpdate)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Heart Rate */}
        <div className={`p-3 rounded-lg border border-opacity-20 ${getHeartRateColor(data.heartRate)}`}>
          <div className="flex items-center justify-between mb-1">
            <Heart className="w-4 h-4" />
            <div className="text-right">
              <div className="text-xl font-bold">{data.heartRate}</div>
              <div className="text-xs">BPM</div>
            </div>
          </div>
          <div className="text-sm font-medium">Heart Rate</div>
          <div className="text-xs">
            {data.heartRate < 60 ? 'Resting' : 
             data.heartRate < 80 ? 'Normal' : 
             data.heartRate < 100 ? 'Elevated' : 'High'}
          </div>
        </div>

        {/* Heart Rate Variability */}
        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-1">
            <Activity className="w-4 h-4" />
            <div className="text-right">
              <div className="text-xl font-bold">{data.heartRateVariability}</div>
              <div className="text-xs">MS</div>
            </div>
          </div>
          <div className="text-sm font-medium">HRV</div>
          <div className="text-xs">
            {data.heartRateVariability > 50 ? 'Excellent' : 
             data.heartRateVariability > 35 ? 'Good' : 'Low'}
          </div>
        </div>

        {/* Sleep Score */}
        <div className={`p-3 rounded-lg border border-opacity-20 ${getSleepColor(data.sleepScore)}`}>
          <div className="flex items-center justify-between mb-1">
            <Moon className="w-4 h-4" />
            <div className="text-right">
              <div className="text-xl font-bold">{data.sleepScore}</div>
              <div className="text-xs">%</div>
            </div>
          </div>
          <div className="text-sm font-medium">Sleep Quality</div>
          <div className="text-xs">Last Night</div>
        </div>

        {/* Stress Level */}
        <div className={`p-3 rounded-lg border border-opacity-20 ${getStressColor(data.stressLevel)}`}>
          <div className="flex items-center justify-between mb-1">
            <Zap className="w-4 h-4" />
            <div className="text-right">
              <div className="text-lg font-bold">{data.stressLevel}</div>
            </div>
          </div>
          <div className="text-sm font-medium">Stress Level</div>
          <div className="text-xs">Current</div>
        </div>
      </div>

      {/* Activity Level Bar - Compact */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activity Level</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{data.activityLevel}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              data.activityLevel >= 70 ? 'bg-green-500 dark:bg-green-400' :
              data.activityLevel >= 40 ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-blue-500 dark:bg-blue-400'
            }`}
            style={{ width: `${data.activityLevel}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {data.activityLevel >= 70 ? 'Very Active' :
           data.activityLevel >= 40 ? 'Moderately Active' : 'Low Activity'}
        </div>
      </div>

      {/* Insights - Compact */}
      <div className="mt-auto p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <div className="flex items-start space-x-2">
          <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Insight: </span>
            {data.stressLevel === 'High' ? 
              'Elevated stress detected. Consider taking a break.' :
             data.heartRate > 80 ? 
              'Heart rate elevated. Active work phase detected.' :
             data.sleepScore < 70 ? 
              'Sleep quality was below optimal last night.' :
              'Physiological metrics look good for sustained focus.'}
          </div>
        </div>
      </div>
    </div>
  );
};