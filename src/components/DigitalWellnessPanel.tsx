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
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getEngagementLabel = (score: number) => {
    if (score >= 70) return 'Intentional';
    if (score >= 40) return 'Moderate';
    return 'Mindless';
  };

  const getCognitiveImpactColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-heading-2 text-calm-800 flex items-center space-x-2">
          <Smartphone className="w-6 h-6 text-purple-500" />
          <span>Digital Wellness</span>
        </h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse-gentle' : 'bg-gray-400'}`}></div>
            <span className="text-label text-calm-600">{isMonitoring ? 'Monitoring' : 'Paused'}</span>
          </div>
          <button
            onClick={toggleMonitoring}
            className={`p-2 rounded-lg transition-colors duration-200 focus-ring ${
              isMonitoring 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={isMonitoring ? 'Pause monitoring' : 'Resume monitoring'}
          >
            {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Current Session Alert */}
      {currentActivity && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse-gentle"></div>
              <div>
                <span className="text-label font-medium text-purple-800">
                  Active on {currentActivity.platform}
                </span>
                <div className="flex items-center space-x-4 text-body-small text-purple-600 mt-1">
                  <span>{formatTime(currentActivity.timeSpent)}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(currentActivity.engagementScore)}`}>
                    {getEngagementLabel(currentActivity.engagementScore)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-heading-4 text-purple-800">{currentActivity.scrollEvents}</div>
              <div className="text-body-small text-purple-600">scrolls</div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <div className="text-right">
              <div className="text-xl font-bold text-blue-800">{formatTime(data.dailySocialMediaTime)}</div>
              <div className="text-xs text-blue-600">Total Time</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-orange-500" />
            <div className="text-right">
              <div className="text-xl font-bold text-orange-800">{data.mindlessScrollingSessions}</div>
              <div className="text-xs text-orange-600">Mindless Sessions</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div className="text-right">
              <div className="text-xl font-bold text-green-800">{data.mindfulBreaksTaken}</div>
              <div className="text-xs text-green-600">Mindful Breaks</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <div className="text-right">
              <div className={`text-xl font-bold ${getCognitiveImpactColor(data.cognitiveImpactScore)}`}>
                {data.cognitiveImpactScore}
              </div>
              <div className="text-xs text-purple-600">Impact Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      {platformBreakdownArray.length > 0 && (
        <div className="mb-6">
          <h3 className="text-heading-4 text-calm-800 mb-4">Platform Usage</h3>
          <div className="space-y-3">
            {platformBreakdownArray.map(([platform, time]) => {
              const percentage = data.dailySocialMediaTime > 0 ? (time / data.dailySocialMediaTime) * 100 : 0;
              return (
                <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-label text-calm-700">{platform}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-label font-medium text-calm-800 min-w-[50px] text-right">
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
        <h4 className="font-semibold text-calm-800 mb-3 flex items-center space-x-2">
          <Target className="w-4 h-4 text-blue-500" />
          <span>Digital Wellness Insights</span>
        </h4>
        
        <div className="space-y-2 text-sm">
          {data.cognitiveImpactScore < 60 && (
            <div className="flex items-start space-x-2 text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>High social media usage may be impacting your cognitive performance</span>
            </div>
          )}
          
          {data.mindlessScrollingSessions > 3 && (
            <div className="flex items-start space-x-2 text-orange-700">
              <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Multiple mindless scrolling sessions detected today</span>
            </div>
          )}
          
          {data.mindfulBreaksTaken > 0 && (
            <div className="flex items-start space-x-2 text-green-700">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Great job taking mindful breaks! Keep up the intentional usage</span>
            </div>
          )}
          
          {data.dailySocialMediaTime < 30 * 60 * 1000 && (
            <div className="flex items-start space-x-2 text-blue-700">
              <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Excellent digital wellness today - minimal social media usage</span>
            </div>
          )}
          
          {platformBreakdownArray.length === 0 && (
            <div className="flex items-start space-x-2 text-green-700">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>No social media usage detected today - excellent focus!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};