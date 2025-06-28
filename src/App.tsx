import React, { useState, Suspense, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { CognitiveStateIndicator } from './components/CognitiveStateIndicator';
import { FocusTimer } from './components/FocusTimer';
import { WellnessSection } from './components/WellnessSection';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { Settings } from './components/Settings';
import { MonitoringStatus } from './components/MonitoringStatus';
import { MonitoringMetrics } from './components/MonitoringMetrics';
import { DigitalWellnessIntervention } from './components/DigitalWellnessIntervention';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OnboardingFlow } from './components/OnboardingFlow';
import { useCognitiveState } from './hooks/useCognitiveState';
import { useAnalytics } from './hooks/useAnalytics';
import { useSettings } from './hooks/useSettings';
import { useDigitalWellness } from './hooks/useDigitalWellness';
import { useTheme } from './hooks/useTheme';
import { useOnboarding } from './hooks/useOnboarding';

// Loading component for better UX
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-calm-50 dark:bg-calm-900 flex items-center justify-center">
    <div className="text-center animate-fade-in">
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <p className="text-body text-calm-600 dark:text-calm-400">Loading your cognitive workspace...</p>
    </div>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  
  // Initialize theme hook to set up dark mode
  useTheme();
  
  // Initialize onboarding hook
  const { 
    hasCompletedOnboarding, 
    isLoading: onboardingLoading, 
    completeOnboarding, 
    skipOnboarding 
  } = useOnboarding();
  
  const { cognitiveState, isMonitoring, toggleMonitoring } = useCognitiveState();
  const { preferences, updatePreferences, resetPreferences, isLoading } = useSettings();
  const analyticsData = useAnalytics(cognitiveState);
  const { 
    interventions: digitalInterventions, 
    dismissIntervention: dismissDigitalIntervention,
    handleInterventionAction: handleDigitalInterventionAction
  } = useDigitalWellness();

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Show loading state while preferences or onboarding status are being loaded
  if (isLoading || onboardingLoading) {
    return <LoadingScreen />;
  }

  // Show onboarding flow for first-time users
  if (!hasCompletedOnboarding) {
    return (
      <ErrorBoundary>
        <OnboardingFlow 
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      </ErrorBoundary>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Suspense fallback={<LoadingSpinner className="mx-auto" />}>
            <Dashboard preferences={preferences} />
          </Suspense>
        );
      case 'monitor':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="card-primary p-6">
              <h2 className="text-heading-2 text-calm-800 dark:text-calm-200 mb-6">Cognitive Monitoring</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CognitiveStateIndicator 
                  cognitiveState={cognitiveState} 
                  isMonitoring={isMonitoring}
                />
                <div className="space-y-4">
                  <div className="card-secondary p-4">
                    <h3 className="text-heading-4 text-calm-800 dark:text-calm-200 mb-2">Monitoring Status</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-body text-calm-600 dark:text-calm-400">Active Monitoring</span>
                      <button
                        onClick={toggleMonitoring}
                        className={`px-4 py-2 rounded-lg text-label transition-all duration-200 focus-ring ${
                          isMonitoring 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800' 
                            : 'bg-wellness-100 dark:bg-wellness-900/30 text-wellness-700 dark:text-wellness-400 hover:bg-wellness-200 dark:hover:bg-wellness-900/50 border border-wellness-200 dark:border-wellness-800'
                        }`}
                        aria-label={isMonitoring ? 'Pause monitoring' : 'Resume monitoring'}
                      >
                        {isMonitoring ? 'Pause' : 'Resume'}
                      </button>
                    </div>
                  </div>
                  <MonitoringStatus />
                </div>
              </div>
            </div>
            
            {/* Detailed Monitoring Metrics */}
            <MonitoringMetrics />
          </div>
        );
      case 'focus':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="card-primary p-6">
              <h2 className="text-heading-2 text-calm-800 dark:text-calm-200 mb-6">Focus Management</h2>
              <FocusTimer 
                preferences={preferences} 
                onUpdatePreferences={updatePreferences}
              />
            </div>
          </div>
        );
      case 'interventions':
        return (
          <WellnessSection 
            cognitiveState={cognitiveState}
            preferences={preferences}
          />
        );
      case 'analytics':
        return (
          <div className="space-y-6 animate-fade-in">
            <AnalyticsDashboard analyticsData={analyticsData} />
          </div>
        );
      case 'settings':
        return (
          <div className="animate-fade-in">
            <Settings 
              preferences={preferences}
              onUpdatePreferences={updatePreferences}
              onResetPreferences={resetPreferences}
              scrollableContainerRef={mainContentRef}
            />
          </div>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner className="mx-auto" />}>
            <Dashboard preferences={preferences} />
          </Suspense>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-calm-50 dark:bg-calm-900 flex transition-colors duration-300">
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={handleMobileMenuToggle}
        />
        
        {/* Main Content Area - Now with explicit scrolling container */}
        <div ref={mainContentRef} className="flex-1 lg:ml-64 overflow-y-auto h-screen">
          <main className="p-4 lg:p-8 pt-16 lg:pt-8">
            <ErrorBoundary fallback={
              <div className="card-primary p-6 text-center">
                <p className="text-body text-calm-600 dark:text-calm-400">Unable to load this section. Please try again.</p>
              </div>
            }>
              {renderContent()}
            </ErrorBoundary>
          </main>
        </div>

        {/* Digital Wellness Interventions Overlay */}
        {digitalInterventions.map((intervention) => (
          <DigitalWellnessIntervention
            key={intervention.id}
            intervention={intervention}
            onDismiss={dismissDigitalIntervention}
            onAction={handleDigitalInterventionAction}
          />
        ))}
      </div>
    </ErrorBoundary>
  );
}

export default App;