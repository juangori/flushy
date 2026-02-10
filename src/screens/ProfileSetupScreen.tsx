import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Shield,
  CircleOff,
  RefreshCw,
  Flame,
  Wheat,
  Syringe,
  Activity,
  Baby,
  Milk,
  Sparkles,
  LucideIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { PrimaryButton } from '../components';
import { useTheme, useUserProfile } from '../context';
import {
  FONTS,
  AGE_OPTIONS,
  SEX_OPTIONS,
  CONDITION_OPTIONS,
  AgeRange,
  BiologicalSex,
  HealthCondition,
} from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Icon mapping for health conditions
const CONDITION_ICON_MAP: Record<string, LucideIcon> = {
  RefreshCw,
  Flame,
  Wheat,
  Syringe,
  Activity,
  Baby,
  Milk,
  Sparkles,
};

interface ProfileSetupScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  onComplete,
  onSkip,
}) => {
  const { colors } = useTheme();
  const { updateAge, updateSex, updateConditions, completeProfile, skipProfile } = useUserProfile();

  const [step, setStep] = useState(0);
  const [selectedAge, setSelectedAge] = useState<AgeRange | null>(null);
  const [selectedSex, setSelectedSex] = useState<BiologicalSex | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<HealthCondition[]>([]);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const totalSteps = 3;

  const animateToStep = (targetStep: number) => {
    Animated.timing(slideAnim, {
      toValue: -targetStep * SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setStep(targetStep);
    });
  };

  const handleBack = () => {
    if (step > 0) {
      animateToStep(step - 1);
    }
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Only handle final step - age and sex auto-advance on selection
    if (step === 2) {
      await updateConditions(selectedConditions);
      await completeProfile();
      onComplete();
    }
  };

  const handleSkip = async () => {
    await skipProfile();
    onSkip();
  };

  const handleAgeSelect = async (age: AgeRange) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAge(age);
    // Auto-advance after brief delay to show selection
    await updateAge(age);
    setTimeout(() => animateToStep(1), 300);
  };

  const handleSexSelect = async (sex: BiologicalSex) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSex(sex);
    // Auto-advance after brief delay to show selection
    await updateSex(sex);
    setTimeout(() => animateToStep(2), 300);
  };

  const handleConditionToggle = (condition: HealthCondition) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (condition === 'none') {
      setSelectedConditions(['none']);
    } else {
      setSelectedConditions((prev) => {
        const filtered = prev.filter((c) => c !== 'none');
        if (filtered.includes(condition)) {
          return filtered.filter((c) => c !== condition);
        } else {
          return [...filtered, condition];
        }
      });
    }
  };

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary, colors.bgTertiary]}
      style={styles.container}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          {step > 0 ? (
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.surface }]}
              onPress={handleBack}
            >
              <ChevronLeft size={20} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerButton} />
          )}

          <Text style={[styles.headerTitle, { color: colors.textMuted }]}>
            Personalize
          </Text>

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: colors.surface }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: `${((step + 1) / totalSteps) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Slides */}
        <View style={styles.slidesContainer}>
          <Animated.View
            style={[
              styles.slidesWrapper,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* Step 1: Age */}
            <View style={styles.slide}>
              <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                What's your age range?
              </Text>
              <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                Helps us understand what's normal for you
              </Text>

              <View style={styles.optionsGrid}>
                {AGE_OPTIONS.map((option) => {
                  const isSelected = selectedAge === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        isSelected && { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
                      ]}
                      onPress={() => handleAgeSelect(option.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>
                        {option.label}
                      </Text>
                      <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
                        {option.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Step 2: Sex */}
            <View style={styles.slide}>
              <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                Biological sex?
              </Text>
              <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                Hormones affect gut health differently
              </Text>

              <View style={styles.sexOptionsContainer}>
                {/* Male and Female row */}
                <View style={styles.sexOptionsRow}>
                  {SEX_OPTIONS.filter(opt => opt.id !== 'not-specified').map((option) => {
                    const isSelected = selectedSex === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.sexCard,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          isSelected && { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
                        ]}
                        onPress={() => handleSexSelect(option.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.sexIconContainer, { backgroundColor: isSelected ? `${colors.primary}30` : `${colors.textMuted}15` }]}>
                          <Text style={[styles.sexSymbol, { color: isSelected ? colors.primary : colors.textPrimary }]}>
                            {option.id === 'female' ? '♀' : '♂'}
                          </Text>
                        </View>
                        <Text style={[styles.sexLabel, { color: isSelected ? colors.primary : colors.textPrimary }]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Prefer not to say - separate row */}
                {SEX_OPTIONS.filter(opt => opt.id === 'not-specified').map((option) => {
                  const isSelected = selectedSex === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.sexCardAlt,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        isSelected && { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
                      ]}
                      onPress={() => handleSexSelect(option.id)}
                      activeOpacity={0.7}
                    >
                      <CircleOff size={20} color={isSelected ? colors.primary : colors.textMuted} strokeWidth={2} />
                      <Text style={[styles.sexLabelAlt, { color: isSelected ? colors.primary : colors.textSecondary }]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Step 3: Conditions */}
            <View style={styles.slide}>
              <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                Any health conditions?
              </Text>
              <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
                Select all that apply (optional)
              </Text>

              <ScrollView
                style={styles.conditionsScroll}
                contentContainerStyle={styles.conditionsGrid}
                showsVerticalScrollIndicator={false}
              >
                {CONDITION_OPTIONS.map((option) => {
                  const isSelected = selectedConditions.includes(option.id);
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.conditionCard,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        isSelected && { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
                      ]}
                      onPress={() => handleConditionToggle(option.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.conditionIconContainer, { backgroundColor: option.bgColor }]}>
                        {CONDITION_ICON_MAP[option.icon] && React.createElement(CONDITION_ICON_MAP[option.icon], {
                          size: 20,
                          color: option.iconColor,
                          strokeWidth: 2,
                        })}
                      </View>
                      <View style={styles.conditionText}>
                        <Text style={[styles.conditionLabel, { color: colors.textPrimary }]}>
                          {option.label}
                        </Text>
                        <Text style={[styles.conditionDesc, { color: colors.textMuted }]}>
                          {option.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </Animated.View>
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Shield size={14} color={colors.textMuted} />
          <Text style={[styles.privacyText, { color: colors.textMuted }]}>
            Your data stays on your device
          </Text>
        </View>

        {/* Button - only show on conditions step since others auto-advance */}
        {step === 2 && (
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Done"
              onPress={handleNext}
              variant="primary"
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
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  slidesContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  slidesWrapper: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * 3,
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 24,
  },
  stepTitle: {
    fontSize: 26,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
  },
  optionDesc: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  sexOptionsContainer: {
    alignItems: 'center',
    gap: 16,
  },
  sexOptionsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  sexCard: {
    borderRadius: 20,
    padding: 20,
    paddingHorizontal: 28,
    borderWidth: 2,
    alignItems: 'center',
    gap: 10,
    minWidth: 110,
  },
  sexIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sexSymbol: {
    fontSize: 32,
    fontWeight: '300',
  },
  sexLabel: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
  },
  sexCardAlt: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sexLabelAlt: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  conditionsScroll: {
    flex: 1,
  },
  conditionsGrid: {
    gap: 10,
    paddingBottom: 20,
  },
  conditionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  conditionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionText: {
    flex: 1,
  },
  conditionLabel: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  conditionDesc: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  privacyText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
});
