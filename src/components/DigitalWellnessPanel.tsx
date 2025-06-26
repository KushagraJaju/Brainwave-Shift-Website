import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Pause,
  Play
} from 'lucide-react';
import { digitalWellnessMonitor, DigitalWellnessData, SocialMediaActivity } from '../services/DigitalWellnessMonitor';

export const DigitalWellnessPanel: React.FC = () => {
  const [data, setData] = useState<DigitalWellnessData>(digitalWellnessMonitor.getData());
  const [currentActivity, setCurrentActivity] = useState<SocialMediaActivity | null>(digitalWellnessMonitor.getCurrentActivity());
  const [isMonitoring, setIsMonitoring] = useState(digitalWellnessMonitor.isActive());

  useEffect(() => {
    // Subscribe to data updates
    const unsubscribeData = digitalWellnessMonitor.subscribe((newData) => {
      setData(newData);
    });

    // Update current activity every second
    const activityInterval = setInterval(() => {
      setCurrentActivity(digitalWellnessMonitor.getCurrentActivity());
    }, 1000);

    return () => {
      unsubscribeData();
      clearInterval(activityInterval);
    };
  }, []);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimeShort = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    return `${minutes}m`;
  };

  const getEngagementColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  const getEngagementLabel = (score: number) => {
    if (score >= 70) return 'Intentional';
    if (score >= 40) return 'Moderate';
    return 'Mindless';
  };

  const getCognitiveImpactColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      digitalWellnessMonitor.stopMonitoring();
    } else {
      digitalWellnessMonitor.startMonitoring();
    }
    setIsMonitoring(!isMonitoring);
  };

  const platformBreakdownArray = Array.from(data.platformBreakdown.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-heading-2 text-calm-800 dark:text-calm-200 flex items-center space-x-2">
          <Smartphone className="w-6 h-6 text-purple-500 dark:text-purple-400" />
          <span>Digital Wellness</span>
        </h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse-gentle' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
            <span className="text-label text-calm-600 dark:text-calm-400">{isMonitoring ? 'Monitoring' : 'Paused'}</span>
          </div>
          <button
            onClick={toggleMonitoring}
            className={`p-2 rounded-lg transition-colors duration-200 focus-ring ${
              isMonitoring 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800' 
                : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-800'
            }`}
            title={isMonitoring ? 'Pause monitoring' : 'Resume monitoring'}
          >
            {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Current Session Alert */}
      {currentActivity && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse-gentle"></div>
              <div>
                <span className="text-label font-medium text-purple-800 dark:text-purple-300">
                  Active on {currentActivity.platform}
                </span>
                <div className="flex items-center space-x-4 text-body-small text-purple-600 dark:text-purple-400 mt-1">
                  <span>{formatTime(currentActivity.timeSpent)}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEngagementColor(currentActivity.engagementScore)}`}>
                    {getEngagementLabel(currentActivity.engagementScore)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-heading-4 text-purple-800 dark:text-purple-300">{currentActivity.scrollEvents}</div>
              <div className="text-body-small text-purple-600 dark:text-purple-400">scrolls</div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <div className="text-right">
              <div className="text-xl font-bold text-blue-800 dark:text-blue-300">{formatTime(data.dailySocialMediaTime)}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Total Time</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            <div className="text-right">
              <div className="text-xl font-bold text-orange-800 dark:text-orange-300">{data.mindlessScrollingSessions}</div>
              <div className="text-xs text-orange-600 dark:text-orange-400">Mindless Sessions</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
            <div className="text-right">
              <div className="text-xl font-bold text-green-800 dark:text-green-300">{data.mindfulBreaksTaken}</div>
              <div className="text-xs text-green-600 dark:text-green-400">Mindful Breaks</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <div className="text-right">
              <div className={`text-xl font-bold ${getCognitiveImpactColor(data.cognitiveImpactScore)}`}>
                {data.cognitiveImpactScore}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Impact Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      {platformBreakdownArray.length > 0 && (
        <div className="mb-6">
          <h3 className="text-heading-4 text-calm-800 dark:text-calm-200 mb-4">Platform Usage</h3>
          <div className="space-y-3">
            {platformBreakdownArray.map(([platform, time]) => {
              const percentage = data.dailySocialMediaTime > 0 ? (time / data.dailySocialMediaTime) * 100 : 0;
              return (
                <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-label text-calm-700 dark:text-calm-300">{platform}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-label font-medium text-calm-800 dark:text-calm-200 min-w-[50px] text-right">
                      {formatTimeShort(time)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights and Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
        <h4 className="font-semibold text-calm-800 dark:text-calm-200 mb-3 flex items-center space-x-2">
          <Target className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span>Digital Wellness Insights</span>
        </h4>
        
        <div className="space-y-2 text-sm">
          {data.cognitiveImpactScore < 60 && (
            <div className="flex items-start space-x-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>High social media usage may be impacting your cognitive performance</span>
            </div>
          )}
          
          {data.mindlessScrollingSessions > 3 && (
            <div className="flex items-start space-x-2 text-orange-700 dark:text-orange-400">
              <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Multiple mindless scrolling sessions detected today</span>
            </div>
          )}
          
          {data.mindfulBreaksTaken > 0 && (
            <div className="flex items-start space-x-2 text-green-700 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Great job taking mindful breaks! Keep up the intentional usage</span>
            </div>
          )}
          
          {data.dailySocialMediaTime < 30 * 60 * 1000 && (
            <div className="flex items-start space-x-2 text-blue-700 dark:text-blue-400">
              <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Excellent digital wellness today - minimal social media usage</span>
            </div>
          )}
          
          {platformBreakdownArray.length === 0 && (
            <div className="flex items-start space-x-2 text-green-700 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>No social media usage detected today - excellent focus!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};