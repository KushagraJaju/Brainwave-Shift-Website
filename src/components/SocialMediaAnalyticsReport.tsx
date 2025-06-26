import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Smartphone, 
  Eye, 
  Target,
  Calendar,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useDigitalWellness } from '../hooks/useDigitalWellness';

interface PlatformMetrics {
  platform: string;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  avgSessionDuration: number;
  peakEngagementHours: number[];
  interactionRate: number;
  retentionRate: number;
  dropOffPoints: string[];
  crossPlatformUsage: number;
}

interface UsagePattern {
  timeOfDay: string;
  usage: number;
  engagement: number;
  platform: string;
}

interface HabitIndicator {
  trigger: string;
  frequency: number;
  timeSpent: number;
  returnPattern: string;
  adoptionRate: number;
}

export const SocialMediaAnalyticsReport: React.FC = () => {
  const { data: digitalWellnessData } = useDigitalWellness();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedMetric, setSelectedMetric] = useState<'usage' | 'engagement' | 'wellness'>('usage');

  // Mock comprehensive analytics data
  const platformMetrics: PlatformMetrics[] = [
    {
      platform: 'Instagram',
      dailyActiveUsers: 1250000,
      weeklyActiveUsers: 3200000,
      monthlyActiveUsers: 8500000,
      avgSessionDuration: 28.5,
      peakEngagementHours: [12, 18, 20, 21],
      interactionRate: 4.2,
      retentionRate: 78.5,
      dropOffPoints: ['Stories view', 'Explore page', 'Reels scroll'],
      crossPlatformUsage: 65.3
    },
    {
      platform: 'YouTube',
      dailyActiveUsers: 980000,
      weeklyActiveUsers: 2800000,
      monthlyActiveUsers: 7200000,
      avgSessionDuration: 45.2,
      peakEngagementHours: [19, 20, 21, 22],
      interactionRate: 2.8,
      retentionRate: 82.1,
      dropOffPoints: ['Video recommendations', 'Comments section', 'Shorts feed'],
      crossPlatformUsage: 58.7
    },
    {
      platform: 'TikTok',
      dailyActiveUsers: 890000,
      weeklyActiveUsers: 2400000,
      monthlyActiveUsers: 6100000,
      avgSessionDuration: 52.8,
      peakEngagementHours: [16, 19, 20, 23],
      interactionRate: 6.1,
      retentionRate: 71.2,
      dropOffPoints: ['For You page', 'Following feed', 'Discover tab'],
      crossPlatformUsage: 72.4
    },
    {
      platform: 'Twitter',
      dailyActiveUsers: 650000,
      weeklyActiveUsers: 1800000,
      monthlyActiveUsers: 4200000,
      avgSessionDuration: 18.3,
      peakEngagementHours: [8, 12, 17, 21],
      interactionRate: 3.5,
      retentionRate: 69.8,
      dropOffPoints: ['Timeline scroll', 'Trending topics', 'Notifications'],
      crossPlatformUsage: 45.2
    },
    {
      platform: 'Reddit',
      dailyActiveUsers: 420000,
      weeklyActiveUsers: 1200000,
      monthlyActiveUsers: 2800000,
      avgSessionDuration: 35.7,
      peakEngagementHours: [11, 14, 20, 22],
      interactionRate: 2.1,
      retentionRate: 85.3,
      dropOffPoints: ['Subreddit browsing', 'Comment threads', 'Popular feed'],
      crossPlatformUsage: 38.9
    }
  ];

  const usagePatterns: UsagePattern[] = [
    { timeOfDay: '06:00', usage: 15, engagement: 25, platform: 'Instagram' },
    { timeOfDay: '08:00', usage: 35, engagement: 45, platform: 'Twitter' },
    { timeOfDay: '10:00', usage: 28, engagement: 38, platform: 'YouTube' },
    { timeOfDay: '12:00', usage: 65, engagement: 75, platform: 'Instagram' },
    { timeOfDay: '14:00', usage: 42, engagement: 52, platform: 'Reddit' },
    { timeOfDay: '16:00', usage: 58, engagement: 68, platform: 'TikTok' },
    { timeOfDay: '18:00', usage: 78, engagement: 85, platform: 'Instagram' },
    { timeOfDay: '20:00', usage: 85, engagement: 92, platform: 'YouTube' },
    { timeOfDay: '22:00', usage: 72, engagement: 68, platform: 'TikTok' },
    { timeOfDay: '00:00', usage: 25, engagement: 35, platform: 'Twitter' }
  ];

  const habitIndicators: HabitIndicator[] = [
    {
      trigger: 'Morning routine check',
      frequency: 87.3,
      timeSpent: 12.5,
      returnPattern: 'Daily',
      adoptionRate: 92.1
    },
    {
      trigger: 'Lunch break browsing',
      frequency: 76.8,
      timeSpent: 25.3,
      returnPattern: 'Weekdays',
      adoptionRate: 84.7
    },
    {
      trigger: 'Evening wind-down',
      frequency: 91.2,
      timeSpent: 45.7,
      returnPattern: 'Daily',
      adoptionRate: 96.3
    },
    {
      trigger: 'Boredom/waiting',
      frequency: 68.4,
      timeSpent: 18.9,
      returnPattern: 'Irregular',
      adoptionRate: 78.2
    },
    {
      trigger: 'Notification response',
      frequency: 82.6,
      timeSpent: 8.3,
      returnPattern: 'Multiple daily',
      adoptionRate: 89.5
    }
  ];

  const getTrendIcon = (value: number, benchmark: number) => {
    if (value > benchmark * 1.05) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (value < benchmark * 0.95) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (value: number, benchmark: number) => {
    if (value > benchmark * 1.05) return 'text-green-600';
    if (value < benchmark * 0.95) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    trend?: number;
    benchmark?: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, subtitle, trend, benchmark, icon, color }) => (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-xl border-2 border-opacity-20 transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
          {icon}
        </div>
        {trend !== undefined && benchmark !== undefined && (
          <div className="flex items-center space-x-1">
            {getTrendIcon(trend, benchmark)}
            <span className={`text-sm font-medium ${getTrendColor(trend, benchmark)}`}>
              {((trend - benchmark) / benchmark * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white text-opacity-80">{title}</div>
      <div className="text-xs text-white text-opacity-60 mt-1">{subtitle}</div>
    </div>
  );

  const PlatformAnalysisCard: React.FC<{ platform: PlatformMetrics }> = ({ platform }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{platform.platform}</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            platform.retentionRate > 80 ? 'bg-green-500' :
            platform.retentionRate > 70 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600">{platform.retentionRate}% retention</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-800">{formatNumber(platform.dailyActiveUsers)}</div>
          <div className="text-sm text-blue-600">Daily Active Users</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-purple-800">{platform.avgSessionDuration}m</div>
          <div className="text-sm text-purple-600">Avg Session</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-800">{platform.interactionRate}%</div>
          <div className="text-sm text-green-600">Interaction Rate</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-orange-800">{platform.crossPlatformUsage}%</div>
          <div className="text-sm text-orange-600">Cross-Platform</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Peak Engagement Hours</h4>
        <div className="flex space-x-2">
          {platform.peakEngagementHours.map((hour) => (
            <div key={hour} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">
              {hour}:00
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Common Drop-off Points</h4>
        <div className="space-y-1">
          {platform.dropOffPoints.map((point, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const UsagePatternChart: React.FC = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Usage Patterns</h3>
      <div className="space-y-4">
        {usagePatterns.map((pattern, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-16 text-sm font-medium text-gray-600">{pattern.timeOfDay}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm text-gray-700">{pattern.platform}</span>
                <span className="text-xs text-gray-500">{pattern.usage}% usage</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pattern.usage}%` }}
                ></div>
              </div>
            </div>
            <div className="w-16 text-right">
              <div className="text-sm font-medium text-gray-800">{pattern.engagement}%</div>
              <div className="text-xs text-gray-500">engagement</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const HabitFormationAnalysis: React.FC = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Habit Formation Indicators</h3>
      <div className="space-y-4">
        {habitIndicators.map((habit, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800">{habit.trigger}</h4>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  habit.adoptionRate > 90 ? 'bg-green-500' :
                  habit.adoptionRate > 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600">{habit.adoptionRate}% adoption</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Frequency:</span>
                <span className="ml-2 font-medium text-gray-800">{habit.frequency}%</span>
              </div>
              <div>
                <span className="text-gray-600">Avg Time:</span>
                <span className="ml-2 font-medium text-gray-800">{habit.timeSpent}m</span>
              </div>
              <div>
                <span className="text-gray-600">Pattern:</span>
                <span className="ml-2 font-medium text-gray-800">{habit.returnPattern}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Social Media Analytics Report</h1>
            <p className="text-indigo-100">Comprehensive analysis of user behavior and platform performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg px-3 py-2 text-sm backdrop-blur-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <select 
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg px-3 py-2 text-sm backdrop-blur-sm"
            >
              <option value="usage">Usage Metrics</option>
              <option value="engagement">Engagement</option>
              <option value="wellness">Digital Wellness</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Active Users"
          value="12.4M"
          subtitle="Across all platforms"
          trend={12400000}
          benchmark={11800000}
          icon={<Users className="w-6 h-6 text-white" />}
          color="from-blue-500 to-blue-600"
        />
        <MetricCard
          title="Avg Session Duration"
          value="36.2m"
          subtitle="Per platform session"
          trend={36.2}
          benchmark={34.8}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="from-purple-500 to-purple-600"
        />
        <MetricCard
          title="Engagement Rate"
          value="3.7%"
          subtitle="Content interaction rate"
          trend={3.7}
          benchmark={3.9}
          icon={<Activity className="w-6 h-6 text-white" />}
          color="from-green-500 to-green-600"
        />
        <MetricCard
          title="Digital Wellness Score"
          value={digitalWellnessData.cognitiveImpactScore}
          subtitle="Cognitive impact rating"
          trend={digitalWellnessData.cognitiveImpactScore}
          benchmark={75}
          icon={<Target className="w-6 h-6 text-white" />}
          color="from-orange-500 to-orange-600"
        />
      </div>

      {/* Platform Analysis Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Platform Performance Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {platformMetrics.map((platform) => (
            <PlatformAnalysisCard key={platform.platform} platform={platform} />
          ))}
        </div>
      </div>

      {/* Usage Patterns and Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UsagePatternChart />
        <HabitFormationAnalysis />
      </div>

      {/* Industry Benchmarks Comparison */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Industry Benchmark Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">+12.3%</div>
            <div className="text-sm text-gray-600">Above average retention</div>
            <div className="text-xs text-gray-500 mt-1">Industry avg: 68.2%</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">-5.8%</div>
            <div className="text-sm text-gray-600">Below average engagement</div>
            <div className="text-xs text-gray-500 mt-1">Industry avg: 4.1%</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">+8.7%</div>
            <div className="text-sm text-gray-600">Above average session time</div>
            <div className="text-xs text-gray-500 mt-1">Industry avg: 33.2m</div>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>Actionable Recommendations</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-gray-800 mb-2">Optimize Peak Hours</h4>
            <p className="text-sm text-gray-600">
              Focus content delivery during 18:00-22:00 when engagement peaks across platforms.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-gray-800 mb-2">Reduce Drop-off Points</h4>
            <p className="text-sm text-gray-600">
              Implement smoother transitions in Stories and Explore sections to improve retention.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-gray-800 mb-2">Digital Wellness Integration</h4>
            <p className="text-sm text-gray-600">
              Introduce mindful usage prompts during extended sessions to improve user well-being.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-gray-800 mb-2">Cross-Platform Strategy</h4>
            <p className="text-sm text-gray-600">
              Leverage high cross-platform usage (65%+) for integrated content experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Trend Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trend Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-green-600">+15.2%</span>
            </div>
            <div className="text-lg font-bold text-blue-800">User Growth</div>
            <div className="text-sm text-blue-600">Month over month</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-green-600">+8.7%</span>
            </div>
            <div className="text-lg font-bold text-purple-800">Session Time</div>
            <div className="text-sm text-purple-600">Average increase</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-red-600">-3.1%</span>
            </div>
            <div className="text-lg font-bold text-green-800">Engagement</div>
            <div className="text-sm text-green-600">Slight decline</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-green-600">+12.4%</span>
            </div>
            <div className="text-lg font-bold text-orange-800">Wellness Score</div>
            <div className="text-sm text-orange-600">Improving habits</div>
          </div>
        </div>
      </div>
    </div>
  );
};