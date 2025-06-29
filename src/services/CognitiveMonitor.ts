export interface MonitoringData {
  browserActivity: {
    tabSwitches: number;
    focusTime: number;
    lastFocusChange: Date;
    isTabActive: boolean;
    totalActiveTime: number;
  };
  keyboardActivity: {
    typingSpeed: number; // WPM
    keystrokes: number;
    typingRhythm: 'steady' | 'erratic' | 'declining';
    lastKeystroke: Date;
    averageInterval: number;
  };
  mouseActivity: {
    movements: number;
    clicks: number;
    lastActivity: Date;
    movementPattern: 'smooth' | 'erratic' | 'minimal';
  };
  cognitiveMetrics: {
    focusScore: number;
    loadScore: number;
    stressScore: number;
    overallScore: number;
    // Historical data for trends
    focusHistory: number[];
    loadHistory: number[];
    stressHistory: number[];
    overallHistory: number[];
    // Trend indicators
    focusTrend: 'up' | 'down' | 'stable';
    loadTrend: 'up' | 'down' | 'stable';
    stressTrend: 'up' | 'down' | 'stable';
    overallTrend: 'up' | 'down' | 'stable';
    // Change percentages
    focusChange: number;
    loadChange: number;
    stressChange: number;
    overallChange: number;
  };
}

export interface DataSourceStatus {
  browserActivity: 'Active' | 'Disconnected';
  keyboardPatterns: 'Active' | 'Disconnected';
  mouseMovement: 'Active' | 'Disconnected';
  smartwatch: 'Active' | 'Disconnected';
}

export class CognitiveMonitor {
  private data: MonitoringData;
  private isMonitoring: boolean = false;
  private isPaused: boolean = false;
  private listeners: ((data: MonitoringData) => void)[] = [];
  private statusListeners: ((status: DataSourceStatus) => void)[] = [];
  private intervals: NodeJS.Timeout[] = [];
  private keystrokeTimestamps: number[] = [];
  private mouseMovements: { x: number; y: number; timestamp: number }[] = [];
  private tabSwitchCount: number = 0;
  private sessionStartTime: Date = new Date();
  private lastTabFocusTime: Date = new Date();
  private totalFocusTime: number = 0;
  private lastSaveTime: number = 0;

  // Configuration constants - Updated to 15-second intervals
  private readonly MONITORING_INTERVAL = 15000; // 15 seconds (updated from 30 seconds)
  private readonly FOCUS_UPDATE_INTERVAL = 1000; // 1 second for focus time updates
  private readonly DIGITAL_WELLNESS_CHECK_INTERVAL = 30000; // 30 seconds for digital wellness checks
  private readonly PEAK_USAGE_CHECK_INTERVAL = 60000; // 1 minute for peak usage tracking
  private readonly STORAGE_KEY = 'brainwave-shift-cognitive-data';

  constructor() {
    this.data = this.getInitialData();
    this.setupEventListeners();
    this.restoreDataFromStorage();
  }

  private getInitialData(): MonitoringData {
    return {
      browserActivity: {
        tabSwitches: 0,
        focusTime: 0,
        lastFocusChange: new Date(),
        isTabActive: !document.hidden,
        totalActiveTime: 0
      },
      keyboardActivity: {
        typingSpeed: 0,
        keystrokes: 0,
        typingRhythm: 'steady',
        lastKeystroke: new Date(),
        averageInterval: 0
      },
      mouseActivity: {
        movements: 0,
        clicks: 0,
        lastActivity: new Date(),
        movementPattern: 'smooth'
      },
      cognitiveMetrics: {
        focusScore: 60,
        loadScore: 60,
        stressScore: 60,
        overallScore: 60,
        focusHistory: [60],
        loadHistory: [60],
        stressHistory: [60],
        overallHistory: [60],
        focusTrend: 'stable',
        loadTrend: 'stable',
        stressTrend: 'stable',
        overallTrend: 'stable',
        focusChange: 0,
        loadChange: 0,
        stressChange: 0,
        overallChange: 0
      }
    };
  }

  private setupEventListeners(): void {
    // Browser activity tracking
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.addEventListener('focus', this.handleWindowFocus.bind(this));
    window.addEventListener('blur', this.handleWindowBlur.bind(this));

    // Keyboard activity tracking
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    document.addEventListener('keyup', this.handleKeyup.bind(this));

    // Mouse activity tracking
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('click', this.handleMouseClick.bind(this));
    
    // Storage event for cross-tab synchronization
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }
  
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === this.STORAGE_KEY) {
      // Another tab has updated the cognitive data
      this.syncFromStorage();
    }
  }

  private handleVisibilityChange(): void {
    if (!this.isMonitoring) return;

    const now = new Date();
    const wasActive = this.data.browserActivity.isTabActive;
    const isActive = !document.hidden;

    if (wasActive && !isActive) {
      // Tab became inactive - record focus time
      const focusTime = now.getTime() - this.lastTabFocusTime.getTime();
      this.totalFocusTime += focusTime;
      this.tabSwitchCount++;
      
      // Save state when tab becomes inactive
      this.saveDataToStorage();
    } else if (!wasActive && isActive) {
      // Tab became active
      this.lastTabFocusTime = now;
      
      // Sync from storage when tab becomes active
      this.syncFromStorage();
    }

    this.data.browserActivity.isTabActive = isActive;
    this.data.browserActivity.lastFocusChange = now;
    this.data.browserActivity.tabSwitches = this.tabSwitchCount;
    this.data.browserActivity.totalActiveTime = this.totalFocusTime;
  }

  private handleWindowFocus(): void {
    if (!this.isMonitoring) return;
    this.lastTabFocusTime = new Date();
    this.data.browserActivity.isTabActive = true;
    
    // Sync from storage when window gets focus
    this.syncFromStorage();
    
    // Resume monitoring if it was paused
    if (this.isPaused) {
      this.resumeMonitoring();
    }
  }

  private handleWindowBlur(): void {
    if (!this.isMonitoring) return;
    const now = new Date();
    const focusTime = now.getTime() - this.lastTabFocusTime.getTime();
    this.totalFocusTime += focusTime;
    this.tabSwitchCount++;
    this.data.browserActivity.isTabActive = false;
    this.data.browserActivity.tabSwitches = this.tabSwitchCount;
    this.data.browserActivity.totalActiveTime = this.totalFocusTime;
    
    // Save state when window loses focus
    this.saveDataToStorage();
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.isMonitoring) return;
    
    // Ignore modifier keys and function keys
    if (event.ctrlKey || event.altKey || event.metaKey || event.key.startsWith('F')) {
      return;
    }

    const now = Date.now();
    this.keystrokeTimestamps.push(now);
    
    // Keep only last 50 keystrokes for analysis
    if (this.keystrokeTimestamps.length > 50) {
      this.keystrokeTimestamps.shift();
    }

    this.data.keyboardActivity.keystrokes++;
    this.data.keyboardActivity.lastKeystroke = new Date(now);
    
    this.calculateTypingMetrics();
  }

  private handleKeyup(event: KeyboardEvent): void {
    // Currently not used, but available for future enhancements
  }

  private calculateTypingMetrics(): void {
    if (this.keystrokeTimestamps.length < 5) return;

    const recent = this.keystrokeTimestamps.slice(-10);
    const intervals = [];
    
    for (let i = 1; i < recent.length; i++) {
      intervals.push(recent[i] - recent[i - 1]);
    }

    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    this.data.keyboardActivity.averageInterval = averageInterval;

    // Calculate WPM (assuming average word length of 5 characters)
    const timeSpan = (recent[recent.length - 1] - recent[0]) / 1000 / 60; // minutes
    const wpm = timeSpan > 0 ? (recent.length / 5) / timeSpan : 0;
    this.data.keyboardActivity.typingSpeed = Math.round(wpm);

    // Determine typing rhythm
    const variance = this.calculateVariance(intervals);
    if (variance < 10000) { // Low variance
      this.data.keyboardActivity.typingRhythm = 'steady';
    } else if (variance < 50000) { // Medium variance
      this.data.keyboardActivity.typingRhythm = 'erratic';
    } else { // High variance
      this.data.keyboardActivity.typingRhythm = 'declining';
    }
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isMonitoring) return;

    const now = Date.now();
    this.mouseMovements.push({
      x: event.clientX,
      y: event.clientY,
      timestamp: now
    });

    // Keep only last 20 movements for analysis
    if (this.mouseMovements.length > 20) {
      this.mouseMovements.shift();
    }

    this.data.mouseActivity.movements++;
    this.data.mouseActivity.lastActivity = new Date(now);
    
    this.calculateMousePattern();
  }

  private handleMouseClick(): void {
    if (!this.isMonitoring) return;
    
    this.data.mouseActivity.clicks++;
    this.data.mouseActivity.lastActivity = new Date();
  }

  private calculateMousePattern(): void {
    if (this.mouseMovements.length < 5) return;

    const recent = this.mouseMovements.slice(-10);
    const distances = [];
    
    for (let i = 1; i < recent.length; i++) {
      const dx = recent[i].x - recent[i - 1].x;
      const dy = recent[i].y - recent[i - 1].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      distances.push(distance);
    }

    const averageDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const variance = this.calculateVariance(distances);

    if (averageDistance < 10) {
      this.data.mouseActivity.movementPattern = 'minimal';
    } else if (variance < 1000) {
      this.data.mouseActivity.movementPattern = 'smooth';
    } else {
      this.data.mouseActivity.movementPattern = 'erratic';
    }
  }

  private calculateTrend(history: number[]): 'up' | 'down' | 'stable' {
    if (history.length < 3) return 'stable';
    
    const recent = history.slice(-3);
    const trend = recent[2] - recent[0];
    
    if (trend > 5) return 'up';
    if (trend < -5) return 'down';
    return 'stable';
  }

  private calculateChange(history: number[]): number {
    if (history.length < 2) return 0;
    
    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  private updateHistoricalData(metrics: any): void {
    const maxHistoryLength = 14; // Keep last 14 data points
    
    // Update focus history
    this.data.cognitiveMetrics.focusHistory.push(metrics.focusScore);
    if (this.data.cognitiveMetrics.focusHistory.length > maxHistoryLength) {
      this.data.cognitiveMetrics.focusHistory.shift();
    }
    
    // Update load history
    this.data.cognitiveMetrics.loadHistory.push(metrics.loadScore);
    if (this.data.cognitiveMetrics.loadHistory.length > maxHistoryLength) {
      this.data.cognitiveMetrics.loadHistory.shift();
    }
    
    // Update stress history
    this.data.cognitiveMetrics.stressHistory.push(metrics.stressScore);
    if (this.data.cognitiveMetrics.stressHistory.length > maxHistoryLength) {
      this.data.cognitiveMetrics.stressHistory.shift();
    }
    
    // Update overall history
    this.data.cognitiveMetrics.overallHistory.push(metrics.overallScore);
    if (this.data.cognitiveMetrics.overallHistory.length > maxHistoryLength) {
      this.data.cognitiveMetrics.overallHistory.shift();
    }
    
    // Calculate trends
    this.data.cognitiveMetrics.focusTrend = this.calculateTrend(this.data.cognitiveMetrics.focusHistory);
    this.data.cognitiveMetrics.loadTrend = this.calculateTrend(this.data.cognitiveMetrics.loadHistory);
    this.data.cognitiveMetrics.stressTrend = this.calculateTrend(this.data.cognitiveMetrics.stressHistory);
    this.data.cognitiveMetrics.overallTrend = this.calculateTrend(this.data.cognitiveMetrics.overallHistory);
    
    // Calculate changes
    this.data.cognitiveMetrics.focusChange = this.calculateChange(this.data.cognitiveMetrics.focusHistory);
    this.data.cognitiveMetrics.loadChange = this.calculateChange(this.data.cognitiveMetrics.loadHistory);
    this.data.cognitiveMetrics.stressChange = this.calculateChange(this.data.cognitiveMetrics.stressHistory);
    this.data.cognitiveMetrics.overallChange = this.calculateChange(this.data.cognitiveMetrics.overallHistory);
  }

  private calculateCognitiveMetrics(): void {
    const now = Date.now();
    const sessionDuration = (now - this.sessionStartTime.getTime()) / 1000 / 60; // minutes

    // Focus Score Calculation
    let focusScore = 60; // Base score
    
    if (sessionDuration > 0) {
      const tabSwitchRate = this.tabSwitchCount / sessionDuration;
      const focusTimeRatio = this.totalFocusTime / (sessionDuration * 60 * 1000);
      
      // Reward sustained focus
      if (tabSwitchRate < 0.5) focusScore += 15; // Very few switches
      else if (tabSwitchRate < 1) focusScore += 10; // Moderate switches
      else if (tabSwitchRate < 2) focusScore += 5; // Some switches
      else focusScore -= 10; // Too many switches
      
      // Reward high focus time ratio
      if (focusTimeRatio > 0.8) focusScore += 10;
      else if (focusTimeRatio > 0.6) focusScore += 5;
      else if (focusTimeRatio < 0.3) focusScore -= 15;
    }

    // Cognitive Load Score
    let loadScore = 60;
    
    if (this.data.keyboardActivity.typingRhythm === 'steady') {
      loadScore += 10;
    } else if (this.data.keyboardActivity.typingRhythm === 'erratic') {
      loadScore -= 5;
    } else if (this.data.keyboardActivity.typingRhythm === 'declining') {
      loadScore -= 15;
    }

    if (this.data.keyboardActivity.typingSpeed > 40) {
      loadScore += 5; // Good typing speed indicates alertness
    } else if (this.data.keyboardActivity.typingSpeed < 20) {
      loadScore -= 10; // Slow typing might indicate fatigue
    }

    // Stress Score
    let stressScore = 60;
    
    if (this.data.mouseActivity.movementPattern === 'erratic') {
      stressScore -= 15; // Erratic mouse movements indicate stress
    } else if (this.data.mouseActivity.movementPattern === 'smooth') {
      stressScore += 10; // Smooth movements indicate calm state
    }

    if (this.tabSwitchCount > sessionDuration * 2) {
      stressScore -= 10; // Frequent tab switching indicates distraction/stress
    }

    // Ensure scores are within bounds
    focusScore = Math.max(20, Math.min(100, focusScore));
    loadScore = Math.max(20, Math.min(100, loadScore));
    stressScore = Math.max(20, Math.min(100, stressScore));

    // Overall score is weighted average
    const overallScore = Math.round(
      (focusScore * 0.4 + loadScore * 0.3 + stressScore * 0.3)
    );

    const newMetrics = {
      focusScore,
      loadScore,
      stressScore,
      overallScore
    };

    // Update historical data and trends
    this.updateHistoricalData(newMetrics);

    this.data.cognitiveMetrics = {
      ...this.data.cognitiveMetrics,
      ...newMetrics
    };
    
    // Save data to storage for cross-tab sync
    this.saveDataToStorage();
  }

  public startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.isPaused = false;
    this.sessionStartTime = new Date();
    this.lastTabFocusTime = new Date();
    this.tabSwitchCount = 0;
    this.totalFocusTime = 0;
    
    // Try to restore data from storage first
    this.syncFromStorage();

    // Update cognitive metrics every 15 seconds (updated from 30 seconds)
    const metricsInterval = setInterval(() => {
      if (!this.isMonitoring || this.isPaused) return;
      
      this.calculateCognitiveMetrics();
      this.notifyListeners();
    }, this.MONITORING_INTERVAL);

    // Update focus time every second when tab is active
    const focusInterval = setInterval(() => {
      if (!this.isMonitoring || this.isPaused) return;
      
      if (this.data.browserActivity.isTabActive) {
        const now = new Date();
        const currentFocusTime = now.getTime() - this.lastTabFocusTime.getTime();
        this.data.browserActivity.focusTime = currentFocusTime;
      }
    }, this.FOCUS_UPDATE_INTERVAL);

    this.intervals.push(metricsInterval, focusInterval);
    this.notifyStatusListeners();
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    this.isPaused = false;
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    this.notifyStatusListeners();
    
    // Save final state to storage
    this.saveDataToStorage();
  }
  
  public pauseMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isPaused = true;
    this.notifyStatusListeners();
    
    // Save state to storage
    this.saveDataToStorage();
  }
  
  public resumeMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isPaused = false;
    this.lastTabFocusTime = new Date(); // Reset focus time
    this.notifyStatusListeners();
  }

  public isActive(): boolean {
    return this.isMonitoring;
  }
  
  public isPausing(): boolean {
    return this.isPaused;
  }

  public getData(): MonitoringData {
    return { ...this.data };
  }

  public getDataSourceStatus(): DataSourceStatus {
    return {
      browserActivity: this.isMonitoring && !this.isPaused ? 'Active' : 'Disconnected',
      keyboardPatterns: this.isMonitoring && !this.isPaused ? 'Active' : 'Disconnected',
      mouseMovement: this.isMonitoring && !this.isPaused ? 'Active' : 'Disconnected',
      smartwatch: 'Disconnected' // Will be updated by device integration service
    };
  }

  public subscribe(callback: (data: MonitoringData) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  public subscribeToStatus(callback: (status: DataSourceStatus) => void): () => void {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getData()));
  }

  private notifyStatusListeners(): void {
    this.statusListeners.forEach(listener => listener(this.getDataSourceStatus()));
  }

  public resetSession(): void {
    this.sessionStartTime = new Date();
    this.lastTabFocusTime = new Date();
    this.tabSwitchCount = 0;
    this.totalFocusTime = 0;
    this.keystrokeTimestamps = [];
    this.mouseMovements = [];
    this.data = this.getInitialData();
    
    // Save reset state to storage
    this.saveDataToStorage();
  }
  
  private restoreDataFromStorage = (): void => {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (!savedData) return;
      
      const parsedData = JSON.parse(savedData);
      
      // Restore monitoring state
      this.isMonitoring = parsedData.isMonitoring || false;
      this.isPaused = parsedData.isPaused || false;
      this.tabSwitchCount = parsedData.tabSwitchCount || 0;
      this.totalFocusTime = parsedData.totalFocusTime || 0;
      
      if (parsedData.sessionStartTime) {
        this.sessionStartTime = new Date(parsedData.sessionStartTime);
      }
      
      if (parsedData.lastTabFocusTime) {
        this.lastTabFocusTime = new Date(parsedData.lastTabFocusTime);
      }
      
      // Restore data if available
      if (parsedData.data) {
        this.data = {
          ...this.data,
          ...parsedData.data,
          // Ensure dates are properly restored
          browserActivity: {
            ...this.data.browserActivity,
            ...parsedData.data.browserActivity,
            lastFocusChange: new Date(parsedData.data.browserActivity?.lastFocusChange || Date.now())
          },
          keyboardActivity: {
            ...this.data.keyboardActivity,
            ...parsedData.data.keyboardActivity,
            lastKeystroke: new Date(parsedData.data.keyboardActivity?.lastKeystroke || Date.now())
          },
          mouseActivity: {
            ...this.data.mouseActivity,
            ...parsedData.data.mouseActivity,
            lastActivity: new Date(parsedData.data.mouseActivity?.lastActivity || Date.now())
          }
        };
      }
      
      this.lastSaveTime = parsedData.timestamp || 0;
    } catch (error) {
      console.error('Failed to restore cognitive data from storage:', error);
    }
  };
  
  private saveDataToStorage(): void {
    try {
      const dataToSave = {
        data: this.data,
        isMonitoring: this.isMonitoring,
        isPaused: this.isPaused,
        tabSwitchCount: this.tabSwitchCount,
        totalFocusTime: this.totalFocusTime,
        sessionStartTime: this.sessionStartTime.toISOString(),
        lastTabFocusTime: this.lastTabFocusTime.toISOString(),
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
      this.lastSaveTime = Date.now();
    } catch (error) {
      console.error('Failed to save cognitive data to storage:', error);
    }
  }
  
  private syncFromStorage(): void {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (!savedData) return;
      
      const parsedData = JSON.parse(savedData);
      
      // Only sync if the saved data is newer than our last sync
      if (parsedData.timestamp <= this.lastSaveTime) return;
      
      // Update monitoring state
      this.isMonitoring = parsedData.isMonitoring;
      this.isPaused = parsedData.isPaused;
      this.tabSwitchCount = parsedData.tabSwitchCount;
      this.totalFocusTime = parsedData.totalFocusTime;
      this.sessionStartTime = new Date(parsedData.sessionStartTime);
      this.lastTabFocusTime = new Date(parsedData.lastTabFocusTime);
      
      // Update data
      this.data = parsedData.data;
      
      // Notify listeners
      this.notifyListeners();
      this.notifyStatusListeners();
    } catch (error) {
      console.error('Failed to sync cognitive data from storage:', error);
    }
  }

  // Getter for monitoring interval (for UI display)
  public getMonitoringInterval(): number {
    return this.MONITORING_INTERVAL;
  }

  // Getter for monitoring interval in seconds (for UI display)
  public getMonitoringIntervalSeconds(): number {
    return this.MONITORING_INTERVAL / 1000;
  }
}

// Singleton instance
export const cognitiveMonitor = new CognitiveMonitor();