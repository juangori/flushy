import { BristolType, QuickTag } from '../types';

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
  { id: 'coffee', emoji: '☕', label: 'Coffee' },
  { id: 'spicy', emoji: '🌶️', label: 'Spicy food' },
  { id: 'alcohol', emoji: '🍷', label: 'Alcohol' },
  { id: 'fiber', emoji: '🥗', label: 'High fiber' },
  { id: 'stress', emoji: '😰', label: 'Stressed' },
  { id: 'meds', emoji: '💊', label: 'Medication' },
  { id: 'travel', emoji: '✈️', label: 'Traveling' },
  { id: 'period', emoji: '🔴', label: 'Period' },
  { id: 'dairy', emoji: '🧀', label: 'Dairy' },
  { id: 'exercise', emoji: '🏃', label: 'Exercise' },
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

export const STORAGE_KEY = '@plop_history';

export const getHealthColor = (health: BristolType['health']): string => {
  switch (health) {
    case 'healthy': return COLORS.healthy;
    case 'warning': return COLORS.warning;
    case 'alert': return COLORS.alert;
    case 'constipated': return COLORS.constipated;
    default: return COLORS.textMuted;
  }
};
