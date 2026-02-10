import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BristolIcon } from '../components/BristolIcons';
import { PrimaryButton } from '../components';
import { useTheme } from '../context';
import { FONTS } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    title: 'Welcome to Flushy',
    subtitle: 'Your personal gut health companion',
    description: 'Track your bowel movements quickly and privately. All data stays on your device.',
    useImage: true,
  },
  {
    title: 'Bristol Stool Chart',
    subtitle: '7 types, science-backed',
    description: 'Log using the Bristol Stool Scale, a medical tool used by doctors worldwide to classify stool consistency.',
    useBristol: true,
  },
  {
    title: 'Discover Patterns',
    subtitle: 'Insights that matter',
    description: 'Track colors, tags, and see how diet and habits affect your gut. Your Gut Score shows overall health at a glance.',
    useStats: true,
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { colors } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const goToSlide = (index: number) => {
    Animated.timing(slideAnim, {
      toValue: -index * SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentSlide(index);
    });
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      onComplete();
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
        {/* Skip button */}
        {currentSlide < slides.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Slides */}
        <View style={styles.slidesContainer}>
          <Animated.View
            style={[
              styles.slidesWrapper,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            {slides.map((slide, index) => (
              <View key={index} style={styles.slide}>
                {/* Visual */}
                <View style={styles.visual}>
                  {slide.useImage && (
                    <Image
                      source={require('../../assets/flushy-emoji.png')}
                      style={styles.heroImage}
                    />
                  )}
                  {slide.useBristol && (
                    <View style={styles.bristolPreview}>
                      {[3, 4, 5].map((type) => (
                        <View key={type} style={styles.bristolItem}>
                          <BristolIcon type={type} size={40} color={
                            type === 4 ? colors.healthy : colors.warning
                          } />
                          <Text style={[styles.bristolLabel, { color: colors.textMuted }]}>Type {type}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {slide.useStats && (
                    <View style={styles.statsPreview}>
                      <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.previewLabel, { color: colors.textMuted }]}>Gut Score</Text>
                        <Text style={[styles.previewValue, { color: colors.healthy }]}>85</Text>
                      </View>
                      <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.previewLabel, { color: colors.textMuted }]}>Streak</Text>
                        <Text style={[styles.previewValue, { color: colors.healthy }]}>7</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Text */}
                <View style={styles.textContent}>
                  <Text style={[styles.slideTitle, { color: colors.textPrimary }]}>{slide.title}</Text>
                  <Text style={[styles.slideSubtitle, { color: colors.primary }]}>{slide.subtitle}</Text>
                  <Text style={[styles.slideDescription, { color: colors.textSecondary }]}>{slide.description}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: colors.surface },
                currentSlide === index && { backgroundColor: colors.primary, width: 24 },
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={currentSlide === slides.length - 1 ? "Let's Go!" : 'Next'}
            onPress={handleNext}
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
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
  slidesContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  slidesWrapper: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * slides.length,
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  visual: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroImage: {
    width: 120,
    height: 120,
  },
  bristolPreview: {
    flexDirection: 'row',
    gap: 24,
  },
  bristolItem: {
    alignItems: 'center',
    gap: 8,
  },
  bristolLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  statsPreview: {
    flexDirection: 'row',
    gap: 16,
  },
  previewCard: {
    borderRadius: 20,
    padding: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    borderWidth: 1,
  },
  previewLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: FONTS.medium,
  },
  previewValue: {
    fontSize: 36,
    fontFamily: FONTS.bold,
    marginTop: 4,
    letterSpacing: -1,
  },
  textContent: {
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    textAlign: 'center',
    marginTop: 8,
  },
  slideDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
    fontFamily: FONTS.regular,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
});
