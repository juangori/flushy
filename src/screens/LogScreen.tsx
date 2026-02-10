import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  X,
  ChevronLeft,
  Sunrise,
  Sun,
  SunMedium,
  CloudSun,
  Sunset,
  Moon,
  Sparkles,
  LucideIcon,
} from 'lucide-react-native';
import { BristolSelector, TagSelector, ColorSelector, PrimaryButton } from '../components';
import { BristolType } from '../types';
import { BRISTOL_TYPES, QUICK_TAGS, STOOL_COLORS, FONTS } from '../constants';
import { useTheme } from '../context';
import { formatDate } from '../utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LogScreenProps {
  onSave: (type: BristolType, tags: string[], color: string, time?: string) => Promise<boolean>;
  onCancel: () => void;
  forDate?: string; // Optional: YYYY-MM-DD for past entries
}

// Time slot icon map
const TIME_ICON_MAP: Record<string, LucideIcon> = {
  Sunrise,
  Sun,
  SunMedium,
  CloudSun,
  Sunset,
  Moon,
};

// Time slots for past date logging
const TIME_SLOTS = [
  { id: 'early_morning', label: 'Early Morning', time: '06:30', icon: 'Sunrise', iconColor: '#EA580C', bgColor: '#FFEDD5' },
  { id: 'morning', label: 'Morning', time: '09:00', icon: 'Sun', iconColor: '#CA8A04', bgColor: '#FEF9C3' },
  { id: 'midday', label: 'Midday', time: '12:00', icon: 'SunMedium', iconColor: '#D97706', bgColor: '#FEF3C7' },
  { id: 'afternoon', label: 'Afternoon', time: '15:30', icon: 'CloudSun', iconColor: '#E11D48', bgColor: '#FFE4E6' },
  { id: 'evening', label: 'Evening', time: '19:00', icon: 'Sunset', iconColor: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'night', label: 'Night', time: '22:00', icon: 'Moon', iconColor: '#4F46E5', bgColor: '#E0E7FF' },
];

export const LogScreen: React.FC<LogScreenProps> = ({
  onSave,
  onCancel,
  forDate,
}) => {
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<BristolType | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(forDate ? 'midday' : null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateToStep = useCallback((targetStep: number) => {
    Animated.timing(slideAnim, {
      toValue: -(targetStep - 1) * SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setStep(targetStep);
    });
  }, [slideAnim]);

  const handleTypeSelect = (type: BristolType) => {
    setSelectedType(type);
    // Auto-advance to color step after a short delay
    setTimeout(() => {
      animateToStep(2);
    }, 200);
  };

  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);
    // Auto-advance to tags step after a short delay
    setTimeout(() => {
      animateToStep(3);
    }, 200);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleBack = () => {
    if (step > 1) {
      animateToStep(step - 1);
    } else {
      onCancel();
    }
  };

  const handleSave = async () => {
    if (!selectedType || !selectedColor || isSaving) return;

    setIsSaving(true);

    try {
      // Get the time string from selected time slot
      const timeSlot = TIME_SLOTS.find(t => t.id === selectedTime);
      const timeString = timeSlot?.time;
      const success = await onSave(selectedType, selectedTags, selectedColor, timeString);

      if (success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowSuccess(true);

        setTimeout(() => {
          onCancel();
        }, 1200);
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  // Success overlay
  if (showSuccess) {
    return (
      <LinearGradient
        colors={[colors.bgPrimary, colors.bgSecondary, colors.bgTertiary]}
        style={styles.successContainer}
      >
        <Animated.View style={styles.successIcon}>
          <Sparkles size={48} color={colors.healthy} strokeWidth={1.5} />
        </Animated.View>
        <Text style={[styles.successText, { color: colors.healthy }]}>Logged!</Text>
      </LinearGradient>
    );
  }

  const stepLabels = ['Type', 'Color', 'Tags'];

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
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={handleBack}
          >
            {step > 1 ? (
              <ChevronLeft size={20} color={colors.textSecondary} strokeWidth={2} />
            ) : (
              <X size={20} color={colors.textSecondary} strokeWidth={2} />
            )}
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              {forDate ? 'Add Past Log' : 'Quick Log'}
            </Text>
            {forDate && (
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                {formatDate(forDate)}
              </Text>
            )}
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {stepLabels.map((label, index) => {
            const stepNum = index + 1;
            const isActive = step >= stepNum;
            const isCurrent = step === stepNum;
            return (
              <View key={label} style={styles.stepItem}>
                <View style={[
                  styles.stepDot,
                  { backgroundColor: colors.surface },
                  isActive && { backgroundColor: colors.primary },
                  isCurrent && { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.primaryLight, backgroundColor: colors.primary },
                ]} />
                <Text style={[
                  styles.stepLabel,
                  { color: colors.textMuted },
                  isActive && { color: colors.textSecondary },
                ]}>{label}</Text>
              </View>
            );
          })}
          <View style={[styles.stepLine, { backgroundColor: colors.surface }]}>
            <View style={[
              styles.stepLineProgress,
              { width: `${((step - 1) / 2) * 100}%`, backgroundColor: colors.primary }
            ]} />
          </View>
        </View>

        {/* Sliding panels */}
        <View style={styles.panelContainer}>
          <Animated.View
            style={[
              styles.panelSlider,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* Step 1: Bristol Type */}
            <View style={styles.panel}>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>How did it look?</Text>
                <BristolSelector
                  types={BRISTOL_TYPES}
                  selectedType={selectedType}
                  onSelect={handleTypeSelect}
                />
              </ScrollView>
            </View>

            {/* Step 2: Color */}
            <View style={styles.panel}>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>What color was it?</Text>
                <ColorSelector
                  colors={STOOL_COLORS}
                  selectedColor={selectedColor}
                  onSelect={handleColorSelect}
                />
              </ScrollView>
            </View>

            {/* Step 3: Tags + Time (for past dates) + Save */}
            <View style={styles.panel}>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Time selector for past dates */}
                {forDate && (
                  <>
                    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>What time was it?</Text>
                    <View style={styles.timeGrid}>
                      {TIME_SLOTS.map((slot) => {
                        const isSelected = selectedTime === slot.id;
                        const IconComponent = TIME_ICON_MAP[slot.icon];
                        return (
                          <TouchableOpacity
                            key={slot.id}
                            style={[
                              styles.timeSlot,
                              { backgroundColor: colors.surface, borderColor: colors.borderLight },
                              isSelected && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
                            ]}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setSelectedTime(slot.id);
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.timeSlotIconContainer, { backgroundColor: slot.bgColor }]}>
                              {IconComponent && (
                                <IconComponent size={18} color={slot.iconColor} strokeWidth={2.5} />
                              )}
                            </View>
                            <Text style={[
                              styles.timeSlotLabel,
                              { color: colors.textSecondary },
                              isSelected && { color: colors.primary },
                            ]}>
                              {slot.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}

                <Text style={[styles.sectionLabel, { color: colors.textMuted }, forDate && { marginTop: 24 }]}>What might have affected this?</Text>
                <Text style={[styles.tagSubtitle, { color: colors.textSecondary }]}>
                  We'll find patterns and personalized insights for you
                </Text>
                <TagSelector
                  tags={QUICK_TAGS}
                  selectedTags={selectedTags}
                  onToggle={handleTagToggle}
                />
                <Text style={[styles.tagHint, { color: colors.textMuted }]}>
                  Tip: Regular tagging helps us spot what affects your gut health
                </Text>
              </ScrollView>
            </View>
          </Animated.View>
        </View>

        {/* Save Button - only on step 3 */}
        {step === 3 && (
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="✓ Save Log"
              onPress={handleSave}
              disabled={!selectedType || !selectedColor}
              loading={isSaving}
              variant="success"
            />
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },

  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
    marginBottom: 20,
    position: 'relative',
  },
  stepItem: {
    alignItems: 'center',
    zIndex: 1,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  stepLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  stepLine: {
    position: 'absolute',
    top: 5,
    left: 55,
    right: 55,
    height: 2,
  },
  stepLineProgress: {
    height: '100%',
  },

  // Panel sliding
  panelContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  panelSlider: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * 3,
    flex: 1,
  },
  panel: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
    fontFamily: FONTS.medium,
  },
  tagSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 4,
    fontFamily: FONTS.regular,
  },
  tagHint: {
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    fontStyle: 'italic',
  },
  // Time selector
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  timeSlot: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  timeSlotIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  timeSlotLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 10,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    marginBottom: 8,
  },
  successText: {
    fontSize: 24,
    fontFamily: FONTS.semiBold,
    marginTop: 20,
    letterSpacing: -0.5,
  },
});
