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
import { X, ChevronLeft } from 'lucide-react-native';
import { BristolSelector, TagSelector, ColorSelector, PrimaryButton } from '../components';
import { BristolType } from '../types';
import { COLORS, BRISTOL_TYPES, QUICK_TAGS, STOOL_COLORS } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LogScreenProps {
  onSave: (type: BristolType, tags: string[], color: string) => Promise<boolean>;
  onCancel: () => void;
}

export const LogScreen: React.FC<LogScreenProps> = ({
  onSave,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<BristolType | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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
      const success = await onSave(selectedType, selectedTags, selectedColor);

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
        colors={[COLORS.bgPrimary, COLORS.bgSecondary, COLORS.bgTertiary]}
        style={styles.successContainer}
      >
        <Animated.Text style={styles.successEmoji}>✨</Animated.Text>
        <Text style={styles.successText}>Logged!</Text>
      </LinearGradient>
    );
  }

  const stepLabels = ['Type', 'Color', 'Tags'];

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
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleBack}
          >
            {step > 1 ? (
              <ChevronLeft size={20} color={COLORS.textSecondary} strokeWidth={2} />
            ) : (
              <X size={20} color={COLORS.textSecondary} strokeWidth={2} />
            )}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quick Log</Text>
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
                  isActive && styles.stepDotActive,
                  isCurrent && styles.stepDotCurrent,
                ]} />
                <Text style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                ]}>{label}</Text>
              </View>
            );
          })}
          <View style={styles.stepLine}>
            <View style={[
              styles.stepLineProgress,
              { width: `${((step - 1) / 2) * 100}%` }
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
                <Text style={styles.sectionLabel}>How did it look?</Text>
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
                <Text style={styles.sectionLabel}>What color was it?</Text>
                <ColorSelector
                  colors={STOOL_COLORS}
                  selectedColor={selectedColor}
                  onSelect={handleColorSelect}
                />
              </ScrollView>
            </View>

            {/* Step 3: Tags + Save */}
            <View style={styles.panel}>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.sectionLabel}>Quick tags (optional)</Text>
                <TagSelector
                  tags={QUICK_TAGS}
                  selectedTags={selectedTags}
                  onToggle={handleTagToggle}
                />
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
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
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
    backgroundColor: COLORS.surface,
    marginBottom: 6,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotCurrent: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primary,
  },
  stepLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: COLORS.textSecondary,
  },
  stepLine: {
    position: 'absolute',
    top: 5,
    left: 55,
    right: 55,
    height: 2,
    backgroundColor: COLORS.surface,
  },
  stepLineProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
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
    color: COLORS.textMuted,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
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
  successEmoji: {
    fontSize: 80,
  },
  successText: {
    color: COLORS.healthy,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    letterSpacing: -0.5,
  },
});
