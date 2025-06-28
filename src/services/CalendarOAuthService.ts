export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  attendees?: string[];
  location?: string;
  description?: string;
}

export class CalendarOAuthService {
  private static instance: CalendarOAuthService;
  private accessTokens: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): CalendarOAuthService {
    if (!CalendarOAuthService.instance) {
      CalendarOAuthService.instance = new CalendarOAuthService();
    }
    return CalendarOAuthService.instance;
  }

  private getOAuthConfig(provider: 'google' | 'microsoft'): OAuthConfig {
    const baseRedirectUri = `${window.location.origin}/oauth/callback`;
    
    switch (provider) {
      case 'google':
        return {
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id',
          redirectUri: `${baseRedirectUri}/google`,
          scope: 'https://www.googleapis.com/auth/calendar.readonly',
          authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token'
        };
      
      case 'microsoft':
        return {
          clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'your-microsoft-client-id',
          redirectUri: `${baseRedirectUri}/microsoft`,
          scope: 'https://graph.microsoft.com/calendars.read',
          authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
          tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
        };
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  public async initiateOAuth(provider: 'google' | 'microsoft'): Promise<void> {
    const config = this.getOAuthConfig(provider);
    
    // Generate state parameter for security
    const state = this.generateRandomString(32);
    localStorage.setItem(`oauth_state_${provider}`, state);
    
    // Build authorization URL
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      response_type: 'code',
      state: state,
      access_type: 'offline', // For Google to get refresh token
      prompt: 'consent' // Force consent screen to ensure refresh token
    });

    const authUrl = `${config.authUrl}?${params.toString()}`;
    
    // Redirect to OAuth provider
    window.location.href = authUrl;
  }

  public async handleOAuthCallback(
    provider: 'google' | 'microsoft',
    code: string,
    state: string
  ): Promise<boolean> {
    try {
      // Verify state parameter
      const storedState = localStorage.getItem(`oauth_state_${provider}`);
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }
      
      // Clean up stored state
      localStorage.removeItem(`oauth_state_${provider}`);
      
      const config = this.getOAuthConfig(provider);
      
      // Exchange authorization code for access token
      const tokenResponse = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || import.meta.env.VITE_MICROSOFT_CLIENT_SECRET || '',
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: config.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange authorization code for token');
      }

      const tokenData = await tokenResponse.json();
      
      // Store access token
      this.accessTokens.set(provider, tokenData.access_token);
      
      // Store refresh token if available
      if (tokenData.refresh_token) {
        localStorage.setItem(`${provider}_refresh_token`, tokenData.refresh_token);
      }
      
      return true;
    } catch (error) {
      console.error(`OAuth callback error for ${provider}:`, error);
      return false;
    }
  }

  public async getCalendarEvents(
    provider: 'google' | 'microsoft',
    startDate?: Date,
    endDate?: Date
  ): Promise<CalendarEvent[]> {
    const accessToken = this.accessTokens.get(provider);
    if (!accessToken) {
      throw new Error(`No access token available for ${provider}`);
    }

    try {
      switch (provider) {
        case 'google':
          return await this.getGoogleCalendarEvents(accessToken, startDate, endDate);
        case 'microsoft':
          return await this.getMicrosoftCalendarEvents(accessToken, startDate, endDate);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error fetching calendar events from ${provider}:`, error);
      throw error;
    }
  }

  private async getGoogleCalendarEvents(
    accessToken: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CalendarEvent[]> {
    const start = startDate || new Date();
    const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const params = new URLSearchParams({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '100'
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Google Calendar events');
    }

    const data = await response.json();
    
    return data.items.map((event: any) => ({
      id: event.id,
      title: event.summary || 'Untitled Event',
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
      attendees: event.attendees?.map((attendee: any) => attendee.email) || [],
      location: event.location,
      description: event.description
    }));
  }

  private async getMicrosoftCalendarEvents(
    accessToken: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CalendarEvent[]> {
    const start = startDate || new Date();
    const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const params = new URLSearchParams({
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      $orderby: 'start/dateTime',
      $top: '100'
    });

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/events?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Microsoft Calendar events');
    }

    const data = await response.json();
    
    return data.value.map((event: any) => ({
      id: event.id,
      title: event.subject || 'Untitled Event',
      start: new Date(event.start.dateTime),
      end: new Date(event.end.dateTime),
      attendees: event.attendees?.map((attendee: any) => attendee.emailAddress.address) || [],
      location: event.location?.displayName,
      description: event.bodyPreview
    }));
  }

  public async refreshAccessToken(provider: 'google' | 'microsoft'): Promise<boolean> {
    const refreshToken = localStorage.getItem(`${provider}_refresh_token`);
    if (!refreshToken) {
      return false;
    }

    try {
      const config = this.getOAuthConfig(provider);
      
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || import.meta.env.VITE_MICROSOFT_CLIENT_SECRET || '',
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const tokenData = await response.json();
      this.accessTokens.set(provider, tokenData.access_token);
      
      return true;
    } catch (error) {
      console.error(`Error refreshing token for ${provider}:`, error);
      return false;
    }
  }

  public isConnected(provider: 'google' | 'microsoft'): boolean {
    return this.accessTokens.has(provider);
  }

  public disconnect(provider: 'google' | 'microsoft'): void {
    this.accessTokens.delete(provider);
    localStorage.removeItem(`${provider}_refresh_token`);
    localStorage.removeItem(`oauth_state_${provider}`);
  }

  private generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }
}

export const calendarOAuthService = CalendarOAuthService.getInstance();