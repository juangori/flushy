import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Swipeable } from 'react-native-gesture-handler';
import { Trash2, Info, X, CalendarDays, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TimelineEntry, HealthCalendar, AnimatedBristolIcon } from '../components';
import { DayData, LogEntry } from '../types';
import { BRISTOL_TYPES, QUICK_TAGS, getHealthColor, getStoolColorById, getStoolColorHealthColor, FONTS } from '../constants';
import { useTheme } from '../context';
import { formatDate } from '../utils';

// Health tips based on Bristol type
const HEALTH_TIPS: Record<number, string> = {
  1: 'Try increasing water intake and adding more fiber to your diet. Regular exercise can also help.',
  2: 'You may need more hydration and fiber. Consider adding fruits, vegetables, and whole grains.',
  3: 'This is a healthy stool type! Keep up your current diet and hydration habits.',
  4: 'Perfect! This is the ideal stool type. Your digestive system is working well.',
  5: 'This could indicate fast transit. Consider if you\'ve had caffeine, stress, or certain foods.',
  6: 'Mild diarrhea. Stay hydrated and monitor. If it persists, review recent diet changes.',
  7: 'Diarrhea - stay very hydrated. If this persists more than 2 days, consult a healthcare provider.',
};

// Get today's date string in YYYY-MM-DD format
const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface TimelineScreenProps {
  history: DayData[];
  onDeleteEntry?: (date: string, entryId: string) => Promise<boolean>;
  onAddLogForDate?: (date: string) => void;
}

const SwipeableEntry = ({
  entry,
  date,
  onDelete,
  onInfo,
}: {
  entry: LogEntry;
  date: string;
  onDelete: (date: string, entryId: string) => void;
  onInfo: (entry: LogEntry) => void;
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    swipeableRef.current?.close();
    onDelete(date, entry.id);
  };

  const handleInfo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    swipeableRef.current?.close();
    onInfo(entry);
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <TouchableOpacity onPress={handleDelete} activeOpacity={0.6} style={styles.deleteWrapper}>
        <Animated.View style={[styles.deleteAction, { transform: [{ translateX }] }]}>
          <Trash2 size={20} color="#F87171" strokeWidth={2} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-80, 0],
    });

    return (
      <TouchableOpacity onPress={handleInfo} activeOpacity={0.6} style={styles.infoWrapper}>
        <Animated.View style={[styles.infoAction, { transform: [{ translateX }] }]}>
          <Info size={20} color="#60A5FA" strokeWidth={2} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootRight={false}
      overshootLeft={false}
    >
      <View style={styles.entryWrapper}>
        <TimelineEntry entry={entry} />
      </View>
    </Swipeable>
  );
};

export const TimelineScreen: React.FC<TimelineScreenProps> = ({ history, onDeleteEntry, onAddLogForDate }) => {
  const { colors } = useTheme();
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);
  // Default to today's date
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  // Get entries for the selected date only, sorted chronologically
  const selectedDayData = useMemo(() => {
    const dayData = history.find(d => d.date === selectedDate);
    if (!dayData) return null;
    return {
      ...dayData,
      entries: [...dayData.entries].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)),
    };
  }, [history, selectedDate]);

  // Check if selected date is within the last 7 days (for adding logs)
  const canAddLog = useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sixDaysAgo = new Date(today);
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    return date >= sixDaysAgo && date <= today;
  }, [selectedDate]);

  const handleDelete = (date: string, entryId: string) => {
    onDeleteEntry?.(date, entryId);
  };

  const handleInfo = (entry: LogEntry) => {
    setSelectedEntry(entry);
    setInfoModalVisible(true);
  };

  const closeInfoModal = () => {
    setInfoModalVisible(false);
    setSelectedEntry(null);
  };

  const handleCalendarDayPress = (date: string) => {
    setSelectedDate(date);
  };

  const handleAddLog = () => {
    if (onAddLogForDate) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onAddLogForDate(selectedDate);
    }
  };

  // Get health info for selected day
  const getHealthInfo = () => {
    if (!selectedDayData || selectedDayData.entries.length === 0) return null;
    const avgType = selectedDayData.entries.reduce((sum, e) => sum + e.type, 0) / selectedDayData.entries.length;
    const rounded = Math.round(avgType);
    const bristolType = BRISTOL_TYPES[rounded - 1];
    return {
      healthColor: getHealthColor(bristolType?.health),
      healthLabel: bristolType?.health
        ? bristolType.health.charAt(0).toUpperCase() + bristolType.health.slice(1)
        : '',
    };
  };

  const healthInfo = getHealthInfo();

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
          <Text style={[styles.title, { color: colors.textPrimary }]}>Your Timeline</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Tap a date to view or add logs
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Calendar */}
          <HealthCalendar history={history} onDayPress={handleCalendarDayPress} />

          {/* Selected Day Section */}
          <View style={styles.selectedDaySection}>
            {/* Day Header */}
            <View style={[styles.dayHeader, { backgroundColor: colors.surface }]}>
              <Text style={[styles.dayTitle, { color: colors.textPrimary }]}>
                {formatDate(selectedDate)}
              </Text>
              {healthInfo && (
                <View style={[styles.healthBadge, { backgroundColor: `${healthInfo.healthColor}20` }]}>
                  <View style={[styles.healthDot, { backgroundColor: healthInfo.healthColor }]} />
                  <Text style={[styles.healthLabel, { color: healthInfo.healthColor }]}>
                    {healthInfo.healthLabel}
                  </Text>
                </View>
              )}
            </View>

            {/* Entries for selected day */}
            {selectedDayData && selectedDayData.entries.length > 0 ? (
              <>
                <Text style={[styles.swipeHint, { color: colors.textMuted }]}>← info · delete →</Text>
                {selectedDayData.entries.map((entry) => (
                  <SwipeableEntry
                    key={entry.id}
                    entry={entry}
                    date={selectedDate}
                    onDelete={handleDelete}
                    onInfo={handleInfo}
                  />
                ))}
              </>
            ) : (
              <View style={styles.noEntriesContainer}>
                <View style={[styles.noEntriesIcon, { backgroundColor: colors.surface }]}>
                  <CalendarDays size={24} color={colors.textMuted} strokeWidth={1.5} />
                </View>
                <Text style={[styles.noEntriesText, { color: colors.textSecondary }]}>
                  No logs for this day
                </Text>
              </View>
            )}

            {/* Add Log Button - only for last 7 days */}
            {canAddLog && (
              <TouchableOpacity
                style={[styles.addLogButton, { backgroundColor: colors.primary }]}
                onPress={handleAddLog}
                activeOpacity={0.8}
              >
                <Plus size={20} color={colors.textPrimary} strokeWidth={2.5} />
                <Text style={[styles.addLogButtonText, { color: colors.textPrimary }]}>
                  Add Log for {formatDate(selectedDate)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Info Modal */}
        <Modal
          visible={infoModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeInfoModal}
        >
          <Pressable style={styles.modalOverlay} onPress={closeInfoModal}>
            <Pressable style={[styles.modalContent, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]} onPress={(e) => e.stopPropagation()}>
              {selectedEntry && (() => {
                const bristolType = BRISTOL_TYPES[selectedEntry.type - 1];
                const stoolColor = selectedEntry.color ? getStoolColorById(selectedEntry.color) : null;
                const healthColor = getHealthColor(bristolType.health);
                const healthLabel = bristolType.health.charAt(0).toUpperCase() + bristolType.health.slice(1);

                return (
                  <>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                      <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Entry Details</Text>
                      <TouchableOpacity onPress={closeInfoModal} style={[styles.modalCloseButton, { backgroundColor: colors.surface }]}>
                        <X size={20} color={colors.textMuted} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>

                    {/* Bristol Type Section */}
                    <View style={styles.modalSection}>
                      <View style={styles.modalTypeHeader}>
                        <View style={[styles.modalIconContainer, { backgroundColor: `${healthColor}20` }]}>
                          <AnimatedBristolIcon type={selectedEntry.type} size={40} color={healthColor} />
                        </View>
                        <View style={styles.modalTypeInfo}>
                          <Text style={[styles.modalTypeName, { color: colors.textPrimary }]}>Type {selectedEntry.type}: {bristolType.name}</Text>
                          <View style={[styles.modalHealthBadge, { backgroundColor: `${healthColor}20` }]}>
                            <View style={[styles.modalHealthDot, { backgroundColor: healthColor }]} />
                            <Text style={[styles.modalHealthText, { color: healthColor }]}>{healthLabel}</Text>
                          </View>
                        </View>
                      </View>
                      <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>{bristolType.desc}</Text>
                    </View>

                    {/* Color Section */}
                    {stoolColor && (
                      <View style={styles.modalSection}>
                        <Text style={[styles.modalSectionTitle, { color: colors.textMuted }]}>Color</Text>
                        <View style={styles.modalColorRow}>
                          <View style={[styles.modalColorDot, { backgroundColor: stoolColor.hex }]} />
                          <View style={styles.modalColorInfo}>
                            <Text style={[styles.modalColorName, { color: colors.textPrimary }]}>{stoolColor.name}</Text>
                            <Text style={[styles.modalColorHealth, { color: getStoolColorHealthColor(stoolColor.health) }]}>
                              {stoolColor.description}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Tags Section */}
                    {selectedEntry.tags.length > 0 && (
                      <View style={styles.modalSection}>
                        <Text style={[styles.modalSectionTitle, { color: colors.textMuted }]}>Tags</Text>
                        <View style={styles.modalTagsContainer}>
                          {selectedEntry.tags.map(tagId => {
                            const tag = QUICK_TAGS.find(t => t.id === tagId);
                            if (!tag) return null;
                            return (
                              <View key={tagId} style={[styles.modalTag, { backgroundColor: tag.bgColor }]}>
                                <Text style={[styles.modalTagText, { color: tag.iconColor }]}>{tag.label}</Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    )}

                    {/* Health Tip */}
                    <View style={[styles.modalSection, styles.modalTipSection]}>
                      <Text style={styles.modalTipTitle}>Health Tip</Text>
                      <Text style={[styles.modalTipText, { color: colors.textSecondary }]}>{HEALTH_TIPS[selectedEntry.type]}</Text>
                    </View>
                  </>
                );
              })()}
            </Pressable>
          </Pressable>
        </Modal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  selectedDaySection: {
    marginTop: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  dayTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthLabel: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  swipeHint: {
    fontSize: 11,
    marginTop: 12,
    marginBottom: 4,
    opacity: 0.7,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  noEntriesContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noEntriesIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  noEntriesText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
  addLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 16,
  },
  addLogButtonText: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
  },
  entryWrapper: {
    marginTop: 10,
  },
  deleteWrapper: {
    marginTop: 10,
    marginLeft: 10,
    justifyContent: 'center',
  },
  deleteAction: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    flex: 1,
    borderRadius: 16,
  },
  infoWrapper: {
    marginTop: 10,
    marginRight: 10,
    justifyContent: 'center',
  },
  infoAction: {
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    flex: 1,
    borderRadius: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTypeInfo: {
    flex: 1,
    gap: 6,
  },
  modalTypeName: {
    fontSize: 17,
    fontFamily: FONTS.semiBold,
  },
  modalHealthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  modalHealthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalHealthText: {
    fontSize: 13,
    fontFamily: FONTS.semiBold,
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  modalColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalColorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalColorInfo: {
    flex: 1,
  },
  modalColorName: {
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
  modalColorHealth: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  modalTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalTag: {
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  modalTagText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  modalTipSection: {
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  modalTipTitle: {
    color: '#60A5FA',
    fontSize: 13,
    fontFamily: FONTS.semiBold,
    marginBottom: 6,
  },
  modalTipText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },
});
