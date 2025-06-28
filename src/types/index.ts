export interface CognitiveState {
  focusLevel: 'Deep' | 'Moderate' | 'Distracted';
  cognitiveLoad: 'Fresh' | 'Fatigued' | 'Overloaded';
  emotionalState: 'Calm' | 'Stressed' | 'Engaged';
  score: number;
  timestamp: Date;
}

export interface FocusSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  quality: number;
  interruptions: number;
  type: 'Deep Work' | 'Meeting' | 'Creative' | 'Break';
}

export interface Intervention {
  id: string;
  type: 'Break' | 'Breathing' | 'Posture' | 'Hydration' | 'Movement';
  title: string;
  description: string;
  duration: number;
  priority: 'Low' | 'Medium' | 'High';
  timestamp: Date;
  completed?: boolean;
}

export interface UserPreferences {
  interventionFrequency: 'Minimal' | 'Normal' | 'Frequent';
  focusSessionLength: number;
  breakReminders: boolean;
  ambientNotifications: boolean;
  dataSharing: boolean;
  breakLength?: number;
  selectedPreset?: string;
  // Device integration preferences
  smartwatchDataSharing: boolean;
  calendarDataSharing: boolean;
  physiologicalMonitoring: boolean;
  calendarInsights: boolean;
  // Digital wellness preferences
  digitalWellnessEnabled?: boolean;
  socialMediaTimeLimit?: number;
  mindfulnessReminders?: boolean;
  focusModeSchedule?: { start: string; end: string }[];
  // Multi-break support
  numberOfBreaks?: number;
}

export interface FocusPreset {
  id: string;
  name: string;
  focusMinutes: number;
  breakMinutes: number;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

export interface AnalyticsData {
  dailyFocusTime: number;
  weeklyFocusTime: number;
  averageFocusQuality: number;
  totalInterventions: number;
  streakDays: number;
  peakHours: number[];
  distractionTriggers: string[];
  // Digital wellness analytics
  dailySocialMediaTime?: number;
  mindfulBreaksTaken?: number;
  digitalWellnessScore?: number;
}

// New device integration types
export interface DeviceIntegration {
  id: string;
  name: string;
  type: 'smartwatch' | 'calendar' | 'browser';
  status: 'connected' | 'disconnected' | 'connecting';
  provider?: string;
  lastSync?: Date;
  dataTypes: string[];
  privacyLevel: 'minimal' | 'standard' | 'full';
}

export interface SmartwatchData {
  heartRate: number;
  heartRateVariability: number;
  sleepScore: number;
  stressLevel: 'Low' | 'Medium' | 'High';
  activityLevel: number;
  lastUpdate: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'meeting' | 'focus-block' | 'break' | 'deadline';
  attendees?: number;
  isOnline: boolean;
}

export interface CalendarData {
  events: CalendarEvent[];
  meetingDensity: 'low' | 'medium' | 'high';
  focusTimeAvailable: number;
  upcomingDeadlines: CalendarEvent[];
  insights: string[];
  lastSync: Date;
}

// Digital wellness types
export interface DigitalWellnessIntervention {
  id: string;
  type: 'Digital Wellness';
  subtype: 'mindless-scrolling' | 'time-limit-gentle' | 'time-limit-moderate' | 'time-limit-firm' | 'focus-mode-violation';
  title: string;
  description: string;
  options: string[];
  priority: 'Low' | 'Medium' | 'High';
  timestamp: Date;
  platform?: string;
  sessionLength?: number;
  escalationLevel: number;
}