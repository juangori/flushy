import { Achievement, AchievementCategory, UserStats } from '../types';
import { DayData, LogEntry } from '../types';
import {
  consecutiveDaysWithLogs,
  consecutiveDaysWithCondition,
  currentStreakWithCondition,
  hasConsistentTiming,
  countLogsWithTags,
  hasImprovedAfterTag,
  consecutiveEntriesWithColor,
} from '../utils/achievementHelpers';

// Achievement icon colors - matching app theme
const ICON_COLORS = {
  gold: '#F59E0B',
  green: '#10B981',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  cyan: '#06B6D4',
  indigo: '#6366F1',
  rose: '#F43F5E',
  emerald: '#059669',
};

const BG_COLORS = {
  gold: '#FEF3C7',
  green: '#D1FAE5',
  blue: '#DBEAFE',
  purple: '#EDE9FE',
  pink: '#FCE7F3',
  orange: '#FFEDD5',
  cyan: '#CFFAFE',
  indigo: '#E0E7FF',
  rose: '#FFE4E6',
  emerald: '#ECFDF5',
};

export const ACHIEVEMENTS: Achievement[] = [
  // ==================== CONSISTENCY ====================
  {
    id: 'first_flush',
    name: 'First Flush',
    description: 'Welcome! Your gut health journey begins',
    hint: 'Log your first bowel movement',
    icon: 'Sparkles',
    iconColor: ICON_COLORS.gold,
    bgColor: BG_COLORS.gold,
    category: 'consistency',
    condition: (history) => {
      const totalEntries = history.flatMap(d => d.entries).length;
      return totalEntries >= 1;
    },
  },
  {
    id: 'threes_company',
    name: "Three's Company",
    description: 'Building a healthy habit!',
    hint: 'Log for 3 days in a row',
    icon: 'Sprout',
    iconColor: ICON_COLORS.green,
    bgColor: BG_COLORS.green,
    category: 'consistency',
    condition: (history, stats) => stats.currentStreak >= 3,
    progress: (history, stats) => ({
      current: Math.min(stats.currentStreak, 3),
      total: 3,
    }),
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'A full week of tracking!',
    hint: 'Log for 7 days in a row',
    icon: 'Calendar',
    iconColor: ICON_COLORS.blue,
    bgColor: BG_COLORS.blue,
    category: 'consistency',
    condition: (history, stats) => stats.currentStreak >= 7,
    progress: (history, stats) => ({
      current: Math.min(stats.currentStreak, 7),
      total: 7,
    }),
  },
  {
    id: 'fortnight_fighter',
    name: 'Fortnight Fighter',
    description: 'Two weeks strong!',
    hint: 'Log for 14 days in a row',
    icon: 'CalendarCheck',
    iconColor: ICON_COLORS.purple,
    bgColor: BG_COLORS.purple,
    category: 'consistency',
    condition: (history, stats) => stats.currentStreak >= 14,
    progress: (history, stats) => ({
      current: Math.min(stats.currentStreak, 14),
      total: 14,
    }),
  },
  {
    id: 'monthly_master',
    name: 'Monthly Master',
    description: 'A month of mindful tracking!',
    hint: 'Log for 30 days in a row',
    icon: 'Trophy',
    iconColor: ICON_COLORS.gold,
    bgColor: BG_COLORS.gold,
    category: 'consistency',
    condition: (history, stats) => stats.currentStreak >= 30,
    progress: (history, stats) => ({
      current: Math.min(stats.currentStreak, 30),
      total: 30,
    }),
  },

  // ==================== DIGESTIVE HEALTH ====================
  {
    id: 'golden_standard',
    name: 'Golden Standard',
    description: 'The ideal type! Your gut is happy',
    hint: 'Log a Type 4 bowel movement',
    icon: 'Star',
    iconColor: ICON_COLORS.gold,
    bgColor: BG_COLORS.gold,
    category: 'health',
    condition: (history) => {
      const allEntries = history.flatMap(d => d.entries);
      return allEntries.some(e => e.type === 4);
    },
  },
  {
    id: 'smooth_operator',
    name: 'Smooth Operator',
    description: 'A week of perfect digestion!',
    hint: 'Log Type 3 or 4 for 7 days straight',
    icon: 'Target',
    iconColor: ICON_COLORS.green,
    bgColor: BG_COLORS.green,
    category: 'health',
    condition: (history) => {
      return consecutiveDaysWithCondition(history, 7, (entries) => {
        return entries.length > 0 && entries.every(e => e.type >= 3 && e.type <= 4);
      });
    },
    progress: (history) => ({
      current: Math.min(currentStreakWithCondition(history, (entries) =>
        entries.length > 0 && entries.every(e => e.type >= 3 && e.type <= 4)
      ), 7),
      total: 7,
    }),
  },
  {
    id: 'gut_feeling',
    name: 'Gut Feeling',
    description: 'Your gut is in great shape!',
    hint: 'Log Type 3 or 4 for 14 days straight',
    icon: 'Smile',
    iconColor: ICON_COLORS.orange,
    bgColor: BG_COLORS.orange,
    category: 'health',
    condition: (history) => {
      return consecutiveDaysWithCondition(history, 14, (entries) => {
        return entries.length > 0 && entries.every(e => e.type >= 3 && e.type <= 4);
      });
    },
    progress: (history) => ({
      current: Math.min(currentStreakWithCondition(history, (entries) =>
        entries.length > 0 && entries.every(e => e.type >= 3 && e.type <= 4)
      ), 14),
      total: 14,
    }),
  },
  {
    id: 'digestive_zen',
    name: 'Digestive Zen',
    description: 'Mastery achieved! Incredible consistency',
    hint: 'Log Type 3 or 4 for 30 days straight',
    icon: 'Flower2',
    iconColor: ICON_COLORS.pink,
    bgColor: BG_COLORS.pink,
    category: 'health',
    condition: (history) => {
      return consecutiveDaysWithCondition(history, 30, (entries) => {
        return entries.length > 0 && entries.every(e => e.type >= 3 && e.type <= 4);
      });
    },
    progress: (history) => ({
      current: Math.min(currentStreakWithCondition(history, (entries) =>
        entries.length > 0 && entries.every(e => e.type >= 3 && e.type <= 4)
      ), 30),
      total: 30,
    }),
  },
  {
    id: 'bounce_back',
    name: 'Bounce Back',
    description: 'Great recovery! Your body is resilient',
    hint: 'Log Type 3-4 after 3+ days of irregular stools',
    icon: 'TrendingUp',
    iconColor: ICON_COLORS.emerald,
    bgColor: BG_COLORS.emerald,
    category: 'health',
    condition: (history) => {
      // Check if there's a recovery pattern: 3+ days of type 1-2 or 6-7, followed by type 3-4
      const sorted = [...history].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      for (let i = 0; i < sorted.length; i++) {
        const day = sorted[i];
        const hasGoodType = day.entries.some(e => e.type >= 3 && e.type <= 4);

        if (hasGoodType) {
          // Check previous 3 days for irregular stools
          let irregularDays = 0;
          for (let j = i + 1; j < Math.min(i + 4, sorted.length); j++) {
            const prevDay = sorted[j];
            const hasIrregular = prevDay.entries.some(e => e.type <= 2 || e.type >= 6);
            if (hasIrregular) {
              irregularDays++;
            }
          }
          if (irregularDays >= 3) {
            return true;
          }
        }
      }
      return false;
    },
  },

  // ==================== TIMING ====================
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Early morning productivity!',
    hint: 'Log before 7:00 AM',
    icon: 'Sunrise',
    iconColor: ICON_COLORS.orange,
    bgColor: BG_COLORS.orange,
    category: 'timing',
    condition: (history) => {
      const allEntries = history.flatMap(d => d.entries);
      return allEntries.some(e => {
        const [hours] = e.time.split(':').map(Number);
        return hours < 7;
      });
    },
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Burning the midnight oil!',
    hint: 'Log after 11:00 PM',
    icon: 'Moon',
    iconColor: ICON_COLORS.indigo,
    bgColor: BG_COLORS.indigo,
    category: 'timing',
    condition: (history) => {
      const allEntries = history.flatMap(d => d.entries);
      return allEntries.some(e => {
        const [hours] = e.time.split(':').map(Number);
        return hours >= 23;
      });
    },
  },
  {
    id: 'clockwork',
    name: 'Clockwork',
    description: 'Your body loves routine!',
    hint: 'Log at the same time (±1 hour) for 7 days',
    icon: 'Clock',
    iconColor: ICON_COLORS.cyan,
    bgColor: BG_COLORS.cyan,
    category: 'timing',
    condition: (history) => {
      return hasConsistentTiming(history, 7, 60);
    },
    progress: (history) => {
      // Count consecutive days with consistent timing
      let count = 0;
      const sorted = [...history].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      if (sorted.length < 2) return { current: sorted.length, total: 7 };

      const times: number[] = [];
      for (const day of sorted) {
        if (day.entries.length === 0) break;
        const [hours, minutes] = day.entries[0].time.split(':').map(Number);
        times.push(hours * 60 + minutes);
        count++;
        if (count >= 7) break;
      }

      if (times.length < 2) return { current: times.length, total: 7 };

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      let consistentCount = 0;
      for (const t of times) {
        if (Math.abs(t - avgTime) <= 60) {
          consistentCount++;
        } else {
          break;
        }
      }

      return { current: Math.min(consistentCount, 7), total: 7 };
    },
  },

  // ==================== INSIGHTS ====================
  {
    id: 'tag_team',
    name: 'Tag Team',
    description: 'Great job tracking factors!',
    hint: 'Use tags in 10 different logs',
    icon: 'Tags',
    iconColor: ICON_COLORS.purple,
    bgColor: BG_COLORS.purple,
    category: 'insights',
    condition: (history) => {
      return countLogsWithTags(history) >= 10;
    },
    progress: (history) => ({
      current: Math.min(countLogsWithTags(history), 10),
      total: 10,
    }),
  },
  {
    id: 'pattern_spotter',
    name: 'Pattern Spotter',
    description: 'Knowledge is power!',
    hint: 'View the Insights tab 5 times',
    icon: 'Search',
    iconColor: ICON_COLORS.blue,
    bgColor: BG_COLORS.blue,
    category: 'insights',
    condition: (history, stats) => {
      return stats.insightsViews >= 5;
    },
    progress: (history, stats) => ({
      current: Math.min(stats.insightsViews, 5),
      total: 5,
    }),
  },
  {
    id: 'self_aware',
    name: 'Self Aware',
    description: 'A month of gut awareness!',
    hint: 'Use the app for 30 different days',
    icon: 'Brain',
    iconColor: ICON_COLORS.pink,
    bgColor: BG_COLORS.pink,
    category: 'insights',
    condition: (history, stats) => {
      return stats.totalDaysUsed >= 30;
    },
    progress: (history, stats) => ({
      current: Math.min(stats.totalDaysUsed, 30),
      total: 30,
    }),
  },

  // ==================== SPECIAL / EASTER EGGS ====================
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Flawless! Absolutely perfect week',
    hint: 'Log exactly Type 4, every day, for a full week',
    icon: 'Gem',
    iconColor: ICON_COLORS.cyan,
    bgColor: BG_COLORS.cyan,
    category: 'special',
    condition: (history) => {
      return consecutiveDaysWithCondition(history, 7, (entries) => {
        return entries.length > 0 && entries.every(e => e.type === 4);
      });
    },
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: '100 logs! Dedication pays off',
    hint: 'Log 100 bowel movements total',
    icon: 'Medal',
    iconColor: ICON_COLORS.gold,
    bgColor: BG_COLORS.gold,
    category: 'special',
    condition: (history, stats) => {
      return stats.totalLogs >= 100;
    },
    progress: (history, stats) => ({
      current: Math.min(stats.totalLogs, 100),
      total: 100,
    }),
  },
  {
    id: 'fiber_friend',
    name: 'Fiber Friend',
    description: 'Fiber is your friend indeed!',
    hint: 'Use the fiber tag 10 times while maintaining healthy stools',
    icon: 'Leaf',
    iconColor: ICON_COLORS.green,
    bgColor: BG_COLORS.green,
    category: 'special',
    condition: (history, stats) => {
      const fiberCount = stats.tagUsageCount['fiber'] || 0;
      if (fiberCount < 10) return false;

      // Check if average type is 3-4 for entries with fiber tag
      const fiberEntries = history.flatMap(d => d.entries).filter(e => e.tags.includes('fiber'));
      if (fiberEntries.length === 0) return false;

      const avgType = fiberEntries.reduce((sum, e) => sum + e.type, 0) / fiberEntries.length;
      return avgType >= 3 && avgType <= 4;
    },
    progress: (history, stats) => ({
      current: Math.min(stats.tagUsageCount['fiber'] || 0, 10),
      total: 10,
    }),
  },
  {
    id: 'hydration_hero',
    name: 'Hydration Hero',
    description: 'Hydration for the win!',
    hint: 'See improvement after staying hydrated',
    icon: 'Droplets',
    iconColor: ICON_COLORS.blue,
    bgColor: BG_COLORS.blue,
    category: 'special',
    condition: (history) => {
      return hasImprovedAfterTag(history, 'water');
    },
  },
  {
    id: 'color_conscious',
    name: 'Color Conscious',
    description: 'Tracking every detail!',
    hint: 'Log color for 10 entries in a row',
    icon: 'Palette',
    iconColor: ICON_COLORS.rose,
    bgColor: BG_COLORS.rose,
    category: 'special',
    condition: (history) => {
      return consecutiveEntriesWithColor(history) >= 10;
    },
    progress: (history) => ({
      current: Math.min(consecutiveEntriesWithColor(history), 10),
      total: 10,
    }),
  },
];

// Category labels for UI
export const ACHIEVEMENT_CATEGORIES: Record<AchievementCategory, string> = {
  consistency: 'Consistency',
  health: 'Digestive Health',
  timing: 'Timing',
  insights: 'Insights',
  special: 'Special',
};

// Get achievements by category
export const getAchievementsByCategory = (category: AchievementCategory): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.category === category);
};

// Get achievement by ID
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};
