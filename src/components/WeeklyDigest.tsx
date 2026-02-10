import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Share2,
  Flame,
  Clock,
  Sparkles,
  Trophy,
  Sprout,
  Calendar,
  CalendarCheck,
  Star,
  Target,
  Smile,
  Flower2,
  TrendingUp,
  Sunrise,
  Moon,
  Tags,
  Search,
  Brain,
  Gem,
  Medal,
  Leaf,
  Droplets,
  Palette,
  ThumbsUp,
  CircleCheck,
  HeartPulse,
  LucideIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import ViewShot from 'react-native-view-shot';
import { useTheme } from '../context';
import { FONTS } from '../constants';
import { DigestData } from '../utils/digestCalculations';
import { Achievement, UnlockedAchievement } from '../types';
import { getAchievementById } from '../constants/achievements';

// Icon mapping for achievements
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

// Icon mapping for health indicators
const HEALTH_ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  ThumbsUp,
  CircleCheck,
  HeartPulse,
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WeeklyDigestProps {
  visible: boolean;
  data: DigestData;
  onDismiss: () => void;
  weeklyAchievements?: UnlockedAchievement[];
}

export const WeeklyDigest: React.FC<WeeklyDigestProps> = ({
  visible,
  data,
  onDismiss,
  weeklyAchievements = [],
}) => {
  const { colors } = useTheme();
  const viewShotRef = useRef<ViewShot>(null);

  // Animation values
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bigNumberScale = useRef(new Animated.Value(0.8)).current;
  const bigNumberOpacity = useRef(new Animated.Value(0)).current;
  const dotsAnims = useRef(data.dailyDots.map(() => new Animated.Value(0))).current;
  const avgOpacity = useRef(new Animated.Value(0)).current;
  const streakScale = useRef(new Animated.Value(0.5)).current;
  const streakOpacity = useRef(new Animated.Value(0)).current;
  const peakOpacity = useRef(new Animated.Value(0)).current;
  const badgesOpacity = useRef(new Animated.Value(0)).current;
  const badgesScale = useRef(new Animated.Value(0.8)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      slideAnim.setValue(100);
      fadeAnim.setValue(0);
      bigNumberScale.setValue(0.8);
      bigNumberOpacity.setValue(0);
      dotsAnims.forEach((anim) => anim.setValue(0));
      avgOpacity.setValue(0);
      streakScale.setValue(0.5);
      streakOpacity.setValue(0);
      peakOpacity.setValue(0);
      badgesOpacity.setValue(0);
      badgesScale.setValue(0.8);
      messageOpacity.setValue(0);
      buttonOpacity.setValue(0);

      // Start animation sequence
      Animated.sequence([
        // Modal slides up and fades in
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),

        // Big number appears
        Animated.parallel([
          Animated.spring(bigNumberScale, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(bigNumberOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),

        // Dots appear one by one
        Animated.stagger(
          60,
          dotsAnims.map((anim) =>
            Animated.spring(anim, {
              toValue: 1,
              friction: 8,
              tension: 50,
              useNativeDriver: true,
            })
          )
        ),

        // Average type fades in
        Animated.timing(avgOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),

        // Peak hour fades in
        Animated.timing(peakOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),

        // Streak badge bounces in
        Animated.parallel([
          Animated.spring(streakScale, {
            toValue: 1,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(streakOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),

        // Badges section appears
        Animated.parallel([
          Animated.spring(badgesScale, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(badgesOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),

        // Message fades in
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),

        // Button fades in
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (viewShotRef.current?.capture) {
        // Capture the shareable card as an image
        const uri = await viewShotRef.current.capture();

        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share your weekly digest',
          });
        }
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  }, []);

  const getHealthColor = () => {
    switch (data.weekCategory) {
      case 'excellent':
        return colors.healthy;
      case 'good':
        return colors.primary;
      case 'needs_attention':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <LinearGradient
          colors={[colors.bgPrimary, colors.bgSecondary, colors.bgTertiary]}
          style={styles.gradient}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <Animated.View
              style={[
                styles.content,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={handleShare}
                  style={[styles.headerButton, { backgroundColor: colors.surface }]}
                >
                  <Share2 size={20} color={colors.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDismiss}
                  style={[styles.headerButton, { backgroundColor: colors.surface }]}
                >
                  <X size={20} color={colors.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Your week at a glance
                </Text>
                <Text style={[styles.dateRange, { color: colors.textMuted }]}>
                  {data.dateRange}
                </Text>
              </View>

              {/* Big number */}
              <Animated.View
                style={[
                  styles.bigNumberContainer,
                  {
                    opacity: bigNumberOpacity,
                    transform: [{ scale: bigNumberScale }],
                  },
                ]}
              >
                <Text style={[styles.bigNumber, { color: colors.textPrimary }]}>
                  {data.totalLogs}
                </Text>
                <Text style={[styles.bigNumberLabel, { color: colors.textSecondary }]}>
                  {data.totalLogs === 1 ? 'visit' : 'visits'}
                </Text>
              </Animated.View>

              {/* Weekly dots */}
              <View style={styles.dotsContainer}>
                {data.dailyDots.map((dot, index) => (
                  <Animated.View
                    key={dot.date}
                    style={[
                      styles.dotWrapper,
                      {
                        opacity: dotsAnims[index],
                        transform: [
                          {
                            scale: dotsAnims[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: dot.color,
                          borderColor: dot.hasData ? 'transparent' : colors.border,
                          borderWidth: dot.hasData ? 0 : 2,
                        },
                      ]}
                    />
                    <Text style={[styles.dotLabel, { color: colors.textMuted }]}>
                      {dot.day}
                    </Text>
                  </Animated.View>
                ))}
              </View>

              {/* Stats row */}
              <View style={styles.statsRow}>
                {/* Average type */}
                {data.avgType && (
                  <Animated.View
                    style={[
                      styles.statCard,
                      { backgroundColor: colors.surface, opacity: avgOpacity },
                    ]}
                  >
                    <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                      Type {data.avgType.toFixed(1)}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                      average
                    </Text>
                    {data.healthIndicator && (
                      <View style={[styles.healthBadge, { backgroundColor: data.healthIndicator.bgColor }]}>
                        {HEALTH_ICON_MAP[data.healthIndicator.icon] && React.createElement(HEALTH_ICON_MAP[data.healthIndicator.icon], {
                          size: 12,
                          color: data.healthIndicator.iconColor,
                          strokeWidth: 2,
                        })}
                        <Text style={[styles.healthBadgeText, { color: data.healthIndicator.iconColor }]}>
                          {data.healthIndicator.label}
                        </Text>
                      </View>
                    )}
                  </Animated.View>
                )}

                {/* Peak hour */}
                {data.peakHour && (
                  <Animated.View
                    style={[
                      styles.statCard,
                      { backgroundColor: colors.surface, opacity: peakOpacity },
                    ]}
                  >
                    <View style={styles.statIconRow}>
                      <Clock size={16} color={colors.textSecondary} strokeWidth={2} />
                      <Text style={[styles.statValue, { color: colors.textPrimary, marginLeft: 6 }]}>
                        {data.peakHour}
                      </Text>
                    </View>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                      most active
                    </Text>
                  </Animated.View>
                )}
              </View>

              {/* Streak badge */}
              {data.streak > 2 && (
                <Animated.View
                  style={[
                    styles.streakBadge,
                    {
                      backgroundColor: `${colors.warning}20`,
                      borderColor: `${colors.warning}30`,
                      opacity: streakOpacity,
                      transform: [{ scale: streakScale }],
                    },
                  ]}
                >
                  <Flame size={18} color={colors.warning} strokeWidth={2} />
                  <Text style={[styles.streakText, { color: colors.warning }]}>
                    {data.streak}-day streak
                  </Text>
                  {data.streakMessage && (
                    <Text style={[styles.streakMessage, { color: colors.textSecondary }]}>
                      {data.streakMessage}
                    </Text>
                  )}
                </Animated.View>
              )}

              {/* Weekly achievements unlocked */}
              {weeklyAchievements.length > 0 && (
                <Animated.View
                  style={[
                    styles.achievementsSection,
                    {
                      opacity: badgesOpacity,
                      transform: [{ scale: badgesScale }],
                    },
                  ]}
                >
                  <View style={styles.achievementsHeader}>
                    <Trophy size={18} color={colors.primary} strokeWidth={2} />
                    <Text style={[styles.achievementsTitle, { color: colors.textPrimary }]}>
                      {weeklyAchievements.length === 1 ? 'Badge Unlocked!' : 'Badges Unlocked!'}
                    </Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.achievementsList}
                  >
                    {weeklyAchievements.map((unlock) => {
                      const achievement = getAchievementById(unlock.id);
                      if (!achievement) return null;
                      const IconComponent = ICON_MAP[achievement.icon];
                      return (
                        <View
                          key={unlock.id}
                          style={[styles.achievementBadge, { backgroundColor: colors.surface }]}
                        >
                          <View
                            style={[
                              styles.achievementIcon,
                              { backgroundColor: achievement.bgColor },
                            ]}
                          >
                            {IconComponent && (
                              <IconComponent
                                size={20}
                                color={achievement.iconColor}
                                strokeWidth={2}
                              />
                            )}
                          </View>
                          <Text
                            style={[styles.achievementName, { color: colors.textPrimary }]}
                            numberOfLines={2}
                          >
                            {achievement.name}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </Animated.View>
              )}

              {/* Motivational message */}
              <Animated.View
                style={[
                  styles.messageContainer,
                  { opacity: messageOpacity },
                ]}
              >
                {data.weekCategory === 'excellent' && (
                  <Sparkles
                    size={20}
                    color={colors.healthy}
                    strokeWidth={2}
                    style={styles.messageIcon}
                  />
                )}
                <Text style={[styles.message, { color: colors.textPrimary }]}>
                  {data.message}
                </Text>
              </Animated.View>

              {/* Button */}
              <Animated.View
                style={[
                  styles.buttonContainer,
                  { opacity: buttonOpacity },
                ]}
              >
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleDismiss}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, { color: colors.textPrimary }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>

        {/* Offscreen shareable card for image capture */}
        <View style={styles.shareCardWrapper}>
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
            <LinearGradient
              colors={[colors.bgPrimary, colors.bgSecondary, colors.bgTertiary]}
              style={styles.shareCard}
              start={{ x: 0.3, y: 0 }}
              end={{ x: 0.7, y: 1 }}
            >
              {/* Share card title */}
              <Text style={[styles.shareCardTitle, { color: colors.textPrimary }]}>
                My Week at a Glance
              </Text>
              <Text style={[styles.shareCardDate, { color: colors.textMuted }]}>
                {data.dateRange}
              </Text>

              {/* Big number */}
              <View style={styles.shareCardBigNumber}>
                <Text style={[styles.shareCardNumber, { color: colors.textPrimary }]}>
                  {data.totalLogs}
                </Text>
                <Text style={[styles.shareCardNumberLabel, { color: colors.textSecondary }]}>
                  {data.totalLogs === 1 ? 'visit' : 'visits'}
                </Text>
              </View>

              {/* Weekly dots */}
              <View style={styles.shareCardDots}>
                {data.dailyDots.map((dot) => (
                  <View key={dot.date} style={styles.shareCardDotWrapper}>
                    <View
                      style={[
                        styles.shareCardDot,
                        {
                          backgroundColor: dot.color,
                          borderColor: dot.hasData ? 'transparent' : colors.border,
                          borderWidth: dot.hasData ? 0 : 2,
                        },
                      ]}
                    />
                    <Text style={[styles.shareCardDotLabel, { color: colors.textMuted }]}>
                      {dot.day}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Stats */}
              <View style={styles.shareCardStats}>
                {data.avgType && (
                  <View style={[styles.shareCardStatItem, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.shareCardStatValue, { color: colors.textPrimary }]}>
                      Type {data.avgType.toFixed(1)}
                    </Text>
                    <Text style={[styles.shareCardStatLabel, { color: colors.textMuted }]}>
                      average
                    </Text>
                  </View>
                )}
                {data.streak > 2 && (
                  <View style={[styles.shareCardStatItem, { backgroundColor: `${colors.warning}15` }]}>
                    <Text style={[styles.shareCardStatValue, { color: colors.warning }]}>
                      🔥 {data.streak} days
                    </Text>
                    <Text style={[styles.shareCardStatLabel, { color: colors.textMuted }]}>
                      streak
                    </Text>
                  </View>
                )}
              </View>

              {/* Message */}
              <Text style={[styles.shareCardMessage, { color: colors.textSecondary }]}>
                {data.message}
              </Text>

              {/* Branding */}
              <View style={[styles.shareCardBranding, { borderTopColor: colors.border }]}>
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.shareCardLogo}
                />
                <View style={styles.shareCardBrandingText}>
                  <Text style={[styles.shareCardAppName, { color: colors.textPrimary }]}>
                    Flushy
                  </Text>
                  <Text style={[styles.shareCardSlogan, { color: colors.textMuted }]}>
                    Know your gut, own your health
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </ViewShot>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  dateRange: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginTop: 8,
  },
  bigNumberContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  bigNumber: {
    fontSize: 72,
    fontFamily: FONTS.bold,
    letterSpacing: -2,
  },
  bigNumberLabel: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    marginTop: -8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  dotWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  dotLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 130,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 4,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  healthBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  streakText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  streakMessage: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  messageIcon: {
    marginRight: 8,
  },
  message: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  // Shareable card styles
  shareCardWrapper: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  shareCard: {
    width: 340,
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
  },
  shareCardTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  shareCardDate: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    marginTop: 6,
    marginBottom: 24,
  },
  shareCardBigNumber: {
    alignItems: 'center',
    marginBottom: 24,
  },
  shareCardNumber: {
    fontSize: 64,
    fontFamily: FONTS.bold,
    letterSpacing: -2,
  },
  shareCardNumberLabel: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    marginTop: -6,
  },
  shareCardDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  shareCardDotWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  shareCardDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  shareCardDotLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  shareCardStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  shareCardStatItem: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  shareCardStatValue: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  shareCardStatLabel: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  shareCardMessage: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  shareCardBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    width: '100%',
    justifyContent: 'center',
    gap: 12,
  },
  shareCardLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  shareCardBrandingText: {
    alignItems: 'flex-start',
  },
  shareCardAppName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  shareCardSlogan: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  // Weekly achievements styles
  achievementsSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  achievementsTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  achievementsList: {
    gap: 12,
    paddingHorizontal: 4,
  },
  achievementBadge: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    width: 90,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    textAlign: 'center',
    lineHeight: 14,
  },
});
