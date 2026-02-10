import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayData } from '../types';
import {
  calculateDigestData,
  getCurrentWeekStart,
  DigestData,
} from '../utils/digestCalculations';
import { STORAGE_KEYS } from '../constants';

interface DigestState {
  lastSeenTimestamp: number | null;
  lastSeenWeekStart: string | null;
}

export const useWeeklyDigest = (history: DayData[]) => {
  const [showDigest, setShowDigest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [digestState, setDigestState] = useState<DigestState>({
    lastSeenTimestamp: null,
    lastSeenWeekStart: null,
  });

  // Calculate digest data from history
  const digestData = useMemo<DigestData>(() => {
    return calculateDigestData(history);
  }, [history]);

  // Check if we should show the digest
  useEffect(() => {
    checkShouldShowDigest();
  }, []);

  const checkShouldShowDigest = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_DIGEST);
      const state: DigestState = stored
        ? JSON.parse(stored)
        : { lastSeenTimestamp: null, lastSeenWeekStart: null };

      setDigestState(state);

      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
      const isMonday = dayOfWeek === 1;

      // Get the start of the current week as a string for comparison
      const currentWeekStart = getCurrentWeekStart().toISOString().split('T')[0];

      // Show digest if:
      // 1. It's Monday (or any day if they haven't seen this week's digest yet)
      // 2. They haven't seen the digest for this week
      const hasSeenThisWeek = state.lastSeenWeekStart === currentWeekStart;

      // On Monday, show if not seen this week
      // On other days, only show if explicitly requested (via viewDigest)
      if (isMonday && !hasSeenThisWeek) {
        setShowDigest(true);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to check digest state:', error);
      setIsLoading(false);
    }
  };

  // Dismiss the digest and mark as seen
  const dismissDigest = useCallback(async () => {
    try {
      const currentWeekStart = getCurrentWeekStart().toISOString().split('T')[0];
      const newState: DigestState = {
        lastSeenTimestamp: Date.now(),
        lastSeenWeekStart: currentWeekStart,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_DIGEST, JSON.stringify(newState));
      setDigestState(newState);
      setShowDigest(false);
    } catch (error) {
      console.error('Failed to dismiss digest:', error);
      setShowDigest(false);
    }
  }, []);

  // Manually view the digest (from settings or insights)
  const viewDigest = useCallback(() => {
    setShowDigest(true);
  }, []);

  // Reset digest state (for app reset)
  const resetDigestState = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.WEEKLY_DIGEST);
      setDigestState({
        lastSeenTimestamp: null,
        lastSeenWeekStart: null,
      });
    } catch (error) {
      console.error('Failed to reset digest state:', error);
    }
  }, []);

  // Check if digest is available (has data from last week)
  const hasDigestData = digestData.totalLogs > 0 || digestData.dailyDots.some((d) => d.hasData);

  return {
    showDigest,
    digestData,
    isLoading,
    hasDigestData,
    dismissDigest,
    viewDigest,
    resetDigestState,
  };
};
