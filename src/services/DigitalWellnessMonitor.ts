export interface SocialMediaActivity {
  platform: string;
  domain: string;
  timeSpent: number; // milliseconds
  scrollEvents: number;
  clickEvents: number;
  lastActivity: Date;
  sessionStart: Date;
  scrollVelocity: number; // pixels per second
  engagementScore: number; // 0-100, higher = more intentional
}

export interface DailyDigitalData {
  date: string; // YYYY-MM-DD format
  totalSocialMediaTime: number;
  platformBreakdown: Map<string, number>;
  mindlessScrollingSessions: number;
  mindfulBreaksTaken: number;
  longestSession: number;
  averageSessionLength: number;
  cognitiveImpactScore: number;
  peakUsageHours: number[];
  sessionCount: number;
}

export interface WeeklyDigitalTrends {
  averageDailyUsage: number;
  totalWeeklyUsage: number;
  mostUsedPlatform: string;
  mostUsedDay: string;
  leastUsedDay: string;
  weeklyMindfulBreaks: number;
  weeklyMindlessSessions: number;
  averageCognitiveImpact: number;
  usageTrend: 'increasing' | 'decreasing' | 'stable';
  peakUsageDays: string[];
  platformTrends: Map<string, { trend: 'up' | 'down' | 'stable'; change: number }>;
}

export interface DigitalWellnessData {
  // Current day data
  dailySocialMediaTime: number;
  platformBreakdown: Map<string, number>;
  mindlessScrollingSessions: number;
  mindfulBreaksTaken: number;
  longestSession: number;
  averageSessionLength: number;
  cognitiveImpactScore: number;
  lastUpdate: Date;
  
  // Weekly historical data
  weeklyData: DailyDigitalData[];
  weeklyTrends: WeeklyDigitalTrends;
  
  // Additional analytics
  peakUsageHours: number[];
  sessionCount: number;
  averageEngagementScore: number;
}

export interface DigitalWellnessSettings {
  enableMonitoring: boolean;
  timeThresholds: {
    gentle: number; // 15 minutes default
    moderate: number; // 30 minutes default
    firm: number; // 60 minutes default
  };
  platformLimits: Map<string, number>;
  focusModeEnabled: boolean;
  focusModeSchedule: { start: string; end: string }[];
  interventionStyle: 'gentle' | 'moderate' | 'firm';
  whitelistedDomains: string[];
  enableCorrelationTracking: boolean;
}

export class DigitalWellnessMonitor {
  private socialMediaPlatforms = new Map([
    ['instagram.com', 'Instagram'],
    ['youtube.com', 'YouTube'],
    ['tiktok.com', 'TikTok'],
    ['twitter.com', 'Twitter'],
    ['x.com', 'Twitter'],
    ['facebook.com', 'Facebook'],
    ['reddit.com', 'Reddit'],
    ['linkedin.com', 'LinkedIn'],
    ['snapchat.com', 'Snapchat'],
    ['pinterest.com', 'Pinterest'],
    ['twitch.tv', 'Twitch']
  ]);

  private currentActivity: SocialMediaActivity | null = null;
  private dailyData: DigitalWellnessData;
  private settings: DigitalWellnessSettings;
  private isMonitoring: boolean = false;
  private listeners: ((data: DigitalWellnessData) => void)[] = [];
  private interventionListeners: ((intervention: any) => void)[] = [];
  private scrollBuffer: { timestamp: number; scrollY: number }[] = [];
  private lastInterventionTime: Date = new Date(0);
  private interventionEscalationLevel: number = 0;
  private sessionEngagementScores: number[] = [];

  // Updated timing constants for 15-second monitoring cycle
  private readonly FOCUS_MODE_CHECK_INTERVAL = 15000; // 15 seconds (updated from 30 seconds)
  private readonly PEAK_USAGE_CHECK_INTERVAL = 60000; // 1 minute
  private readonly MINDLESS_SCROLLING_TIMEOUT = 2000; // 2 seconds
  private readonly MIN_INTERVENTION_INTERVAL = 5 * 60 * 1000; // 5 minutes minimum between interventions

  constructor() {
    this.dailyData = this.getInitialData();
    this.settings = this.getDefaultSettings();
    this.loadHistoricalData();
    this.setupEventListeners();
  }

  private getInitialData(): DigitalWellnessData {
    return {
      dailySocialMediaTime: 0,
      platformBreakdown: new Map(),
      mindlessScrollingSessions: 0,
      mindfulBreaksTaken: 0,
      longestSession: 0,
      averageSessionLength: 0,
      cognitiveImpactScore: 0,
      lastUpdate: new Date(),
      weeklyData: [],
      weeklyTrends: this.getInitialWeeklyTrends(),
      peakUsageHours: [],
      sessionCount: 0,
      averageEngagementScore: 0
    };
  }

  private getInitialWeeklyTrends(): WeeklyDigitalTrends {
    return {
      averageDailyUsage: 0,
      totalWeeklyUsage: 0,
      mostUsedPlatform: '',
      mostUsedDay: '',
      leastUsedDay: '',
      weeklyMindfulBreaks: 0,
      weeklyMindlessSessions: 0,
      averageCognitiveImpact: 0,
      usageTrend: 'stable',
      peakUsageDays: [],
      platformTrends: new Map()
    };
  }

  private loadHistoricalData(): void {
    // Generate realistic weekly data for the past 7 days
    const weeklyData: DailyDigitalData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Generate realistic usage patterns
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseUsage = isWeekend ? 90 : 60; // Weekend vs weekday usage
      const variance = Math.random() * 40 - 20; // ±20 minutes variance
      const totalTime = Math.max(0, (baseUsage + variance) * 60 * 1000); // Convert to milliseconds
      
      // Generate platform breakdown
      const platformBreakdown = new Map();
      const platforms = ['Instagram', 'YouTube', 'Twitter', 'TikTok', 'Reddit'];
      let remainingTime = totalTime;
      
      platforms.forEach((platform, index) => {
        if (index === platforms.length - 1) {
          platformBreakdown.set(platform, remainingTime);
        } else {
          const platformTime = Math.random() * (remainingTime * 0.4);
          platformBreakdown.set(platform, platformTime);
          remainingTime -= platformTime;
        }
      });
      
      // Generate other metrics
      const sessionCount = Math.floor(totalTime / (15 * 60 * 1000)) + Math.floor(Math.random() * 3); // ~15min per session
      const mindlessRatio = 0.2 + Math.random() * 0.3; // 20-50% mindless sessions
      const mindfulBreaks = Math.floor(Math.random() * 5) + (i === 0 ? this.dailyData.mindfulBreaksTaken : 0);
      
      weeklyData.push({
        date: dateString,
        totalSocialMediaTime: totalTime,
        platformBreakdown,
        mindlessScrollingSessions: Math.floor(sessionCount * mindlessRatio),
        mindfulBreaksTaken: mindfulBreaks,
        longestSession: totalTime > 0 ? Math.max(15 * 60 * 1000, totalTime * (0.3 + Math.random() * 0.4)) : 0,
        averageSessionLength: sessionCount > 0 ? totalTime / sessionCount : 0,
        cognitiveImpactScore: Math.max(20, Math.min(100, 80 - (totalTime / (60 * 60 * 1000)) * 15)), // Decreases with usage
        peakUsageHours: this.generatePeakHours(isWeekend),
        sessionCount
      });
    }
    
    this.dailyData.weeklyData = weeklyData;
    this.calculateWeeklyTrends();
  }

  private generatePeakHours(isWeekend: boolean): number[] {
    const peakHours: number[] = [];
    
    if (isWeekend) {
      // Weekend patterns: late morning, afternoon, evening
      if (Math.random() > 0.3) peakHours.push(10, 11); // Late morning
      if (Math.random() > 0.4) peakHours.push(14, 15, 16); // Afternoon
      if (Math.random() > 0.2) peakHours.push(20, 21, 22); // Evening
    } else {
      // Weekday patterns: lunch break, evening
      if (Math.random() > 0.5) peakHours.push(12, 13); // Lunch break
      if (Math.random() > 0.3) peakHours.push(18, 19, 20); // After work
      if (Math.random() > 0.6) peakHours.push(22, 23); // Late evening
    }
    
    return peakHours;
  }

  private calculateWeeklyTrends(): void {
    const weeklyData = this.dailyData.weeklyData;
    if (weeklyData.length === 0) return;

    // Calculate basic weekly stats
    const totalWeeklyUsage = weeklyData.reduce((sum, day) => sum + day.totalSocialMediaTime, 0);
    const averageDailyUsage = totalWeeklyUsage / weeklyData.length;
    const weeklyMindfulBreaks = weeklyData.reduce((sum, day) => sum + day.mindfulBreaksTaken, 0);
    const weeklyMindlessSessions = weeklyData.reduce((sum, day) => sum + day.mindlessScrollingSessions, 0);
    const averageCognitiveImpact = weeklyData.reduce((sum, day) => sum + day.cognitiveImpactScore, 0) / weeklyData.length;

    // Find most/least used days
    const sortedByUsage = [...weeklyData].sort((a, b) => b.totalSocialMediaTime - a.totalSocialMediaTime);
    const mostUsedDay = this.formatDayName(sortedByUsage[0].date);
    const leastUsedDay = this.formatDayName(sortedByUsage[sortedByUsage.length - 1].date);

    // Calculate usage trend
    const firstHalf = weeklyData.slice(0, Math.ceil(weeklyData.length / 2));
    const secondHalf = weeklyData.slice(Math.floor(weeklyData.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.totalSocialMediaTime, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.totalSocialMediaTime, 0) / secondHalf.length;
    
    let usageTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const trendThreshold = 0.15; // 15% change threshold
    const changeRatio = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;
    
    if (changeRatio > trendThreshold) usageTrend = 'increasing';
    else if (changeRatio < -trendThreshold) usageTrend = 'decreasing';

    // Find peak usage days (above average)
    const peakUsageDays = weeklyData
      .filter(day => day.totalSocialMediaTime > averageDailyUsage * 1.2)
      .map(day => this.formatDayName(day.date));

    // Calculate most used platform
    const platformTotals = new Map<string, number>();
    weeklyData.forEach(day => {
      day.platformBreakdown.forEach((time, platform) => {
        platformTotals.set(platform, (platformTotals.get(platform) || 0) + time);
      });
    });
    
    const mostUsedPlatform = Array.from(platformTotals.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Calculate platform trends
    const platformTrends = new Map<string, { trend: 'up' | 'down' | 'stable'; change: number }>();
    platformTotals.forEach((_, platform) => {
      const firstHalfPlatform = firstHalf.reduce((sum, day) => sum + (day.platformBreakdown.get(platform) || 0), 0);
      const secondHalfPlatform = secondHalf.reduce((sum, day) => sum + (day.platformBreakdown.get(platform) || 0), 0);
      
      if (firstHalfPlatform > 0) {
        const platformChange = ((secondHalfPlatform - firstHalfPlatform) / firstHalfPlatform) * 100;
        let trend: 'up' | 'down' | 'stable' = 'stable';
        
        if (platformChange > 20) trend = 'up';
        else if (platformChange < -20) trend = 'down';
        
        platformTrends.set(platform, { trend, change: Math.round(platformChange) });
      }
    });

    this.dailyData.weeklyTrends = {
      averageDailyUsage,
      totalWeeklyUsage,
      mostUsedPlatform,
      mostUsedDay,
      leastUsedDay,
      weeklyMindfulBreaks,
      weeklyMindlessSessions,
      averageCognitiveImpact,
      usageTrend,
      peakUsageDays,
      platformTrends
    };
  }

  private formatDayName(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  private getDefaultSettings(): DigitalWellnessSettings {
    return {
      enableMonitoring: true,
      timeThresholds: {
        gentle: 15 * 60 * 1000, // 15 minutes
        moderate: 30 * 60 * 1000, // 30 minutes
        firm: 60 * 60 * 1000 // 60 minutes
      },
      platformLimits: new Map(),
      focusModeEnabled: false,
      focusModeSchedule: [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' }
      ],
      interventionStyle: 'gentle',
      whitelistedDomains: [],
      enableCorrelationTracking: true
    };
  }

  private setupEventListeners(): void {
    // Monitor URL changes
    let currentUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        this.handleUrlChange(currentUrl, window.location.href);
        currentUrl = window.location.href;
      }
    });

    urlObserver.observe(document, { subtree: true, childList: true });

    // Monitor scrolling behavior
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      if (!this.isMonitoring || !this.currentActivity) return;

      const now = Date.now();
      const scrollY = window.scrollY;
      
      this.scrollBuffer.push({ timestamp: now, scrollY });
      
      // Keep only last 10 scroll events for velocity calculation
      if (this.scrollBuffer.length > 10) {
        this.scrollBuffer.shift();
      }

      this.currentActivity.scrollEvents++;
      this.calculateScrollVelocity();
      this.updateEngagementScore();

      // Clear existing timeout and set new one
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.checkForMindlessScrolling();
      }, this.MINDLESS_SCROLLING_TIMEOUT);
    });

    // Monitor clicks and interactions
    document.addEventListener('click', () => {
      if (!this.isMonitoring || !this.currentActivity) return;
      
      this.currentActivity.clickEvents++;
      this.updateEngagementScore();
    });

    // Monitor focus/blur for session tracking
    window.addEventListener('blur', () => {
      this.endCurrentSession();
    });

    window.addEventListener('focus', () => {
      this.checkCurrentUrl();
    });

    // Check for focus mode violations - updated to 15-second intervals
    setInterval(() => {
      this.checkFocusMode();
    }, this.FOCUS_MODE_CHECK_INTERVAL);

    // Update peak usage hours
    setInterval(() => {
      this.updatePeakUsageHours();
    }, this.PEAK_USAGE_CHECK_INTERVAL);
  }

  private updatePeakUsageHours(): void {
    if (!this.currentActivity) return;
    
    const currentHour = new Date().getHours();
    if (!this.dailyData.peakUsageHours.includes(currentHour)) {
      // Add hour if we've been active for more than 10 minutes this hour
      const hourStart = new Date();
      hourStart.setMinutes(0, 0, 0);
      const timeInCurrentHour = Date.now() - hourStart.getTime();
      
      if (timeInCurrentHour > 10 * 60 * 1000) { // 10 minutes
        this.dailyData.peakUsageHours.push(currentHour);
      }
    }
  }

  private handleUrlChange(oldUrl: string, newUrl: string): void {
    this.endCurrentSession();
    this.checkCurrentUrl();
  }

  private checkCurrentUrl(): void {
    if (!this.settings.enableMonitoring) return;

    const currentDomain = this.extractDomain(window.location.href);
    const platform = this.socialMediaPlatforms.get(currentDomain);

    if (platform && !this.isWhitelisted(currentDomain)) {
      this.startSocialMediaSession(platform, currentDomain);
    }
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  private isWhitelisted(domain: string): boolean {
    return this.settings.whitelistedDomains.includes(domain);
  }

  private startSocialMediaSession(platform: string, domain: string): void {
    const now = new Date();
    
    this.currentActivity = {
      platform,
      domain,
      timeSpent: 0,
      scrollEvents: 0,
      clickEvents: 0,
      lastActivity: now,
      sessionStart: now,
      scrollVelocity: 0,
      engagementScore: 50 // Start neutral
    };

    this.dailyData.sessionCount++;

    // Start session timer
    const sessionTimer = setInterval(() => {
      if (!this.currentActivity) {
        clearInterval(sessionTimer);
        return;
      }

      this.currentActivity.timeSpent += 1000; // Add 1 second
      this.updateDailyData();
      this.checkTimeThresholds();
    }, 1000);
  }

  private endCurrentSession(): void {
    if (!this.currentActivity) return;

    const sessionLength = this.currentActivity.timeSpent;
    
    // Update daily statistics
    this.dailyData.dailySocialMediaTime += sessionLength;
    
    const currentPlatformTime = this.dailyData.platformBreakdown.get(this.currentActivity.platform) || 0;
    this.dailyData.platformBreakdown.set(this.currentActivity.platform, currentPlatformTime + sessionLength);

    if (sessionLength > this.dailyData.longestSession) {
      this.dailyData.longestSession = sessionLength;
    }

    // Track engagement scores
    this.sessionEngagementScores.push(this.currentActivity.engagementScore);
    this.dailyData.averageEngagementScore = this.sessionEngagementScores.reduce((a, b) => a + b, 0) / this.sessionEngagementScores.length;

    // Check if session was mindless
    if (this.currentActivity.engagementScore < 30 && sessionLength > 5 * 60 * 1000) {
      this.dailyData.mindlessScrollingSessions++;
    }

    this.calculateAverageSessionLength();
    this.currentActivity = null;
    this.scrollBuffer = [];
    this.notifyListeners();
  }

  private calculateScrollVelocity(): void {
    if (!this.currentActivity || this.scrollBuffer.length < 2) return;

    const recent = this.scrollBuffer.slice(-5); // Last 5 scroll events
    let totalVelocity = 0;
    let validMeasurements = 0;

    for (let i = 1; i < recent.length; i++) {
      const timeDiff = recent[i].timestamp - recent[i - 1].timestamp;
      const scrollDiff = Math.abs(recent[i].scrollY - recent[i - 1].scrollY);
      
      if (timeDiff > 0) {
        totalVelocity += scrollDiff / (timeDiff / 1000); // pixels per second
        validMeasurements++;
      }
    }

    if (validMeasurements > 0) {
      this.currentActivity.scrollVelocity = totalVelocity / validMeasurements;
    }
  }

  private updateEngagementScore(): void {
    if (!this.currentActivity) return;

    const sessionLength = this.currentActivity.timeSpent / 1000; // seconds
    const scrollRate = sessionLength > 0 ? this.currentActivity.scrollEvents / sessionLength : 0;
    const clickRate = sessionLength > 0 ? this.currentActivity.clickEvents / sessionLength : 0;

    // Calculate engagement based on interaction patterns
    let engagementScore = 50; // Base score

    // High scroll velocity suggests mindless scrolling
    if (this.currentActivity.scrollVelocity > 1000) {
      engagementScore -= 20;
    } else if (this.currentActivity.scrollVelocity > 500) {
      engagementScore -= 10;
    }

    // Very high scroll rate suggests mindless scrolling
    if (scrollRate > 2) {
      engagementScore -= 15;
    } else if (scrollRate > 1) {
      engagementScore -= 5;
    }

    // Clicks suggest more intentional engagement
    if (clickRate > 0.1) {
      engagementScore += 15;
    } else if (clickRate > 0.05) {
      engagementScore += 10;
    }

    // Time spent without interaction suggests mindless consumption
    const timeSinceLastActivity = Date.now() - this.currentActivity.lastActivity.getTime();
    if (timeSinceLastActivity > 30000) { // 30 seconds
      engagementScore -= 10;
    }

    this.currentActivity.engagementScore = Math.max(0, Math.min(100, engagementScore));
  }

  private checkForMindlessScrolling(): void {
    if (!this.currentActivity) return;

    const isLowEngagement = this.currentActivity.engagementScore < 30;
    const isHighScrollVelocity = this.currentActivity.scrollVelocity > 800;
    const sessionLength = this.currentActivity.timeSpent;

    if (isLowEngagement && isHighScrollVelocity && sessionLength > 5 * 60 * 1000) {
      this.triggerMindfulnessIntervention('mindless-scrolling');
    }
  }

  private checkTimeThresholds(): void {
    if (!this.currentActivity) return;

    const sessionLength = this.currentActivity.timeSpent;
    const now = Date.now();
    const timeSinceLastIntervention = now - this.lastInterventionTime.getTime();

    // Don't trigger interventions too frequently
    if (timeSinceLastIntervention < this.MIN_INTERVENTION_INTERVAL) return;

    if (sessionLength >= this.settings.timeThresholds.firm) {
      this.triggerMindfulnessIntervention('time-limit-firm');
      this.interventionEscalationLevel = Math.min(3, this.interventionEscalationLevel + 1);
    } else if (sessionLength >= this.settings.timeThresholds.moderate) {
      this.triggerMindfulnessIntervention('time-limit-moderate');
      this.interventionEscalationLevel = Math.min(2, this.interventionEscalationLevel + 1);
    } else if (sessionLength >= this.settings.timeThresholds.gentle) {
      this.triggerMindfulnessIntervention('time-limit-gentle');
      this.interventionEscalationLevel = Math.min(1, this.interventionEscalationLevel + 1);
    }
  }

  private checkFocusMode(): void {
    if (!this.settings.focusModeEnabled || !this.currentActivity) return;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const isInFocusTime = this.settings.focusModeSchedule.some(schedule => {
      return currentTime >= schedule.start && currentTime <= schedule.end;
    });

    if (isInFocusTime) {
      this.triggerMindfulnessIntervention('focus-mode-violation');
    }
  }

  private triggerMindfulnessIntervention(type: string): void {
    const interventions = this.generateInterventionOptions(type);
    const selectedIntervention = interventions[Math.floor(Math.random() * interventions.length)];

    this.lastInterventionTime = new Date();
    
    // Notify intervention listeners
    this.interventionListeners.forEach(listener => listener({
      id: Date.now().toString(),
      type: 'Digital Wellness',
      subtype: type,
      title: selectedIntervention.title,
      description: selectedIntervention.description,
      options: selectedIntervention.options,
      priority: this.getInterventionPriority(type),
      timestamp: new Date(),
      platform: this.currentActivity?.platform,
      sessionLength: this.currentActivity?.timeSpent,
      escalationLevel: this.interventionEscalationLevel
    }));
  }

  private generateInterventionOptions(type: string) {
    const baseInterventions = {
      'mindless-scrolling': [
        {
          title: 'Mindful Moment',
          description: 'Take 3 deep breaths before continuing',
          options: ['Take a breath', 'Set intention', 'Continue mindfully', 'Take a break']
        },
        {
          title: 'Intention Check',
          description: 'What are you hoping to find right now?',
          options: ['Set clear goal', 'Switch to productive task', 'Take a break', 'Continue with purpose']
        }
      ],
      'time-limit-gentle': [
        {
          title: 'Gentle Reminder',
          description: `You've been on ${this.currentActivity?.platform} for ${Math.round((this.currentActivity?.timeSpent || 0) / 60000)} minutes`,
          options: ['Take a 2-minute break', 'Set a timer', 'Switch activities', 'Continue for 5 more minutes']
        }
      ],
      'time-limit-moderate': [
        {
          title: 'Time Check',
          description: 'Consider taking a break to refresh your mind',
          options: ['Take a 5-minute walk', 'Do breathing exercise', 'Switch to work task', 'Set strict timer']
        }
      ],
      'time-limit-firm': [
        {
          title: 'Extended Session Alert',
          description: 'Long social media sessions can impact your cognitive performance',
          options: ['End session now', 'Take 10-minute break', 'Switch to productive activity', 'Set daily limit']
        }
      ],
      'focus-mode-violation': [
        {
          title: 'Focus Mode Active',
          description: 'This is your designated focus time',
          options: ['Return to work', 'Take a proper break', 'Adjust focus schedule', 'Disable focus mode']
        }
      ]
    };

    return baseInterventions[type as keyof typeof baseInterventions] || baseInterventions['mindless-scrolling'];
  }

  private getInterventionPriority(type: string): 'Low' | 'Medium' | 'High' {
    switch (type) {
      case 'focus-mode-violation':
      case 'time-limit-firm':
        return 'High';
      case 'time-limit-moderate':
      case 'mindless-scrolling':
        return 'Medium';
      default:
        return 'Low';
    }
  }

  private updateDailyData(): void {
    this.calculateCognitiveImpactScore();
    this.dailyData.lastUpdate = new Date();
  }

  private calculateAverageSessionLength(): void {
    if (this.dailyData.sessionCount > 0) {
      this.dailyData.averageSessionLength = this.dailyData.dailySocialMediaTime / this.dailyData.sessionCount;
    }
  }

  private calculateCognitiveImpactScore(): void {
    const totalTime = this.dailyData.dailySocialMediaTime / (1000 * 60); // minutes
    const mindlessRatio = this.dailyData.sessionCount > 0 ? this.dailyData.mindlessScrollingSessions / this.dailyData.sessionCount : 0;
    
    // Higher time and mindless ratio = lower cognitive impact score
    let impactScore = 100;
    
    if (totalTime > 120) impactScore -= 30; // 2+ hours
    else if (totalTime > 60) impactScore -= 20; // 1+ hour
    else if (totalTime > 30) impactScore -= 10; // 30+ minutes
    
    impactScore -= mindlessRatio * 20;
    
    // Factor in engagement score
    if (this.dailyData.averageEngagementScore < 40) impactScore -= 15;
    else if (this.dailyData.averageEngagementScore > 70) impactScore += 10;
    
    this.dailyData.cognitiveImpactScore = Math.max(0, Math.min(100, impactScore));
  }

  // Public methods
  public startMonitoring(): void {
    this.isMonitoring = true;
    this.checkCurrentUrl();
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    this.endCurrentSession();
  }

  public isActive(): boolean {
    return this.isMonitoring;
  }

  public getData(): DigitalWellnessData {
    return { ...this.dailyData };
  }

  public getCurrentActivity(): SocialMediaActivity | null {
    return this.currentActivity ? { ...this.currentActivity } : null;
  }

  public getSettings(): DigitalWellnessSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<DigitalWellnessSettings>): void {
    this.settings = { ...this.settings, ...updates };
  }

  public recordMindfulBreak(): void {
    this.dailyData.mindfulBreaksTaken++;
    this.interventionEscalationLevel = Math.max(0, this.interventionEscalationLevel - 1);
    
    // Update today's data in weekly array
    const today = new Date().toISOString().split('T')[0];
    const todayIndex = this.dailyData.weeklyData.findIndex(day => day.date === today);
    if (todayIndex >= 0) {
      this.dailyData.weeklyData[todayIndex].mindfulBreaksTaken = this.dailyData.mindfulBreaksTaken;
    }
    
    this.calculateWeeklyTrends();
    this.notifyListeners();
  }

  public subscribe(callback: (data: DigitalWellnessData) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  public subscribeToInterventions(callback: (intervention: any) => void): () => void {
    this.interventionListeners.push(callback);
    return () => {
      this.interventionListeners = this.interventionListeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getData()));
  }

  public resetDaily(): void {
    this.dailyData = this.getInitialData();
    this.interventionEscalationLevel = 0;
    this.sessionEngagementScores = [];
    this.loadHistoricalData(); // Reload weekly data
    this.notifyListeners();
  }

  // Getter for monitoring intervals (for UI display)
  public getFocusModeCheckInterval(): number {
    return this.FOCUS_MODE_CHECK_INTERVAL;
  }

  public getFocusModeCheckIntervalSeconds(): number {
    return this.FOCUS_MODE_CHECK_INTERVAL / 1000;
  }
}

// Singleton instance
export const digitalWellnessMonitor = new DigitalWellnessMonitor();