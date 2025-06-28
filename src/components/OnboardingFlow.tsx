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
  Palette,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

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
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  const { setTheme } = useTheme();

  useEffect(() => {
    // Animate in after a short delay
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const ThemeSelector: React.FC = () => {
    const themeOptions = [
      {
        value: 'light' as const,
        label: 'Light',
        icon: <Sun className="w-6 h-6" />,
        description: 'Clean and bright interface',
        preview: 'bg-white border-gray-200 text-gray-900'
      },
      {
        value: 'dark' as const,
        label: 'Dark',
        icon: <Moon className="w-6 h-6" />,
        description: 'Easy on the eyes in low light',
        preview: 'bg-gray-900 border-gray-700 text-white'
      },
      {
        value: 'system' as const,
        label: 'System',
        icon: <Monitor className="w-6 h-6" />,
        description: 'Matches your device settings',
        preview: 'bg-gradient-to-r from-white to-gray-900 border-gray-400 text-gray-600'
      }
    ];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSelectedTheme(option.value);
                setTheme(option.value);
              }}
              className={`
                flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${selectedTheme === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-calm-800 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <div className={`p-3 rounded-lg ${
                selectedTheme === option.value 
                  ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 dark:text-gray-200">{option.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
              </div>
              <div className={`w-8 h-8 rounded-lg border-2 ${option.preview}`}></div>
              {selectedTheme === option.value && (
                <CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              )}
            </button>
          ))}
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Palette className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Theme Preference</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                You can change your theme preference anytime in Settings. The system option will automatically 
                switch between light and dark modes based on your device settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Brainwave Shift',
      description: 'Your AI-powered cognitive wellness companion',
      icon: <Brain className="w-8 h-8" />,
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Transform Your Mental Performance
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
              Brainwave Shift uses advanced AI to monitor your cognitive state in real-time and provides 
              personalized interventions to maintain peak mental performance.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <Activity className="w-6 h-6 text-blue-500 dark:text-blue-400 mb-2" />
                <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Real-time Monitoring</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Track focus & cognitive load</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400 mb-2" />
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
      description: 'Customize your visual experience',
      icon: <Palette className="w-8 h-8" />,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Personalize Your Experience
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Choose a theme that's comfortable for your eyes and matches your workflow preferences.
            </p>
          </div>
          <ThemeSelector />
        </div>
      )
    },
    {
      id: 'cognitive-monitoring',
      title: 'Cognitive Monitoring',
      description: 'Real-time analysis of your mental state',
      icon: <Brain className="w-8 h-8" />,
      highlight: 'monitor',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Continuous Analysis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your cognitive performance</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">85</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Focus Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">Fresh</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Cognitive Load</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Calm</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Emotional State</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Tracks browser activity and typing patterns</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Analyzes mouse movement and click patterns</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
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
      icon: <Timer className="w-8 h-8" />,
      highlight: 'focus',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Timer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Smart Focus Sessions</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pomodoro, Deep Work, or Custom</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">25:00</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Focus Session</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Pomodoro</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">25m/5m</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Deep Work</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">45m/15m</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Flow State</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">90m/15m</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Multiple preset configurations available</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Sound notifications and pop-out timer</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
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
      icon: <Smartphone className="w-8 h-8" />,
      highlight: 'interventions',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Social Media Tracking</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mindful usage insights</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">45m</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Daily Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">3</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Mindful Breaks</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Tracks social media usage patterns</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Detects mindless scrolling sessions</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
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
      icon: <Heart className="w-8 h-8" />,
      highlight: 'interventions',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-rose-200 dark:border-rose-800">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Smart Recommendations</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Based on your cognitive state</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Take a 5-minute break</span>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400">Medium priority</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Deep breathing exercise</span>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400">Low priority</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Breathing exercises and movement prompts</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Posture and hydration reminders</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
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
      icon: <BarChart3 className="w-8 h-8" />,
      highlight: 'analytics',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Detailed Insights</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your progress over time</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">4h 32m</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Weekly Focus</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">78%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Avg Quality</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Daily and weekly performance tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Peak performance hour identification</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
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
      icon: <Settings className="w-8 h-8" />,
      highlight: 'settings',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Tailored to You</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Adjust settings to match your workflow</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Intervention Frequency</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Normal</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Focus Session Length</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">25 minutes</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">Theme Preference</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400 capitalize">{selectedTheme}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Customize intervention frequency and types</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Adjust focus session lengths and breaks</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
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
      icon: <Target className="w-8 h-8" />,
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              You're All Set!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
              Brainwave Shift is now ready to help you achieve peak cognitive performance. 
              Your AI-powered mental co-pilot will start monitoring and providing insights immediately.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Start Tips:</h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Start with a 25-minute Pomodoro session</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Check your cognitive state in the Monitor tab</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Review analytics to identify patterns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
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
      // Apply the selected theme before completing onboarding
      setTheme(selectedTheme);
      // Complete onboarding and redirect to dashboard
      onComplete();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    // Apply the selected theme before skipping
    setTheme(selectedTheme);
    onSkip();
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`
        bg-white dark:bg-calm-800 rounded-2xl shadow-2xl dark:shadow-gentle-dark max-w-4xl w-full max-h-[90vh] overflow-hidden
        transform transition-all duration-500 ease-out border border-calm-200 dark:border-calm-700
        ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                {currentStepData.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
                <p className="text-blue-100 dark:text-blue-200 text-sm">{currentStepData.description}</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              aria-label="Skip onboarding"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-100 dark:text-blue-200">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm text-blue-100 dark:text-blue-200">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <div className="animate-fade-in">
            {currentStepData.content}
          </div>
        </div>

        {/* Step Indicators */}
        <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentStep
                    ? 'bg-blue-500 dark:bg-blue-400 scale-125'
                    : index < currentStep
                      ? 'bg-green-500 dark:bg-green-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                } hover:scale-110`}
                aria-label={`Go to step ${index + 1}: ${step.title}`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-8 py-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            <button
              onClick={handleSkip}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors"
            >
              Skip Tour
            </button>
          </div>
          
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>{isLastStep ? 'Get Started' : 'Next'}</span>
            {isLastStep ? (
              <Play className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};