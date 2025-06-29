import { useState, useEffect, useCallback } from 'react';

export interface RecommendationAction {
  id: string;
  action: 'completed' | 'dismissed';
  timestamp: string;
  sessionId: string;
}

export interface RecommendationState {
  actions: Map<string, RecommendationAction>;
  sessionId: string;
}

const STORAGE_KEY = 'brainwave-shift-recommendation-actions';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useRecommendationState = () => {
  const [state, setState] = useState<RecommendationState>(() => {
    // Initialize with current session
    const sessionId = Date.now().toString();
    return {
      actions: new Map(),
      sessionId
    };
  });

  // Load persisted state on mount
  useEffect(() => {
    loadPersistedState();
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    saveStateToStorage();
  }, [state]);

  const loadPersistedState = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const now = Date.now();
      
      // Clean up old actions (older than SESSION_DURATION)
      const validActions = new Map<string, RecommendationAction>();
      
      if (parsed.actions && Array.isArray(parsed.actions)) {
        parsed.actions.forEach(([id, action]: [string, RecommendationAction]) => {
          const actionTime = new Date(action.timestamp).getTime();
          if (now - actionTime < SESSION_DURATION) {
            validActions.set(id, action);
          }
        });
      }

      setState(prevState => ({
        ...prevState,
        actions: validActions
      }));
    } catch (error) {
      console.error('Failed to load recommendation state:', error);
    }
  }, []);

  const saveStateToStorage = useCallback(() => {
    try {
      const dataToSave = {
        actions: Array.from(state.actions.entries()),
        sessionId: state.sessionId,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save recommendation state:', error);
    }
  }, [state]);

  const markAsCompleted = useCallback((id: string) => {
    const action: RecommendationAction = {
      id,
      action: 'completed',
      timestamp: new Date().toISOString(),
      sessionId: state.sessionId
    };

    setState(prevState => ({
      ...prevState,
      actions: new Map(prevState.actions).set(id, action)
    }));
  }, [state.sessionId]);

  const markAsDismissed = useCallback((id: string) => {
    const action: RecommendationAction = {
      id,
      action: 'dismissed',
      timestamp: new Date().toISOString(),
      sessionId: state.sessionId
    };

    setState(prevState => ({
      ...prevState,
      actions: new Map(prevState.actions).set(id, action)
    }));
  }, [state.sessionId]);

  const getActionForRecommendation = useCallback((id: string): RecommendationAction | null => {
    return state.actions.get(id) || null;
  }, [state.actions]);

  const isCompleted = useCallback((id: string): boolean => {
    const action = state.actions.get(id);
    return action?.action === 'completed';
  }, [state.actions]);

  const isDismissed = useCallback((id: string): boolean => {
    const action = state.actions.get(id);
    return action?.action === 'dismissed';
  }, [state.actions]);

  const isActionTaken = useCallback((id: string): boolean => {
    return state.actions.has(id);
  }, [state.actions]);

  const clearExpiredActions = useCallback(() => {
    const now = Date.now();
    const validActions = new Map<string, RecommendationAction>();
    
    state.actions.forEach((action, id) => {
      const actionTime = new Date(action.timestamp).getTime();
      if (now - actionTime < SESSION_DURATION) {
        validActions.set(id, action);
      }
    });

    setState(prevState => ({
      ...prevState,
      actions: validActions
    }));
  }, [state.actions]);

  const resetSession = useCallback(() => {
    const newSessionId = Date.now().toString();
    setState({
      actions: new Map(),
      sessionId: newSessionId
    });
  }, []);

  const getCompletedCount = useCallback((): number => {
    return Array.from(state.actions.values()).filter(action => action.action === 'completed').length;
  }, [state.actions]);

  const getDismissedCount = useCallback((): number => {
    return Array.from(state.actions.values()).filter(action => action.action === 'dismissed').length;
  }, [state.actions]);

  return {
    // Action methods
    markAsCompleted,
    markAsDismissed,
    
    // Query methods
    getActionForRecommendation,
    isCompleted,
    isDismissed,
    isActionTaken,
    
    // Utility methods
    clearExpiredActions,
    resetSession,
    getCompletedCount,
    getDismissedCount,
    
    // State
    sessionId: state.sessionId,
    totalActions: state.actions.size
  };
};