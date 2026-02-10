import { useState, useEffect, useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { DayData, Achievement, AchievementState, UserStats, UnlockedAchievement } from '../types';
import { ACHIEVEMENTS, getAchievementById } from '../constants/achievements';
import {
  loadAchievementState,
  saveAchievementState,
  addUnlockedAchievement,
  incrementInsightsViews,
  updateDailyActivity,
  resetAchievementState,
  isAchievementUnlocked,
  getUnlockDate,
  getRecentUnlocks,
} from '../utils/achievementStorage';
import {
  consecutiveDaysWithLogs,
  countTagUsage,
  countTotalEntries,
  countTotalDaysWithEntries,
} from '../utils/achievementHelpers';

interface UseAchievementsReturn {
  // State
  achievements: Achievement[];
  achievementState: AchievementState;
  isLoading: boolean;

  // Newly unlocked (for toast)
  newlyUnlocked: Achievement | null;
  dismissNewlyUnlocked: () => void;

  // Counts
  unlockedCount: number;
  totalCount: number;

  // Check functions
  isUnlocked: (achievementId: string) => boolean;
  getUnlockedAt: (achievementId: string) => number | undefined;
  getProgress: (achievement: Achievement) => { current: number; total: number } | null;

  // Actions
  trackInsightsView: () => Promise<void>;
  checkAchievements: (history: DayData[]) => Promise<void>;
  resetAchievements: () => Promise<void>;

  // Recent unlocks (for weekly digest)
  getWeeklyUnlocks: () => UnlockedAchievement[];

  // Has new achievements (for badge indicator)
  hasNewAchievements: boolean;
  markAchievementsSeen: () => void;
}

export function useAchievements(history: DayData[]): UseAchievementsReturn {
  const [achievementState, setAchievementState] = useState<AchievementState>({
    unlockedAchievements: [],
    insightsViews: 0,
    totalDaysUsed: 0,
    lastActiveDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  const [lastSeenCount, setLastSeenCount] = useState(0);

  // Queue for multiple unlocks
  const unlockQueue = useRef<Achievement[]>([]);
  const isProcessingQueue = useRef(false);

  // Load saved state on mount
  useEffect(() => {
    const loadState = async () => {
      const state = await loadAchievementState();
      setAchievementState(state);
      setLastSeenCount(state.unlockedAchievements.length);

      // Update daily activity
      const updatedState = await updateDailyActivity(state);
      setAchievementState(updatedState);

      setIsLoading(false);
    };

    loadState();
  }, []);

  // Calculate user stats from history and state
  const calculateStats = useCallback((hist: DayData[]): UserStats => {
    const tagUsage = countTagUsage(hist);

    return {
      totalLogs: countTotalEntries(hist),
      currentStreak: consecutiveDaysWithLogs(hist),
      longestStreak: consecutiveDaysWithLogs(hist), // Simplified
      insightsViews: achievementState.insightsViews,
      totalDaysUsed: achievementState.totalDaysUsed,
      tagUsageCount: tagUsage,
    };
  }, [achievementState.insightsViews, achievementState.totalDaysUsed]);

  // Process unlock queue
  const processUnlockQueue = useCallback(() => {
    if (isProcessingQueue.current || unlockQueue.current.length === 0) return;

    isProcessingQueue.current = true;
    const achievement = unlockQueue.current.shift();

    if (achievement) {
      setNewlyUnlocked(achievement);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // After toast auto-dismisses (4 seconds), process next
      setTimeout(() => {
        isProcessingQueue.current = false;
        processUnlockQueue();
      }, 4500);
    }
  }, []);

  // Check for new achievements
  const checkAchievements = useCallback(async (hist: DayData[]) => {
    if (isLoading) return;

    const stats = calculateStats(hist);
    const newUnlocks: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      const alreadyUnlocked = isAchievementUnlocked(achievementState, achievement.id);

      if (!alreadyUnlocked) {
        try {
          const conditionMet = achievement.condition(hist, stats);

          if (conditionMet) {
            newUnlocks.push(achievement);
          }
        } catch (error) {
          console.error(`Error checking achievement ${achievement.id}:`, error);
        }
      }
    }

    // Save and queue unlocks
    if (newUnlocks.length > 0) {
      let updatedState = achievementState;

      for (const achievement of newUnlocks) {
        updatedState = await addUnlockedAchievement(updatedState, achievement.id);
      }

      setAchievementState(updatedState);

      // Add to queue and process
      unlockQueue.current.push(...newUnlocks);
      processUnlockQueue();
    }
  }, [isLoading, achievementState, calculateStats, processUnlockQueue]);

  // Check achievements when history changes
  useEffect(() => {
    if (!isLoading && history.length > 0) {
      checkAchievements(history);
    }
  }, [history, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Dismiss newly unlocked toast
  const dismissNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked(null);
    // Process next in queue after short delay
    setTimeout(() => {
      isProcessingQueue.current = false;
      processUnlockQueue();
    }, 300);
  }, [processUnlockQueue]);

  // Track insights view
  const trackInsightsView = useCallback(async () => {
    const updatedState = await incrementInsightsViews(achievementState);
    setAchievementState(updatedState);

    // Re-check achievements after incrementing
    const stats = calculateStats(history);
    await checkAchievements(history);
  }, [achievementState, calculateStats, history, checkAchievements]);

  // Reset all achievements
  const resetAchievements = useCallback(async () => {
    const newState = await resetAchievementState();
    setAchievementState(newState);
    setLastSeenCount(0);
    setNewlyUnlocked(null);
    unlockQueue.current = [];
  }, []);

  // Check if achievement is unlocked
  const isUnlocked = useCallback((achievementId: string): boolean => {
    return isAchievementUnlocked(achievementState, achievementId);
  }, [achievementState]);

  // Get unlock date
  const getUnlockedAt = useCallback((achievementId: string): number | undefined => {
    return getUnlockDate(achievementState, achievementId);
  }, [achievementState]);

  // Get progress for an achievement
  const getProgress = useCallback((achievement: Achievement): { current: number; total: number } | null => {
    if (!achievement.progress) return null;

    const stats = calculateStats(history);
    try {
      return achievement.progress(history, stats);
    } catch {
      return null;
    }
  }, [history, calculateStats]);

  // Get weekly unlocks
  const getWeeklyUnlocks = useCallback((): UnlockedAchievement[] => {
    return getRecentUnlocks(achievementState, 7);
  }, [achievementState]);

  // Has new achievements indicator
  const hasNewAchievements = achievementState.unlockedAchievements.length > lastSeenCount;

  // Mark achievements as seen
  const markAchievementsSeen = useCallback(() => {
    setLastSeenCount(achievementState.unlockedAchievements.length);
  }, [achievementState.unlockedAchievements.length]);

  return {
    achievements: ACHIEVEMENTS,
    achievementState,
    isLoading,

    newlyUnlocked,
    dismissNewlyUnlocked,

    unlockedCount: achievementState.unlockedAchievements.length,
    totalCount: ACHIEVEMENTS.length,

    isUnlocked,
    getUnlockedAt,
    getProgress,

    trackInsightsView,
    checkAchievements,
    resetAchievements,

    getWeeklyUnlocks,

    hasNewAchievements,
    markAchievementsSeen,
  };
}
