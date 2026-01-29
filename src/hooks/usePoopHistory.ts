import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayData, LogEntry, BristolType } from '../types';
import { STORAGE_KEY } from '../constants';
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
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
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
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const addEntry = useCallback(async (
    type: BristolType,
    tags: string[] = [],
    notes?: string,
    color?: string
  ): Promise<boolean> => {
    const today = getTodayString();

    const newEntry: LogEntry = {
      id: generateId(),
      type: type.type,
      color,
      time: formatTime(),
      tags,
      notes,
      createdAt: Date.now(),
    };

    const newHistory = [...history];
    const todayIndex = newHistory.findIndex(d => d.date === today);

    if (todayIndex >= 0) {
      newHistory[todayIndex] = {
        ...newHistory[todayIndex],
        entries: [...newHistory[todayIndex].entries, newEntry],
      };
    } else {
      newHistory.unshift({ date: today, entries: [newEntry] });
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
      await AsyncStorage.removeItem(STORAGE_KEY);
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
