import { BristolType, QuickTag, StoolColor, StoolColorHealth } from '../types';

export { FONTS, TYPOGRAPHY } from './fonts';
export {
  WELLNESS_TIPS,
  TIP_COOLDOWNS,
  WELLNESS_DISCLAIMER,
  WELLNESS_SOURCES,
  FULL_DISCLAIMER,
  PRIVACY_STATEMENT,
} from './wellnessTips';
export type { WellnessTip, PatternType } from './wellnessTips';
export {
  AGE_OPTIONS,
  SEX_OPTIONS,
  CONDITION_OPTIONS,
  CONDITION_EFFECTS,
  AGE_EFFECTS,
  DEFAULT_USER_PROFILE,
} from './userProfile';
export type {
  UserProfile,
  AgeRange,
  BiologicalSex,
  HealthCondition,
} from './userProfile';
export {
  WEEKLY_MESSAGES,
  HEALTH_INDICATORS,
  STREAK_MESSAGES,
} from './weeklyMessages';
export type { WeeklyMessageCategory, HealthIndicatorType } from './weeklyMessages';

export const BRISTOL_TYPES: BristolType[] = [
  { type: 1, emoji: '🫘', name: 'Separate lumps', desc: 'Hard to pass', health: 'constipated' },
  { type: 2, emoji: '🥜', name: 'Lumpy sausage', desc: 'Slightly hard', health: 'constipated' },
  { type: 3, emoji: '🌭', name: 'Cracked sausage', desc: 'Normal', health: 'healthy' },
  { type: 4, emoji: '🐍', name: 'Smooth snake', desc: 'Ideal', health: 'healthy' },
  { type: 5, emoji: '☁️', name: 'Soft blobs', desc: 'Soft pieces', health: 'warning' },
  { type: 6, emoji: '🌊', name: 'Mushy', desc: 'Mild diarrhea', health: 'warning' },
  { type: 7, emoji: '💧', name: 'Liquid', desc: 'Diarrhea', health: 'alert' },
];

export const QUICK_TAGS: QuickTag[] = [
  { id: 'coffee', label: 'Coffee', icon: 'Coffee', iconColor: '#92400E', bgColor: '#FEF3C7' },
  { id: 'spicy', label: 'Spicy food', icon: 'Flame', iconColor: '#DC2626', bgColor: '#FEE2E2' },
  { id: 'alcohol', label: 'Alcohol', icon: 'Wine', iconColor: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'fiber', label: 'High fiber', icon: 'Salad', iconColor: '#16A34A', bgColor: '#DCFCE7' },
  { id: 'water', label: 'Hydrated', icon: 'GlassWater', iconColor: '#0EA5E9', bgColor: '#E0F2FE' },
  { id: 'stress', label: 'Stressed', icon: 'Frown', iconColor: '#EA580C', bgColor: '#FFEDD5' },
  { id: 'meds', label: 'Medication', icon: 'Pill', iconColor: '#2563EB', bgColor: '#DBEAFE' },
  { id: 'travel', label: 'Traveling', icon: 'Plane', iconColor: '#0891B2', bgColor: '#CFFAFE' },
  { id: 'period', label: 'Period', icon: 'Droplets', iconColor: '#E11D48', bgColor: '#FFE4E6' },
  { id: 'dairy', label: 'Dairy', icon: 'Milk', iconColor: '#CA8A04', bgColor: '#FEF9C3' },
  { id: 'exercise', label: 'Exercise', icon: 'Dumbbell', iconColor: '#059669', bgColor: '#D1FAE5' },
];

export const STOOL_COLORS: StoolColor[] = [
  { id: 'brown', name: 'Brown', hex: '#8B4513', description: 'Normal, healthy digestion', health: 'normal' },
  { id: 'dark-brown', name: 'Dark Brown', hex: '#4A2C0A', description: 'Normal, high-protein diet', health: 'normal' },
  { id: 'light-brown', name: 'Light Brown', hex: '#C4A265', description: 'Normal, low-fiber diet', health: 'normal' },
  { id: 'green', name: 'Green', hex: '#3A7D44', description: 'Fast transit or leafy greens', health: 'attention' },
  { id: 'yellow', name: 'Yellow', hex: '#D4A017', description: 'Possible fat malabsorption', health: 'attention' },
  { id: 'black', name: 'Black', hex: '#1C1C1C', description: 'Possible upper GI bleeding or iron', health: 'alert' },
  { id: 'red', name: 'Red', hex: '#B22222', description: 'Possible lower GI bleeding or foods', health: 'alert' },
  { id: 'white-pale', name: 'White / Pale', hex: '#D3CBC2', description: 'Possible bile duct or liver issues', health: 'alert' },
];

export const COLORS = {
  // Background gradient
  bgPrimary: '#1a1a2e',
  bgSecondary: '#16213e',
  bgTertiary: '#0f0f23',

  // Accent colors
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',

  // Health indicator colors
  healthy: '#4ADE80',
  warning: '#FBBF24',
  alert: '#F87171',
  constipated: '#A78BFA',

  // UI colors
  white: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',

  // Surface colors
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceHover: 'rgba(255, 255, 255, 0.08)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
};

// Storage keys - centralized
export { STORAGE_KEYS, ALL_STORAGE_KEYS } from './storageKeys';
export type { StorageKey } from './storageKeys';

// Legacy exports for backwards compatibility
export const STORAGE_KEY = '@flushy_history';
export const LEGACY_STORAGE_KEY = '@plop_history';

export const getHealthColor = (health: BristolType['health']): string => {
  switch (health) {
    case 'healthy': return COLORS.healthy;
    case 'warning': return COLORS.warning;
    case 'alert': return COLORS.alert;
    case 'constipated': return COLORS.constipated;
    default: return COLORS.textMuted;
  }
};

export const getStoolColorHealthColor = (health: StoolColorHealth): string => {
  switch (health) {
    case 'normal': return COLORS.healthy;
    case 'attention': return COLORS.warning;
    case 'alert': return COLORS.alert;
    default: return COLORS.textMuted;
  }
};

export const getStoolColorById = (id: string): StoolColor | undefined => {
  return STOOL_COLORS.find(c => c.id === id);
};

// Achievement exports
export { ACHIEVEMENTS, getAchievementById } from './achievements';

// Icon maps - centralized
export {
  ACHIEVEMENT_ICON_MAP,
  HEALTH_ICON_MAP,
  TAG_ICON_MAP,
  WELLNESS_TIP_ICON_MAP,
  CONDITION_ICON_MAP,
} from './iconMaps';
