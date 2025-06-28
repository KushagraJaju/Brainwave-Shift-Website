import { soundService } from './SoundService';

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  sessionType: 'Focus' | 'Break';
  time: number;
  initialTime: number;
  startTime?: Date;
}

export interface TimerSettings {
  focusSessionLength: number;
  breakLength: number;
  breakReminders: boolean;
  tickSound?: boolean;
}

export class TimerService {
  private static instance: TimerService;
  private state: TimerState;
  private settings: TimerSettings;
  private listeners: ((state: TimerState) => void)[] = [];
  private intervalRef: NodeJS.Timeout | null = null;
  private tickSoundEnabled: boolean = false;

  private constructor() {
    this.settings = {
      focusSessionLength: 25,
      breakLength: 5,
      breakReminders: true,
      tickSound: false
    };
    
    this.state = {
      isActive: false,
      isPaused: false,
      sessionType: 'Focus',
      time: this.settings.focusSessionLength * 60,
      initialTime: this.settings.focusSessionLength * 60
    };
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
    
    // Check if focus or break length changed
    const focusChanged = oldSettings.focusSessionLength !== this.settings.focusSessionLength;
    const breakChanged = oldSettings.breakLength !== this.settings.breakLength;
    
    // Update timer times if not active and not paused, OR if the current session type changed
    if (!this.state.isActive && !this.state.isPaused) {
      if (this.state.sessionType === 'Focus' && focusChanged) {
        const newTime = this.settings.focusSessionLength * 60;
        this.state.time = newTime;
        this.state.initialTime = newTime;
        this.notifyListeners();
      } else if (this.state.sessionType === 'Break' && breakChanged) {
        const newTime = this.settings.breakLength * 60;
        this.state.time = newTime;
        this.state.initialTime = newTime;
        this.notifyListeners();
      }
    }
  }

  public start(): void {
    if (this.state.isActive) return;

    this.state.isActive = true;
    this.state.isPaused = false;
    this.state.startTime = new Date();
    
    this.startInterval();
    this.notifyListeners();
  }

  public pause(): void {
    if (!this.state.isActive) return;

    this.state.isActive = false;
    this.state.isPaused = true;
    
    this.clearInterval();
    this.notifyListeners();
  }

  public resume(): void {
    if (this.state.isActive || !this.state.isPaused) return;

    this.state.isActive = true;
    this.state.isPaused = false;
    
    this.startInterval();
    this.notifyListeners();
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
    
    this.clearInterval();
    this.notifyListeners();
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
      this.notifyListeners();
    }
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
    
    this.clearInterval();

    // Play completion sound
    this.playCompletionSound();

    // Show notification if enabled
    if (this.settings.breakReminders) {
      this.showNotification();
    }

    // Auto-switch between focus and break
    setTimeout(() => {
      if (this.state.sessionType === 'Focus') {
        this.state.sessionType = 'Break';
        const breakTime = this.settings.breakLength * 60;
        this.state.time = breakTime;
        this.state.initialTime = breakTime;
      } else {
        this.state.sessionType = 'Focus';
        const focusTime = this.settings.focusSessionLength * 60;
        this.state.time = focusTime;
        this.state.initialTime = focusTime;
      }
      this.notifyListeners();
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
      if (this.state.sessionType === 'Focus') {
        new Notification('Focus session complete!', {
          body: `Time for a ${this.settings.breakLength}-minute break.`,
          icon: '/BrainwaveShift.png'
        });
      } else {
        new Notification('Break time over!', {
          body: 'Ready to start another focus session?',
          icon: '/BrainwaveShift.png'
        });
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

  public cleanup(): void {
    this.clearInterval();
    this.listeners = [];
  }
}

// Singleton instance
export const timerService = TimerService.getInstance();