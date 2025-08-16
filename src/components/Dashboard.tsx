import React from 'react';
import { CognitiveStateIndicator } from './CognitiveStateIndicator';
import { FocusTimer } from './FocusTimer';
import { InterventionPanel } from './InterventionPanel';
import { PhysiologicalMetrics } from './PhysiologicalMetrics';
import { CalendarInsights } from './CalendarInsights';
import { useCognitiveState } from '../hooks/useCognitiveState';
import { useInterventions } from '../hooks/useInterventions';
import { useDeviceIntegration } from '../hooks/useDeviceIntegration';
import { UserPreferences } from '../types';

interface DashboardProps {
  preferences: UserPreferences;
}

export const Dashboard: React.FC<DashboardProps> = ({ preferences }) => {
  const { cognitiveState, isMonitoring, toggleMonitoring } = useCognitiveState();
  const { interventions, completeIntervention, dismissIntervention } = useInterventions(cognitiveState, preferences);
  const { smartwatchData, calendarData, integrations } = useDeviceIntegration();

  const isSmartWatchConnected = integrations.find(i => i.type === 'smartwatch')?.status === 'connected';
  const isCalendarConnected = integrations.find(i => i.type === 'calendar')?.status === 'connected';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-focus-600 to-focus-700 dark:from-focus-700 dark:to-focus-800 rounded-xl shadow-soft dark:shadow-gentle-dark p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-heading-1 mb-3 tracking-tight">Boost Your Focus by 40% with AI-Powered Mental Tracking</h1>
            <p className="text-body text-focus-100 dark:text-focus-200 leading-relaxed mb-4">
              Your AI-powered mental co-pilot monitors cognitive performance in real-time and provides personalized interventions to maintain peak mental performance.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-gentle"></div>
                <span className="text-focus-100">Real-time Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-gentle"></div>
                <span className="text-focus-100">Smart Interventions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse-gentle"></div>
                <span className="text-focus-100">Performance Insights</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-wellness-400 animate-pulse-gentle' : 'bg-calm-400'}`}></div>
              <span className="text-label">{isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}</span>
            </div>
            <button
              onClick={toggleMonitoring}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-label transition-all duration-200 focus-ring backdrop-blur-sm"
              aria-label={isMonitoring ? 'Pause monitoring' : 'Resume monitoring'}
            >
              {isMonitoring ? 'Pause' : 'Resume'}
            </button>
          </div>
          <div className="text-right bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-1">
              <p className="text-display font-bold">{cognitiveState.score}</p>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-xs text-green-800">↗</span>
                </div>
                <span className="text-sm font-medium text-green-200">+8%</span>
              </div>
            </div>
            <p className="text-body-small text-focus-100 dark:text-focus-200">Cognitive Score vs. last week</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid - Fixed Layout with Equal Heights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cognitive State - Left Column */}
        <div className="lg:col-span-1 h-full">
          <div className="h-full">
            <CognitiveStateIndicator 
              cognitiveState={cognitiveState} 
              isMonitoring={isMonitoring}
            />
          </div>
        </div>

        {/* Focus Timer - Center Column - NO PRESETS ON DASHBOARD */}
        <div className="lg:col-span-1 h-full">
          <div className="h-full">
            <FocusTimer 
              preferences={preferences} 
              showPresets={false}
            />
          </div>
        </div>

        {/* Active Recommendations - Right Column */}
        <div className="lg:col-span-1 h-full">
          <div className="card-primary p-6 h-full flex flex-col">
            <InterventionPanel
              interventions={interventions}
              onComplete={completeIntervention}
              onDismiss={dismissIntervention}
            />
          </div>
        </div>
      </div>

      {/* Device Integration Data - Show when devices are connected */}
      {(isSmartWatchConnected || isCalendarConnected) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isSmartWatchConnected && smartwatchData && (
            <PhysiologicalMetrics data={smartwatchData} />
          )}
          {isCalendarConnected && calendarData && (
            <CalendarInsights data={calendarData} />
          )}
        </div>
      )}

      {/* Connection Prompt - Show when no devices are connected */}
      {!isSmartWatchConnected && !isCalendarConnected && (
        <div className="bg-gradient-to-r from-calm-50 to-focus-50 dark:from-calm-900/50 dark:to-focus-900/50 rounded-xl border border-calm-200 dark:border-calm-700 p-6 animate-slide-up">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-3 h-3 bg-focus-500 rounded-full animate-pulse-gentle"></div>
              <h3 className="text-heading-3 text-calm-800 dark:text-calm-200">Unlock 3x Better Insights</h3>
            </div>
            <p className="text-body text-calm-600 dark:text-calm-400 mb-6 leading-relaxed">
              Connect your devices to get real-time stress detection and focus-optimized scheduling
            </p>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">⌚</span>
                </div>
                <p className="text-label text-calm-700 dark:text-calm-300">Smartwatch</p>
                <p className="text-body-small text-calm-500 dark:text-calm-400">Real-time stress alerts</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-focus-100 dark:bg-focus-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">📅</span>
                </div>
                <p className="text-label text-calm-700 dark:text-calm-300">Calendar</p>
                <p className="text-body-small text-calm-500 dark:text-calm-400">Smart focus scheduling</p>
              </div>
            </div>
            <div className="mt-6">
              <button 
                onClick={() => window.location.hash = '#settings'}
                className="bg-focus-500 hover:bg-focus-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Connect Devices Now
              </button>
              <p className="text-body-small text-focus-600 dark:text-focus-400 mt-2">
                Takes 30 seconds • Instant insights
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};