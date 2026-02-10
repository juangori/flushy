import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Settings, NotebookPen, Trophy, HardDrive, X } from 'lucide-react-native';
import { StatCard, PrimaryButton, AnimatedBristolIcon, SettingsModal, WellnessTipCard } from '../components';
import { useWellnessTip } from '../hooks/useWellnessTip';
import { DayData } from '../types';
import { BRISTOL_TYPES, getHealthColor, getStoolColorById, FONTS } from '../constants';
import { formatDate, calculateStats } from '../utils';
import { shouldShowBackupReminder } from '../utils/backup';
import { useTheme, useUserProfile } from '../context';

interface HomeScreenProps {
  history: DayData[];
  onLogPress: () => void;
  onTimelinePress: () => void;
  onResetApp?: () => Promise<void>;
  onViewDigest?: () => void;
  onAchievementsPress?: () => void;
  hasNewAchievements?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  history,
  onLogPress,
  onTimelinePress,
  onResetApp,
  onViewDigest,
  onAchievementsPress,
  hasNewAchievements = false,
}) => {
  const { colors } = useTheme();
  const { profile } = useUserProfile();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const stats = calculateStats(history);

  useEffect(() => {
    shouldShowBackupReminder().then(setShowBackupReminder);
  }, []);

  // Filter history to only last 7 days for Recent section
  const recentHistory = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sixDaysAgo = new Date(today);
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6); // 6 days back + today = 7 days

    return history.filter((day) => {
      const [year, month, dayNum] = day.date.split('-').map(Number);
      const date = new Date(year, month - 1, dayNum);
      date.setHours(0, 0, 0, 0);
      return date >= sixDaysAgo && date <= today;
    }).map((day) => ({
      ...day,
      // Sort entries by time (createdAt) ascending within each day
      entries: [...day.entries].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)),
    }));
  }, [history]);

  // Flatten history into LogEntry[] for wellness tips
  const allEntries = React.useMemo(
    () => history.flatMap((day) => day.entries),
    [history]
  );

  const {
    currentTip,
    dismissTip,
    snoozeTip,
    markHelpful,
  } = useWellnessTip(allEntries, profile);
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary, colors.bgTertiary]}
      style={styles.container}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
    >
      <StatusBar barStyle={colors.bgPrimary === '#FFFFFF' || colors.bgPrimary === '#FDF2F8' ? 'dark-content' : 'light-content'} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Ambient glow */}
        <View style={[styles.ambientGlow, { backgroundColor: `${colors.primary}15` }]} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>{dateString}</Text>
              <View style={styles.headerButtons}>
                {onAchievementsPress && (
                  <TouchableOpacity
                    onPress={onAchievementsPress}
                    style={[styles.headerButton, { backgroundColor: colors.surface }]}
                    activeOpacity={0.7}
                  >
                    <Trophy size={20} color={colors.textSecondary} strokeWidth={2} />
                    {hasNewAchievements && (
                      <View style={[styles.newBadge, { backgroundColor: colors.primary }]} />
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setSettingsVisible(true)}
                  style={[styles.headerButton, { backgroundColor: colors.surface }]}
                  activeOpacity={0.7}
                >
                  <Settings size={20} color={colors.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>How's it going?</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard
              label="Streak"
              value={stats.streak}
              unit="days"
              color={stats.streak >= 3 ? colors.healthy : stats.streak >= 1 ? colors.warning : colors.alert}
            />
            <StatCard
              label="This Week"
              value={stats.weekCount}
              unit="logs"
              onPress={onTimelinePress}
              color={stats.weekCount >= 3 ? colors.healthy : stats.weekCount >= 1 ? colors.warning : colors.alert}
            />
            <StatCard
              label="Gut Score"
              value={stats.healthScore ?? '-'}
              hint={stats.healthScore === null ? 'Log 3+ times' : undefined}
              color={stats.healthScore === null ? colors.textMuted : stats.healthScore >= 70 ? colors.healthy : stats.healthScore >= 40 ? colors.warning : colors.alert}
            />
          </View>

          {/* Wellness Tip */}
          {currentTip && (
            <WellnessTipCard
              tip={currentTip}
              onDismiss={dismissTip}
              onSnooze={snoozeTip}
              onFeedback={markHelpful}
            />
          )}

          {/* Backup Reminder */}
          {showBackupReminder && (
            <View style={[styles.backupBanner, { backgroundColor: `${colors.warning}15`, borderColor: `${colors.warning}30` }]}>
              <View style={styles.backupBannerContent}>
                <HardDrive size={18} color={colors.warning} strokeWidth={2} />
                <View style={styles.backupBannerText}>
                  <Text style={[styles.backupBannerTitle, { color: colors.textPrimary }]}>
                    Back up your data
                  </Text>
                  <Text style={[styles.backupBannerDesc, { color: colors.textMuted }]}>
                    Protect your logs. Go to Settings to create a backup.
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowBackupReminder(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={16} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          )}

          {/* Recent Section */}
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent</Text>
              <TouchableOpacity onPress={onTimelinePress}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See all →</Text>
              </TouchableOpacity>
            </View>

            {recentHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                  <NotebookPen size={32} color={colors.textMuted} strokeWidth={1.5} />
                </View>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No logs yet</Text>
                <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                  Tap the button below to start tracking
                </Text>
              </View>
            ) : (
              <View style={styles.recentList}>
                {recentHistory.slice(0, 5).map((day) => (
                  <TouchableOpacity
                    key={day.date}
                    style={[styles.recentItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                    onPress={onTimelinePress}
                    activeOpacity={0.7}
                  >
                    <View>
                      <Text style={[styles.recentDate, { color: colors.textSecondary }]}>
                        {formatDate(day.date)}
                      </Text>
                      <View style={styles.recentTypes}>
                        {day.entries.map((entry, i) => {
                          const stoolColor = entry.color ? getStoolColorById(entry.color) : null;
                          const bristolType = BRISTOL_TYPES[entry.type - 1];
                          return (
                            <View
                              key={i}
                              style={[
                                styles.entryCard,
                                { backgroundColor: colors.surfaceHover, borderColor: `${getHealthColor(bristolType.health)}30` }
                              ]}
                            >
                              <View style={styles.entryCardIcon}>
                                <AnimatedBristolIcon
                                  type={entry.type}
                                  size={24}
                                  color={getHealthColor(bristolType.health)}
                                />
                              </View>
                              {stoolColor && (
                                <View style={[styles.entryCardColor, { backgroundColor: stoolColor.hex }]} />
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                    <Text style={[styles.recentCount, { color: colors.textMuted }]}>
                      {day.entries.length} {day.entries.length === 1 ? 'log' : 'logs'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Big Log Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Log Now"
            icon={<Plus size={22} color={colors.buttonText} strokeWidth={2.5} />}
            onPress={onLogPress}
            variant="primary"
          />
        </View>

        {/* Settings Modal */}
        <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} onResetApp={onResetApp} onViewDigest={onViewDigest} />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  ambientGlow: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: FONTS.medium,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 30,
    fontFamily: FONTS.bold,
    letterSpacing: -1,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  recentSection: {
    flex: 1,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  recentList: {
    gap: 10,
  },
  recentItem: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  recentDate: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  recentTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  entryCardIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryCardColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(128, 128, 128, 0.3)',
  },
  recentCount: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  backupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  backupBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backupBannerText: {
    flex: 1,
  },
  backupBannerTitle: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  backupBannerDesc: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 10,
  },
});
