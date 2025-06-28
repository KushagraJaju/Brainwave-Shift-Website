export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0-1
  focusCompleteSound: string;
  breakCompleteSound: string;
  tickSound?: string;
}

export class SoundService {
  private audioContext: AudioContext | null = null;
  private settings: SoundSettings = {
    enabled: true,
    volume: 0.7,
    focusCompleteSound: 'chime',
    breakCompleteSound: 'chime'
  };

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  // Generate pleasant bell sound using Web Audio API
  private createBellSound(frequency: number = 800, duration: number = 2): void {
    if (!this.audioContext || !this.settings.enabled) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();

      // Connect nodes
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure oscillator for bell-like sound
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, this.audioContext.currentTime + duration);

      // Configure filter for warmth
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime);
      filterNode.Q.setValueAtTime(1, this.audioContext.currentTime);

      // Configure envelope for natural decay
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      // Play sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.error('Failed to create bell sound:', error);
    }
  }

  // Generate gentle chime sound
  private createChimeSound(): void {
    if (!this.audioContext || !this.settings.enabled) return;

    try {
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 chord
      const duration = 1.5;

      frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        const filterNode = this.audioContext!.createBiquadFilter();

        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime);

        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(3000, this.audioContext!.currentTime);

        const startTime = this.audioContext!.currentTime + (index * 0.1);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.2, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } catch (error) {
      console.error('Failed to create chime sound:', error);
    }
  }

  // Generate subtle notification sound
  private createNotificationSound(): void {
    if (!this.audioContext || !this.settings.enabled) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.15, this.audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Failed to create notification sound:', error);
    }
  }

  // Public methods for playing sounds
  public playFocusCompleteSound(): void {
    if (!this.settings.enabled) return;
    
    // Resume audio context if suspended (required by some browsers)
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    switch (this.settings.focusCompleteSound) {
      case 'bell':
        this.createBellSound(800, 2.5);
        break;
      case 'chime':
        this.createChimeSound();
        break;
      default:
        this.createChimeSound(); // Default to chime
    }
  }

  public playBreakCompleteSound(): void {
    if (!this.settings.enabled) return;
    
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    switch (this.settings.breakCompleteSound) {
      case 'chime':
        this.createChimeSound();
        break;
      case 'notification':
        this.createNotificationSound();
        break;
      case 'bell':
        this.createBellSound(600, 1.5);
        break;
      default:
        this.createChimeSound(); // Default to chime
    }
  }

  public playTickSound(): void {
    if (!this.settings.enabled || !this.settings.tickSound) return;
    
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    // Very subtle tick sound
    try {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, this.audioContext!.currentTime);

      gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.05, this.audioContext!.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.05);

      oscillator.start(this.audioContext!.currentTime);
      oscillator.stop(this.audioContext!.currentTime + 0.05);
    } catch (error) {
      console.error('Failed to create tick sound:', error);
    }
  }

  // Settings management
  public getSettings(): SoundSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<SoundSettings>): void {
    this.settings = { ...this.settings, ...updates };
  }

  public toggleSound(): boolean {
    this.settings.enabled = !this.settings.enabled;
    return this.settings.enabled;
  }

  public setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(1, volume));
  }

  // Test sounds for settings
  public testFocusSound(): void {
    const originalEnabled = this.settings.enabled;
    this.settings.enabled = true;
    this.playFocusCompleteSound();
    this.settings.enabled = originalEnabled;
  }

  public testBreakSound(): void {
    const originalEnabled = this.settings.enabled;
    this.settings.enabled = true;
    this.playBreakCompleteSound();
    this.settings.enabled = originalEnabled;
  }

  // Initialize audio context on user interaction (required by browsers)
  public initializeOnUserInteraction(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// Singleton instance
export const soundService = new SoundService();