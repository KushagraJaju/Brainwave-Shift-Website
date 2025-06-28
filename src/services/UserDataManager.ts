export interface UserData {
  // User identification and onboarding
  userId: string;
  onboardingCompleted: boolean;
  firstVisit: Date;
  lastVisit: Date;
  
  // User preferences
  preferences: {
    interventionFrequency: 'Minimal' | 'Normal' | 'Frequent';
    focusSessionLength: number;
    breakLength: number;
    breakReminders: boolean;
    ambientNotifications: boolean;
    dataSharing: boolean;
    selectedPreset?: string;
    smartwatchDataSharing: boolean;
    calendarDataSharing: boolean;
    physiologicalMonitoring: boolean;
    calendarInsights: boolean;
    digitalWellnessEnabled: boolean;
    socialMediaTimeLimit?: number;
    mindfulnessReminders: boolean;
    focusModeSchedule: { start: string; end: string }[];
    theme: 'light' | 'dark' | 'system';
    soundSettings: {
      enabled: boolean;
      volume: number;
      focusCompleteSound: string;
      breakCompleteSound: string;
      tickSound?: string;
    };
  };
  
  // Focus timer data
  focusData: {
    totalSessions: number;
    totalFocusTime: number; // in minutes
    totalBreakTime: number; // in minutes
    averageSessionLength: number;
    longestSession: number;
    currentStreak: number;
    bestStreak: number;
    sessionsToday: number;
    sessionsThisWeek: number;
    lastSessionDate?: Date;
    sessionHistory: FocusSession[];
    presetUsage: Record<string, number>; // preset ID -> usage count
  };
  
  // Wellness and intervention data
  wellnessData: {
    totalInterventionsCompleted: number;
    interventionsByType: Record<string, number>;
    mindfulBreaksToday: number;
    mindfulBreaksThisWeek: number;
    mindfulBreaksTotal: number;
    lastMindfulBreak?: Date;
    wellnessStreak: number;
    interventionHistory: InterventionRecord[];
  };
  
  // Digital wellness data
  digitalWellnessData: {
    dailyUsageHistory: DailyUsageRecord[];
    totalSocialMediaTime: number; // all time, in milliseconds
    mindlessSessionsTotal: number;
    mindfulBreaksTotal: number;
    averageDailyUsage: number; // in milliseconds
    longestDailyUsage: number; // in milliseconds
    bestDigitalWellnessScore: number;
    platformUsageStats: Record<string, number>; // platform -> total time
  };
  
  // Analytics and performance data
  analyticsData: {
    cognitiveScoreHistory: CognitiveScoreRecord[];
    peakPerformanceHours: number[];
    averageFocusQuality: number;
    bestFocusQuality: number;
    totalActiveTime: number; // in minutes
    distractionTriggers: Record<string, number>; // trigger -> frequency
    performanceInsights: string[];
    weeklyReports: WeeklyReport[];
  };
  
  // Device integration data
  deviceData: {
    connectedDevices: string[];
    smartwatchConnected: boolean;
    calendarConnected: boolean;
    lastSyncTimes: Record<string, Date>;
    devicePreferences: Record<string, any>;
  };
  
  // App usage statistics
  appUsage: {
    totalAppOpenings: number;
    totalTimeInApp: number; // in minutes
    featuresUsed: Record<string, number>; // feature -> usage count
    lastFeatureUsed?: string;
    favoriteFeatures: string[];
    appRating?: number;
    feedbackGiven: boolean;
  };
}

export interface FocusSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  sessionType: 'Focus' | 'Break';
  quality: number; // 1-100
  interruptions: number;
  preset?: string;
  completed: boolean;
}

export interface InterventionRecord {
  id: string;
  type: string;
  timestamp: Date;
  completed: boolean;
  timeToComplete?: number; // in seconds
  effectiveness?: number; // 1-5 rating
}

export interface DailyUsageRecord {
  date: string; // YYYY-MM-DD
  totalSocialMediaTime: number; // in milliseconds
  platformBreakdown: Record<string, number>;
  mindlessScrollingSessions: number;
  mindfulBreaksTaken: number;
  cognitiveImpactScore: number;
  sessionCount: number;
  longestSession: number;
  averageSessionLength: number;
}

export interface CognitiveScoreRecord {
  timestamp: Date;
  focusScore: number;
  loadScore: number;
  stressScore: number;
  overallScore: number;
  context?: string; // what the user was doing
}

export interface WeeklyReport {
  weekStartDate: string; // YYYY-MM-DD
  totalFocusTime: number;
  averageFocusQuality: number;
  totalInterventions: number;
  digitalWellnessScore: number;
  achievements: string[];
  insights: string[];
  recommendations: string[];
}

export class UserDataManager {
  private static instance: UserDataManager;
  private userData: UserData | null = null;
  private isLoaded = false;
  private saveTimeout: NodeJS.Timeout | null = null;
  private listeners: ((data: UserData) => void)[] = [];

  // Storage keys
  private readonly STORAGE_KEYS = {
    USER_DATA: 'brainwave-shift-user-data',
    BACKUP_PREFIX: 'brainwave-shift-backup-',
    LAST_BACKUP: 'brainwave-shift-last-backup'
  };

  private constructor() {
    this.initializeUserData();
    this.setupAutoSave();
    this.setupBackupSystem();
  }

  public static getInstance(): UserDataManager {
    if (!UserDataManager.instance) {
      UserDataManager.instance = new UserDataManager();
    }
    return UserDataManager.instance;
  }

  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getDefaultUserData(): UserData {
    const now = new Date();
    return {
      userId: this.generateUserId(),
      onboardingCompleted: false,
      firstVisit: now,
      lastVisit: now,
      preferences: {
        interventionFrequency: 'Normal',
        focusSessionLength: 25,
        breakLength: 5,
        breakReminders: true,
        ambientNotifications: false,
        dataSharing: false,
        smartwatchDataSharing: true,
        calendarDataSharing: true,
        physiologicalMonitoring: true,
        calendarInsights: true,
        digitalWellnessEnabled: true,
        mindfulnessReminders: true,
        focusModeSchedule: [
          { start: '09:00', end: '12:00' },
          { start: '14:00', end: '17:00' }
        ],
        theme: 'system',
        soundSettings: {
          enabled: true,
          volume: 0.7,
          focusCompleteSound: 'chime',
          breakCompleteSound: 'chime'
        }
      },
      focusData: {
        totalSessions: 0,
        totalFocusTime: 0,
        totalBreakTime: 0,
        averageSessionLength: 0,
        longestSession: 0,
        currentStreak: 0,
        bestStreak: 0,
        sessionsToday: 0,
        sessionsThisWeek: 0,
        sessionHistory: [],
        presetUsage: {}
      },
      wellnessData: {
        totalInterventionsCompleted: 0,
        interventionsByType: {},
        mindfulBreaksToday: 0,
        mindfulBreaksThisWeek: 0,
        mindfulBreaksTotal: 0,
        wellnessStreak: 0,
        interventionHistory: []
      },
      digitalWellnessData: {
        dailyUsageHistory: [],
        totalSocialMediaTime: 0,
        mindlessSessionsTotal: 0,
        mindfulBreaksTotal: 0,
        averageDailyUsage: 0,
        longestDailyUsage: 0,
        bestDigitalWellnessScore: 100,
        platformUsageStats: {}
      },
      analyticsData: {
        cognitiveScoreHistory: [],
        peakPerformanceHours: [],
        averageFocusQuality: 0,
        bestFocusQuality: 0,
        totalActiveTime: 0,
        distractionTriggers: {},
        performanceInsights: [],
        weeklyReports: []
      },
      deviceData: {
        connectedDevices: [],
        smartwatchConnected: false,
        calendarConnected: false,
        lastSyncTimes: {},
        devicePreferences: {}
      },
      appUsage: {
        totalAppOpenings: 1,
        totalTimeInApp: 0,
        featuresUsed: {},
        favoriteFeatures: [],
        feedbackGiven: false
      }
    };
  }

  private async initializeUserData(): Promise<void> {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      
      if (savedData) {
        // Load existing user data
        const parsedData = JSON.parse(savedData);
        this.userData = this.migrateUserData(parsedData);
        this.userData.lastVisit = new Date();
        this.userData.appUsage.totalAppOpenings++;
      } else {
        // Create new user data
        this.userData = this.getDefaultUserData();
      }
      
      this.isLoaded = true;
      this.notifyListeners();
      this.saveUserData();
    } catch (error) {
      console.error('Failed to initialize user data:', error);
      this.handleDataCorruption();
    }
  }

  private migrateUserData(data: any): UserData {
    // Migrate old data structure to new structure
    const defaultData = this.getDefaultUserData();
    
    // Deep merge with defaults to ensure all properties exist
    const migratedData = this.deepMerge(defaultData, data);
    
    // Convert date strings back to Date objects
    migratedData.firstVisit = new Date(migratedData.firstVisit);
    migratedData.lastVisit = new Date(migratedData.lastVisit);
    
    // Migrate session history dates
    if (migratedData.focusData.sessionHistory) {
      migratedData.focusData.sessionHistory = migratedData.focusData.sessionHistory.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime)
      }));
    }
    
    // Migrate intervention history dates
    if (migratedData.wellnessData.interventionHistory) {
      migratedData.wellnessData.interventionHistory = migratedData.wellnessData.interventionHistory.map((intervention: any) => ({
        ...intervention,
        timestamp: new Date(intervention.timestamp)
      }));
    }
    
    // Migrate cognitive score history dates
    if (migratedData.analyticsData.cognitiveScoreHistory) {
      migratedData.analyticsData.cognitiveScoreHistory = migratedData.analyticsData.cognitiveScoreHistory.map((record: any) => ({
        ...record,
        timestamp: new Date(record.timestamp)
      }));
    }
    
    return migratedData;
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && !(source[key] instanceof Date)) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private handleDataCorruption(): void {
    console.warn('User data corrupted, attempting recovery from backup...');
    
    try {
      const backupData = this.loadFromBackup();
      if (backupData) {
        this.userData = backupData;
        this.isLoaded = true;
        this.saveUserData();
        console.log('Successfully recovered from backup');
        return;
      }
    } catch (error) {
      console.error('Backup recovery failed:', error);
    }
    
    // If all else fails, create new user data
    console.warn('Creating fresh user data');
    this.userData = this.getDefaultUserData();
    this.isLoaded = true;
    this.saveUserData();
  }

  private setupAutoSave(): void {
    // Save data every 30 seconds if there are changes
    setInterval(() => {
      if (this.userData && this.isLoaded) {
        this.saveUserData();
      }
    }, 30000);
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveUserData();
    });
    
    // Save on visibility change (when user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveUserData();
      }
    });
  }

  private setupBackupSystem(): void {
    // Create backup every hour
    setInterval(() => {
      this.createBackup();
    }, 60 * 60 * 1000);
    
    // Clean old backups daily
    setInterval(() => {
      this.cleanOldBackups();
    }, 24 * 60 * 60 * 1000);
  }

  private saveUserData(): void {
    if (!this.userData || !this.isLoaded) return;
    
    try {
      // Clear existing timeout
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }
      
      // Debounce saves to avoid excessive localStorage writes
      this.saveTimeout = setTimeout(() => {
        const dataToSave = JSON.stringify(this.userData);
        localStorage.setItem(this.STORAGE_KEYS.USER_DATA, dataToSave);
        
        // Update last visit time
        if (this.userData) {
          this.userData.lastVisit = new Date();
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to save user data:', error);
      this.handleStorageError(error);
    }
  }

  private handleStorageError(error: any): void {
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, cleaning up old data...');
      this.cleanupOldData();
      // Try saving again after cleanup
      setTimeout(() => this.saveUserData(), 1000);
    }
  }

  private cleanupOldData(): void {
    try {
      // Remove old backups
      this.cleanOldBackups();
      
      // Trim session history to last 100 sessions
      if (this.userData?.focusData.sessionHistory.length > 100) {
        this.userData.focusData.sessionHistory = this.userData.focusData.sessionHistory
          .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
          .slice(0, 100);
      }
      
      // Trim intervention history to last 200 interventions
      if (this.userData?.wellnessData.interventionHistory.length > 200) {
        this.userData.wellnessData.interventionHistory = this.userData.wellnessData.interventionHistory
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 200);
      }
      
      // Trim cognitive score history to last 500 records
      if (this.userData?.analyticsData.cognitiveScoreHistory.length > 500) {
        this.userData.analyticsData.cognitiveScoreHistory = this.userData.analyticsData.cognitiveScoreHistory
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 500);
      }
      
      // Keep only last 30 days of daily usage records
      if (this.userData?.digitalWellnessData.dailyUsageHistory.length > 30) {
        this.userData.digitalWellnessData.dailyUsageHistory = this.userData.digitalWellnessData.dailyUsageHistory
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 30);
      }
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }

  private createBackup(): void {
    if (!this.userData) return;
    
    try {
      const backupKey = this.STORAGE_KEYS.BACKUP_PREFIX + Date.now();
      const backupData = JSON.stringify(this.userData);
      
      localStorage.setItem(backupKey, backupData);
      localStorage.setItem(this.STORAGE_KEYS.LAST_BACKUP, backupKey);
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  private loadFromBackup(): UserData | null {
    try {
      const lastBackupKey = localStorage.getItem(this.STORAGE_KEYS.LAST_BACKUP);
      if (!lastBackupKey) return null;
      
      const backupData = localStorage.getItem(lastBackupKey);
      if (!backupData) return null;
      
      return this.migrateUserData(JSON.parse(backupData));
    } catch (error) {
      console.error('Failed to load from backup:', error);
      return null;
    }
  }

  private cleanOldBackups(): void {
    try {
      const keys = Object.keys(localStorage);
      const backupKeys = keys.filter(key => key.startsWith(this.STORAGE_KEYS.BACKUP_PREFIX));
      
      // Keep only the 5 most recent backups
      const sortedBackups = backupKeys
        .map(key => ({
          key,
          timestamp: parseInt(key.replace(this.STORAGE_KEYS.BACKUP_PREFIX, ''))
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
      
      // Remove old backups
      sortedBackups.slice(5).forEach(backup => {
        localStorage.removeItem(backup.key);
      });
    } catch (error) {
      console.error('Failed to clean old backups:', error);
    }
  }

  // Public API methods
  public getUserData(): UserData | null {
    return this.userData;
  }

  public isDataLoaded(): boolean {
    return this.isLoaded;
  }

  public updatePreferences(updates: Partial<UserData['preferences']>): void {
    if (!this.userData) return;
    
    this.userData.preferences = { ...this.userData.preferences, ...updates };
    this.saveUserData();
    this.notifyListeners();
  }

  public recordFocusSession(session: Omit<FocusSession, 'id'>): void {
    if (!this.userData) return;
    
    const sessionWithId: FocusSession = {
      ...session,
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    };
    
    this.userData.focusData.sessionHistory.push(sessionWithId);
    this.userData.focusData.totalSessions++;
    
    if (session.sessionType === 'Focus') {
      this.userData.focusData.totalFocusTime += session.duration;
      this.userData.focusData.sessionsToday++;
      this.userData.focusData.sessionsThisWeek++;
      
      if (session.duration > this.userData.focusData.longestSession) {
        this.userData.focusData.longestSession = session.duration;
      }
    } else {
      this.userData.focusData.totalBreakTime += session.duration;
    }
    
    // Update average session length
    const focusSessions = this.userData.focusData.sessionHistory.filter(s => s.sessionType === 'Focus');
    if (focusSessions.length > 0) {
      this.userData.focusData.averageSessionLength = 
        focusSessions.reduce((sum, s) => sum + s.duration, 0) / focusSessions.length;
    }
    
    // Update streak
    if (session.completed && session.sessionType === 'Focus') {
      this.userData.focusData.currentStreak++;
      if (this.userData.focusData.currentStreak > this.userData.focusData.bestStreak) {
        this.userData.focusData.bestStreak = this.userData.focusData.currentStreak;
      }
    }
    
    this.saveUserData();
    this.notifyListeners();
  }

  public recordIntervention(intervention: Omit<InterventionRecord, 'id'>): void {
    if (!this.userData) return;
    
    const interventionWithId: InterventionRecord = {
      ...intervention,
      id: 'intervention_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    };
    
    this.userData.wellnessData.interventionHistory.push(interventionWithId);
    
    if (intervention.completed) {
      this.userData.wellnessData.totalInterventionsCompleted++;
      this.userData.wellnessData.interventionsByType[intervention.type] = 
        (this.userData.wellnessData.interventionsByType[intervention.type] || 0) + 1;
    }
    
    this.saveUserData();
    this.notifyListeners();
  }

  public recordMindfulBreak(): void {
    if (!this.userData) return;
    
    this.userData.wellnessData.mindfulBreaksToday++;
    this.userData.wellnessData.mindfulBreaksThisWeek++;
    this.userData.wellnessData.mindfulBreaksTotal++;
    this.userData.wellnessData.lastMindfulBreak = new Date();
    
    this.saveUserData();
    this.notifyListeners();
  }

  public recordCognitiveScore(score: Omit<CognitiveScoreRecord, 'timestamp'>): void {
    if (!this.userData) return;
    
    const scoreRecord: CognitiveScoreRecord = {
      ...score,
      timestamp: new Date()
    };
    
    this.userData.analyticsData.cognitiveScoreHistory.push(scoreRecord);
    
    // Update averages
    const scores = this.userData.analyticsData.cognitiveScoreHistory;
    if (scores.length > 0) {
      this.userData.analyticsData.averageFocusQuality = 
        scores.reduce((sum, s) => sum + s.focusScore, 0) / scores.length;
      
      this.userData.analyticsData.bestFocusQuality = 
        Math.max(...scores.map(s => s.focusScore));
    }
    
    this.saveUserData();
    this.notifyListeners();
  }

  public recordDailyUsage(usage: DailyUsageRecord): void {
    if (!this.userData) return;
    
    // Remove existing record for the same date
    this.userData.digitalWellnessData.dailyUsageHistory = 
      this.userData.digitalWellnessData.dailyUsageHistory.filter(record => record.date !== usage.date);
    
    // Add new record
    this.userData.digitalWellnessData.dailyUsageHistory.push(usage);
    
    // Update totals
    this.userData.digitalWellnessData.totalSocialMediaTime += usage.totalSocialMediaTime;
    this.userData.digitalWellnessData.mindlessSessionsTotal += usage.mindlessScrollingSessions;
    this.userData.digitalWellnessData.mindfulBreaksTotal += usage.mindfulBreaksTaken;
    
    if (usage.totalSocialMediaTime > this.userData.digitalWellnessData.longestDailyUsage) {
      this.userData.digitalWellnessData.longestDailyUsage = usage.totalSocialMediaTime;
    }
    
    if (usage.cognitiveImpactScore > this.userData.digitalWellnessData.bestDigitalWellnessScore) {
      this.userData.digitalWellnessData.bestDigitalWellnessScore = usage.cognitiveImpactScore;
    }
    
    // Update platform usage stats
    Object.entries(usage.platformBreakdown).forEach(([platform, time]) => {
      this.userData!.digitalWellnessData.platformUsageStats[platform] = 
        (this.userData!.digitalWellnessData.platformUsageStats[platform] || 0) + time;
    });
    
    this.saveUserData();
    this.notifyListeners();
  }

  public recordFeatureUsage(feature: string): void {
    if (!this.userData) return;
    
    this.userData.appUsage.featuresUsed[feature] = 
      (this.userData.appUsage.featuresUsed[feature] || 0) + 1;
    this.userData.appUsage.lastFeatureUsed = feature;
    
    this.saveUserData();
  }

  public completeOnboarding(): void {
    if (!this.userData) return;
    
    this.userData.onboardingCompleted = true;
    this.saveUserData();
    this.notifyListeners();
  }

  public resetOnboarding(): void {
    if (!this.userData) return;
    
    this.userData.onboardingCompleted = false;
    this.saveUserData();
    this.notifyListeners();
  }

  public exportUserData(): string {
    if (!this.userData) return '';
    
    return JSON.stringify(this.userData, null, 2);
  }

  public importUserData(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData);
      const migratedData = this.migrateUserData(importedData);
      
      this.userData = migratedData;
      this.saveUserData();
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error('Failed to import user data:', error);
      return false;
    }
  }

  public resetAllData(): void {
    try {
      // Clear all localStorage data
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear backups
      const keys = Object.keys(localStorage);
      keys.filter(key => key.startsWith(this.STORAGE_KEYS.BACKUP_PREFIX))
           .forEach(key => localStorage.removeItem(key));
      
      // Reset to default data
      this.userData = this.getDefaultUserData();
      this.saveUserData();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to reset user data:', error);
    }
  }

  public subscribe(callback: (data: UserData) => void): () => void {
    this.listeners.push(callback);
    
    // Immediately call with current data if available
    if (this.userData) {
      callback(this.userData);
    }
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    if (this.userData) {
      this.listeners.forEach(listener => listener(this.userData!));
    }
  }

  // Daily reset methods (call these at midnight)
  public resetDailyCounters(): void {
    if (!this.userData) return;
    
    this.userData.focusData.sessionsToday = 0;
    this.userData.wellnessData.mindfulBreaksToday = 0;
    
    this.saveUserData();
    this.notifyListeners();
  }

  // Weekly reset methods (call these on Sunday)
  public resetWeeklyCounters(): void {
    if (!this.userData) return;
    
    this.userData.focusData.sessionsThisWeek = 0;
    this.userData.wellnessData.mindfulBreaksThisWeek = 0;
    
    this.saveUserData();
    this.notifyListeners();
  }

  // Get storage usage information
  public getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const used = new Blob([localStorage.getItem(this.STORAGE_KEYS.USER_DATA) || '']).size;
      const available = 5 * 1024 * 1024; // Assume 5MB localStorage limit
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

// Singleton instance
export const userDataManager = UserDataManager.getInstance();