import { DayData, LogEntry } from '../types';
import { BRISTOL_TYPES } from '../constants';
import {
  WEEKLY_MESSAGES,
  HEALTH_INDICATORS,
  STREAK_MESSAGES,
  WeeklyMessageCategory,
  HealthIndicatorType,
  HealthIndicator,
} from '../constants/weeklyMessages';

export interface DailyDot {
  day: string;
  date: string;
  color: string;
  hasData: boolean;
  avgType?: number;
}

export interface DigestData {
  totalLogs: number;
  dailyDots: DailyDot[];
  avgType: number | null;
  healthIndicator: HealthIndicator | null;
  streak: number;
  streakMessage: string | null;
  peakHour: string | null;
  message: string;
  dateRange: string;
  weekCategory: WeeklyMessageCategory;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const HEALTH_COLORS = {
  healthy: '#4ADE80',
  warning: '#FBBF24',
  alert: '#F87171',
  constipated: '#A78BFA',
  empty: 'rgba(255, 255, 255, 0.1)',
};

/**
 * Get the start of the previous week (Monday 00:00:00)
 */
export const getLastWeekStart = (): Date => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  // Days since last Monday (if today is Monday, go back 7 days)
  const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - daysToLastMonday - 7);
  lastMonday.setHours(0, 0, 0, 0);
  return lastMonday;
};

/**
 * Get the end of the previous week (Sunday 23:59:59)
 */
export const getLastWeekEnd = (): Date => {
  const lastMonday = getLastWeekStart();
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);
  lastSunday.setHours(23, 59, 59, 999);
  return lastSunday;
};

/**
 * Get the start of the current week (Monday 00:00:00)
 */
export const getCurrentWeekStart = (): Date => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

/**
 * Format date as "Mon D - Mon D"
 */
export const formatDateRange = (start: Date, end: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}`;
};

/**
 * Get entries from the last week
 */
export const getLastWeekEntries = (history: DayData[]): LogEntry[] => {
  const weekStart = getLastWeekStart();
  const weekEnd = getLastWeekEnd();

  const entries: LogEntry[] = [];

  history.forEach((day) => {
    const dayDate = new Date(day.date);
    if (dayDate >= weekStart && dayDate <= weekEnd) {
      entries.push(...day.entries);
    }
  });

  return entries;
};

/**
 * Get entries grouped by day for the last week
 */
export const getLastWeekByDay = (history: DayData[]): Map<string, LogEntry[]> => {
  const weekStart = getLastWeekStart();
  const result = new Map<string, LogEntry[]>();

  // Initialize all 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    result.set(dateStr, []);
  }

  // Fill with actual data
  history.forEach((day) => {
    if (result.has(day.date)) {
      result.set(day.date, day.entries);
    }
  });

  return result;
};

/**
 * Calculate average Bristol type
 */
export const calculateAverageType = (entries: LogEntry[]): number | null => {
  if (entries.length === 0) return null;

  const sum = entries.reduce((acc, entry) => acc + entry.type, 0);
  return Math.round((sum / entries.length) * 10) / 10;
};

/**
 * Determine health indicator based on average type
 */
export const getHealthIndicator = (avgType: number | null): HealthIndicator | null => {
  if (avgType === null) return null;

  if (avgType >= 3 && avgType <= 4.5) {
    return HEALTH_INDICATORS.excellent;
  } else if ((avgType >= 2.5 && avgType < 3) || (avgType > 4.5 && avgType <= 5)) {
    return HEALTH_INDICATORS.good;
  } else if ((avgType >= 2 && avgType < 2.5) || (avgType > 5 && avgType <= 5.5)) {
    return HEALTH_INDICATORS.fair;
  } else {
    return HEALTH_INDICATORS.needs_attention;
  }
};

/**
 * Get health color for a type
 */
const getHealthColorForType = (type: number): string => {
  const bristolType = BRISTOL_TYPES.find((b) => b.type === type);
  if (!bristolType) return HEALTH_COLORS.empty;

  return HEALTH_COLORS[bristolType.health] || HEALTH_COLORS.empty;
};

/**
 * Get average health color for a day's entries
 */
const getDayHealthColor = (entries: LogEntry[]): string => {
  if (entries.length === 0) return HEALTH_COLORS.empty;

  const avgType = Math.round(entries.reduce((acc, e) => acc + e.type, 0) / entries.length);
  return getHealthColorForType(avgType);
};

/**
 * Generate daily dots for the week view
 */
export const generateDailyDots = (history: DayData[]): DailyDot[] => {
  const weekByDay = getLastWeekByDay(history);
  const weekStart = getLastWeekStart();
  const dots: DailyDot[] = [];

  let i = 0;
  weekByDay.forEach((entries, dateStr) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dayIndex = date.getDay();

    const avgType = entries.length > 0
      ? Math.round(entries.reduce((acc, e) => acc + e.type, 0) / entries.length)
      : undefined;

    dots.push({
      day: DAY_LABELS[dayIndex],
      date: dateStr,
      color: getDayHealthColor(entries),
      hasData: entries.length > 0,
      avgType,
    });

    i++;
  });

  return dots;
};

/**
 * Calculate current streak (consecutive days with at least one log)
 */
export const calculateStreak = (history: DayData[]): number => {
  if (history.length === 0) return 0;

  // Sort by date descending
  const sorted = [...history]
    .filter((d) => d.entries.length > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecentDate = new Date(sorted[0].date);
  mostRecentDate.setHours(0, 0, 0, 0);

  // Streak must be current (today or yesterday)
  if (mostRecentDate < yesterday) return 0;

  let streak = 1;
  let expectedDate = new Date(mostRecentDate);
  expectedDate.setDate(expectedDate.getDate() - 1);

  for (let i = 1; i < sorted.length; i++) {
    const entryDate = new Date(sorted[i].date);
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Get streak message based on length
 */
export const getStreakMessage = (streak: number): string | null => {
  if (streak < 3) return null;
  if (streak < 7) return STREAK_MESSAGES.short;
  if (streak < 14) return STREAK_MESSAGES.medium;
  if (streak < 30) return STREAK_MESSAGES.long;
  return STREAK_MESSAGES.epic;
};

/**
 * Find the most frequent hour range for logging
 */
export const findPeakHour = (entries: LogEntry[]): string | null => {
  if (entries.length < 3) return null;

  const hourBuckets: { [key: string]: number } = {
    'Morning': 0,    // 5-11
    'Midday': 0,     // 11-14
    'Afternoon': 0,  // 14-18
    'Evening': 0,    // 18-22
    'Night': 0,      // 22-5
  };

  entries.forEach((entry) => {
    const hour = new Date(entry.createdAt).getHours();
    if (hour >= 5 && hour < 11) hourBuckets['Morning']++;
    else if (hour >= 11 && hour < 14) hourBuckets['Midday']++;
    else if (hour >= 14 && hour < 18) hourBuckets['Afternoon']++;
    else if (hour >= 18 && hour < 22) hourBuckets['Evening']++;
    else hourBuckets['Night']++;
  });

  const maxBucket = Object.entries(hourBuckets).reduce((max, [key, count]) =>
    count > max.count ? { key, count } : max
  , { key: '', count: 0 });

  return maxBucket.count >= 2 ? maxBucket.key : null;
};

/**
 * Determine week category for message selection
 */
export const getWeekCategory = (entries: LogEntry[], avgType: number | null): WeeklyMessageCategory => {
  if (entries.length === 0) return 'no_data';
  if (entries.length < 3) return 'low_data';

  if (avgType === null) return 'low_data';

  if (avgType >= 3 && avgType <= 4.5) return 'excellent';
  if (avgType >= 2.5 && avgType <= 5) return 'good';
  return 'needs_attention';
};

/**
 * Get a random motivational message for the category
 */
export const getMotivationalMessage = (category: WeeklyMessageCategory): string => {
  const messages = WEEKLY_MESSAGES[category];
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

/**
 * Calculate all digest data
 */
export const calculateDigestData = (history: DayData[]): DigestData => {
  const weekStart = getLastWeekStart();
  const weekEnd = getLastWeekEnd();
  const entries = getLastWeekEntries(history);
  const avgType = calculateAverageType(entries);
  const weekCategory = getWeekCategory(entries, avgType);
  const streak = calculateStreak(history);

  return {
    totalLogs: entries.length,
    dailyDots: generateDailyDots(history),
    avgType,
    healthIndicator: getHealthIndicator(avgType),
    streak,
    streakMessage: getStreakMessage(streak),
    peakHour: findPeakHour(entries),
    message: getMotivationalMessage(weekCategory),
    dateRange: formatDateRange(weekStart, weekEnd),
    weekCategory,
  };
};
