import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { DayData } from '../types';
import { BRISTOL_TYPES, getHealthColor, FONTS } from '../constants';
import { useTheme } from '../context';

interface HealthCalendarProps {
  history: DayData[];
  onDayPress?: (date: string) => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const HealthCalendar: React.FC<HealthCalendarProps> = ({ history, onDayPress }) => {
  const { colors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const translateX = useRef(new Animated.Value(0)).current;
  const swipeThreshold = 50;

  // Create a map of date -> health data for quick lookup
  const healthMap = useMemo(() => {
    const map: Record<string, { avgType: number; count: number; health: string }> = {};
    history.forEach(day => {
      if (day.entries.length > 0) {
        const avgType = day.entries.reduce((sum, e) => sum + e.type, 0) / day.entries.length;
        const rounded = Math.round(avgType);
        const bristolType = BRISTOL_TYPES[rounded - 1];
        map[day.date] = {
          avgType: rounded,
          count: day.entries.length,
          health: bristolType?.health || 'warning',
        };
      }
    });
    return map;
  }, [history]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty slots for days before the 1st
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [year, month]);

  const animateAndNavigate = (direction: 'prev' | 'next') => {
    const toValue = direction === 'prev' ? 300 : -300;

    Animated.timing(translateX, {
      toValue,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Update month
      if (direction === 'prev') {
        setCurrentDate(new Date(year, month - 1, 1));
      } else {
        setCurrentDate(new Date(year, month + 1, 1));
      }

      // Reset from opposite side
      translateX.setValue(direction === 'prev' ? -300 : 300);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const goToPrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateAndNavigate('prev');
  };

  const goToNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateAndNavigate('next');
  };

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationX } = event.nativeEvent;
    // Limit the drag distance
    const clampedX = Math.max(-100, Math.min(100, translationX));
    translateX.setValue(clampedX);
  };

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;

      // Determine if swipe was strong enough
      const shouldNavigate = Math.abs(translationX) > swipeThreshold || Math.abs(velocityX) > 500;

      if (shouldNavigate) {
        if (translationX > 0) {
          // Swipe right = go to previous month
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          animateAndNavigate('prev');
        } else if (canGoNext) {
          // Swipe left = go to next month (if allowed)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          animateAndNavigate('next');
        } else {
          // Can't go next, snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        }
      } else {
        // Snap back if not enough movement
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }).start();
      }
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const getDateString = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Check if a date is within the last 7 days (not including today, so 6 days back + today = 7 days)
  const isWithinLastWeek = (day: number) => {
    // Create date using local time (not UTC)
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sixDaysAgo = new Date(today);
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6); // 6 days back + today = 7 days

    return date >= sixDaysAgo && date <= today;
  };

  const isFutureDate = (day: number) => {
    // Create date using local time (not UTC)
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date > today;
  };

  const handleDayPress = (day: number) => {
    const dateStr = getDateString(day);
    // Allow tapping any past date (for viewing), but only last week for adding
    const isFuture = isFutureDate(day);

    if (!isFuture && onDayPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDayPress(dateStr);
    }
  };

  // Check if we can go to next month (not future)
  const today = new Date();
  const canGoNext = !(year === today.getFullYear() && month === today.getMonth());

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header with month/year and navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPrevMonth} style={[styles.navButton, { backgroundColor: colors.surfaceHover }]} activeOpacity={0.7}>
          <ChevronLeft size={20} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>

        <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>
          {MONTHS[month]} {year}
        </Text>

        <TouchableOpacity
          onPress={goToNextMonth}
          style={[styles.navButton, { backgroundColor: colors.surfaceHover }, !canGoNext && styles.navButtonDisabled]}
          activeOpacity={0.7}
          disabled={!canGoNext}
        >
          <ChevronRight size={20} color={canGoNext ? colors.textSecondary : colors.textMuted} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Swipeable calendar content */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View style={[styles.swipeableContent, { transform: [{ translateX }] }]}>
          {/* Weekday headers */}
          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map((day, i) => (
              <View key={i} style={styles.weekdayCell}>
                <Text style={[styles.weekdayText, { color: colors.textMuted }]}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.daysGrid}>
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const dateStr = getDateString(day);
              const dayData = healthMap[dateStr];
              const hasData = !!dayData;
              const isTodayDay = isToday(day);
              const isFuture = isFutureDate(day);
              const canAddLog = isWithinLastWeek(day); // Only last 7 days can add logs
              const healthColor = hasData
                ? getHealthColor(dayData.health as 'healthy' | 'warning' | 'alert' | 'constipated')
                : colors.textMuted;

              return (
                <TouchableOpacity
                  key={day}
                  style={styles.dayCell}
                  onPress={() => handleDayPress(day)}
                  activeOpacity={isFuture ? 1 : 0.7}
                  disabled={isFuture}
                >
                  <View style={[
                    styles.dayCircle,
                    isTodayDay && { borderWidth: 2, borderColor: '#3B82F6' },
                    hasData && { backgroundColor: `${healthColor}25` },
                    canAddLog && !hasData && !isTodayDay && { backgroundColor: `${colors.primary}08` },
                  ]}>
                    <Text style={[
                      styles.dayText,
                      { color: colors.textSecondary },
                      isTodayDay && { color: '#3B82F6', fontWeight: '700' },
                      hasData && { color: healthColor },
                      isFuture && { color: colors.textMuted, opacity: 0.4 },
                    ]}>
                      {day}
                    </Text>
                    {hasData && (
                      <View style={[styles.healthDot, { backgroundColor: healthColor }]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* Legend */}
      <View style={[styles.legend, { borderTopColor: colors.borderLight }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.healthy }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>Healthy</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>Warning</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.alert }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>Alert</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.constipated }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>Constipated</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  monthTitle: {
    fontSize: 17,
    fontFamily: FONTS.semiBold,
  },
  swipeableContent: {
    overflow: 'hidden',
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayCircle: {
    width: '85%',
    aspectRatio: 1,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  healthDot: {
    position: 'absolute',
    bottom: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
});
