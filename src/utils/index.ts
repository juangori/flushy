import { DayData, Stats, LogEntry, QuickTag } from '../types';
import { BRISTOL_TYPES, STOOL_COLORS } from '../constants';

export { detectPatterns, getPatternSummary } from './patternDetection';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (dateStr: string): string => {
  // Parse date as local time to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Compare dates properly
  const dateOnly = new Date(year, month - 1, day);
  dateOnly.setHours(0, 0, 0, 0);

  if (dateOnly.getTime() === today.getTime()) return 'Today';
  if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (date: Date = new Date()): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
};

export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const calculateStats = (history: DayData[]): Stats => {
  const today = new Date();
  let streak = 0;
  
  // Calculate streak
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayData = history.find(d => d.date === dateStr);
    
    if (dayData && dayData.entries.length > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  
  // Calculate week stats
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const weekEntries = history
    .filter(d => {
      // Parse date as local time to avoid timezone issues
      const [year, month, day] = d.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date >= weekAgo;
    })
    .flatMap(d => d.entries);
  
  const avgType = weekEntries.length > 0 
    ? (weekEntries.reduce((sum, e) => sum + e.type, 0) / weekEntries.length).toFixed(1)
    : '-';
  
  // Health score (0-100, only type 4 = 100, drops off from there)
  // Distance from 4: 0→100, 1→70, 2→40, 3→10
  // null when fewer than 3 entries (not enough data for meaningful score)
  const MIN_ENTRIES_FOR_SCORE = 3;
  let healthScore: number | null = null;
  if (weekEntries.length >= MIN_ENTRIES_FOR_SCORE) {
    const avgTypeNum = parseFloat(avgType);
    const distance = Math.abs(avgTypeNum - 4);
    healthScore = Math.max(0, Math.min(100, Math.round(100 - (distance * 30))));
  }

  return {
    streak,
    weekCount: weekEntries.length,
    avgType,
    healthScore
  };
};

export const getTypeDistribution = (history: DayData[]) => {
  const allEntries = history.flatMap(d => d.entries);
  
  return BRISTOL_TYPES.map(bt => ({
    ...bt,
    count: allEntries.filter(e => e.type === bt.type).length
  }));
};

export const getTagCorrelations = (history: DayData[], quickTags: QuickTag[]) => {
  const allEntries = history.flatMap(d => d.entries);
  
  return quickTags
    .map(tag => {
      const entriesWithTag = allEntries.filter(e => e.tags.includes(tag.id));
      const avgType = entriesWithTag.length > 0 
        ? entriesWithTag.reduce((sum, e) => sum + e.type, 0) / entriesWithTag.length
        : 0;
      return { 
        ...tag, 
        count: entriesWithTag.length, 
        avgType: parseFloat(avgType.toFixed(1))
      };
    })
    .filter(t => t.count > 0)
    .sort((a, b) => b.count - a.count);
};

export const getColorDistribution = (history: DayData[]) => {
  const allEntries = history.flatMap(d => d.entries);
  const entriesWithColor = allEntries.filter(e => e.color);

  return STOOL_COLORS
    .map(sc => ({
      ...sc,
      count: entriesWithColor.filter(e => e.color === sc.id).length,
    }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);
};
