import React from 'react';
import { Calendar, Clock, Users, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { CalendarData } from '../types';

interface CalendarInsightsProps {
  data: CalendarData;
}

export const CalendarInsights: React.FC<CalendarInsightsProps> = ({ data }) => {
  const getDensityColor = (density: string) => {
    switch (density) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'focus-block': return <Clock className="w-4 h-4" />;
      case 'deadline': return <AlertTriangle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'focus-block': return 'bg-green-50 text-green-700 border-green-200';
      case 'deadline': return 'bg-red-50 text-red-700 border-red-200';
      case 'break': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const todayEvents = data.events.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.startTime);
    return eventDate.toDateString() === today.toDateString();
  });

  const upcomingEvents = todayEvents
    .filter(event => event.startTime > new Date())
    .slice(0, 4);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>Calendar Insights</span>
        </h3>
        <div className="text-sm text-gray-500">
          Last sync: {data.lastSync.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Meeting Density */}
        <div className={`p-3 rounded-lg ${getDensityColor(data.meetingDensity)}`}>
          <div className="flex items-center justify-between mb-1">
            <Users className="w-4 h-4" />
            <div className="text-right">
              <div className="text-lg font-bold capitalize">{data.meetingDensity}</div>
              <div className="text-xs">Density</div>
            </div>
          </div>
          <div className="text-sm font-medium">Meeting Load</div>
          <div className="text-xs">Today</div>
        </div>

        {/* Focus Time Available */}
        <div className="p-3 rounded-lg bg-green-50 text-green-600">
          <div className="flex items-center justify-between mb-1">
            <Clock className="w-4 h-4" />
            <div className="text-right">
              <div className="text-lg font-bold">{formatTime(data.focusTimeAvailable)}</div>
              <div className="text-xs">Available</div>
            </div>
          </div>
          <div className="text-sm font-medium">Focus Time</div>
          <div className="text-xs">Remaining</div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
          <div className="flex items-center justify-between mb-1">
            <AlertTriangle className="w-4 h-4" />
            <div className="text-right">
              <div className="text-lg font-bold">{data.upcomingDeadlines.length}</div>
              <div className="text-xs">This Week</div>
            </div>
          </div>
          <div className="text-sm font-medium">Deadlines</div>
          <div className="text-xs">Approaching</div>
        </div>
      </div>

      {/* Today's Schedule - Compact */}
      <div className="mb-4 flex-1">
        <h4 className="font-semibold text-gray-800 mb-3">Today's Schedule</h4>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {upcomingEvents.map((event) => (
              <div key={event.id} className={`p-2 rounded-lg border ${getEventColor(event.type)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getEventIcon(event.type)}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{event.title}</div>
                      <div className="text-xs opacity-75">
                        {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs opacity-75 capitalize ml-2 flex-shrink-0">
                    {event.type.replace('-', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No more events today</p>
            <p className="text-xs">Great time for focused work!</p>
          </div>
        )}
      </div>

      {/* AI Insights - Compact */}
      <div className="mt-auto">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-purple-500" />
          <span>AI Insights</span>
        </h4>
        <div className="space-y-2 max-h-20 overflow-y-auto">
          {data.insights.slice(0, 2).map((insight, index) => (
            <div key={index} className="p-2 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-purple-700">{insight}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};