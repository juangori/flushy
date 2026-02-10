import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { StoolColor } from '../types';
import { getStoolColorHealthColor, FONTS } from '../constants';
import { useTheme } from '../context';

interface ColorSelectorProps {
  colors: StoolColor[];
  selectedColor: string | null;
  onSelect: (colorId: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors: stoolColors,
  selectedColor,
  onSelect,
}) => {
  const { colors } = useTheme();

  const handleSelect = async (colorId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(colorId);
  };

  return (
    <View style={styles.container}>
      {stoolColors.map((color) => {
        const isSelected = selectedColor === color.id;
        const healthColor = getStoolColorHealthColor(color.health);

        return (
          <TouchableOpacity
            key={color.id}
            style={[
              styles.colorItem,
              { backgroundColor: colors.surface },
              color.health === 'alert' && styles.colorItemAlert,
              color.health === 'attention' && styles.colorItemAttention,
              isSelected && { backgroundColor: `${colors.primary}30`, borderColor: colors.primary },
            ]}
            onPress={() => handleSelect(color.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.healthDot, { backgroundColor: healthColor }]} />
            <View style={[styles.swatch, { backgroundColor: color.hex }]} />
            <Text style={[styles.colorName, { color: colors.textPrimary }]}>{color.name}</Text>
            <Text style={[styles.colorDesc, { color: colors.textMuted }]}>{color.description}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorItem: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorItemAlert: {
    borderColor: 'rgba(248, 113, 113, 0.25)',
  },
  colorItemAttention: {
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  healthDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 8,
  },
  colorName: {
    fontSize: 13,
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
  },
  colorDesc: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
    fontFamily: FONTS.regular,
  },
});
