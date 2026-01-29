import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Swipeable } from 'react-native-gesture-handler';
import { Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TimelineEntry } from '../components';
import { DayData, LogEntry } from '../types';
import { COLORS, BRISTOL_TYPES, getHealthColor } from '../constants';
import { formatDate } from '../utils';

interface TimelineScreenProps {
  history: DayData[];
  onDeleteEntry?: (date: string, entryId: string) => Promise<boolean>;
}

// Health legend items
const LEGEND = [
  { label: 'Healthy', color: COLORS.healthy },
  { label: 'Warning', color: COLORS.warning },
  { label: 'Alert', color: COLORS.alert },
  { label: 'Constipated', color: COLORS.constipated },
];

const SwipeableEntry = ({
  entry,
  date,
  onDelete
}: {
  entry: LogEntry;
  date: string;
  onDelete: (date: string, entryId: string) => void;
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    swipeableRef.current?.close();
    onDelete(date, entry.id);
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

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <View style={styles.entryWrapper}>
        <TimelineEntry entry={entry} />
      </View>
    </Swipeable>
  );
};

export const TimelineScreen: React.FC<TimelineScreenProps> = ({ history, onDeleteEntry }) => {
  // Transform history for SectionList
  const sections = history.map(day => ({
    title: formatDate(day.date),
    data: day.entries,
    date: day.date,
  }));

  const handleDelete = (date: string, entryId: string) => {
    onDeleteEntry?.(date, entryId);
  };

  return (
    <LinearGradient
      colors={[COLORS.bgPrimary, COLORS.bgSecondary, COLORS.bgTertiary]}
      style={styles.container}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Timeline</Text>
          <Text style={styles.subtitle}>
            Track your digestive health journey
          </Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {LEGEND.map(item => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Timeline */}
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyText}>No entries yet</Text>
            <Text style={styles.emptySubtext}>
              Your timeline will appear here
            </Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item, section }) => (
              <SwipeableEntry
                entry={item}
                date={section.date}
                onDelete={handleDelete}
              />
            )}
            renderSectionHeader={({ section: { title, data } }) => {
              const avgType = data.reduce((sum: number, e: LogEntry) => sum + e.type, 0) / data.length;
              const rounded = Math.round(avgType);
              const bristolType = BRISTOL_TYPES[rounded - 1];
              const healthColor = getHealthColor(bristolType?.health);
              const healthLabel = bristolType?.health
                ? bristolType.health.charAt(0).toUpperCase() + bristolType.health.slice(1)
                : '';

              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{title}</Text>
                  <View style={[styles.sectionBadge, { backgroundColor: `${healthColor}20` }]}>
                    <View style={[styles.sectionBadgeDot, { backgroundColor: healthColor }]} />
                    <Text style={[styles.sectionBadgeText, { color: healthColor }]}>
                      {healthLabel}
                    </Text>
                  </View>
                </View>
              );
            }}
            stickySectionHeadersEnabled={true}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
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
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -1,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  sectionHeader: {
    backgroundColor: COLORS.bgSecondary,
    paddingVertical: 8,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  sectionBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
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
});
