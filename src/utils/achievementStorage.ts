import AsyncStorage from '@react-native-async-storage/async-storage';
import { AchievementState, UnlockedAchievement } from '../types';
import { STORAGE_KEYS } from '../constants';

const DEFAULT_STATE: AchievementState = {
  unlockedAchievements: [],
  insightsViews: 0,
  totalDaysUsed: 0,
  lastActiveDate: null,
};

/**
 * Load achievement state from AsyncStorage
 */
export async function loadAchievementState(): Promise<AchievementState> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_STATE, ...parsed };
    }
    return DEFAULT_STATE;
  } catch (error) {
    console.error('Error loading achievement state:', error);
    return DEFAULT_STATE;
  }
}

/**
 * Save achievement state to AsyncStorage
 */
export async function saveAchievementState(state: AchievementState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving achievement state:', error);
  }
}

/**
 * Add a newly unlocked achievement
 */
export async function addUnlockedAchievement(
  currentState: AchievementState,
  achievementId: string
): Promise<AchievementState> {
  const newUnlock: UnlockedAchievement = {
    id: achievementId,
    unlockedAt: Date.now(),
  };

  const newState: AchievementState = {
    ...currentState,
    unlockedAchievements: [...currentState.unlockedAchievements, newUnlock],
  };

  await saveAchievementState(newState);
  return newState;
}

/**
 * Increment insights views counter
 */
export async function incrementInsightsViews(
  currentState: AchievementState
): Promise<AchievementState> {
  const newState: AchievementState = {
    ...currentState,
    insightsViews: currentState.insightsViews + 1,
  };

  await saveAchievementState(newState);
  return newState;
}

/**
 * Update last active date and increment total days used if new day
 */
export async function updateDailyActivity(
  currentState: AchievementState
): Promise<AchievementState> {
  const today = new Date().toISOString().split('T')[0];

  if (currentState.lastActiveDate === today) {
    return currentState;
  }

  const newState: AchievementState = {
    ...currentState,
    totalDaysUsed: currentState.totalDaysUsed + 1,
    lastActiveDate: today,
  };

  await saveAchievementState(newState);
  return newState;
}

/**
 * Reset all achievement data
 */
export async function resetAchievementState(): Promise<AchievementState> {
  const newState = DEFAULT_STATE;
  await saveAchievementState(newState);
  return newState;
}

/**
 * Get unlocked achievements from the last N days
 */
export function getRecentUnlocks(
  state: AchievementState,
  days: number = 7
): UnlockedAchievement[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return state.unlockedAchievements.filter(a => a.unlockedAt >= cutoff);
}

/**
 * Check if an achievement is unlocked
 */
export function isAchievementUnlocked(
  state: AchievementState,
  achievementId: string
): boolean {
  return state.unlockedAchievements.some(a => a.id === achievementId);
}

/**
 * Get unlock date for an achievement
 */
export function getUnlockDate(
  state: AchievementState,
  achievementId: string
): number | undefined {
  const achievement = state.unlockedAchievements.find(a => a.id === achievementId);
  return achievement?.unlockedAt;
}
