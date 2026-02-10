export type ThemeId = 'dark' | 'light' | 'nature' | 'blush' | 'mono';

export interface ThemeColors {
  // Background gradient
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;

  // Accent colors
  primary: string;
  primaryLight: string;

  // Health indicator colors (these stay consistent across themes for clarity)
  healthy: string;
  warning: string;
  alert: string;
  constipated: string;

  // UI colors
  white: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Button text (always readable on primary/success gradients)
  buttonText: string;

  // Surface colors
  surface: string;
  surfaceHover: string;
  border: string;
  borderLight: string;
}

export type ThemeIcon = 'Moon' | 'Sun' | 'Leaf' | 'Flower2' | 'Circle';

export interface Theme {
  id: ThemeId;
  name: string;
  icon: ThemeIcon;
  colors: ThemeColors;
}

// Dark theme (current default)
const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  icon: 'Moon',
  colors: {
    bgPrimary: '#1a1a2e',
    bgSecondary: '#16213e',
    bgTertiary: '#0f0f23',
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    healthy: '#4ADE80',
    warning: '#FBBF24',
    alert: '#F87171',
    constipated: '#A78BFA',
    white: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    buttonText: '#FFFFFF',
    surface: 'rgba(255, 255, 255, 0.05)',
    surfaceHover: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
  },
};

// Light minimalist theme
const lightTheme: Theme = {
  id: 'light',
  name: 'Light',
  icon: 'Sun',
  colors: {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F8FAFC',
    bgTertiary: '#F1F5F9',
    primary: '#6366F1',
    primaryLight: '#818CF8',
    healthy: '#22C55E',
    warning: '#F59E0B',
    alert: '#EF4444',
    constipated: '#8B5CF6',
    white: '#FFFFFF',
    textPrimary: '#1E293B',
    textSecondary: 'rgba(30, 41, 59, 0.7)',
    textMuted: 'rgba(30, 41, 59, 0.5)',
    buttonText: '#FFFFFF',
    surface: 'rgba(0, 0, 0, 0.03)',
    surfaceHover: 'rgba(0, 0, 0, 0.05)',
    border: 'rgba(0, 0, 0, 0.08)',
    borderLight: 'rgba(0, 0, 0, 0.04)',
  },
};

// Nature theme (greens)
const natureTheme: Theme = {
  id: 'nature',
  name: 'Nature',
  icon: 'Leaf',
  colors: {
    bgPrimary: '#1A2F1A',
    bgSecondary: '#152815',
    bgTertiary: '#0F1F0F',
    primary: '#4ADE80',
    primaryLight: '#86EFAC',
    healthy: '#4ADE80',
    warning: '#FBBF24',
    alert: '#F87171',
    constipated: '#C4B5FD',
    white: '#FFFFFF',
    textPrimary: '#ECFDF5',
    textSecondary: 'rgba(236, 253, 245, 0.7)',
    textMuted: 'rgba(236, 253, 245, 0.5)',
    buttonText: '#FFFFFF',
    surface: 'rgba(74, 222, 128, 0.08)',
    surfaceHover: 'rgba(74, 222, 128, 0.12)',
    border: 'rgba(74, 222, 128, 0.1)',
    borderLight: 'rgba(74, 222, 128, 0.06)',
  },
};

// Blush theme (pastel pink)
const blushTheme: Theme = {
  id: 'blush',
  name: 'Blush',
  icon: 'Flower2',
  colors: {
    bgPrimary: '#FDF2F8',
    bgSecondary: '#FCE7F3',
    bgTertiary: '#FBCFE8',
    primary: '#EC4899',
    primaryLight: '#F472B6',
    healthy: '#34D399',
    warning: '#FBBF24',
    alert: '#F87171',
    constipated: '#A78BFA',
    white: '#FFFFFF',
    textPrimary: '#831843',
    textSecondary: 'rgba(131, 24, 67, 0.7)',
    textMuted: 'rgba(131, 24, 67, 0.5)',
    buttonText: '#FFFFFF',
    surface: 'rgba(236, 72, 153, 0.08)',
    surfaceHover: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.15)',
    borderLight: 'rgba(236, 72, 153, 0.08)',
  },
};

// Mono theme (grayscale)
const monoTheme: Theme = {
  id: 'mono',
  name: 'Mono',
  icon: 'Circle',
  colors: {
    bgPrimary: '#18181B',
    bgSecondary: '#27272A',
    bgTertiary: '#09090B',
    primary: '#A1A1AA',
    primaryLight: '#D4D4D8',
    healthy: '#4ADE80',
    warning: '#FBBF24',
    alert: '#F87171',
    constipated: '#A78BFA',
    white: '#FFFFFF',
    textPrimary: '#FAFAFA',
    textSecondary: 'rgba(250, 250, 250, 0.7)',
    textMuted: 'rgba(250, 250, 250, 0.45)',
    buttonText: '#FFFFFF',
    surface: 'rgba(255, 255, 255, 0.05)',
    surfaceHover: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
  },
};

export const THEMES: Record<ThemeId, Theme> = {
  dark: darkTheme,
  light: lightTheme,
  nature: natureTheme,
  blush: blushTheme,
  mono: monoTheme,
};

export const THEME_LIST: Theme[] = [darkTheme, lightTheme, natureTheme, blushTheme, monoTheme];

export const DEFAULT_THEME_ID: ThemeId = 'dark';
