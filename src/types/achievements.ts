import { DayData, LogEntry } from './index';

export type AchievementCategory = 'consistency' | 'health' | 'timing' | 'insights' | 'special';

export interface UserStats {
  totalLogs: number;
  currentStreak: number;
  longestStreak: number;
  insightsViews: number;
  totalDaysUsed: number;
  tagUsageCount: Record<string, number>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  hint: string;
  icon: string;       // Lucide icon name
  iconColor: string;  // Icon color
  bgColor: string;    // Background color for icon container
  category: AchievementCategory;
  condition: (history: DayData[], stats: UserStats) => boolean;
  progress?: (history: DayData[], stats: UserStats) => { current: number; total: number };
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number; // timestamp
}

export interface AchievementState {
  unlockedAchievements: UnlockedAchievement[];
  insightsViews: number;
  totalDaysUsed: number;
  lastActiveDate: string | null;
}
