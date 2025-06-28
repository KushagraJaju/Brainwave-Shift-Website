import { timerService } from './TimerService';
import { userDataManager } from './UserDataManager';
import { cognitiveMonitor } from './CognitiveMonitor';
import { digitalWellnessMonitor } from './DigitalWellnessMonitor';

/**
 * BrowserTabManager handles cross-tab communication and visibility state management
 * to ensure data persistence and synchronization across browser tabs.
 */
export class BrowserTabManager {
  private static instance: BrowserTabManager;
  private isVisible: boolean = true;
  private lastActiveTime: number = Date.now();
  private readonly SYNC_INTERVAL = 5000; // 5 seconds
  private readonly STORAGE_KEY = 'brainwave-shift-tab-sync';
  private readonly TAB_ID = Math.random().toString(36).substring(2, 9);
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: ((isVisible: boolean) => void)[] = [];

  private constructor() {
    this.setupEventListeners();
    this.startSyncInterval();
  }

  public static getInstance(): BrowserTabManager {
    if (!BrowserTabManager.instance) {
      BrowserTabManager.instance = new BrowserTabManager();
    }
    return BrowserTabManager.instance;
  }

  private setupEventListeners(): void {
    // Handle visibility change events
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Handle before unload to save state
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    // Handle storage events for cross-tab communication
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // Handle focus/blur events as additional indicators
    window.addEventListener('focus', this.handleWindowFocus.bind(this));
    window.addEventListener('blur', this.handleWindowBlur.bind(this));
    
    // Initialize visibility state
    this.isVisible = !document.hidden;
    this.broadcastVisibilityState();
  }

  private handleVisibilityChange(): void {
    const wasVisible = this.isVisible;
    this.isVisible = !document.hidden;
    
    if (wasVisible !== this.isVisible) {
      this.broadcastVisibilityState();
      this.notifyListeners();
      
      if (this.isVisible) {
        // Tab became visible again - sync data from storage
        this.syncFromStorage();
        
        // Resume monitoring if it was active
        if (cognitiveMonitor.isActive()) {
          cognitiveMonitor.resumeMonitoring();
        }
        
        if (digitalWellnessMonitor.isActive()) {
          digitalWellnessMonitor.resumeMonitoring();
        }
      } else {
        // Tab became hidden - save state to storage
        this.saveStateToStorage();
        
        // Pause monitoring to save resources
        if (cognitiveMonitor.isActive()) {
          cognitiveMonitor.pauseMonitoring();
        }
        
        if (digitalWellnessMonitor.isActive()) {
          digitalWellnessMonitor.pauseMonitoring();
        }
      }
    }
  }

  private handleWindowFocus(): void {
    this.isVisible = true;
    this.broadcastVisibilityState();
    this.notifyListeners();
    
    // Sync data when tab gets focus
    this.syncFromStorage();
    
    // Resume monitoring if it was active
    if (cognitiveMonitor.isActive()) {
      cognitiveMonitor.resumeMonitoring();
    }
    
    if (digitalWellnessMonitor.isActive()) {
      digitalWellnessMonitor.resumeMonitoring();
    }
  }

  private handleWindowBlur(): void {
    this.isVisible = false;
    this.broadcastVisibilityState();
    this.notifyListeners();
    
    // Save state when tab loses focus
    this.saveStateToStorage();
  }

  private handleBeforeUnload(): void {
    // Save state before the tab/window is closed
    this.saveStateToStorage();
  }

  private handleStorageChange(event: StorageEvent): void {
    if (event.key === this.STORAGE_KEY) {
      // Another tab has updated the shared state
      this.syncFromStorage();
    }
  }

  private broadcastVisibilityState(): void {
    try {
      const syncData = {
        tabId: this.TAB_ID,
        isVisible: this.isVisible,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`${this.STORAGE_KEY}-visibility`, JSON.stringify(syncData));
    } catch (error) {
      console.error('Failed to broadcast visibility state:', error);
    }
  }

  private saveStateToStorage(): void {
    try {
      // Get current timer state
      const timerState = timerService.getState();
      
      // Create sync data object
      const syncData = {
        tabId: this.TAB_ID,
        timestamp: Date.now(),
        timerState,
        lastActiveTime: this.lastActiveTime
      };
      
      // Save to localStorage for cross-tab communication
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(syncData));
      
      // Also ensure user data is saved
      userDataManager.forceSave();
    } catch (error) {
      console.error('Failed to save state to storage:', error);
    }
  }

  private syncFromStorage(): void {
    try {
      // Get sync data from localStorage
      const syncDataJson = localStorage.getItem(this.STORAGE_KEY);
      if (!syncDataJson) return;
      
      const syncData = JSON.parse(syncDataJson);
      
      // Skip if this is our own data or if it's older than our last update
      if (syncData.tabId === this.TAB_ID || syncData.timestamp < this.lastActiveTime) {
        return;
      }
      
      // Update last active time
      this.lastActiveTime = syncData.timestamp;
      
      // Sync timer state if needed
      if (syncData.timerState) {
        timerService.syncState(syncData.timerState);
      }
      
      // Reload user data to ensure it's up to date
      userDataManager.reloadFromStorage();
    } catch (error) {
      console.error('Failed to sync from storage:', error);
    }
  }

  private startSyncInterval(): void {
    // Periodically sync state across tabs
    this.syncInterval = setInterval(() => {
      if (this.isVisible) {
        this.saveStateToStorage();
      } else {
        this.syncFromStorage();
      }
    }, this.SYNC_INTERVAL);
  }

  public isTabVisible(): boolean {
    return this.isVisible;
  }

  public getLastActiveTime(): number {
    return this.lastActiveTime;
  }

  public subscribe(callback: (isVisible: boolean) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.isVisible);
      } catch (error) {
        console.error('Error in tab visibility listener:', error);
      }
    });
  }

  public cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    window.removeEventListener('focus', this.handleWindowFocus.bind(this));
    window.removeEventListener('blur', this.handleWindowBlur.bind(this));
    
    this.listeners = [];
  }
}

// Singleton instance
export const browserTabManager = BrowserTabManager.getInstance();