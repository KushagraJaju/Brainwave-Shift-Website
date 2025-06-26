import React from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { AnalyticsData } from '../types';
import { DigitalWellnessData } from '../services/DigitalWellnessMonitor';

interface AnalyticsDashboardProps {
  analyticsData: AnalyticsData & { digitalWellnessData: DigitalWellnessData };
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analyticsData }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm text-gray-600">{title}</p>
          {trend && trendValue && (
            <div className={`flex items-center justify-end space-x-1 mt-1 ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
               trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );

  // Calculate digital wellness insights
  const platformBreakdownArray = Array.from(analyticsData.digitalWellnessData.platformBreakdown.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const totalSocialMediaMinutes = Math.round(analyticsData.digitalWellnessData.dailySocialMediaTime / (1000 * 60));
  const averageSessionMinutes = Math.round(analyticsData.digitalWellnessData.averageSessionLength / (1000 * 60));
  const longestSessionMinutes = Math.round(analyticsData.digitalWellnessData.longestSession / (1000 * 60));

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

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Digital Wellness */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Performance & Digital Wellness Analytics</h2>
        <p className="text-blue-100 mb-4">
          Comprehensive analysis of your cognitive performance and digital habits
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{analyticsData.averageFocusQuality}%</div>
            <div className="text-sm text-blue-100">Avg Focus Quality</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{formatTimeShort(totalSocialMediaMinutes)}</div>
            <div className="text-sm text-blue-100">Social Media Today</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{analyticsData.digitalWellnessScore}</div>
            <div className="text-sm text-blue-100">Digital Wellness</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold">{analyticsData.mindfulBreaksTaken}</div>
            <div className="text-sm text-blue-100">Mindful Breaks</div>
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

      {/* Digital Wellness Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-purple-500" />
          <span>Digital Wellness Analysis</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Smartphone className="w-6 h-6 text-white" />}
            title="Social Media Time"
            value={formatTimeShort(totalSocialMediaMinutes)}
            subtitle="Total usage today"
            color="bg-purple-500"
            trend={totalSocialMediaMinutes > 120 ? 'down' : totalSocialMediaMinutes < 30 ? 'up' : 'stable'}
            trendValue={totalSocialMediaMinutes > 120 ? 'High' : totalSocialMediaMinutes < 30 ? 'Low' : 'Moderate'}
          />
          
          <StatCard
            icon={<Eye className="w-6 h-6 text-white" />}
            title="Mindless Sessions"
            value={analyticsData.digitalWellnessData.mindlessScrollingSessions.toString()}
            subtitle="Low engagement periods"
            color="bg-orange-500"
            trend={analyticsData.digitalWellnessData.mindlessScrollingSessions > 3 ? 'down' : 'up'}
            trendValue={analyticsData.digitalWellnessData.mindlessScrollingSessions > 3 ? 'High' : 'Good'}
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
            <h4 className="font-semibold text-gray-800 mb-4">Platform Usage Breakdown</h4>
            <div className="space-y-3">
              {platformBreakdownArray.map(([platform, time]) => {
                const minutes = Math.round(time / (1000 * 60));
                const percentage = analyticsData.digitalWellnessData.dailySocialMediaTime > 0 
                  ? (time / analyticsData.digitalWellnessData.dailySocialMediaTime) * 100 
                  : 0;
                
                return (
                  <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-gray-700">{platform}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-800 min-w-[40px] text-right">
                        {formatTimeShort(minutes)}
                      </span>
                      <span className="text-xs text-gray-500 min-w-[35px] text-right">
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
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span>Digital Habits Analysis</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{formatTimeShort(averageSessionMinutes)}</div>
              <div className="text-sm text-gray-600">Average Session</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{formatTimeShort(longestSessionMinutes)}</div>
              <div className="text-sm text-gray-600">Longest Session</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {platformBreakdownArray.length}
              </div>
              <div className="text-sm text-gray-600">Platforms Used</div>
            </div>
          </div>

          {/* Correlation Insight */}
          <div className={`p-3 rounded-lg border ${
            correlationInsight.type === 'positive' || correlationInsight.type === 'excellent' 
              ? 'bg-green-50 border-green-200' 
              : correlationInsight.type === 'negative' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start space-x-2">
              {correlationInsight.type === 'positive' || correlationInsight.type === 'excellent' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              ) : correlationInsight.type === 'negative' ? (
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              ) : (
                <BarChart3 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  correlationInsight.type === 'positive' || correlationInsight.type === 'excellent' 
                    ? 'text-green-700' 
                    : correlationInsight.type === 'negative' 
                      ? 'text-red-700' 
                      : 'text-blue-700'
                }`}>
                  {correlationInsight.message}
                </p>
                <p className={`text-xs mt-1 ${
                  correlationInsight.type === 'positive' || correlationInsight.type === 'excellent' 
                    ? 'text-green-600' 
                    : correlationInsight.type === 'negative' 
                      ? 'text-red-600' 
                      : 'text-blue-600'
                }`}>
                  {correlationInsight.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traditional Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Performance Hours */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Peak Performance Hours</h3>
          <div className="space-y-3">
            {analyticsData.peakHours.length > 0 ? (
              analyticsData.peakHours.map((hour, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-gray-700">
                    {hour}:00 - {hour + 1}:00
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">High Focus</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Keep working to identify your peak hours!
              </p>
            )}
          </div>
        </div>

        {/* Common Distractions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Distractions</h3>
          <div className="space-y-3">
            {analyticsData.distractionTriggers.map((trigger, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-gray-700">{trigger}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Trigger</span>
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