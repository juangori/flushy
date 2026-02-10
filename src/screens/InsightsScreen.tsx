import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { exportToPDF } from '../utils/pdfExport';
import { Download, ChevronLeft, ChevronRight, Calendar, BarChart3, HeartPulse, Heart, HeartCrack, HeartOff, Trophy, Lightbulb } from 'lucide-react-native';
import { DayData } from '../types';
import { QUICK_TAGS, BRISTOL_TYPES, getHealthColor, getStoolColorHealthColor, FONTS } from '../constants';
import { calculateStats, getTypeDistribution, getTagCorrelations, getColorDistribution } from '../utils';
import { AnimatedBristolIcon } from '../components/AnimatedBristolIcons';
import { BadgeCard } from '../components/BadgeCard';
import { useTheme } from '../context';
import { useAchievements } from '../hooks/useAchievements';

type FilterType = 'all' | 'month';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface InsightsScreenProps {
  history: DayData[];
  onTrackView?: () => void;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ history, onTrackView }) => {
  const { colors } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Achievements
  const {
    achievements,
    isUnlocked,
    getUnlockedAt,
    getProgress,
    unlockedCount,
    totalCount,
  } = useAchievements(history);

  // Track insights view for achievements
  useEffect(() => {
    if (onTrackView) {
      onTrackView();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get heart icon and color based on health score
  const getHealthIcon = (score: number | null) => {
    if (score === null) {
      return { Icon: Heart, color: colors.textMuted, bgColor: 'rgba(148, 163, 184, 0.15)', borderColor: 'rgba(148, 163, 184, 0.2)' };
    }
    if (score >= 76) {
      return { Icon: HeartPulse, color: colors.healthy, bgColor: 'rgba(74, 222, 128, 0.15)', borderColor: 'rgba(74, 222, 128, 0.2)' };
    }
    if (score >= 51) {
      return { Icon: Heart, color: '#A3E635', bgColor: 'rgba(163, 230, 53, 0.15)', borderColor: 'rgba(163, 230, 53, 0.2)' };
    }
    if (score >= 26) {
      return { Icon: HeartCrack, color: colors.warning, bgColor: 'rgba(251, 191, 36, 0.15)', borderColor: 'rgba(251, 191, 36, 0.2)' };
    }
    return { Icon: HeartOff, color: colors.alert, bgColor: 'rgba(248, 113, 113, 0.15)', borderColor: 'rgba(248, 113, 113, 0.2)' };
  };

  // Filter history based on selected period
  const filteredHistory = useMemo(() => {
    if (filterType === 'all') return history;

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    return history.filter(day => {
      const date = new Date(day.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }, [history, filterType, selectedDate]);

  // Get available months from history
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    history.forEach(day => {
      const date = new Date(day.date);
      months.add(`${date.getFullYear()}-${date.getMonth()}`);
    });
    return months;
  }, [history]);

  const stats = calculateStats(filteredHistory);

  const goToPrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const toggleFilter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (filterType === 'all') {
      setFilterType('month');
      setSelectedDate(new Date());
    } else {
      setFilterType('all');
    }
  };

  // Check if we can go to next month (not future)
  const today = new Date();
  const canGoNext = !(
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth() === today.getMonth()
  );

  const handleExport = async () => {
    if (exporting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExporting(true);

    const success = await exportToPDF({
      history,
      filterType,
      selectedDate,
      filteredHistory,
    });

    if (!success) {
      Alert.alert('Export Failed', 'Could not generate your health report. Please try again.');
    }

    setExporting(false);
  };
  const typeDistribution = getTypeDistribution(filteredHistory);
  const tagCorrelations = getTagCorrelations(filteredHistory, QUICK_TAGS);
  const maxCount = Math.max(...typeDistribution.map(t => t.count), 1);
  const colorDistribution = getColorDistribution(filteredHistory);
  const maxColorCount = Math.max(...colorDistribution.map(c => c.count), 1);
  const totalEntries = filteredHistory.flatMap(d => d.entries).length;

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary, colors.bgTertiary]}
      style={styles.container}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Insights</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Patterns from your data</Text>
        </View>

        {/* Time Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterToggle, { backgroundColor: colors.surface }, filterType === 'all' && { backgroundColor: `${colors.primary}20`, borderWidth: 1, borderColor: `${colors.primary}40` }]}
            onPress={toggleFilter}
            activeOpacity={0.7}
          >
            <Calendar size={16} color={filterType === 'all' ? colors.primary : colors.textMuted} strokeWidth={2} />
            <Text style={[styles.filterToggleText, { color: colors.textMuted }, filterType === 'all' && { color: colors.primary }]}>
              All Time
            </Text>
          </TouchableOpacity>

          {filterType === 'month' && (
            <View style={[styles.monthSelector, { backgroundColor: colors.surface }]}>
              <TouchableOpacity onPress={goToPrevMonth} style={[styles.monthNavButton, { backgroundColor: colors.surfaceHover }]} activeOpacity={0.7}>
                <ChevronLeft size={18} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleFilter} activeOpacity={0.7}>
                <Text style={[styles.monthText, { color: colors.textPrimary }]}>
                  {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={goToNextMonth}
                style={[styles.monthNavButton, { backgroundColor: colors.surfaceHover }, !canGoNext && styles.monthNavButtonDisabled]}
                activeOpacity={0.7}
                disabled={!canGoNext}
              >
                <ChevronRight size={18} color={canGoNext ? colors.textSecondary : colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          )}

          {filterType === 'all' && (
            <TouchableOpacity
              style={[styles.filterToggle, { backgroundColor: colors.surface }]}
              onPress={toggleFilter}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterToggleText, { color: colors.textMuted }]}>By Month →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Entry count badge */}
        {history.length > 0 && (
          <View style={styles.entryCountContainer}>
            <Text style={[styles.entryCountText, { color: colors.textMuted }]}>
              {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
              {filterType === 'month' && ` in ${MONTHS[selectedDate.getMonth()]}`}
            </Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                <BarChart3 size={48} color={colors.textMuted} strokeWidth={1.5} />
              </View>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {filterType === 'month' ? 'No data this month' : 'No data yet'}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                {filterType === 'month'
                  ? 'Try selecting a different month'
                  : 'Start logging to see insights'}
              </Text>
            </View>
          ) : (
            <>
              {/* Type Distribution */}
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Type Distribution</Text>
                <View style={styles.distributionList}>
                  {typeDistribution.map(item => (
                    <View key={item.type} style={styles.distributionItem}>
                      <View style={styles.distributionEmoji}>
                        <AnimatedBristolIcon type={item.type} size={24} color={getHealthColor(item.health)} />
                      </View>
                      <View style={[styles.barContainer, { backgroundColor: colors.surfaceHover }]}>
                        <View
                          style={[
                            styles.bar,
                            {
                              width: `${(item.count / maxCount) * 100}%`,
                              backgroundColor: getHealthColor(item.health),
                            }
                          ]}
                        />
                      </View>
                      <Text style={[styles.distributionCount, { color: colors.textSecondary }]}>{item.count}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Color Distribution */}
              {colorDistribution.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Color Distribution</Text>
                  <View style={styles.distributionList}>
                    {colorDistribution.map(item => (
                      <View key={item.id} style={styles.distributionItem}>
                        <View style={styles.colorSwatchSmall}>
                          <View style={[styles.colorSwatchInner, { backgroundColor: item.hex }]} />
                        </View>
                        <View style={[styles.barContainer, { backgroundColor: colors.surfaceHover }]}>
                          <View
                            style={[
                              styles.bar,
                              {
                                width: `${(item.count / maxColorCount) * 100}%`,
                                backgroundColor: getStoolColorHealthColor(item.health),
                              }
                            ]}
                          />
                        </View>
                        <Text style={[styles.distributionCount, { color: colors.textSecondary }]}>{item.count}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Health Score */}
              {(() => {
                const healthIcon = getHealthIcon(stats.healthScore);
                const HealthIconComponent = healthIcon.Icon;
                return (
                  <View style={[styles.healthCard, { backgroundColor: healthIcon.bgColor, borderColor: healthIcon.borderColor }]}>
                    <View style={styles.healthContent}>
                      <View>
                        <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>Gut Health Score</Text>
                        <Text style={[styles.healthScore, { color: healthIcon.color }]}>
                          {stats.healthScore ?? '-'}
                        </Text>
                      </View>
                      <View style={styles.healthIconContainer}>
                        <HealthIconComponent size={52} color={healthIcon.color} strokeWidth={1.5} />
                      </View>
                    </View>
                    <Text style={[styles.healthDesc, { color: colors.textMuted }]}>
                      {stats.healthScore === null
                        ? 'Log at least 3 times this week to see your Gut Score.'
                        : stats.healthScore >= 76
                          ? 'Excellent! Your gut health is in great shape!'
                          : stats.healthScore >= 51
                            ? 'Good job! Keep working on your digestive health.'
                            : stats.healthScore >= 26
                              ? 'Room for improvement. Consider more fiber and water.'
                              : 'Your gut needs attention. Review your diet and habits.'}
                    </Text>
                  </View>
                );
              })()}

              {/* Average Type */}
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Average Type</Text>
                <View style={styles.avgTypeContent}>
                  <Text style={[styles.avgTypeValue, { color: colors.textPrimary }]}>{stats.avgType}</Text>
                  <View style={styles.avgTypeInfo}>
                    {stats.avgType !== '-' && (
                      <>
                        <View style={styles.avgTypeEmoji}>
                          <AnimatedBristolIcon
                            type={Math.round(parseFloat(stats.avgType))}
                            size={32}
                            color={getHealthColor(BRISTOL_TYPES[Math.round(parseFloat(stats.avgType)) - 1]?.health)}
                          />
                        </View>
                        <Text style={[styles.avgTypeName, { color: colors.textSecondary }]}>
                          {BRISTOL_TYPES[Math.round(parseFloat(stats.avgType)) - 1]?.name}
                        </Text>
                        <View style={[
                          styles.avgTypeBadge,
                          { backgroundColor: getHealthColor(BRISTOL_TYPES[Math.round(parseFloat(stats.avgType)) - 1]?.health) }
                        ]}>
                          <Text style={[styles.avgTypeBadgeText, { color: colors.bgTertiary }]}>
                            {BRISTOL_TYPES[Math.round(parseFloat(stats.avgType)) - 1]?.desc}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
                <Text style={[styles.avgTypeHint, { color: colors.textMuted }]}>
                  Weekly average across {stats.weekCount} logs
                </Text>
              </View>

              {/* Tag Correlations */}
              {tagCorrelations.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>What affects you</Text>
                  <View style={styles.correlationList}>
                    {tagCorrelations.slice(0, 5).map(tag => (
                      <View key={tag.id} style={[styles.correlationItem, { backgroundColor: colors.surfaceHover }]}>
                        <View style={styles.correlationLeft}>
                          <View style={[styles.correlationDot, { backgroundColor: tag.bgColor }]} />
                          <Text style={[styles.correlationLabel, { color: colors.textPrimary }]}>{tag.label}</Text>
                        </View>
                        <Text style={[styles.correlationStats, { color: colors.textMuted }]}>
                          {tag.count}× → avg Type {tag.avgType}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Achievements Section */}
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.achievementsHeader}>
                  <View style={styles.achievementsTitleRow}>
                    <Trophy size={20} color={colors.primary} strokeWidth={2} />
                    <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Achievements</Text>
                  </View>
                  <Text style={[styles.achievementsCount, { color: colors.textMuted }]}>
                    {unlockedCount}/{totalCount}
                  </Text>
                </View>

                {unlockedCount === 0 ? (
                  <View style={styles.noAchievements}>
                    <Text style={[styles.noAchievementsText, { color: colors.textMuted }]}>
                      Keep tracking to unlock your first badge!
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.badgesScrollContent}
                  >
                    {achievements
                      .filter(a => isUnlocked(a.id))
                      .slice(0, 6)
                      .map(achievement => (
                        <BadgeCard
                          key={achievement.id}
                          achievement={achievement}
                          isUnlocked={true}
                          unlockedAt={getUnlockedAt(achievement.id)}
                          onPress={() => {}}
                          size="small"
                        />
                      ))}
                    {unlockedCount > 6 && (
                      <View style={[styles.moreBadges, { backgroundColor: colors.surfaceHover }]}>
                        <Text style={[styles.moreBadgesText, { color: colors.textSecondary }]}>
                          +{unlockedCount - 6}
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                )}
              </View>

              {/* Tips */}
              <View style={[styles.tipsCard, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}>
                <View style={styles.tipsHeader}>
                  <Lightbulb size={18} color={colors.warning} strokeWidth={2} />
                  <Text style={[styles.tipsTitle, { color: colors.textPrimary }]}>Quick Tips</Text>
                </View>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  • Types 3-4 are ideal (smooth, easy to pass)
                </Text>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  • Types 1-2 suggest you need more water and fiber
                </Text>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  • Types 5-7 may indicate digestive issues
                </Text>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                  • Unusual stool colors persisting 2-3+ days may warrant medical attention
                </Text>
              </View>

              {/* Export Health Report */}
              <TouchableOpacity
                style={[styles.exportButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleExport}
                activeOpacity={0.7}
                disabled={exporting}
              >
                <Download size={18} color={colors.textSecondary} strokeWidth={2} />
                <Text style={[styles.exportText, { color: colors.textSecondary }]}>
                  {exporting ? 'Creating Report...' : 'Export Health Report'}
                </Text>
              </TouchableOpacity>

              {/* Disclaimer */}
              <View style={styles.disclaimer}>
                <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
                  Stool classifications are based on the Bristol Stool Chart, a medical diagnostic tool developed at the Bristol Royal Infirmary. Health guidelines follow recommendations from the World Gastroenterology Organisation (WGO) and the World Health Organization (WHO). This app is for informational purposes only and does not replace professional medical advice. If you have concerns about your digestive health, please consult a healthcare professional.
                </Text>
              </View>
            </>
          )}
        </ScrollView>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  filterToggleText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  monthNavButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavButtonDisabled: {
    opacity: 0.4,
  },
  monthText: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    paddingHorizontal: 8,
  },
  entryCountContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  entryCountText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    marginBottom: 16,
  },
  distributionList: {
    gap: 10,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorSwatchSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  colorSwatchInner: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  distributionEmoji: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barContainer: {
    flex: 1,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 12,
    minWidth: 4,
  },
  distributionCount: {
    fontSize: 14,
    width: 30,
    textAlign: 'right',
    fontFamily: FONTS.regular,
  },
  healthCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  healthContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: FONTS.medium,
  },
  healthScore: {
    fontSize: 48,
    fontFamily: FONTS.bold,
    letterSpacing: -2,
    marginTop: 4,
  },
  healthIconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthDesc: {
    fontSize: 13,
    marginTop: 12,
    fontFamily: FONTS.regular,
  },
  avgTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avgTypeValue: {
    fontSize: 48,
    fontFamily: FONTS.bold,
    letterSpacing: -2,
  },
  avgTypeInfo: {
    flex: 1,
    gap: 4,
  },
  avgTypeEmoji: {
    marginBottom: 2,
  },
  avgTypeName: {
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
  avgTypeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  avgTypeBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  avgTypeHint: {
    fontSize: 12,
    marginTop: 12,
    fontFamily: FONTS.regular,
  },
  correlationList: {
    gap: 12,
  },
  correlationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
  },
  correlationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  correlationDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  correlationLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  correlationStats: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  tipsCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 22,
    fontFamily: FONTS.regular,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  exportText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
  disclaimer: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    opacity: 0.7,
    fontFamily: FONTS.regular,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  achievementsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  achievementsCount: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  noAchievements: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noAchievementsText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  badgesScrollContent: {
    gap: 12,
    paddingRight: 4,
  },
  moreBadges: {
    width: 80,
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBadgesText: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
  },
});
