import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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

interface BadgeModalProps {
  visible: boolean;
  achievement: Achievement | null;
  isUnlocked: boolean;
  unlockedAt?: number;
  progress?: { current: number; total: number } | null;
  onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
  visible,
  achievement,
  isUnlocked,
  unlockedAt,
  progress,
  onClose,
}) => {
  const { colors } = useTheme();

  if (!achievement) return null;

  const IconComponent = ICON_MAP[achievement.icon];

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />

          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modal, { backgroundColor: colors.bgSecondary }]}>
              {/* Icon */}
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isUnlocked
                      ? achievement.bgColor
                      : 'rgba(255, 255, 255, 0.05)',
                  },
                ]}
              >
                {isUnlocked ? (
                  IconComponent && (
                    <IconComponent
                      size={48}
                      color={achievement.iconColor}
                      strokeWidth={1.5}
                    />
                  )
                ) : (
                  <Lock size={48} color={colors.textMuted} strokeWidth={1.5} />
                )}
              </View>

              {/* Name */}
              <Text
                style={[
                  styles.name,
                  { color: isUnlocked ? colors.textPrimary : colors.textMuted },
                ]}
              >
                {achievement.name}
              </Text>

              {/* Status */}
              {isUnlocked ? (
                <View style={[styles.statusBadge, styles.statusUnlocked]}>
                  <Text style={styles.statusText}>Unlocked</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, styles.statusLocked]}>
                  <Lock size={12} color="#F59E0B" strokeWidth={2} />
                  <Text style={[styles.statusText, { color: '#F59E0B' }]}>
                    Locked
                  </Text>
                </View>
              )}

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Description or Hint */}
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {isUnlocked ? achievement.description : `Hint: ${achievement.hint}`}
              </Text>

              {/* Progress (if locked and has progress) */}
              {!isUnlocked && progress && (
                <View style={styles.progressSection}>
                  <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                    Your progress
                  </Text>
                  <View style={styles.progressRow}>
                    <View
                      style={[
                        styles.progressBar,
                        { backgroundColor: colors.surface },
                      ]}
                    >
                      <LinearGradient
                        colors={['#8B5CF6', '#A78BFA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.progressFill,
                          {
                            width: `${(progress.current / progress.total) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                      {progress.current} / {progress.total}
                    </Text>
                  </View>
                </View>
              )}

              {/* Unlock date (if unlocked) */}
              {isUnlocked && unlockedAt && (
                <Text style={[styles.unlockDate, { color: colors.textMuted }]}>
                  Unlocked on {formatDate(unlockedAt)}
                </Text>
              )}

              {/* Button */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>
                  {isUnlocked ? 'Nice!' : 'Got it'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusUnlocked: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
  },
  statusLocked: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#4ADE80',
  },
  divider: {
    width: '100%',
    height: 1,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  progressSection: {
    width: '100%',
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    minWidth: 50,
  },
  unlockDate: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
    marginTop: 4,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: '#FFFFFF',
  },
});
