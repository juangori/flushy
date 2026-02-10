import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  Sprout,
  Calendar,
  CalendarCheck,
  Trophy,
  Star,
  Target,
  Smile,
  Flower2,
  TrendingUp,
  Sunrise,
  Moon,
  Clock,
  Tags,
  Search,
  Brain,
  Gem,
  Medal,
  Leaf,
  Droplets,
  Palette,
  LucideIcon,
} from 'lucide-react-native';
import { Achievement } from '../types';
import { useTheme } from '../context';
import { FONTS } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Sprout,
  Calendar,
  CalendarCheck,
  Trophy,
  Star,
  Target,
  Smile,
  Flower2,
  TrendingUp,
  Sunrise,
  Moon,
  Clock,
  Tags,
  Search,
  Brain,
  Gem,
  Medal,
  Leaf,
  Droplets,
  Palette,
};

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
  onPress: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onDismiss,
  onPress,
}) => {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(150)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
    ]).start();

    // Icon bounce animation
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
      ]).start();
    }, 300);

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 150,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const IconComponent = ICON_MAP[achievement.icon];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.95)', 'rgba(109, 40, 217, 0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.toast}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              { backgroundColor: achievement.bgColor },
              { transform: [{ scale: iconScale }] },
            ]}
          >
            {IconComponent && (
              <IconComponent
                size={28}
                color={achievement.iconColor}
                strokeWidth={2}
              />
            )}
          </Animated.View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Achievement Unlocked!</Text>
            <Text style={styles.name}>{achievement.name}</Text>
          </View>

          <View style={styles.chevron}>
            <Text style={styles.chevronText}>›</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONTS.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: FONTS.semiBold,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: FONTS.regular,
  },
});
