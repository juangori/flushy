import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayData, LogEntry, BristolType } from '../types';
import { STORAGE_KEYS, LEGACY_STORAGE_KEY } from '../constants';
import { generateId, formatTime, getTodayString } from '../utils';

export const usePoopHistory = () => {
  const [history, setHistory] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from storage on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      let stored = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      // Migrate from legacy key if needed
      if (!stored) {
        const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy) {
          stored = legacy;
          await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, legacy);
          await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
        }
      }
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHistory = async (newHistory: DayData[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const addEntry = useCallback(async (
    type: BristolType,
    tags: string[] = [],
    notes?: string,
    color?: string,
    forDate?: string, // Optional: YYYY-MM-DD format for past entries
    forTime?: string  // Optional: HH:MM format for past entries (e.g., "08:30")
  ): Promise<boolean> => {
    // Use provided date or today
    const targetDate = forDate || getTodayString();

    // For past dates, use provided time or default to noon
    // For today, use current time
    const isToday = targetDate === getTodayString();
    let entryTime: Date;
    if (isToday) {
      entryTime = new Date();
    } else if (forTime) {
      entryTime = new Date(`${targetDate}T${forTime}:00`);
    } else {
      entryTime = new Date(`${targetDate}T12:00:00`);
    }

    const newEntry: LogEntry = {
      id: generateId(),
      type: type.type,
      color,
      time: formatTime(entryTime),
      tags,
      notes,
      createdAt: entryTime.getTime(),
    };

    const newHistory = [...history];
    const dateIndex = newHistory.findIndex(d => d.date === targetDate);

    if (dateIndex >= 0) {
      newHistory[dateIndex] = {
        ...newHistory[dateIndex],
        entries: [...newHistory[dateIndex].entries, newEntry],
      };
    } else {
      newHistory.push({ date: targetDate, entries: [newEntry] });
    }

    // Sort by date descending
    newHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setHistory(newHistory);
    await saveHistory(newHistory);

    return true;
  }, [history]);

  const deleteEntry = useCallback(async (date: string, entryId: string): Promise<boolean> => {
    const newHistory = history.map(day => {
      if (day.date === date) {
        return {
          ...day,
          entries: day.entries.filter(e => e.id !== entryId),
        };
      }
      return day;
    }).filter(day => day.entries.length > 0);

    setHistory(newHistory);
    await saveHistory(newHistory);
    
    return true;
  }, [history]);

  const clearAllData = useCallback(async (): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
      setHistory([]);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }, []);

  return {
    history,
    isLoading,
    addEntry,
    deleteEntry,
    clearAllData,
    refresh: loadHistory,
  };
};
