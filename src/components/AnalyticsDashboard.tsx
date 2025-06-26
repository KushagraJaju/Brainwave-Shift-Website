import React, { useState } from 'react';
import { TrendingUp, Target, Award, Calendar, Clock, Brain, BarChart3, Smartphone } from 'lucide-react';
import { AnalyticsData } from '../types';
import { SocialMediaAnalyticsReport } from './SocialMediaAnalyticsReport';

interface AnalyticsDashboardProps {
  analyticsData: AnalyticsData;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analyticsData }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'social-media' | 'cognitive' | 'wellness'>('overview');

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

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
  }> = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-blue-500 text-white shadow-md' 
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Performance Analytics Overview</h2>
        
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

      {/* Digital Wellness Summary */}
      {analyticsData.digitalWellnessScore && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-purple-600" />
            <span>Digital Wellness Summary</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-800">{analyticsData.digitalWellnessScore}</div>
              <div className="text-sm text-purple-600">Wellness Score</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-800">{formatTime(analyticsData.dailySocialMediaTime || 0)}</div>
              <div className="text-sm text-blue-600">Social Media Time</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-800">{analyticsData.mindfulBreaksTaken || 0}</div>
              <div className="text-sm text-green-600">Mindful Breaks</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Analytics Dashboard</h1>
          <div className="flex items-center space-x-2">
            <TabButton
              id="overview"
              label="Overview"
              icon={<BarChart3 className="w-4 h-4" />}
              isActive={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              id="social-media"
              label="Social Media"
              icon={<Smartphone className="w-4 h-4" />}
              isActive={activeTab === 'social-media'}
              onClick={() => setActiveTab('social-media')}
            />
            <TabButton
              id="cognitive"
              label="Cognitive"
              icon={<Brain className="w-4 h-4" />}
              isActive={activeTab === 'cognitive'}
              onClick={() => setActiveTab('cognitive')}
            />
            <TabButton
              id="wellness"
              label="Wellness"
              icon={<Target className="w-4 h-4" />}
              isActive={activeTab === 'wellness'}
              onClick={() => setActiveTab('wellness')}
            />
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'social-media' && <SocialMediaAnalyticsReport />}
        {activeTab === 'cognitive' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cognitive Performance Analysis</h2>
            <p className="text-gray-600">Detailed cognitive metrics and performance trends coming soon...</p>
          </div>
        )}
        {activeTab === 'wellness' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Wellness Analytics</h2>
            <p className="text-gray-600">Comprehensive wellness tracking and insights coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};