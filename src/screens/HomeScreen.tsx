import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatCard, PrimaryButton } from '../components';
import { DayData, Stats } from '../types';
import { COLORS, BRISTOL_TYPES, getHealthColor, getStoolColorById } from '../constants';
import { formatDate, calculateStats } from '../utils';

interface HomeScreenProps {
  history: DayData[];
  onLogPress: () => void;
  onTimelinePress: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  history,
  onLogPress,
  onTimelinePress,
}) => {
  const stats = calculateStats(history);
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <LinearGradient
      colors={[COLORS.bgPrimary, COLORS.bgSecondary, COLORS.bgTertiary]}
      style={styles.container}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Ambient glow */}
        <View style={styles.ambientGlow} />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.dateText}>{dateString}</Text>
            <View style={styles.titleRow}>
              <Text style={styles.title}>How's it going? </Text>
              <Image source={require('../../assets/flushy-emoji.png')} style={styles.titleEmoji} />
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard
              label="Streak"
              value={stats.streak}
              unit="days"
              color={stats.streak >= 3 ? COLORS.healthy : stats.streak >= 1 ? COLORS.warning : COLORS.alert}
            />
            <StatCard
              label="This Week"
              value={stats.weekCount}
              unit="logs"
              onPress={onTimelinePress}
              color={stats.weekCount >= 3 ? COLORS.healthy : stats.weekCount >= 1 ? COLORS.warning : COLORS.alert}
            />
            <StatCard
              label="Gut Score"
              value={stats.healthScore}
              color={stats.healthScore >= 70 ? COLORS.healthy : stats.healthScore >= 40 ? COLORS.warning : COLORS.alert}
            />
          </View>

          {/* Recent Section */}
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent</Text>
              <TouchableOpacity onPress={onTimelinePress}>
                <Text style={styles.seeAllText}>See all →</Text>
              </TouchableOpacity>
            </View>

            {history.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🚽</Text>
                <Text style={styles.emptyText}>No logs yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap the button below to start tracking
                </Text>
              </View>
            ) : (
              <View style={styles.recentList}>
                {history.slice(0, 3).map((day) => (
                  <TouchableOpacity key={day.date} style={styles.recentItem} onPress={onTimelinePress} activeOpacity={0.7}>
                    <View>
                      <Text style={styles.recentDate}>
                        {formatDate(day.date)}
                      </Text>
                      <View style={styles.recentTypes}>
                        {day.entries.map((entry, i) => {
                          const stoolColor = entry.color ? getStoolColorById(entry.color) : null;
                          return (
                            <View key={i} style={styles.entryBadgeGroup}>
                              <View
                                style={[
                                  styles.typeBadge,
                                  { backgroundColor: getHealthColor(BRISTOL_TYPES[entry.type - 1].health) }
                                ]}
                              >
                                <Text style={styles.typeBadgeText}>{entry.type}</Text>
                              </View>
                              {stoolColor && (
                                <View style={[styles.colorMiniDot, { backgroundColor: stoolColor.hex }]} />
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                    <Text style={styles.recentCount}>
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
            icon={<Image source={require('../../assets/flushy-emoji.png')} style={{ width: 28, height: 28 }} />}
            onPress={onLogPress}
            variant="primary"
          />
        </View>
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
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
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
  dateText: {
    color: COLORS.textMuted,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -1,
  },
  titleEmoji: {
    width: 34,
    height: 34,
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
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  recentList: {
    gap: 10,
  },
  recentItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  recentDate: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  recentTypes: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  entryBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  colorMiniDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  typeBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadgeText: {
    color: COLORS.bgTertiary,
    fontSize: 12,
    fontWeight: '700',
  },
  recentCount: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 10,
  },
});
