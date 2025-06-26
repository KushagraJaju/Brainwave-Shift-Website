import React from 'react';
import { Brain, Zap, Heart, TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { cognitiveMonitor } from '../services/CognitiveMonitor';

export const MonitoringMetrics: React.FC = () => {
  const [data, setData] = React.useState(cognitiveMonitor.getData());

  React.useEffect(() => {
    const unsubscribe = cognitiveMonitor.subscribe((newData) => {
      setData(newData);
    });

    return unsubscribe;
  }, []);

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Enhanced color system for each metric type
  const getMetricColors = (metricType: 'focus' | 'load' | 'stress' | 'overall', score: number) => {
    const intensity = score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';
    
    const colorSchemes = {
      focus: {
        high: {
          bg: 'bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20',
          border: 'border-blue-300 dark:border-blue-700',
          text: 'text-blue-700 dark:text-blue-300',
          progress: '#0ea5e9', // blue-500
          sparkline: '#0ea5e9',
          shadow: 'shadow-blue-100 dark:shadow-blue-900/20'
        },
        medium: {
          bg: 'bg-gradient-to-br from-blue-25 to-teal-25 dark:from-blue-900/10 dark:to-teal-900/10',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-600 dark:text-blue-400',
          progress: '#38bdf8', // blue-400
          sparkline: '#38bdf8',
          shadow: 'shadow-blue-50 dark:shadow-blue-900/10'
        },
        low: {
          bg: 'bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/20 dark:to-blue-900/20',
          border: 'border-slate-200 dark:border-slate-700',
          text: 'text-slate-600 dark:text-slate-400',
          progress: '#94a3b8', // slate-400
          sparkline: '#94a3b8',
          shadow: 'shadow-slate-100 dark:shadow-slate-900/20'
        }
      },
      load: {
        high: {
          bg: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
          border: 'border-purple-300 dark:border-purple-700',
          text: 'text-purple-700 dark:text-purple-300',
          progress: '#a855f7', // purple-500
          sparkline: '#a855f7',
          shadow: 'shadow-purple-100 dark:shadow-purple-900/20'
        },
        medium: {
          bg: 'bg-gradient-to-br from-purple-25 to-violet-25 dark:from-purple-900/10 dark:to-violet-900/10',
          border: 'border-purple-200 dark:border-purple-800',
          text: 'text-purple-600 dark:text-purple-400',
          progress: '#c084fc', // purple-400
          sparkline: '#c084fc',
          shadow: 'shadow-purple-50 dark:shadow-purple-900/10'
        },
        low: {
          bg: 'bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900/20 dark:to-purple-900/20',
          border: 'border-slate-200 dark:border-slate-700',
          text: 'text-slate-600 dark:text-slate-400',
          progress: '#94a3b8', // slate-400
          sparkline: '#94a3b8',
          shadow: 'shadow-slate-100 dark:shadow-slate-900/20'
        }
      },
      stress: {
        high: {
          bg: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
          border: 'border-red-300 dark:border-red-700',
          text: 'text-red-700 dark:text-red-300',
          progress: '#ef4444', // red-500
          sparkline: '#ef4444',
          shadow: 'shadow-red-100 dark:shadow-red-900/20'
        },
        medium: {
          bg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
          border: 'border-orange-200 dark:border-orange-700',
          text: 'text-orange-600 dark:text-orange-400',
          progress: '#f97316', // orange-500
          sparkline: '#f97316',
          shadow: 'shadow-orange-50 dark:shadow-orange-900/20'
        },
        low: {
          bg: 'bg-gradient-to-br from-slate-50 to-orange-50 dark:from-slate-900/20 dark:to-orange-900/20',
          border: 'border-slate-200 dark:border-slate-700',
          text: 'text-slate-600 dark:text-slate-400',
          progress: '#94a3b8', // slate-400
          sparkline: '#94a3b8',
          shadow: 'shadow-slate-100 dark:shadow-slate-900/20'
        }
      },
      overall: {
        high: {
          bg: 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20',
          border: 'border-emerald-300 dark:border-emerald-700',
          text: 'text-emerald-700 dark:text-emerald-300',
          progress: '#10b981', // emerald-500
          sparkline: '#10b981',
          shadow: 'shadow-emerald-100 dark:shadow-emerald-900/20'
        },
        medium: {
          bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          border: 'border-green-200 dark:border-green-700',
          text: 'text-green-600 dark:text-green-400',
          progress: '#22c55e', // green-500
          sparkline: '#22c55e',
          shadow: 'shadow-green-50 dark:shadow-green-900/20'
        },
        low: {
          bg: 'bg-gradient-to-br from-slate-50 to-green-50 dark:from-slate-900/20 dark:to-green-900/20',
          border: 'border-slate-200 dark:border-slate-700',
          text: 'text-slate-600 dark:text-slate-400',
          progress: '#94a3b8', // slate-400
          sparkline: '#94a3b8',
          shadow: 'shadow-slate-100 dark:shadow-slate-900/20'
        }
      }
    };

    return colorSchemes[metricType][intensity];
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />;
      case 'down':
        return <ArrowDown className="w-3 h-3 text-red-500 dark:text-red-400" />;
      case 'stable':
        return <Minus className="w-3 h-3 text-slate-400 dark:text-slate-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600 dark:text-emerald-400 font-semibold';
      case 'down':
        return 'text-red-600 dark:text-red-400 font-semibold';
      case 'stable':
        return 'text-slate-500 dark:text-slate-400 font-medium';
    }
  };

  const getChangeText = (change: number, trend: 'up' | 'down' | 'stable') => {
    if (trend === 'stable') return 'Stable';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  // Enhanced mini sparkline component with better styling
  const MiniSparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    if (data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 64; // 64px wide
      const y = 18 - ((value - min) / range) * 14; // 18px high, 2px padding
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="flex justify-center">
        <svg width="64" height="18" className="drop-shadow-sm">
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>
          <polyline
            points={points}
            fill="none"
            stroke={`url(#gradient-${color.replace('#', '')})`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
          {/* Add dots for data points */}
          {data.slice(-3).map((value, index) => {
            const x = ((data.length - 3 + index) / (data.length - 1)) * 64;
            const y = 18 - ((value - min) / range) * 14;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill={color}
                className="drop-shadow-sm"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  // Enhanced progress ring component with better styling
  const ProgressRing: React.FC<{ score: number; size: number; strokeWidth: number; color: string }> = ({ 
    score, size, strokeWidth, color 
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
          <defs>
            <linearGradient id={`ring-gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#ring-gradient-${color.replace('#', '')})`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-sm"
          />
        </svg>
      </div>
    );
  };

  const getRhythmColor = (rhythm: string) => {
    switch (rhythm) {
      case 'steady': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700';
      case 'erratic': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700';
      case 'declining': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700';
    }
  };

  const getPatternColor = (pattern: string) => {
    switch (pattern) {
      case 'smooth': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700';
      case 'erratic': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      case 'minimal': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column - Enhanced Cognitive Metrics */}
        <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 h-full flex flex-col border border-slate-200 dark:border-calm-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <span>Cognitive Metrics</span>
          </h3>
          
          {/* 2x2 Grid for Enhanced Score Cards */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            
            {/* Focus Score Card */}
            <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${getMetricColors('focus', data.cognitiveMetrics.focusScore).bg} ${getMetricColors('focus', data.cognitiveMetrics.focusScore).border} ${getMetricColors('focus', data.cognitiveMetrics.focusScore).shadow}`}>
              <div className="flex items-center justify-between mb-3">
                <ProgressRing 
                  score={data.cognitiveMetrics.focusScore} 
                  size={36} 
                  strokeWidth={3} 
                  color={getMetricColors('focus', data.cognitiveMetrics.focusScore).progress}
                />
                <div className="flex items-center space-x-1">
                  {getTrendIcon(data.cognitiveMetrics.focusTrend)}
                  <span className={`text-xs ${getTrendColor(data.cognitiveMetrics.focusTrend)}`}>
                    {getChangeText(data.cognitiveMetrics.focusChange, data.cognitiveMetrics.focusTrend)}
                  </span>
                </div>
              </div>
              <div className="text-center mb-3">
                <div className={`text-2xl font-bold ${getMetricColors('focus', data.cognitiveMetrics.focusScore).text}`}>
                  {data.cognitiveMetrics.focusScore}
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Focus Score</div>
              </div>
              <MiniSparkline 
                data={data.cognitiveMetrics.focusHistory} 
                color={getMetricColors('focus', data.cognitiveMetrics.focusScore).sparkline}
              />
            </div>
            
            {/* Load Score Card */}
            <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${getMetricColors('load', data.cognitiveMetrics.loadScore).bg} ${getMetricColors('load', data.cognitiveMetrics.loadScore).border} ${getMetricColors('load', data.cognitiveMetrics.loadScore).shadow}`}>
              <div className="flex items-center justify-between mb-3">
                <ProgressRing 
                  score={data.cognitiveMetrics.loadScore} 
                  size={36} 
                  strokeWidth={3} 
                  color={getMetricColors('load', data.cognitiveMetrics.loadScore).progress}
                />
                <div className="flex items-center space-x-1">
                  {getTrendIcon(data.cognitiveMetrics.loadTrend)}
                  <span className={`text-xs ${getTrendColor(data.cognitiveMetrics.loadTrend)}`}>
                    {getChangeText(data.cognitiveMetrics.loadChange, data.cognitiveMetrics.loadTrend)}
                  </span>
                </div>
              </div>
              <div className="text-center mb-3">
                <div className={`text-2xl font-bold ${getMetricColors('load', data.cognitiveMetrics.loadScore).text}`}>
                  {data.cognitiveMetrics.loadScore}
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Load Score</div>
              </div>
              <MiniSparkline 
                data={data.cognitiveMetrics.loadHistory} 
                color={getMetricColors('load', data.cognitiveMetrics.loadScore).sparkline}
              />
            </div>
            
            {/* Stress Score Card */}
            <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${getMetricColors('stress', data.cognitiveMetrics.stressScore).bg} ${getMetricColors('stress', data.cognitiveMetrics.stressScore).border} ${getMetricColors('stress', data.cognitiveMetrics.stressScore).shadow}`}>
              <div className="flex items-center justify-between mb-3">
                <ProgressRing 
                  score={data.cognitiveMetrics.stressScore} 
                  size={36} 
                  strokeWidth={3} 
                  color={getMetricColors('stress', data.cognitiveMetrics.stressScore).progress}
                />
                <div className="flex items-center space-x-1">
                  {getTrendIcon(data.cognitiveMetrics.stressTrend)}
                  <span className={`text-xs ${getTrendColor(data.cognitiveMetrics.stressTrend)}`}>
                    {getChangeText(data.cognitiveMetrics.stressChange, data.cognitiveMetrics.stressTrend)}
                  </span>
                </div>
              </div>
              <div className="text-center mb-3">
                <div className={`text-2xl font-bold ${getMetricColors('stress', data.cognitiveMetrics.stressScore).text}`}>
                  {data.cognitiveMetrics.stressScore}
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Stress Score</div>
              </div>
              <MiniSparkline 
                data={data.cognitiveMetrics.stressHistory} 
                color={getMetricColors('stress', data.cognitiveMetrics.stressScore).sparkline}
              />
            </div>
            
            {/* Overall Score Card */}
            <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${getMetricColors('overall', data.cognitiveMetrics.overallScore).bg} ${getMetricColors('overall', data.cognitiveMetrics.overallScore).border} ${getMetricColors('overall', data.cognitiveMetrics.overallScore).shadow}`}>
              <div className="flex items-center justify-between mb-3">
                <ProgressRing 
                  score={data.cognitiveMetrics.overallScore} 
                  size={36} 
                  strokeWidth={3} 
                  color={getMetricColors('overall', data.cognitiveMetrics.overallScore).progress}
                />
                <div className="flex items-center space-x-1">
                  {getTrendIcon(data.cognitiveMetrics.overallTrend)}
                  <span className={`text-xs ${getTrendColor(data.cognitiveMetrics.overallTrend)}`}>
                    {getChangeText(data.cognitiveMetrics.overallChange, data.cognitiveMetrics.overallTrend)}
                  </span>
                </div>
              </div>
              <div className="text-center mb-3">
                <div className={`text-2xl font-bold ${getMetricColors('overall', data.cognitiveMetrics.overallScore).text}`}>
                  {data.cognitiveMetrics.overallScore}
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Overall Score</div>
              </div>
              <MiniSparkline 
                data={data.cognitiveMetrics.overallHistory} 
                color={getMetricColors('overall', data.cognitiveMetrics.overallScore).sparkline}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Activity Sections */}
        <div className="space-y-6">
          
          {/* Browser Activity */}
          <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 border border-slate-200 dark:border-calm-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span>Browser Activity</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{data.browserActivity.tabSwitches}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Tab Switches</div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  {formatTime(data.browserActivity.focusTime)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Current Focus</div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  {formatTime(data.browserActivity.totalActiveTime)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Active</div>
              </div>
            </div>
          </div>

          {/* Keyboard Activity */}
          <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 border border-slate-200 dark:border-calm-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              <span>Keyboard Activity</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-slate-50 to-orange-50 dark:from-slate-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{data.keyboardActivity.typingSpeed}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">WPM</div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-orange-50 dark:from-slate-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{data.keyboardActivity.keystrokes}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Keystrokes</div>
              </div>
              <div className={`p-4 rounded-lg border-2 ${getRhythmColor(data.keyboardActivity.typingRhythm)}`}>
                <div className="text-sm font-bold capitalize">{data.keyboardActivity.typingRhythm}</div>
                <div className="text-xs font-medium">Typing Rhythm</div>
              </div>
            </div>
          </div>

          {/* Mouse Activity */}
          <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 border border-slate-200 dark:border-calm-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-pink-500 dark:text-pink-400" />
              <span>Mouse Activity</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-slate-50 to-pink-50 dark:from-slate-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{data.mouseActivity.movements}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Movements</div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-pink-50 dark:from-slate-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{data.mouseActivity.clicks}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Clicks</div>
              </div>
              <div className={`p-4 rounded-lg border-2 ${getPatternColor(data.mouseActivity.movementPattern)}`}>
                <div className="text-sm font-bold capitalize">{data.mouseActivity.movementPattern}</div>
                <div className="text-xs font-medium">Movement Pattern</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};