import { useState, useEffect } from 'react';
import { browserTabManager } from '../services/BrowserTabManager';

export const useTabVisibility = () => {
  const [isVisible, setIsVisible] = useState(browserTabManager.isTabVisible());
  
  useEffect(() => {
    // Subscribe to tab visibility changes
    const unsubscribe = browserTabManager.subscribe((visible) => {
      setIsVisible(visible);
    });
    
    return unsubscribe;
  }, []);
  
  return {
    isVisible,
    lastActiveTime: browserTabManager.getLastActiveTime()
  };
};