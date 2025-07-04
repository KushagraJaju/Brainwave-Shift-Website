import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Brain, 
  Timer, 
  Heart, 
  BarChart3, 
  Smartphone,
  Settings,
  CheckCircle,
  Play,
  Sparkles,
  Target,
  Activity,
  Sun,
  Moon,
  Palette
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  highlight?: string;
}

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  // FIXED: Start with dark theme as default to match app startup
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Animate in after a short delay
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleThemeSelect = (theme: 'light' | 'dark') => {
    setSelectedTheme(theme);
    
    // Apply theme immediately for preview
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('themePreference', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1e293b' : '#ffffff');
    }
  };

  const ThemePreview: React.FC<{ theme: 'light' | 'dark'; isSelected: boolean; onSelect: () => void }> = ({ 
    theme, 
    isSelected, 
    onSelect 
  }) => (
    <button
      onClick={onSelect}
      className={`relative w-full p-4 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-105 focus-ring ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      aria-pressed={isSelected}
      aria-label={`Select ${theme} theme`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1" aria-hidden="true">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      )}
      
      {/* Theme icon */}
      <div className={`inline-flex p-3 rounded-xl mb-3 shadow-lg ${
        theme === 'light' 
          ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
          : 'bg-gradient-to-r from-indigo-500 to-purple-600'
      }`} aria-hidden="true">
        {theme === 'light' ? (
          <Sun className="w-6 h-6 text-white" />
        ) : (
          <Moon className="w-6 h-6 text-white" />
        )}
      </div>
      
      {/* Theme info - REDUCED SPACING */}
      <div className="space-y-2">
        <div>
          <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
            {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {theme === 'light' 
              ? 'Clean and bright interface perfect for daytime use' 
              : 'Easy on the eyes with reduced strain for extended sessions'
            }
          </p>
        </div>
        
        {/* Mini preview - REDUCED SIZE */}
        <div className={`p-2 rounded-lg border ${
          theme === 'light' 
            ? 'bg-white border-gray-200' 
            : 'bg-gray-900 border-gray-700'
        }`} aria-hidden="true">
          <div className="flex items-center space-x-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${
              theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'
            }`}></div>
            <div className={`text-xs font-medium ${
              theme === 'light' ? 'text-gray-800' : 'text-gray-200'
            }`}>
              Brainwave Shift
            </div>
          </div>
          <div className={`text-xs ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            Cognitive performance monitoring
          </div>
        </div>
        
        {/* Features - CONDENSED */}
        <div className="space-y-1">
          {(theme === 'light' 
            ? ['Bright, clean interface', 'High contrast text', 'Vibrant colors']
            : ['Reduced eye strain', 'Better for low light', 'Elegant dark aesthetics']
          ).map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" aria-hidden="true"></div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${
        theme === 'light' 
          ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
          : 'bg-gradient-to-r from-indigo-500 to-purple-600'
      }`} aria-hidden="true"></div>
    </button>
  );

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Brainwave Shift',
      description: 'Your AI-powered cognitive wellness companion',
      icon: <Brain className="w-8 h-8" aria-hidden="true" />,
      content: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Transform Your Mental Performance
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
              Brainwave Shift uses advanced AI to monitor your cognitive state in real-time and provides 
              personalized interventions to maintain peak mental performance.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400 mb-1" aria-hidden="true" />
                <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Real-time Monitoring</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Track focus & cognitive load</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400 mb-1" aria-hidden="true" />
                <div className="text-sm font-medium text-purple-800 dark:text-purple-300">AI-Powered Insights</div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Personalized recommendations</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'theme-selection',
      title: 'Choose Your Theme',
      description: 'Select your preferred visual experience',
      icon: <Palette className="w-8 h-8" aria-hidden="true" />,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3" aria-hidden="true">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">
              Personalize Your Experience
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
              Choose the theme that works best for you. You can always change this later in settings.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <ThemePreview
              theme="light"
              isSelected={selectedTheme === 'light'}
              onSelect={() => handleThemeSelect('light')}
            />
            <ThemePreview
              theme="dark"
              isSelected={selectedTheme === 'dark'}
              onSelect={() => handleThemeSelect('dark')}
            />
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 max-w-md mx-auto">
            <div className="flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1 text-sm">Pro Tip</h4>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Dark mode can help reduce eye strain during long work sessions, while light mode 
                  provides excellent readability in bright environments.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'cognitive-monitoring',
      title: 'Cognitive Monitoring',
      description: 'Real-time analysis of your mental state',
      icon: <Brain className="w-8 h-8" aria-hidden="true" />,
      highlight: 'monitor',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center" aria-hidden="true">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Continuous Analysis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your cognitive performance</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">85</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Focus Score</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">Fresh</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Cognitive Load</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">Calm</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Emotional State</div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Tracks browser activity and typing patterns</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Analyzes mouse movement and click patterns</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Provides real-time cognitive insights</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'focus-timer',
      title: 'Focus Timer',
      description: 'Structured work sessions with smart breaks',
      icon: <Timer className="w-8 h-8" aria-hidden="true" />,
      highlight: 'focus',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center" aria-hidden="true">
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Smart Focus Sessions</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pomodoro, Deep Work, or Custom</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">25:00</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Focus Session</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Pomodoro</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">25m/5m</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Deep Work</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">45m/15m</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Flow State</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">90m/15m</div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Multiple preset configurations available</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Sound notifications and pop-out timer</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Automatic break reminders</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'digital-wellness',
      title: 'Digital Wellness',
      description: 'Monitor and optimize your digital habits',
      icon: <Smartphone className="w-8 h-8" aria-hidden="true" />,
      highlight: 'interventions',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center" aria-hidden="true">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Social Media Tracking</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mindful usage insights</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">45m</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Daily Usage</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">3</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Mindful Breaks</div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Tracks social media usage patterns</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Detects mindless scrolling sessions</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Provides gentle intervention reminders</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'wellness-interventions',
      title: 'Wellness Interventions',
      description: 'Personalized recommendations for optimal performance',
      icon: <Heart className="w-8 h-8" aria-hidden="true" />,
      highlight: 'interventions',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-rose-200 dark:border-rose-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center" aria-hidden="true">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Smart Recommendations</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Based on your cognitive state</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Take a 5-minute break</span>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400">Medium priority</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Deep breathing exercise</span>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400">Low priority</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Breathing exercises and movement prompts</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Posture and hydration reminders</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Adaptive frequency based on your needs</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'analytics',
      title: 'Performance Analytics',
      description: 'Comprehensive insights into your cognitive patterns',
      icon: <BarChart3 className="w-8 h-8" aria-hidden="true" />,
      highlight: 'analytics',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center" aria-hidden="true">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Detailed Insights</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your progress over time</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">4h 32m</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Weekly Focus</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">78%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Avg Quality</div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Daily and weekly performance tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Peak performance hour identification</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Digital wellness correlation analysis</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'Personalization',
      description: 'Customize your experience',
      icon: <Settings className="w-8 h-8" aria-hidden="true" />,
      highlight: 'settings',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center" aria-hidden="true">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Tailored to You</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Adjust settings to match your workflow</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Intervention Frequency</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Normal</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Focus Session Length</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">25 minutes</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {selectedTheme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Customize intervention frequency and types</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Adjust focus session lengths and breaks</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Connect devices for enhanced monitoring</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Ready to Begin!',
      description: 'Start optimizing your cognitive performance',
      icon: <Target className="w-8 h-8" aria-hidden="true" />,
      content: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              You're All Set!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
              Brainwave Shift is now ready to help you achieve peak cognitive performance. 
              Your AI-powered mental co-pilot will start monitoring and providing insights immediately.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Quick Start Tips:</h4>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></div>
                  <span>Start with a 25-minute Pomodoro session</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></div>
                  <span>Check your cognitive state in the Monitor tab</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" aria-hidden="true"></div>
                  <span>Review analytics to identify patterns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" aria-hidden="true"></div>
                  <span>Your {selectedTheme} theme is ready to go!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  return (
    <div className={`modal-overlay-critical modal-open flex items-center justify-center p-4`} role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className={`
        modal-content-fix bg-white dark:bg-calm-800 rounded-2xl shadow-2xl dark:shadow-gentle-dark max-w-4xl w-full overflow-hidden
        transform transition-all duration-500 ease-out border border-calm-200 dark:border-calm-700
        ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}
      style={{ maxHeight: '85vh' }} // FIXED: Limit max height to ensure visibility on smaller screens
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm" aria-hidden="true">
                {currentStepData.icon}
              </div>
              <div>
                <h2 id="onboarding-title" className="text-lg font-semibold">{currentStepData.title}</h2>
                <p className="text-blue-100 dark:text-blue-200 text-sm">{currentStepData.description}</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors focus-ring"
              aria-label="Skip onboarding"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-blue-100 dark:text-blue-200">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm text-blue-100 dark:text-blue-200">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2" role="progressbar" aria-valuenow={(currentStep + 1) / steps.length * 100} aria-valuemin={0} aria-valuemax={100}>
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content - FIXED: Reduced max height and added padding bottom for scrolling */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: '50vh', paddingBottom: '1rem' }}>
          <div className="animate-fade-in">
            {currentStepData.content}
          </div>
        </div>

        {/* Step Indicators */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-2" role="tablist">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 focus-ring ${
                  index === currentStep
                    ? 'bg-blue-500 dark:bg-blue-400 scale-125'
                    : index < currentStep
                      ? 'bg-green-500 dark:bg-green-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                } hover:scale-110`}
                aria-label={`Go to step ${index + 1}: ${step.title}`}
                aria-selected={index === currentStep}
                role="tab"
                tabIndex={index === currentStep ? 0 : -1}
              />
            ))}
          </div>
        </div>

        {/* Footer - FIXED: Reduced padding, fixed button positioning */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors focus-ring ${
                currentStep === 0
                  ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              aria-label="Go to previous step"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span>Previous</span>
            </button>
            
            <button
              onClick={handleSkip}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors focus-ring"
              aria-label="Skip onboarding tour"
            >
              Skip Tour
            </button>
          </div>
          
          {/* FIXED: Enhanced Next Button with Maximum Visibility */}
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus-ring"
            aria-label={isLastStep ? "Complete onboarding and get started" : "Go to next step"}
          >
            <span className="text-base font-semibold">{isLastStep ? 'Get Started' : 'Next'}</span>
            {isLastStep ? (
              <Play className="w-5 h-5" aria-hidden="true" />
            ) : (
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};