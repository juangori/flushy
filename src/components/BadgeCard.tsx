import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  Sprout,
  Calendar,
  CalendarCheck,
  Trophy,
  Star,
  Target,
  Smile,
  Flower2,
  TrendingUp,
  Sunrise,
  Moon,
  Clock,
  Tags,
  Search,
  Brain,
  Gem,
  Medal,
  Leaf,
  Droplets,
  Palette,
  Lock,
  LucideIcon,
} from 'lucide-react-native';
import { Achievement } from '../types';
import { useTheme } from '../context';
import { FONTS } from '../constants';

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Sprout,
  Calendar,
  CalendarCheck,
  Trophy,
  Star,
  Target,
  Smile,
  Flower2,
  TrendingUp,
  Sunrise,
  Moon,
  Clock,
  Tags,
  Search,
  Brain,
  Gem,
  Medal,
  Leaf,
  Droplets,
  Palette,
};

interface BadgeCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockedAt?: number;
  progress?: { current: number; total: number } | null;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  achievement,
  isUnlocked,
  unlockedAt,
  progress,
  onPress,
  size = 'medium',
}) => {
  const { colors } = useTheme();
  const IconComponent = ICON_MAP[achievement.icon];

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const sizeStyles = {
    small: {
      card: { width: 90, height: 110, padding: 12 },
      iconContainer: { width: 40, height: 40, borderRadius: 10 },
      iconSize: 20,
      nameSize: 10,
      dateSize: 8,
    },
    medium: {
      card: { width: 100, height: 125, padding: 12 },
      iconContainer: { width: 48, height: 48, borderRadius: 12 },
      iconSize: 24,
      nameSize: 11,
      dateSize: 9,
    },
    large: {
      card: { width: 120, height: 145, padding: 14 },
      iconContainer: { width: 56, height: 56, borderRadius: 14 },
      iconSize: 28,
      nameSize: 12,
      dateSize: 10,
    },
  };

  const currentSize = sizeStyles[size];

  if (isUnlocked) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)']}
          style={[
            styles.card,
            currentSize.card,
            { borderColor: 'rgba(139, 92, 246, 0.4)' },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              currentSize.iconContainer,
              { backgroundColor: achievement.bgColor },
            ]}
          >
            {IconComponent && (
              <IconComponent
                size={currentSize.iconSize}
                color={achievement.iconColor}
                strokeWidth={2}
              />
            )}
          </View>

          <Text
            style={[
              styles.name,
              { color: colors.textPrimary, fontSize: currentSize.nameSize },
            ]}
            numberOfLines={2}
          >
            {achievement.name}
          </Text>

          {unlockedAt && (
            <Text
              style={[
                styles.date,
                { color: colors.textMuted, fontSize: currentSize.dateSize },
              ]}
            >
              {formatDate(unlockedAt)}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Locked state
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.card,
          styles.cardLocked,
          currentSize.card,
          { backgroundColor: colors.surface, borderColor: colors.borderLight },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            currentSize.iconContainer,
            { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
          ]}
        >
          <Lock
            size={currentSize.iconSize}
            color={colors.textMuted}
            strokeWidth={1.5}
          />
        </View>

        <Text
          style={[
            styles.name,
            styles.nameLocked,
            { color: colors.textMuted, fontSize: currentSize.nameSize },
          ]}
          numberOfLines={2}
        >
          {achievement.name}
        </Text>

        {progress && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(progress.current / progress.total) * 100}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.progressText,
                { color: colors.textMuted, fontSize: currentSize.dateSize },
              ]}
            >
              {progress.current}/{progress.total}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
  },
  cardLocked: {
    opacity: 0.7,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: {
    fontFamily: FONTS.medium,
    textAlign: 'center',
    lineHeight: 14,
  },
  nameLocked: {
    opacity: 0.6,
  },
  date: {
    fontFamily: FONTS.regular,
    marginTop: 4,
  },
  progressContainer: {
    width: '100%',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  progressText: {
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginTop: 2,
  },
});
