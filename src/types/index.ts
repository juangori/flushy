export interface BristolType {
  type: number;
  emoji: string;
  name: string;
  desc: string;
  health: 'healthy' | 'warning' | 'alert' | 'constipated';
}

export interface QuickTag {
  id: string;
  label: string;
  icon: string;       // Lucide icon name
  iconColor: string;  // Icon color
  bgColor: string;    // Background color (light tint)
}

export type StoolColorHealth = 'normal' | 'attention' | 'alert';

export interface StoolColor {
  id: string;
  name: string;
  hex: string;
  description: string;
  health: StoolColorHealth;
}

export interface LogEntry {
  id: string;
  type: number;
  color?: string;
  time: string;
  tags: string[];
  notes?: string;
  createdAt: number;
}

export interface DayData {
  date: string;
  entries: LogEntry[];
}

export interface Stats {
  streak: number;
  weekCount: number;
  avgType: string;
  healthScore: number | null;
}

// Achievement types
export type {
  AchievementCategory,
  UserStats,
  Achievement,
  UnlockedAchievement,
  AchievementState,
} from './achievements';
