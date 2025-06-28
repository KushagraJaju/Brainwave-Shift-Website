import { soundService } from './SoundService';

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  sessionType: 'Focus' | 'Break';
  time: number;
  initialTime: number;
  startTime?: Date;
  currentFocusSession: number;
  totalFocusSessions: number;
  taskName?: string;
  lastUpdated: number;
}

export interface TimerSettings {
  focusSessionLength: number;
  breakLength: number;
  breakReminders: boolean;
  tickSound?: boolean;
  numberOfBreaks?: number;
  currentTaskName?: string;
}

export class TimerService {
  private static instance: TimerService;
  private state: TimerState;
  private settings: TimerSettings;
  private listeners: ((state: TimerState) => void)[] = [];
  private intervalRef: NodeJS.Timeout | null = null;
  private tickSoundEnabled: boolean = false;
  private lastSyncTime: number = 0;

  private constructor() {
    this.settings = {
      focusSessionLength: 25,
      breakLength: 5,
      breakReminders: true,
      tickSound: false,
      numberOfBreaks: 1,
      currentTaskName: ''
    };
    
    this.state = {
      isActive: false,
      isPaused: false,
      sessionType: 'Focus',
      time: this.settings.focusSessionLength * 60,
      initialTime: this.settings.focusSessionLength * 60,
      currentFocusSession: 1,
      totalFocusSessions: 1,
      taskName: '',
      lastUpdated: Date.now()
    };
    
    // Try to restore state from localStorage
    this.restoreStateFromStorage();
  }

  public static getInstance(): TimerService {
    if (!TimerService.instance) {
      TimerService.instance = new TimerService();
    }
    return TimerService.instance;
  }

  public getState(): TimerState {
    return { ...this.state };
  }

  public updateSettings(newSettings: Partial<TimerSettings>): void {
    const oldSettings = { ...this.settings };
    this.settings = { ...this.settings, ...newSettings };
    
    // Update tick sound setting
    if (newSettings.tickSound !== undefined) {
      this.tickSoundEnabled = newSettings.tickSound;
    }
    
    // Update total focus sessions if number of breaks changed
    if (newSettings.numberOfBreaks !== undefined) {
      this.state.totalFocusSessions = newSettings.numberOfBreaks + 1;
    }
    
    // Update task name if provided
    if (newSettings.currentTaskName !== undefined) {
      this.state.taskName = newSettings.currentTaskName;
    }
    
    // Check if focus or break length changed
    const focusChanged = oldSettings.focusSessionLength !== this.settings.focusSessionLength;
    const breakChanged = oldSettings.breakLength !== this.settings.breakLength;
    
    // Update timer times if not active and not paused, OR if the current session type changed
    if (!this.state.isActive && !this.state.isPaused) {
      if (this.state.sessionType === 'Focus' && focusChanged) {
        const newTime = this.settings.focusSessionLength * 60;
        this.state.time = newTime;
        this.state.initialTime = newTime;
        this.state.lastUpdated = Date.now();
        this.notifyListeners();
      } else if (this.state.sessionType === 'Break' && breakChanged) {
        const newTime = this.settings.breakLength * 60;
        this.state.time = newTime;
        this.state.initialTime = newTime;
        this.state.lastUpdated = Date.now();
        this.notifyListeners();
      }
    }
    
    // Save state to localStorage
    this.saveStateToStorage();
  }

  public start(): void {
    if (this.state.isActive) return;

    this.state.isActive = true;
    this.state.isPaused = false;
    this.state.startTime = new Date();
    this.state.lastUpdated = Date.now();
    
    this.startInterval();
    this.notifyListeners();
    this.saveStateToStorage();
  }

  public pause(): void {
    if (!this.state.isActive) return;

    this.state.isActive = false;
    this.state.isPaused = true;
    this.state.lastUpdated = Date.now();
    
    this.clearInterval();
    this.notifyListeners();
    this.saveStateToStorage();
  }

  public resume(): void {
    if (this.state.isActive || !this.state.isPaused) return;

    this.state.isActive = true;
    this.state.isPaused = false;
    this.state.lastUpdated = Date.now();
    
    this.startInterval();
    this.notifyListeners();
    this.saveStateToStorage();
  }

  public reset(): void {
    this.state.isActive = false;
    this.state.isPaused = false;
    
    if (this.state.sessionType === 'Focus') {
      const newTime = this.settings.focusSessionLength * 60;
      this.state.time = newTime;
      this.state.initialTime = newTime;
    } else {
      const newTime = this.settings.breakLength * 60;
      this.state.time = newTime;
      this.state.initialTime = newTime;
    }
    
    this.state.lastUpdated = Date.now();
    this.clearInterval();
    this.notifyListeners();
    this.saveStateToStorage();
  }

  public toggle(): void {
    if (this.state.isActive) {
      this.pause();
    } else {
      if (this.state.isPaused) {
        this.resume();
      } else {
        this.start();
      }
    }
  }

  // Force update timer to current settings (useful when preset changes)
  public forceUpdateToCurrentSettings(): void {
    if (!this.state.isActive && !this.state.isPaused) {
      if (this.state.sessionType === 'Focus') {
        const newTime = this.settings.focusSessionLength * 60;
        this.state.time = newTime;
        this.state.initialTime = newTime;
      } else {
        const newTime = this.settings.breakLength * 60;
        this.state.time = newTime;
        this.state.initialTime = newTime;
      }
      
      // Reset focus session counter
      this.state.currentFocusSession = 1;
      this.state.totalFocusSessions = (this.settings.numberOfBreaks || 1) + 1;
      
      // Update task name
      this.state.taskName = this.settings.currentTaskName || '';
      
      this.state.lastUpdated = Date.now();
      this.notifyListeners();
      this.saveStateToStorage();
    }
  }

  // Sync state from another tab or source
  public syncState(newState: TimerState): void {
    // Only sync if the new state is newer than our last sync
    if (newState.lastUpdated <= this.lastSyncTime) {
      return;
    }
    
    // Update last sync time
    this.lastSyncTime = newState.lastUpdated;
    
    // Stop current interval if running
    this.clearInterval();
    
    // Update state
    this.state = { ...newState };
    
    // Restart interval if needed
    if (this.state.isActive) {
      this.startInterval();
    }
    
    // Notify listeners
    this.notifyListeners();
  }

  private startInterval(): void {
    this.clearInterval();
    
    this.intervalRef = setInterval(() => {
      if (!this.state.isActive || this.state.time <= 0) return;

      // Play tick sound if enabled
      if (this.tickSoundEnabled) {
        try {
          soundService.playTickSound();
        } catch (error) {
          console.warn('Error playing tick sound:', error);
        }
      }

      this.state.time -= 1;
      this.state.lastUpdated = Date.now();

      if (this.state.time <= 0) {
        this.handleTimerComplete();
      }

      this.notifyListeners();
    }, 1000);
  }

  private clearInterval(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  private handleTimerComplete(): void {
    this.state.isActive = false;
    this.state.isPaused = false;
    this.state.lastUpdated = Date.now();
    
    this.clearInterval();

    // Play completion sound
    this.playCompletionSound();

    // Show notification if enabled
    if (this.settings.breakReminders) {
      this.showNotification();
    }

    // Multi-break logic
    setTimeout(() => {
      if (this.state.sessionType === 'Focus') {
        // Focus session completed, switch to break
        this.state.sessionType = 'Break';
        const breakTime = this.settings.breakLength * 60;
        this.state.time = breakTime;
        this.state.initialTime = breakTime;
      } else {
        // Break session completed
        // Check if we need to start another focus session or if we're done with all sessions
        if (this.state.currentFocusSession < this.state.totalFocusSessions) {
          // More focus sessions to go
          this.state.currentFocusSession++;
          this.state.sessionType = 'Focus';
          const focusTime = this.settings.focusSessionLength * 60;
          this.state.time = focusTime;
          this.state.initialTime = focusTime;
        } else {
          // All focus sessions completed, reset to first session
          this.state.currentFocusSession = 1;
          this.state.sessionType = 'Focus';
          const focusTime = this.settings.focusSessionLength * 60;
          this.state.time = focusTime;
          this.state.initialTime = focusTime;
        }
      }
      
      this.state.lastUpdated = Date.now();
      this.notifyListeners();
      this.saveStateToStorage();
    }, 100);
  }

  private playCompletionSound(): void {
    try {
      if (this.state.sessionType === 'Focus') {
        soundService.playFocusCompleteSound();
      } else {
        soundService.playBreakCompleteSound();
      }
    } catch (error) {
      console.warn('Error playing completion sound:', error);
    }
  }

  private showNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const taskInfo = this.state.taskName ? ` (${this.state.taskName})` : '';
      
      if (this.state.sessionType === 'Focus') {
        new Notification('Focus session complete!', {
          body: `Time for a ${this.settings.breakLength}-minute break.${taskInfo}`,
          icon: '/BrainwaveShift.png'
        });
      } else {
        if (this.state.currentFocusSession < this.state.totalFocusSessions) {
          new Notification('Break time over!', {
            body: `Ready to start focus session ${this.state.currentFocusSession + 1} of ${this.state.totalFocusSessions}?${taskInfo}`,
            icon: '/BrainwaveShift.png'
          });
        } else {
          new Notification('All sessions complete!', {
            body: `You have completed all your planned focus sessions.${taskInfo}`,
            icon: '/BrainwaveShift.png'
          });
        }
      }
    }
  }

  public setTickSoundEnabled(enabled: boolean): void {
    this.tickSoundEnabled = enabled;
  }

  public isTickSoundEnabled(): boolean {
    return this.tickSoundEnabled;
  }

  public subscribe(callback: (state: TimerState) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('Error in timer listener:', error);
      }
    });
  }

  private saveStateToStorage(): void {
    try {
      localStorage.setItem('brainwave-shift-timer-state', JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save timer state to storage:', error);
    }
  }

  private restoreStateFromStorage(): void {
    try {
      const savedState = localStorage.getItem('brainwave-shift-timer-state');
      if (savedState) {
        const parsedState = JSON.parse(savedState) as TimerState;
        
        // Only restore if the saved state is less than 1 hour old
        const now = Date.now();
        const stateAge = now - parsedState.lastUpdated;
        
        if (stateAge < 60 * 60 * 1000) { // 1 hour
          this.state = parsedState;
          
          // If timer was active, check if we need to adjust the time
          if (this.state.isActive) {
            // Calculate how much time has passed since the state was saved
            const secondsPassed = Math.floor(stateAge / 1000);
            
            // Adjust the time
            this.state.time = Math.max(0, this.state.time - secondsPassed);
            
            // If time would have expired, handle completion
            if (this.state.time <= 0) {
              this.state.isActive = false;
              this.state.isPaused = false;
              this.handleTimerComplete();
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore timer state from storage:', error);
    }
  }

  public cleanup(): void {
    this.clearInterval();
    this.listeners = [];
  }
}

// Singleton instance
export const timerService = TimerService.getInstance();