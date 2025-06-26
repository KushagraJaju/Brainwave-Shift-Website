import { useState, useEffect } from 'react';
import { DeviceIntegration, SmartwatchData, CalendarData } from '../types';
import { deviceIntegrationService } from '../services/DeviceIntegrationService';

export const useDeviceIntegration = () => {
  const [integrations, setIntegrations] = useState<DeviceIntegration[]>([]);
  const [smartwatchData, setSmartwatchData] = useState<SmartwatchData | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  useEffect(() => {
    // Get initial data
    setIntegrations(deviceIntegrationService.getIntegrations());
    setSmartwatchData(deviceIntegrationService.getSmartwatchData());
    setCalendarData(deviceIntegrationService.getCalendarData());

    // Subscribe to integration updates
    const unsubscribeIntegrations = deviceIntegrationService.subscribe((newIntegrations) => {
      setIntegrations(newIntegrations);
    });

    // Subscribe to data updates
    const unsubscribeData = deviceIntegrationService.subscribeToData((data) => {
      if (data.smartwatch !== undefined) {
        setSmartwatchData(data.smartwatch);
      }
      if (data.calendar !== undefined) {
        setCalendarData(data.calendar);
      }
    });

    return () => {
      unsubscribeIntegrations();
      unsubscribeData();
    };
  }, []);

  const connectSmartwatch = async (provider: string) => {
    setIsConnecting('smartwatch');
    try {
      const success = await deviceIntegrationService.connectSmartwatch(provider);
      return success;
    } finally {
      setIsConnecting(null);
    }
  };

  const connectCalendar = async (provider: string) => {
    setIsConnecting('calendar');
    try {
      const success = await deviceIntegrationService.connectCalendar(provider);
      return success;
    } finally {
      setIsConnecting(null);
    }
  };

  const disconnectDevice = (deviceId: string) => {
    deviceIntegrationService.disconnectDevice(deviceId);
  };

  const updatePrivacyLevel = (deviceId: string, level: 'minimal' | 'standard' | 'full') => {
    deviceIntegrationService.updatePrivacyLevel(deviceId, level);
  };

  return {
    integrations,
    smartwatchData,
    calendarData,
    isConnecting,
    connectSmartwatch,
    connectCalendar,
    disconnectDevice,
    updatePrivacyLevel
  };
};