import { DeviceIntegration, SmartwatchData, CalendarData, CalendarEvent } from '../types';

export class DeviceIntegrationService {
  private integrations: Map<string, DeviceIntegration> = new Map();
  private smartwatchData: SmartwatchData | null = null;
  private calendarData: CalendarData | null = null;
  private listeners: ((integrations: DeviceIntegration[]) => void)[] = [];
  private dataListeners: ((data: { smartwatch?: SmartwatchData; calendar?: CalendarData }) => void)[] = [];
  private intervals: NodeJS.Timeout[] = [];

  constructor() {
    this.initializeDefaultIntegrations();
  }

  private initializeDefaultIntegrations(): void {
    // Browser integration (always connected)
    this.integrations.set('browser', {
      id: 'browser',
      name: 'Browser Integration',
      type: 'browser',
      status: 'connected',
      provider: 'Built-in',
      lastSync: new Date(),
      dataTypes: ['Tab focus', 'Keyboard patterns', 'Mouse activity'],
      privacyLevel: 'standard'
    });

    // Smartwatch integration (initially disconnected)
    this.integrations.set('smartwatch', {
      id: 'smartwatch',
      name: 'Smartwatch',
      type: 'smartwatch',
      status: 'disconnected',
      dataTypes: ['Heart rate', 'Sleep data', 'Activity levels', 'Stress indicators'],
      privacyLevel: 'minimal'
    });

    // Calendar integration (initially disconnected)
    this.integrations.set('calendar', {
      id: 'calendar',
      name: 'Calendar',
      type: 'calendar',
      status: 'disconnected',
      dataTypes: ['Meeting schedules', 'Focus blocks', 'Deadlines', 'Availability'],
      privacyLevel: 'standard'
    });
  }

  public getIntegrations(): DeviceIntegration[] {
    return Array.from(this.integrations.values());
  }

  public getIntegration(id: string): DeviceIntegration | undefined {
    return this.integrations.get(id);
  }

  public async connectSmartwatch(provider: string): Promise<boolean> {
    const integration = this.integrations.get('smartwatch');
    if (!integration) return false;

    // Simulate connection process
    integration.status = 'connecting';
    this.notifyListeners();

    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate connection delay

    integration.status = 'connected';
    integration.provider = provider;
    integration.lastSync = new Date();
    this.integrations.set('smartwatch', integration);

    // Start generating mock smartwatch data
    this.startSmartwatchDataGeneration();
    this.notifyListeners();
    return true;
  }

  public async connectCalendar(provider: string): Promise<boolean> {
    const integration = this.integrations.get('calendar');
    if (!integration) return false;

    // Simulate connection process
    integration.status = 'connecting';
    this.notifyListeners();

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate connection delay

    integration.status = 'connected';
    integration.provider = provider;
    integration.lastSync = new Date();
    this.integrations.set('calendar', integration);

    // Start generating mock calendar data
    this.startCalendarDataGeneration();
    this.notifyListeners();
    return true;
  }

  public disconnectDevice(deviceId: string): void {
    const integration = this.integrations.get(deviceId);
    if (!integration || integration.type === 'browser') return; // Can't disconnect browser

    integration.status = 'disconnected';
    integration.provider = undefined;
    integration.lastSync = undefined;
    this.integrations.set(deviceId, integration);

    // Stop data generation
    if (deviceId === 'smartwatch') {
      this.smartwatchData = null;
      this.stopSmartwatchDataGeneration();
    } else if (deviceId === 'calendar') {
      this.calendarData = null;
      this.stopCalendarDataGeneration();
    }

    this.notifyListeners();
    this.notifyDataListeners();
  }

  private startSmartwatchDataGeneration(): void {
    // Generate initial data
    this.generateSmartwatchData();

    // Update data every 30 seconds
    const interval = setInterval(() => {
      this.generateSmartwatchData();
      this.notifyDataListeners();
    }, 30000);

    this.intervals.push(interval);
  }

  private stopSmartwatchDataGeneration(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }

  private generateSmartwatchData(): void {
    const now = new Date();
    const hour = now.getHours();
    
    // Generate realistic heart rate based on time of day and activity
    let baseHeartRate = 65;
    if (hour >= 9 && hour <= 17) {
      baseHeartRate = 70; // Work hours - slightly elevated
    } else if (hour >= 18 && hour <= 22) {
      baseHeartRate = 75; // Evening - more active
    } else {
      baseHeartRate = 60; // Rest periods
    }

    const heartRate = baseHeartRate + Math.floor(Math.random() * 15) - 7; // ±7 bpm variation
    const heartRateVariability = 25 + Math.floor(Math.random() * 50); // 25-75ms
    
    // Sleep score based on previous night (simulated)
    const sleepScore = 70 + Math.floor(Math.random() * 25); // 70-95%
    
    // Stress level based on heart rate variability and time
    let stressLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (heartRateVariability < 35 || (hour >= 14 && hour <= 16)) {
      stressLevel = 'High'; // Afternoon stress peak
    } else if (heartRateVariability < 50 || heartRate > 80) {
      stressLevel = 'Medium';
    }

    // Activity level (0-100)
    const activityLevel = Math.max(0, Math.min(100, 
      30 + Math.floor(Math.random() * 40) + (hour >= 9 && hour <= 17 ? 20 : 0)
    ));

    this.smartwatchData = {
      heartRate,
      heartRateVariability,
      sleepScore,
      stressLevel,
      activityLevel,
      lastUpdate: now
    };
  }

  private startCalendarDataGeneration(): void {
    // Generate initial calendar data
    this.generateCalendarData();

    // Update calendar data every 5 minutes
    const interval = setInterval(() => {
      this.generateCalendarData();
      this.notifyDataListeners();
    }, 300000);

    this.intervals.push(interval);
  }

  private stopCalendarDataGeneration(): void {
    // Calendar intervals are shared with smartwatch, so we only clear if both are disconnected
    if (!this.smartwatchData) {
      this.intervals.forEach(interval => clearInterval(interval));
      this.intervals = [];
    }
  }

  private generateCalendarData(): void {
    const now = new Date();
    const events: CalendarEvent[] = [];
    
    // Generate events for the next 3 days
    for (let day = 0; day < 3; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      
      // Generate 3-8 events per day
      const eventCount = 3 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < eventCount; i++) {
        const startHour = 9 + Math.floor(Math.random() * 9); // 9 AM to 6 PM
        const duration = [30, 60, 90, 120][Math.floor(Math.random() * 4)]; // 30min to 2h
        
        const startTime = new Date(date);
        startTime.setHours(startHour, Math.random() > 0.5 ? 0 : 30, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + duration);
        
        const eventTypes = ['meeting', 'focus-block', 'break', 'deadline'] as const;
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        const titles = {
          meeting: ['Team Standup', 'Client Review', 'Project Planning', 'Strategy Session', '1:1 with Manager'],
          'focus-block': ['Deep Work Block', 'Code Review', 'Design Session', 'Research Time', 'Writing Block'],
          break: ['Lunch Break', 'Coffee Break', 'Walk Break', 'Meditation', 'Gym Session'],
          deadline: ['Project Deadline', 'Report Due', 'Presentation Prep', 'Code Freeze', 'Review Deadline']
        };
        
        events.push({
          id: `event-${day}-${i}`,
          title: titles[eventType][Math.floor(Math.random() * titles[eventType].length)],
          startTime,
          endTime,
          type: eventType,
          attendees: eventType === 'meeting' ? 2 + Math.floor(Math.random() * 8) : undefined,
          isOnline: Math.random() > 0.3 // 70% online meetings
        });
      }
    }

    // Sort events by start time
    events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    // Calculate meeting density for today
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === now.toDateString();
    });

    const meetingCount = todayEvents.filter(e => e.type === 'meeting').length;
    let meetingDensity: 'low' | 'medium' | 'high' = 'low';
    if (meetingCount >= 6) meetingDensity = 'high';
    else if (meetingCount >= 3) meetingDensity = 'medium';

    // Calculate available focus time
    const workingHours = 8 * 60; // 8 hours in minutes
    const meetingTime = todayEvents
      .filter(e => e.type === 'meeting')
      .reduce((total, event) => {
        return total + (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60);
      }, 0);
    
    const focusTimeAvailable = Math.max(0, workingHours - meetingTime);

    // Get upcoming deadlines
    const upcomingDeadlines = events
      .filter(e => e.type === 'deadline' && e.startTime > now)
      .slice(0, 3);

    // Generate insights
    const insights: string[] = [];
    if (meetingDensity === 'high') {
      insights.push('Heavy meeting day ahead - consider blocking focus time');
    }
    if (focusTimeAvailable < 120) {
      insights.push('Limited focus time available - prioritize important tasks');
    }
    if (upcomingDeadlines.length > 0) {
      insights.push(`${upcomingDeadlines.length} deadline(s) approaching this week`);
    }
    if (meetingDensity === 'low') {
      insights.push('Great day for deep work - minimal meeting interruptions');
    }

    this.calendarData = {
      events,
      meetingDensity,
      focusTimeAvailable,
      upcomingDeadlines,
      insights,
      lastSync: new Date()
    };
  }

  public getSmartwatchData(): SmartwatchData | null {
    return this.smartwatchData;
  }

  public getCalendarData(): CalendarData | null {
    return this.calendarData;
  }

  public updatePrivacyLevel(deviceId: string, level: 'minimal' | 'standard' | 'full'): void {
    const integration = this.integrations.get(deviceId);
    if (integration) {
      integration.privacyLevel = level;
      this.integrations.set(deviceId, integration);
      this.notifyListeners();
    }
  }

  public subscribe(callback: (integrations: DeviceIntegration[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  public subscribeToData(callback: (data: { smartwatch?: SmartwatchData; calendar?: CalendarData }) => void): () => void {
    this.dataListeners.push(callback);
    return () => {
      this.dataListeners = this.dataListeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getIntegrations()));
  }

  private notifyDataListeners(): void {
    this.dataListeners.forEach(listener => 
      listener({
        smartwatch: this.smartwatchData || undefined,
        calendar: this.calendarData || undefined
      })
    );
  }

  public cleanup(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }
}

// Singleton instance
export const deviceIntegrationService = new DeviceIntegrationService();