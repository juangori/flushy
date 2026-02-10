import { DayData, LogEntry } from '../types';

/**
 * Get today's date string in YYYY-MM-DD format
 */
const getTodayString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

/**
 * Parse date string to Date object (local time)
 */
const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Calculate consecutive days with at least one log
 */
export function consecutiveDaysWithLogs(history: DayData[]): number {
  if (history.length === 0) return 0;

  const sorted = [...history].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const day = sorted[i];
    const dayDate = parseDate(day.date);
    dayDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    // Allow for "yesterday" to be valid if no entry today yet
    if (i === 0 && dayDate.getTime() !== expectedDate.getTime()) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      if (dayDate.getTime() === yesterday.getTime()) {
        streak++;
        continue;
      }
    }

    if (dayDate.getTime() !== expectedDate.getTime()) break;

    if (day.entries.length > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Check if there are N consecutive days that satisfy a condition
 */
export function consecutiveDaysWithCondition(
  history: DayData[],
  requiredDays: number,
  condition: (entries: LogEntry[]) => boolean
): boolean {
  if (history.length < requiredDays) return false;

  const sorted = [...history].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let consecutive = 0;
  let lastDate: Date | null = null;

  for (const day of sorted) {
    const currentDate = parseDate(day.date);

    if (lastDate) {
      const diffDays = Math.floor(
        (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays !== 1) {
        consecutive = 0;
      }
    }

    if (day.entries.length > 0 && condition(day.entries)) {
      consecutive++;
      if (consecutive >= requiredDays) return true;
    } else {
      consecutive = 0;
    }

    lastDate = currentDate;
  }

  return false;
}

/**
 * Count current streak of days that satisfy a condition (from today backwards)
 */
export function currentStreakWithCondition(
  history: DayData[],
  condition: (entries: LogEntry[]) => boolean
): number {
  const sorted = [...history].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const day = sorted[i];
    const dayDate = parseDate(day.date);
    dayDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    // Allow starting from yesterday if no entry today
    if (i === 0 && dayDate.getTime() !== expectedDate.getTime()) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      if (dayDate.getTime() === yesterday.getTime() && day.entries.length > 0 && condition(day.entries)) {
        streak++;
        continue;
      } else {
        break;
      }
    }

    if (dayDate.getTime() !== expectedDate.getTime()) break;

    if (day.entries.length > 0 && condition(day.entries)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Check if user logs at consistent timing (within tolerance)
 */
export function hasConsistentTiming(
  history: DayData[],
  requiredDays: number,
  toleranceMinutes: number
): boolean {
  const sorted = [...history].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const recentDays = sorted.slice(0, requiredDays);
  if (recentDays.length < requiredDays) return false;

  // Get the time of the first log of each day
  const times: number[] = [];
  for (const day of recentDays) {
    if (day.entries.length === 0) return false;
    const [hours, minutes] = day.entries[0].time.split(':').map(Number);
    times.push(hours * 60 + minutes);
  }

  if (times.length < requiredDays) return false;

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

  // Check if all times are within tolerance of average
  return times.every(t => Math.abs(t - avgTime) <= toleranceMinutes);
}

/**
 * Count logs that have at least one tag
 */
export function countLogsWithTags(history: DayData[]): number {
  const allEntries = history.flatMap(d => d.entries);
  return allEntries.filter(e => e.tags && e.tags.length > 0).length;
}

/**
 * Count usage of each tag
 */
export function countTagUsage(history: DayData[]): Record<string, number> {
  const counts: Record<string, number> = {};
  const allEntries = history.flatMap(d => d.entries);

  for (const entry of allEntries) {
    if (entry.tags) {
      for (const tag of entry.tags) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
  }

  return counts;
}

/**
 * Check if there was an improvement (to type 3-4) after using a specific tag
 * When user had type 1-2 or 6-7, used the tag, and then got type 3-4
 */
export function hasImprovedAfterTag(history: DayData[], tagId: string): boolean {
  const sorted = [...history].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Look for pattern: irregular -> tag used -> improvement
  for (let i = 0; i < sorted.length - 1; i++) {
    const day = sorted[i];
    const nextDay = sorted[i + 1];

    // Check if current day has irregular type and tag
    const hasIrregularWithTag = day.entries.some(e =>
      (e.type <= 2 || e.type >= 6) && e.tags.includes(tagId)
    );

    if (hasIrregularWithTag) {
      // Check if next day has improvement
      const hasImprovement = nextDay.entries.some(e => e.type >= 3 && e.type <= 4);
      if (hasImprovement) return true;
    }

    // Also check within same day
    for (let j = 0; j < day.entries.length - 1; j++) {
      const entry = day.entries[j];
      const nextEntry = day.entries[j + 1];

      if ((entry.type <= 2 || entry.type >= 6) && entry.tags.includes(tagId)) {
        if (nextEntry.type >= 3 && nextEntry.type <= 4) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Count consecutive recent entries that have a color logged
 */
export function consecutiveEntriesWithColor(history: DayData[]): number {
  // Get all entries sorted by date and time (most recent first)
  const allEntries: Array<LogEntry & { date: string }> = [];

  for (const day of history) {
    for (const entry of day.entries) {
      allEntries.push({ ...entry, date: day.date });
    }
  }

  // Sort by date and createdAt descending
  allEntries.sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  let count = 0;
  for (const entry of allEntries) {
    if (entry.color && entry.color.trim() !== '') {
      count++;
    } else {
      break;
    }
  }

  return count;
}

/**
 * Calculate total unique days with entries
 */
export function countTotalDaysWithEntries(history: DayData[]): number {
  return history.filter(d => d.entries.length > 0).length;
}

/**
 * Calculate total number of entries
 */
export function countTotalEntries(history: DayData[]): number {
  return history.flatMap(d => d.entries).length;
}
