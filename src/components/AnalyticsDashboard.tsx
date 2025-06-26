import React from 'react';
import { TrendingUp, Target, Award, Calendar, Clock, Brain } from 'lucide-react';
import { AnalyticsData } from '../types';

interface AnalyticsDashboardProps {
  analyticsData: AnalyticsData;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analyticsData }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    color: string;
  }> = ({ icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Performance Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={<Clock className="w-6 h-6 text-white" />}
            title="Daily Focus"
            value={formatTime(analyticsData.dailyFocusTime)}
            subtitle="Deep work sessions today"
            color="bg-blue-500"
          />
          
          <StatCard
            icon={<Calendar className="w-6 h-6 text-white" />}
            title="Weekly Focus"
            value={formatTime(analyticsData.weeklyFocusTime)}
            subtitle="Total focus time this week"
            color="bg-purple-500"
          />
          
          <StatCard
            icon={<Brain className="w-6 h-6 text-white" />}
            title="Focus Quality"
            value={`${analyticsData.averageFocusQuality}%`}
            subtitle="Average cognitive performance"
            color="bg-green-500"
          />
          
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  );
};