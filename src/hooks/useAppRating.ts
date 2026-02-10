import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../constants';

interface RatingData {
  firstOpenDate: string;
  hasRequestedRating: boolean;
  lastRequestDate?: string;
  entryCount: number;
}

const MIN_DAYS_BEFORE_PROMPT = 3;
const MIN_ENTRIES_BEFORE_PROMPT = 5;
const DAYS_BETWEEN_PROMPTS = 90; // Don't ask again for 90 days if dismissed

export const useAppRating = () => {
  const [ratingData, setRatingData] = useState<RatingData | null>(null);

  useEffect(() => {
    loadRatingData();
  }, []);

  const loadRatingData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.APP_RATING);
      if (stored) {
        setRatingData(JSON.parse(stored));
      } else {
        // First time opening app
        const initialData: RatingData = {
          firstOpenDate: new Date().toISOString(),
          hasRequestedRating: false,
          entryCount: 0,
        };
        await AsyncStorage.setItem(STORAGE_KEYS.APP_RATING, JSON.stringify(initialData));
        setRatingData(initialData);
      }
    } catch (error) {
      console.error('Failed to load rating data:', error);
    }
  };

  const incrementEntryCount = useCallback(async () => {
    if (!ratingData) return;

    const updatedData = {
      ...ratingData,
      entryCount: ratingData.entryCount + 1,
    };

    setRatingData(updatedData);
    await AsyncStorage.setItem(STORAGE_KEYS.APP_RATING, JSON.stringify(updatedData));
  }, [ratingData]);

  const shouldRequestRating = useCallback((): boolean => {
    if (!ratingData) return false;

    const daysSinceFirstOpen = Math.floor(
      (Date.now() - new Date(ratingData.firstOpenDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if enough time has passed and enough entries logged
    const meetsUsageCriteria =
      daysSinceFirstOpen >= MIN_DAYS_BEFORE_PROMPT &&
      ratingData.entryCount >= MIN_ENTRIES_BEFORE_PROMPT;

    if (!meetsUsageCriteria) return false;

    // Check if we've already requested
    if (ratingData.hasRequestedRating) {
      // If we have a last request date, check if enough time has passed
      if (ratingData.lastRequestDate) {
        const daysSinceLastRequest = Math.floor(
          (Date.now() - new Date(ratingData.lastRequestDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceLastRequest >= DAYS_BETWEEN_PROMPTS;
      }
      return false;
    }

    return true;
  }, [ratingData]);

  const requestRating = useCallback(async (): Promise<boolean> => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();

      if (!isAvailable) {
        console.log('Store review not available on this device');
        return false;
      }

      await StoreReview.requestReview();

      // Mark that we've requested a rating
      if (ratingData) {
        const updatedData = {
          ...ratingData,
          hasRequestedRating: true,
          lastRequestDate: new Date().toISOString(),
        };
        setRatingData(updatedData);
        await AsyncStorage.setItem(STORAGE_KEYS.APP_RATING, JSON.stringify(updatedData));
      }

      return true;
    } catch (error) {
      console.error('Failed to request rating:', error);
      return false;
    }
  }, [ratingData]);

  const checkAndRequestRating = useCallback(async (): Promise<boolean> => {
    if (shouldRequestRating()) {
      return await requestRating();
    }
    return false;
  }, [shouldRequestRating, requestRating]);

  const resetRatingData = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.APP_RATING);
    setRatingData(null);
  }, []);

  return {
    ratingData,
    incrementEntryCount,
    shouldRequestRating,
    requestRating,
    checkAndRequestRating,
    resetRatingData,
  };
};
