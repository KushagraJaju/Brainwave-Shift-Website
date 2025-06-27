import React from 'react';
import { Calendar, Clock, Users, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { CalendarData } from '../types';

interface CalendarInsightsProps {
  data: CalendarData;
}

export const CalendarInsights: React.FC<CalendarInsightsProps> = ({ data }) => {
  const getDensityColor = (density: string) => {
    switch (density) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
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
      case 'meeting': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'focus-block': return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'deadline': return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'break': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default: return 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
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
    <div className="bg-white dark:bg-calm-800 rounded-lg shadow-md dark:shadow-gentle-dark p-6 h-full flex flex-col border border-calm-200 dark:border-calm-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <span>Calendar Insights</span>
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last sync: {data.lastSync.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Meeting Density */}
        <div className={`p-3 rounded-lg border border-opacity-20 ${getDensityColor(data.meetingDensity)}`}>
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
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
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
        <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
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
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Today's Schedule</h4>
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
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No more events today</p>
            <p className="text-xs">Great time for focused work!</p>
          </div>
        )}
      </div>

      {/* AI Insights - Compact */}
      <div className="mt-auto">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span>AI Insights</span>
        </h4>
        <div className="space-y-2 max-h-20 overflow-y-auto">
          {data.insights.slice(0, 2).map((insight, index) => (
            <div key={index} className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-3 h-3 text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-purple-700 dark:text-purple-300">{insight}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};