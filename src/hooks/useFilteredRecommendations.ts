import { useMemo } from 'react';
import { useRecommendationState } from './useRecommendationState';
import { Intervention } from '../types';

export interface FilteredRecommendationsResult {
  activeRecommendations: Intervention[];
  completedRecommendations: Intervention[];
  dismissedRecommendations: Intervention[];
  totalActive: number;
  totalCompleted: number;
  totalDismissed: number;
}

export const useFilteredRecommendations = (
  allRecommendations: Intervention[]
): FilteredRecommendationsResult => {
  const {
    isCompleted,
    isDismissed,
    isActionTaken,
    getCompletedCount,
    getDismissedCount
  } = useRecommendationState();

  const filteredResults = useMemo(() => {
    const active: Intervention[] = [];
    const completed: Intervention[] = [];
    const dismissed: Intervention[] = [];

    allRecommendations.forEach(recommendation => {
      if (isCompleted(recommendation.id)) {
        completed.push({
          ...recommendation,
          completed: true
        });
      } else if (isDismissed(recommendation.id)) {
        dismissed.push(recommendation);
      } else if (!isActionTaken(recommendation.id)) {
        // Only show recommendations that haven't been acted upon
        active.push({
          ...recommendation,
          completed: false
        });
      }
    });

    return {
      activeRecommendations: active,
      completedRecommendations: completed,
      dismissedRecommendations: dismissed,
      totalActive: active.length,
      totalCompleted: getCompletedCount(),
      totalDismissed: getDismissedCount()
    };
  }, [
    allRecommendations,
    isCompleted,
    isDismissed,
    isActionTaken,
    getCompletedCount,
    getDismissedCount
  ]);

  return filteredResults;
};