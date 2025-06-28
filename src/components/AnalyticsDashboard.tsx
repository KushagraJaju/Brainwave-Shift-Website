import React, { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Calendar, 
  Clock, 
  Brain,
  Smartphone,
  Heart,
  Eye,
  TrendingDown,
  BarChart3,
  Users,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity
} from 'lucide-react';
import { AnalyticsData } from '../types';
import { DigitalWellnessData } from '../services/DigitalWellnessMonitor';

interface AnalyticsDashboardProps {
  analyticsData: AnalyticsData & { digitalWellnessData: DigitalWellnessData };
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analyticsData }) => {
  const [digitalWellnessView, setDigitalWellnessView] = useState<'today' | 'weekly'>('today');

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTimeMs = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (hours > 0) {
      return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const formatTimeShort = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    color: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
  }> = ({ icon, title, value, subtitle, color, trend, trendValue }) => (
    <div className="bg-white dark:bg-calm-800 rounded-lg shadow-md dark:shadow-gentle-dark p-6 transition-all duration-200 hover:shadow-lg dark:hover:shadow-soft-dark border border-calm-200 dark:border-calm-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          {trend && trendValue && (
            <div className={`flex items-center justify-end space-x-1 mt-1 ${
              trend === 'up' ? 'text-green-600 dark:text-green-400' : 
              trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : 
               trend === 'down' ? <ArrowDown className="w-3 h-3" /> : 
               <Minus className="w-3 h-3" />}
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
  );

  // Calculate digital wellness insights
  const digitalData = analyticsData.digitalWellnessData;
  const weeklyTrends = digitalData.weeklyTrends;
  
  const platformBreakdownArray = Array.from(digitalData.platformBreakdown.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const totalSocialMediaMinutes = Math.round(digitalData.dailySocialMediaTime / (1000 * 60));
  const averageSessionMinutes = Math.round(digitalData.averageSessionLength / (1000 * 60));
  const longestSessionMinutes = Math.round(digitalData.longestSession / (1000 * 60));
  const weeklyAverageMinutes = Math.round(weeklyTrends.averageDailyUsage / (1000 * 60));

  // Calculate correlation between social media usage and cognitive performance
  const getCorrelationInsight = () => {
    if (totalSocialMediaMinutes > 120 && analyticsData.averageFocusQuality < 70) {
      return {
        type: 'negative',
        message: 'High social media usage may be impacting cognitive performance',
        recommendation: 'Consider reducing daily usage or taking more frequent breaks'
      };
    } else if (analyticsData.mindfulBreaksTaken > 3 && analyticsData.averageFocusQuality > 75) {
      return {
        type: 'positive',
        message: 'Mindful digital habits are supporting excellent cognitive performance',
        recommendation: 'Keep up the balanced approach to digital wellness'
      };
    } else if (totalSocialMediaMinutes < 30 && analyticsData.averageFocusQuality > 80) {
      return {
        type: 'excellent',
        message: 'Minimal social media usage correlates with peak cognitive performance',
        recommendation: 'Your digital discipline is paying off in enhanced focus'
      };
    }
    return {
      type: 'neutral',
      message: 'Digital habits appear balanced with cognitive performance',
      recommendation: 'Continue monitoring for optimization opportunities'
    };
  };

  const correlationInsight = getCorrelationInsight();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500 dark:text-red-400" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500 dark:text-green-400" />;
      default: return <Minus className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-red-600 dark:text-red-400';
      case 'decreasing': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getChangeText = (change: number, trend: 'up' | 'down' | 'stable') => {
    if (trend === 'stable') return 'Stable';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Digital Wellness */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Performance & Digital Wellness Analytics</h2>
        <p className="text-blue-100 dark:text-blue-200 mb-4">
          Comprehensive analysis of your cognitive performance and digital habits over the past week
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{analyticsData.averageFocusQuality}%</div>
            <div className="text-sm text-blue-100 dark:text-blue-200">Avg Focus Quality</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{formatTimeShort(totalSocialMediaMinutes)}</div>
            <div className="text-sm text-blue-100 dark:text-blue-200">Social Media Today</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{analyticsData.digitalWellnessScore}</div>
            <div className="text-sm text-blue-100 dark:text-blue-200">Digital Wellness</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{formatTimeMs(weeklyTrends.totalWeeklyUsage)}</div>
            <div className="text-sm text-blue-100 dark:text-blue-200">Weekly Total</div>
          </div>
        </div>
      </div>

      {/* Core Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<Clock className="w-6 h-6 text-white" />}
          title="Daily Focus"
          value={formatTime(analyticsData.dailyFocusTime)}
          subtitle="Deep work sessions today"
          color="bg-blue-500"
          trend="up"
          trendValue="+12%"
        />
        
        <StatCard
          icon={<Calendar className="w-6 h-6 text-white" />}
          title="Weekly Focus"
          value={formatTime(analyticsData.weeklyFocusTime)}
          subtitle="Total focus time this week"
          color="bg-purple-500"
          trend="stable"
          trendValue="±2%"
        />
        
        <StatCard
          icon={<Brain className="w-6 h-6 text-white" />}
          title="Focus Quality"
          value={`${analyticsData.averageFocusQuality}%`}
          subtitle="Average cognitive performance"
          color="bg-green-500"
          trend={analyticsData.averageFocusQuality > 75 ? 'up' : analyticsData.averageFocusQuality < 60 ? 'down' : 'stable'}
          trendValue={analyticsData.averageFocusQuality > 75 ? '+8%' : analyticsData.averageFocusQuality < 60 ? '-5%' : '±1%'}
        />
      </div>

      {/* UNIFIED Digital Wellness Overview Section */}
      <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <span>Digital Wellness Overview</span>
          </h3>
          
          {/* View Toggle Buttons */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setDigitalWellnessView('today')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                digitalWellnessView === 'today'
                  ? 'bg-white dark:bg-calm-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDigitalWellnessView('weekly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                digitalWellnessView === 'weekly'
                  ? 'bg-white dark:bg-calm-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
        
        {digitalWellnessView === 'today' ? (
          /* Today's Digital Wellness View */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={<Smartphone className="w-6 h-6 text-white" />}
                title="Social Media Time"
                value={formatTimeShort(totalSocialMediaMinutes)}
                subtitle="Total usage today"
                color="bg-purple-500"
                trend={totalSocialMediaMinutes > weeklyAverageMinutes ? 'up' : totalSocialMediaMinutes < weeklyAverageMinutes * 0.7 ? 'down' : 'stable'}
                trendValue={totalSocialMediaMinutes > weeklyAverageMinutes ? 'Above avg' : totalSocialMediaMinutes < weeklyAverageMinutes * 0.7 ? 'Below avg' : 'Normal'}
              />
              
              <StatCard
                icon={<Eye className="w-6 h-6 text-white" />}
                title="Mindless Sessions"
                value={digitalData.mindlessScrollingSessions.toString()}
                subtitle="Low engagement periods"
                color="bg-orange-500"
                trend={digitalData.mindlessScrollingSessions > 3 ? 'up' : 'down'}
                trendValue={digitalData.mindlessScrollingSessions > 3 ? 'High' : 'Good'}
              />
              
              <StatCard
                icon={<Heart className="w-6 h-6 text-white" />}
                title="Mindful Breaks"
                value={analyticsData.mindfulBreaksTaken.toString()}
                subtitle="Conscious pause moments"
                color="bg-green-500"
                trend="up"
                trendValue="+3 today"
              />
              
              <StatCard
                icon={<BarChart3 className="w-6 h-6 text-white" />}
                title="Digital Wellness"
                value={`${analyticsData.digitalWellnessScore}`}
                subtitle="Overall digital health score"
                color="bg-teal-500"
                trend={analyticsData.digitalWellnessScore > 80 ? 'up' : analyticsData.digitalWellnessScore < 60 ? 'down' : 'stable'}
                trendValue={analyticsData.digitalWellnessScore > 80 ? 'Excellent' : analyticsData.digitalWellnessScore < 60 ? 'Needs Work' : 'Good'}
              />
            </div>

            {/* Platform Usage Breakdown */}
            {platformBreakdownArray.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Today's Platform Usage Breakdown</h4>
                <div className="space-y-3">
                  {platformBreakdownArray.map(([platform, time]) => {
                    const minutes = Math.round(time / (1000 * 60));
                    const percentage = digitalData.dailySocialMediaTime > 0 
                      ? (time / digitalData.dailySocialMediaTime) * 100 
                      : 0;
                    
                    // Get platform trend from weekly data
                    const platformTrend = weeklyTrends.platformTrends.get(platform);
                    
                    return (
                      <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{platform}</span>
                          {platformTrend && (
                            <div className={`flex items-center space-x-1 text-xs ${
                              platformTrend.trend === 'up' ? 'text-red-600 dark:text-red-400' : 
                              platformTrend.trend === 'down' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {platformTrend.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : 
                               platformTrend.trend === 'down' ? <ArrowDown className="w-3 h-3" /> : 
                               <Minus className="w-3 h-3" />}
                              <span>{Math.abs(platformTrend.change)}%</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 min-w-[40px] text-right">
                            {formatTimeShort(minutes)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[35px] text-right">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Digital Habits Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <span>Digital Habits Analysis</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatTimeShort(averageSessionMinutes)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Session</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatTimeShort(longestSessionMinutes)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Longest Session</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {digitalData.sessionCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
                </div>
              </div>

              {/* Correlation Insight */}
              <div className={`p-3 rounded-lg border ${
                correlationInsight.type === 'positive' || correlationInsight.type === 'excellent' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : correlationInsight.type === 'negative' 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}>
                <div className="flex items-start space-x-2">
                  {correlationInsight.type === 'positive' || correlationInsight.type === 'excellent' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  ) : correlationInsight.type === 'negative' ? (
                    <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <BarChart3 className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${
                      correlationInsight.type === 'positive' || correlationInsight.type === 'excellent' 
                        ? 'text-green-700 dark:text-green-300' 
                        : correlationInsight.type === 'negative' 
                          ? 'text-red-700 dark:text-red-300' 
                          : 'text-blue-700 dark:text-blue-300'
                    }`}>
                      {correlationInsight.message}
                    </p>
                    <p className={`text-xs mt-1 ${
                      correlationInsight.type === 'positive' || correlationInsight.type === 'excellent' 
                        ? 'text-green-600 dark:text-green-400' 
                        : correlationInsight.type === 'negative' 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      {correlationInsight.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Weekly Digital Wellness View */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={<BarChart3 className="w-6 h-6 text-white" />}
                title="Weekly Average"
                value={formatTimeShort(weeklyAverageMinutes)}
                subtitle="Daily social media usage"
                color="bg-purple-500"
                trend={weeklyTrends.usageTrend === 'increasing' ? 'up' : weeklyTrends.usageTrend === 'decreasing' ? 'down' : 'stable'}
                trendValue={weeklyTrends.usageTrend === 'stable' ? 'Stable' : weeklyTrends.usageTrend === 'increasing' ? 'Rising' : 'Falling'}
              />
              
              <StatCard
                icon={<Target className="w-6 h-6 text-white" />}
                title="Most Used Platform"
                value={weeklyTrends.mostUsedPlatform || 'None'}
                subtitle="Top platform this week"
                color="bg-orange-500"
              />
              
              <StatCard
                icon={<Heart className="w-6 h-6 text-white" />}
                title="Weekly Mindful Breaks"
                value={weeklyTrends.weeklyMindfulBreaks.toString()}
                subtitle="Conscious pause moments"
                color="bg-green-500"
                trend="up"
                trendValue="+15 this week"
              />
              
              <StatCard
                icon={<Activity className="w-6 h-6 text-white" />}
                title="Cognitive Impact"
                value={`${Math.round(weeklyTrends.averageCognitiveImpact)}`}
                subtitle="Weekly average score"
                color="bg-teal-500"
                trend={weeklyTrends.averageCognitiveImpact > 80 ? 'up' : weeklyTrends.averageCognitiveImpact < 60 ? 'down' : 'stable'}
                trendValue={weeklyTrends.averageCognitiveImpact > 80 ? 'Excellent' : weeklyTrends.averageCognitiveImpact < 60 ? 'Needs Work' : 'Good'}
              />
            </div>

            {/* Weekly Usage Trend Chart */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Daily Usage Trend (Past 7 Days)</h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-end justify-between space-x-2 h-32">
                  {digitalData.weeklyData.map((day, index) => {
                    const dayMinutes = Math.round(day.totalSocialMediaTime / (1000 * 60));
                    const maxUsage = Math.max(...digitalData.weeklyData.map(d => d.totalSocialMediaTime));
                    const height = maxUsage > 0 ? (day.totalSocialMediaTime / maxUsage) * 100 : 0;
                    const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                    
                    return (
                      <div key={day.date} className="flex flex-col items-center flex-1">
                        <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-t-lg relative" style={{ height: '100px' }}>
                          <div 
                            className="bg-purple-500 dark:bg-purple-400 rounded-t-lg w-full absolute bottom-0 transition-all duration-500"
                            style={{ height: `${height}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                          <div className="font-medium">{dayName}</div>
                          <div>{dayMinutes}m</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Weekly Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span>Usage Patterns</span>
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Peak usage day:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{weeklyTrends.mostUsedDay}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Lowest usage day:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{weeklyTrends.leastUsedDay}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Weekly trend:</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(weeklyTrends.usageTrend)}
                      <span className={`font-medium capitalize ${getTrendColor(weeklyTrends.usageTrend)}`}>
                        {weeklyTrends.usageTrend}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-green-500 dark:text-green-400" />
                  <span>Wellness Metrics</span>
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mindless sessions:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{weeklyTrends.weeklyMindlessSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mindful breaks:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{weeklyTrends.weeklyMindfulBreaks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Peak usage days:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{weeklyTrends.peakUsageDays.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Traditional Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Performance Hours */}
        <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Peak Performance Hours</h3>
          <div className="space-y-3">
            {analyticsData.peakHours.length > 0 ? (
              analyticsData.peakHours.map((hour, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {hour}:00 - {hour + 1}:00
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">High Focus</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Keep working to identify your peak hours!
              </p>
            )}
          </div>
        </div>

        {/* Common Distractions */}
        <div className="bg-white dark:bg-calm-800 rounded-xl shadow-lg dark:shadow-gentle-dark p-6 border border-calm-200 dark:border-calm-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Common Distractions</h3>
          <div className="space-y-3">
            {analyticsData.distractionTriggers.map((trigger, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">{trigger}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Trigger</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<Target className="w-6 h-6 text-white" />}
          title="Interventions"
          value={analyticsData.totalInterventions.toString()}
          subtitle="Wellness actions completed"
          color="bg-orange-500"
        />
        
        <StatCard
          icon={<Award className="w-6 h-6 text-white" />}
          title="Streak"
          value={`${analyticsData.streakDays} days`}
          subtitle="Consistent performance"
          color="bg-pink-500"
        />
        
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          title="Peak Hours"
          value={analyticsData.peakHours.length.toString()}
          subtitle="High-performance periods identified"
          color="bg-teal-500"
        />
      </div>
    </div>
  );
};