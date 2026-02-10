import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context';
import { FONTS } from '../constants';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string | React.ReactNode;
  variant?: 'primary' | 'success' | 'secondary';
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  variant = 'primary',
  style,
}) => {
  const { colors } = useTheme();

  const handlePress = async () => {
    if (disabled || loading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const getGradient = (): [string, string] => {
    if (disabled) return [colors.surface, colors.surfaceHover];

    switch (variant) {
      case 'success':
        return ['#4ADE80', '#22C55E'];
      case 'secondary':
        return [colors.surface, colors.surfaceHover];
      default:
        return [colors.primary, colors.primaryLight];
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.wrapper, style]}
    >
      <LinearGradient
        colors={getGradient()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          variant === 'success' && !disabled && { shadowColor: colors.healthy },
          variant === 'primary' && !disabled && { shadowColor: colors.primary },
          (variant === 'success' || variant === 'primary') && !disabled && styles.buttonShadow,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'secondary' || disabled ? colors.textPrimary : colors.buttonText} />
        ) : (
          <>
            {icon && (typeof icon === 'string' ? <Text style={styles.icon}>{icon}</Text> : icon)}
            <Text style={[
              styles.text,
              { color: variant === 'secondary' ? colors.textPrimary : colors.buttonText },
              disabled && { color: colors.textMuted },
            ]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
  },
  gradient: {
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonShadow: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    fontSize: 24,
  },
  text: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
  },
});
