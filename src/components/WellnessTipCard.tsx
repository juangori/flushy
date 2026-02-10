import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Linking,
} from 'react-native';
import {
  X,
  ThumbsUp,
  ThumbsDown,
  Clock,
  ExternalLink,
  Droplets,
  Salad,
  Footprints,
  GlassWater,
  Apple,
  Search,
  Hand,
  Star,
  Trophy,
  Coffee,
  Brain,
  Leaf,
  Moon,
  Milk,
  LucideIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { WellnessTip, WELLNESS_DISCLAIMER } from '../constants/wellnessTips';
import { useTheme } from '../context';
import { FONTS } from '../constants';

// Icon mapping for wellness tips
const ICON_MAP: Record<string, LucideIcon> = {
  Droplets,
  Salad,
  Footprints,
  GlassWater,
  Apple,
  Search,
  Clock,
  Hand,
  Star,
  Trophy,
  Coffee,
  Brain,
  Leaf,
  Moon,
  Milk,
};

interface WellnessTipCardProps {
  tip: WellnessTip;
  onDismiss: () => void;
  onSnooze: () => void;
  onFeedback: (helpful: boolean) => void;
}

export const WellnessTipCard: React.FC<WellnessTipCardProps> = ({
  tip,
  onDismiss,
  onSnooze,
  onFeedback,
}) => {
  const { colors } = useTheme();
  const [showFeedback, setShowFeedback] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const handleDismiss = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onDismiss());
  };

  const handleSnooze = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onSnooze());
  };

  const handleFeedbackPress = async (helpful: boolean) => {
    await Haptics.notificationAsync(
      helpful
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onFeedback(helpful));
  };

  const handleSourcePress = () => {
    if (tip.sourceUrl) {
      Linking.openURL(tip.sourceUrl);
    }
  };

  const priorityColors = {
    high: colors.alert,
    medium: colors.warning,
    low: colors.healthy,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: `${priorityColors[tip.priority]}40`,
          opacity: fadeAnim,
          transform: [
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconContainer, { backgroundColor: tip.bgColor }]}>
            {ICON_MAP[tip.icon] && React.createElement(ICON_MAP[tip.icon], {
              size: 18,
              color: tip.iconColor,
              strokeWidth: 2,
            })}
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {tip.title}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Message */}
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {tip.message}
      </Text>

      {/* Source */}
      {tip.source && (
        <TouchableOpacity
          style={styles.sourceRow}
          onPress={handleSourcePress}
          disabled={!tip.sourceUrl}
        >
          <Text style={[styles.sourceText, { color: colors.textMuted }]}>
            Source: {tip.source}
          </Text>
          {tip.sourceUrl && (
            <ExternalLink size={12} color={colors.textMuted} />
          )}
        </TouchableOpacity>
      )}

      {/* Actions */}
      {!showFeedback ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surfaceHover }]}
            onPress={handleSnooze}
          >
            <Clock size={14} color={colors.textMuted} />
            <Text style={[styles.actionText, { color: colors.textMuted }]}>
              Later
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.feedbackButton,
              { backgroundColor: `${colors.primary}20` },
            ]}
            onPress={() => setShowFeedback(true)}
          >
            <Text style={[styles.actionText, { color: colors.primary }]}>
              Was this helpful?
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.feedbackActions}>
          <TouchableOpacity
            style={[
              styles.feedbackOption,
              { backgroundColor: `${colors.healthy}20` },
            ]}
            onPress={() => handleFeedbackPress(true)}
          >
            <ThumbsUp size={16} color={colors.healthy} />
            <Text style={[styles.feedbackText, { color: colors.healthy }]}>
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.feedbackOption,
              { backgroundColor: `${colors.alert}20` },
            ]}
            onPress={() => handleFeedbackPress(false)}
          >
            <ThumbsDown size={16} color={colors.alert} />
            <Text style={[styles.feedbackText, { color: colors.alert }]}>
              No
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Disclaimer */}
      <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
        {WELLNESS_DISCLAIMER}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  message: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginBottom: 10,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  sourceText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  feedbackButton: {
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  feedbackOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 20,
  },
  feedbackText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  disclaimer: {
    fontSize: 9,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 12,
  },
});
