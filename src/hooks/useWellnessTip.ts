import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogEntry } from '../types';
import { WellnessTip, TIP_COOLDOWNS } from '../constants/wellnessTips';
import { UserProfile, STORAGE_KEYS } from '../constants';
import { detectPatterns } from '../utils';

interface TipState {
  lastShownTimestamp: number;
  shownTips: Record<string, number>; // tipId -> timestamp
  dismissedTips: Record<string, number>; // tipId -> timestamp
  snoozedUntil: number | null;
  helpfulCount: number;
  notHelpfulCount: number;
}

interface UseWellnessTipResult {
  currentTip: WellnessTip | null;
  isLoading: boolean;
  dismissTip: () => Promise<void>;
  snoozeTip: () => Promise<void>;
  markHelpful: (helpful: boolean) => Promise<void>;
  refreshTip: () => void;
}

const DEFAULT_STATE: TipState = {
  lastShownTimestamp: 0,
  shownTips: {},
  dismissedTips: {},
  snoozedUntil: null,
  helpfulCount: 0,
  notHelpfulCount: 0,
};

export function useWellnessTip(
  history: LogEntry[],
  profile?: UserProfile
): UseWellnessTipResult {
  const [tipState, setTipState] = useState<TipState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTip, setCurrentTip] = useState<WellnessTip | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load saved state
  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.WELLNESS_TIPS);
        if (saved) {
          setTipState(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to load wellness tip state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, []);

  // Save state changes
  const saveState = async (newState: TipState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WELLNESS_TIPS, JSON.stringify(newState));
      setTipState(newState);
    } catch (error) {
      console.error('Failed to save wellness tip state:', error);
    }
  };

  // Determine if we can show a tip
  const canShowTip = useMemo(() => {
    const now = Date.now();

    // Check if snoozed
    if (tipState.snoozedUntil && now < tipState.snoozedUntil) {
      return false;
    }

    // Check minimum time between any tips (24h)
    if (now - tipState.lastShownTimestamp < TIP_COOLDOWNS.anyTip) {
      return false;
    }

    // Need at least 3 entries to provide meaningful tips
    if (history.length < 3) {
      return false;
    }

    return true;
  }, [tipState, history.length]);

  // Detect patterns and get a tip
  useEffect(() => {
    if (isLoading || !canShowTip) {
      if (!canShowTip) setCurrentTip(null);
      return;
    }

    const { recommendedTip } = detectPatterns(history, profile);

    if (!recommendedTip) {
      setCurrentTip(null);
      return;
    }

    const now = Date.now();

    // Check if this specific tip was recently shown
    const lastShown = tipState.shownTips[recommendedTip.id];
    if (lastShown && now - lastShown < TIP_COOLDOWNS.sameTip) {
      setCurrentTip(null);
      return;
    }

    // Check if this tip was recently dismissed
    const lastDismissed = tipState.dismissedTips[recommendedTip.id];
    if (lastDismissed && now - lastDismissed < TIP_COOLDOWNS.afterDismiss) {
      setCurrentTip(null);
      return;
    }

    setCurrentTip(recommendedTip);

    // Mark tip as shown
    const newState: TipState = {
      ...tipState,
      lastShownTimestamp: now,
      shownTips: {
        ...tipState.shownTips,
        [recommendedTip.id]: now,
      },
    };
    saveState(newState);
  }, [history, profile, isLoading, canShowTip, refreshKey]);

  // Dismiss the current tip
  const dismissTip = useCallback(async () => {
    if (!currentTip) return;

    const newState: TipState = {
      ...tipState,
      dismissedTips: {
        ...tipState.dismissedTips,
        [currentTip.id]: Date.now(),
      },
    };
    await saveState(newState);
    setCurrentTip(null);
  }, [currentTip, tipState]);

  // Snooze all tips
  const snoozeTip = useCallback(async () => {
    const newState: TipState = {
      ...tipState,
      snoozedUntil: Date.now() + TIP_COOLDOWNS.snooze,
    };
    await saveState(newState);
    setCurrentTip(null);
  }, [tipState]);

  // Mark tip as helpful/not helpful
  const markHelpful = useCallback(
    async (helpful: boolean) => {
      const newState: TipState = {
        ...tipState,
        helpfulCount: tipState.helpfulCount + (helpful ? 1 : 0),
        notHelpfulCount: tipState.notHelpfulCount + (helpful ? 0 : 1),
      };
      await saveState(newState);
      await dismissTip();
    },
    [tipState, dismissTip]
  );

  // Force refresh tip
  const refreshTip = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    currentTip,
    isLoading,
    dismissTip,
    snoozeTip,
    markHelpful,
    refreshTip,
  };
}
