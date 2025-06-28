export interface UserData {
  // User preferences and settings
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
    digitalWellnessEnabled?: boolean;
    socialMediaTimeLimit?: number;
    mindfulnessReminders?: boolean;
    focusModeSchedule?: { start: string; end: string }[];
  };
  
  // Analytics and progress data
  analytics: {
    dailyFocusTime: number;
    weeklyFocusTime: number;
    totalFocusTime: number;
    averageFocusQuality: number;
    totalInterventions: number;
    completedInterventions: number;
    streakDays: number;
    peakHours: number[];
    distractionTriggers: string[];
    focusSessionsCompleted: number;
    totalBreaksTaken: number;
    mindfulBreaksTaken: number;
    digitalWellnessScore: number;
    lastUpdated: string;
  };
  
  // Focus timer session history
  focusSessions: {
    id: string;
    date: string;
    type: 'Focus' | 'Break';
    duration: number;
    completed: boolean;
    quality?: number;
    preset?: string;
    timestamp: string;
  }[];
  
  // Digital wellness tracking
  digitalWellness: {
    dailySocialMediaTime: number;
    weeklyData: {
      date: string;
      totalTime: number;
      platformBreakdown: Record<string, number>;
      mindlessScrollingSessions: number;
      mindfulBreaksTaken: number;
      cognitiveImpactScore: number;
    }[];
    platformLimits: Record<string, number>;
    interventionHistory: {
      id: string;
      type: string;
      timestamp: string;
      action: string;
    }[];
  };
  
  // Intervention and wellness history
  interventions: {
    id: string;
    type: string;
    title: string;
    completed: boolean;
    dismissed: boolean;
    timestamp: string;
    completedAt?: string;
  }[];
  
  // Device integration status
  deviceIntegrations: {
    smartwatch: {
      connected: boolean;
      provider?: string;
      lastSync?: string;
    };
    calendar: {
      connected: boolean;
      provider?: string;
      lastSync?: string;
    };
  };
  
  // App state and onboarding
  appState: {
    onboardingCompleted: boolean;
    firstLaunch: boolean;
    lastActiveDate: string;
    version: string;
    theme: 'light' | 'dark' | 'system';
  };
  
  // Sound settings
  soundSettings: {
    enabled: boolean;
    volume: number;
    focusCompleteSound: string;
    breakCompleteSound: string;
    tickSound?: string;
  };
}

export interface DataBackup {
  userData: UserData;
  timestamp: string;
  version: string;
  checksum: string;
}

export class UserDataManager {
  private static instance: UserDataManager;
  private readonly STORAGE_KEY = 'brainwave-shift-user-data';
  private readonly BACKUP_KEY = 'brainwave-shift-backup';
  private readonly VERSION = '1.0.0';
  private userData: UserData;
  private listeners: ((data: UserData) => void)[] = [];
  private saveTimeout: NodeJS.Timeout | null = null;
  private _isInitialized = false;

  private constructor() {
    this.userData = this.getDefaultUserData();
    this.initialize();
  }

  public static getInstance(): UserDataManager {
    if (!UserDataManager.instance) {
      UserDataManager.instance = new UserDataManager();
    }
    return UserDataManager.instance;
  }

  private getDefaultUserData(): UserData {
    return {
      preferences: {
        interventionFrequency: 'Normal',
        focusSessionLength: 25,
        breakLength: 5,
        breakReminders: true,
        ambientNotifications: false,
        dataSharing: false,
        selectedPreset: 'pomodoro',
        smartwatchDataSharing: true,
        calendarDataSharing: true,
        physiologicalMonitoring: true,
        calendarInsights: true,
        digitalWellnessEnabled: true,
        mindfulnessReminders: true
      },
      analytics: {
        dailyFocusTime: 0,
        weeklyFocusTime: 0,
        totalFocusTime: 0,
        averageFocusQuality: 60,
        totalInterventions: 0,
        completedInterventions: 0,
        streakDays: 0,
        peakHours: [],
        distractionTriggers: ['Email notifications', 'Social media', 'Meetings', 'Noise'],
        focusSessionsCompleted: 0,
        totalBreaksTaken: 0,
        mindfulBreaksTaken: 0,
        digitalWellnessScore: 80,
        lastUpdated: new Date().toISOString()
      },
      focusSessions: [],
      digitalWellness: {
        dailySocialMediaTime: 0,
        weeklyData: [],
        platformLimits: {},
        interventionHistory: []
      },
      interventions: [],
      deviceIntegrations: {
        smartwatch: { connected: false },
        calendar: { connected: false }
      },
      appState: {
        onboardingCompleted: false,
        firstLaunch: true,
        lastActiveDate: new Date().toISOString(),
        version: this.VERSION,
        theme: 'system'
      },
      soundSettings: {
        enabled: true,
        volume: 0.7,
        focusCompleteSound: 'chime',
        breakCompleteSound: 'chime'
      }
    };
  }

  private async initialize(): Promise<void> {
    try {
      await this.loadUserData();
      this.updateLastActiveDate();
      this._isInitialized = true;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to initialize user data:', error);
      // Use default data if loading fails
      this._isInitialized = true;
      this.notifyListeners();
    }
  }

  private async loadUserData(): Promise<void> {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData) as UserData;
        
        // Validate and migrate data if necessary
        this.userData = this.migrateUserData(parsedData);
        
        // Update version if needed
        if (this.userData.appState.version !== this.VERSION) {
          this.userData.appState.version = this.VERSION;
          await this.saveUserData();
        }
      } else {
        // First time user - use defaults
        this.userData = this.getDefaultUserData();
        await this.saveUserData();
      }
    } catch (error) {
      console.error('Failed to load user data from localStorage:', error);
      
      // Try to restore from backup
      try {
        await this.restoreFromBackup();
      } catch (backupError) {
        console.error('Failed to restore from backup:', backupError);
        // Use default data as last resort
        this.userData = this.getDefaultUserData();
      }
    }
  }

  private migrateUserData(data: any): UserData {
    const defaultData = this.getDefaultUserData();
    
    // Deep merge with defaults to ensure all properties exist
    const migratedData = this.deepMerge(defaultData, data);
    
    // Specific migrations for version changes
    if (!migratedData.appState.version || migratedData.appState.version < '1.0.0') {
      // Add any specific migrations here
      migratedData.appState.version = this.VERSION;
    }
    
    return migratedData;
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private async saveUserData(): Promise<void> {
    try {
      // Update last updated timestamp
      this.userData.analytics.lastUpdated = new Date().toISOString();
      
      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.userData));
      
      // Create backup periodically
      await this.createBackup();
      
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }

  private debouncedSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(async () => {
      try {
        await this.saveUserData();
      } catch (error) {
        console.error('Debounced save failed:', error);
      }
    }, 1000); // Save after 1 second of inactivity
  }

  private async createBackup(): Promise<void> {
    try {
      const backup: DataBackup = {
        userData: this.userData,
        timestamp: new Date().toISOString(),
        version: this.VERSION,
        checksum: this.generateChecksum(this.userData)
      };
      
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  private generateChecksum(data: UserData): string {
    // Simple checksum for data integrity
    const dataString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private async restoreFromBackup(): Promise<void> {
    try {
      const backupData = localStorage.getItem(this.BACKUP_KEY);
      if (backupData) {
        const backup = JSON.parse(backupData) as DataBackup;
        
        // Verify checksum
        const expectedChecksum = this.generateChecksum(backup.userData);
        if (backup.checksum === expectedChecksum) {
          this.userData = backup.userData;
          await this.saveUserData();
        } else {
          throw new Error('Backup data integrity check failed');
        }
      } else {
        throw new Error('No backup data found');
      }
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw error;
    }
  }

  private updateLastActiveDate(): void {
    this.userData.appState.lastActiveDate = new Date().toISOString();
    this.debouncedSave();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.userData);
      } catch (error) {
        console.error('Error in data listener:', error);
      }
    });
  }

  // Public API methods
  public getUserData(): UserData {
    return { ...this.userData };
  }

  public updatePreferences(updates: Partial<UserData['preferences']>): void {
    this.userData.preferences = { ...this.userData.preferences, ...updates };
    this.debouncedSave();
    this.notifyListeners();
  }

  public updateAnalytics(updates: Partial<UserData['analytics']>): void {
    this.userData.analytics = { ...this.userData.analytics, ...updates };
    this.debouncedSave();
    this.notifyListeners();
  }

  public addFocusSession(session: Omit<UserData['focusSessions'][0], 'id' | 'timestamp'>): void {
    const newSession = {
      ...session,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    this.userData.focusSessions.push(newSession);
    
    // Update analytics
    if (session.completed && session.type === 'Focus') {
      this.userData.analytics.focusSessionsCompleted++;
      this.userData.analytics.totalFocusTime += session.duration;
      this.userData.analytics.dailyFocusTime += session.duration;
      this.userData.analytics.weeklyFocusTime += session.duration;
    } else if (session.completed && session.type === 'Break') {
      this.userData.analytics.totalBreaksTaken++;
    }
    
    this.debouncedSave();
    this.notifyListeners();
  }

  public addIntervention(intervention: Omit<UserData['interventions'][0], 'id' | 'timestamp'>): void {
    const newIntervention = {
      ...intervention,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    this.userData.interventions.push(newIntervention);
    this.userData.analytics.totalInterventions++;
    
    this.debouncedSave();
    this.notifyListeners();
  }

  public completeIntervention(id: string): void {
    const intervention = this.userData.interventions.find(i => i.id === id);
    if (intervention && !intervention.completed) {
      intervention.completed = true;
      intervention.completedAt = new Date().toISOString();
      this.userData.analytics.completedInterventions++;
      
      this.debouncedSave();
      this.notifyListeners();
    }
  }

  public recordMindfulBreak(): void {
    this.userData.analytics.mindfulBreaksTaken++;
    this.userData.analytics.totalBreaksTaken++;
    
    this.debouncedSave();
    this.notifyListeners();
  }

  public updateDigitalWellness(updates: Partial<UserData['digitalWellness']>): void {
    this.userData.digitalWellness = { ...this.userData.digitalWellness, ...updates };
    this.debouncedSave();
    this.notifyListeners();
  }

  public updateDeviceIntegration(device: 'smartwatch' | 'calendar', updates: Partial<UserData['deviceIntegrations']['smartwatch']>): void {
    this.userData.deviceIntegrations[device] = { ...this.userData.deviceIntegrations[device], ...updates };
    this.debouncedSave();
    this.notifyListeners();
  }

  public updateSoundSettings(updates: Partial<UserData['soundSettings']>): void {
    this.userData.soundSettings = { ...this.userData.soundSettings, ...updates };
    this.debouncedSave();
    this.notifyListeners();
  }

  public completeOnboarding(): void {
    this.userData.appState.onboardingCompleted = true;
    this.userData.appState.firstLaunch = false;
    this.debouncedSave();
    this.notifyListeners();
  }

  public resetOnboarding(): void {
    this.userData.appState.onboardingCompleted = false;
    this.debouncedSave();
    this.notifyListeners();
  }

  public setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.userData.appState.theme = theme;
    this.debouncedSave();
    this.notifyListeners();
  }

  public isOnboardingCompleted(): boolean {
    return this.userData.appState.onboardingCompleted;
  }

  public isFirstLaunch(): boolean {
    return this.userData.appState.firstLaunch;
  }

  // Data management methods
  public async exportData(): Promise<string> {
    try {
      const exportData = {
        userData: this.userData,
        exportDate: new Date().toISOString(),
        version: this.VERSION
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  public async importData(jsonData: string): Promise<void> {
    try {
      const importedData = JSON.parse(jsonData);
      
      if (importedData.userData && importedData.version) {
        // Validate and migrate imported data
        this.userData = this.migrateUserData(importedData.userData);
        await this.saveUserData();
        this.notifyListeners();
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  public async resetAllData(): Promise<void> {
    try {
      // Keep onboarding status but reset everything else
      const onboardingCompleted = this.userData.appState.onboardingCompleted;
      const theme = this.userData.appState.theme;
      
      this.userData = this.getDefaultUserData();
      this.userData.appState.onboardingCompleted = onboardingCompleted;
      this.userData.appState.theme = theme;
      this.userData.appState.firstLaunch = false;
      
      await this.saveUserData();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw error;
    }
  }

  public getDataSize(): { total: number; breakdown: Record<string, number> } {
    try {
      const dataString = JSON.stringify(this.userData);
      const totalSize = new Blob([dataString]).size;
      
      const breakdown: Record<string, number> = {};
      for (const [key, value] of Object.entries(this.userData)) {
        breakdown[key] = new Blob([JSON.stringify(value)]).size;
      }
      
      return { total: totalSize, breakdown };
    } catch (error) {
      console.error('Failed to calculate data size:', error);
      return { total: 0, breakdown: {} };
    }
  }

  public subscribe(listener: (data: UserData) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public isInitialized(): boolean {
    return this._isInitialized;
  }

  // Cleanup method
  public cleanup(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.listeners = [];
  }
}

// Singleton instance
export const userDataManager = UserDataManager.getInstance();