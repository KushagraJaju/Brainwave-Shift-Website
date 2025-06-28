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
    volume: 0.5, // Default to 50% volume
    focusCompleteSound: 'chime', // Default to gentle chime for focus
    breakCompleteSound: 'pop' // Default to soft pop for break
  };

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext(): void {
    try {
      // Only create AudioContext on demand to avoid autoplay policy issues
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  // Generate success sound (rising tone with harmonics)
  private createSuccessSound(): void {
    if (!this.audioContext || !this.settings.enabled) return;

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create oscillators for a rich sound
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();

      // Connect nodes
      oscillator1.connect(filterNode);
      oscillator2.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure oscillators for a pleasant rising tone
      oscillator1.type = 'sine';
      oscillator1.frequency.setValueAtTime(440, this.audioContext.currentTime);
      oscillator1.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.5);

      oscillator2.type = 'triangle';
      oscillator2.frequency.setValueAtTime(550, this.audioContext.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(1100, this.audioContext.currentTime + 0.5);

      // Configure filter for warmth
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime);
      filterNode.Q.setValueAtTime(1, this.audioContext.currentTime);

      // Configure envelope for natural sound
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.3, this.audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.2);

      // Play sound
      oscillator1.start(this.audioContext.currentTime);
      oscillator2.start(this.audioContext.currentTime);
      oscillator1.stop(this.audioContext.currentTime + 1.2);
      oscillator2.stop(this.audioContext.currentTime + 1.2);
    } catch (error) {
      console.error('Failed to create success sound:', error);
    }
  }

  // Generate gentle chime sound with harmonics
  private createChimeSound(): void {
    if (!this.audioContext || !this.settings.enabled) return;

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create a chord with harmonics for a rich chime sound
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
      const duration = 1.5;

      frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        const filterNode = this.audioContext!.createBiquadFilter();

        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        // Mix sine and triangle waves for richer tone
        oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
        oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime);

        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(3000, this.audioContext!.currentTime);

        const startTime = this.audioContext!.currentTime + (index * 0.08);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.15, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } catch (error) {
      console.error('Failed to create chime sound:', error);
    }
  }

  // Generate water drop notification sound
  private createNotificationSound(): void {
    if (!this.audioContext || !this.settings.enabled) return;

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create oscillator for the main tone
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();

      // Connect nodes
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure for water drop sound
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

      // Filter for warmth
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(3000, this.audioContext.currentTime);
      filterNode.Q.setValueAtTime(8, this.audioContext.currentTime);

      // Envelope for pluck effect
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.2, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

      // Play sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);

      // Add a subtle echo
      setTimeout(() => {
        if (!this.audioContext) return;
        
        const echoOsc = this.audioContext.createOscillator();
        const echoGain = this.audioContext.createGain();
        const echoFilter = this.audioContext.createBiquadFilter();
        
        echoOsc.connect(echoFilter);
        echoFilter.connect(echoGain);
        echoGain.connect(this.audioContext.destination);
        
        echoOsc.type = 'sine';
        echoOsc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        echoOsc.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.1);
        
        echoFilter.type = 'lowpass';
        echoFilter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        
        echoGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        echoGain.gain.linearRampToValueAtTime(this.settings.volume * 0.05, this.audioContext.currentTime + 0.01);
        echoGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
        
        echoOsc.start(this.audioContext.currentTime);
        echoOsc.stop(this.audioContext.currentTime + 0.2);
      }, 150);
    } catch (error) {
      console.error('Failed to create notification sound:', error);
    }
  }

  // Generate a soft pop sound
  private createPopSound(): void {
    if (!this.audioContext || !this.settings.enabled) return;

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create oscillator for the main tone
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();

      // Connect nodes
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure for pop sound
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.2);

      // Filter for warmth
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      filterNode.Q.setValueAtTime(2, this.audioContext.currentTime);

      // Envelope for pop effect
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

      // Play sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.error('Failed to create pop sound:', error);
    }
  }

  // Generate a soft wooden tick sound
  private createWoodTickSound(): void {
    if (!this.audioContext || !this.settings.enabled) return;

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create oscillator for the main tone
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();

      // Connect nodes
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure for wooden tick sound
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(180, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(120, this.audioContext.currentTime + 0.03);

      // Filter for wooden quality
      filterNode.type = 'bandpass';
      filterNode.frequency.setValueAtTime(800, this.audioContext.currentTime);
      filterNode.Q.setValueAtTime(1.5, this.audioContext.currentTime);

      // Very short envelope for tick effect
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.settings.volume * 0.08, this.audioContext.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);

      // Play sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.05);
    } catch (error) {
      console.error('Failed to create wood tick sound:', error);
    }
  }

  // Public methods for playing sounds
  public playFocusCompleteSound(): void {
    if (!this.settings.enabled) return;
    
    // Initialize audio context if needed
    this.initializeAudioContext();
    
    // Resume audio context if suspended (required by some browsers)
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    switch (this.settings.focusCompleteSound) {
      case 'success':
        this.createSuccessSound();
        break;
      case 'chime':
        this.createChimeSound();
        break;
      case 'pop':
        this.createPopSound();
        break;
      default:
        this.createChimeSound(); // Default to chime sound
    }
  }

  public playBreakCompleteSound(): void {
    if (!this.settings.enabled) return;
    
    // Initialize audio context if needed
    this.initializeAudioContext();
    
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
      case 'pop':
        this.createPopSound();
        break;
      default:
        this.createPopSound(); // Default to pop sound
    }
  }

  public playTickSound(): void {
    if (!this.settings.enabled || !this.settings.tickSound) return;
    
    // Initialize audio context if needed
    this.initializeAudioContext();
    
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    // Very subtle tick sound
    this.createWoodTickSound();
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

  public testTickSound(): void {
    const originalEnabled = this.settings.enabled;
    const originalTickSound = this.settings.tickSound;
    this.settings.enabled = true;
    this.settings.tickSound = 'enabled';
    this.playTickSound();
    this.settings.enabled = originalEnabled;
    this.settings.tickSound = originalTickSound;
  }

  // Initialize audio context on user interaction (required by browsers)
  public initializeOnUserInteraction(): void {
    this.initializeAudioContext();
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// Singleton instance
export const soundService = new SoundService();