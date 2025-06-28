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
        <h1 className="text-heading-1 mb-2 tracking-tight">Welcome to your Cognitive Command Center</h1>
        <p className="text-body text-focus-100 dark:text-focus-200 leading-relaxed">
          Your AI-powered mental co-pilot is actively monitoring and optimizing your cognitive performance.
        </p>
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
          <div className="text-right">
            <p className="text-display font-bold">{cognitiveState.score}</p>
            <p className="text-body-small text-focus-100 dark:text-focus-200">Cognitive Score</p>
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

        {/* Focus Timer - Center Column */}
        <div className="lg:col-span-1 h-full">
          <div className="h-full">
            <FocusTimer preferences={preferences} />
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
              <h3 className="text-heading-3 text-calm-800 dark:text-calm-200">Enhance Your Cognitive Insights</h3>
            </div>
            <p className="text-body text-calm-600 dark:text-calm-400 mb-6 leading-relaxed">
              Connect your smartwatch and calendar to unlock advanced physiological monitoring and schedule optimization.
            </p>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">⌚</span>
                </div>
                <p className="text-label text-calm-700 dark:text-calm-300">Smartwatch</p>
                <p className="text-body-small text-calm-500 dark:text-calm-400">Heart rate, sleep, stress</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-focus-100 dark:bg-focus-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">📅</span>
                </div>
                <p className="text-label text-calm-700 dark:text-calm-300">Calendar</p>
                <p className="text-body-small text-calm-500 dark:text-calm-400">Meeting analysis, focus time</p>
              </div>
            </div>
            <p className="text-body-small text-focus-600 dark:text-focus-400 mt-6">
              Go to Settings → Device Integration to connect your devices
            </p>
          </div>
        </div>
      )}
    </div>
  );
};