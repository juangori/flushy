import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BristolType } from '../types';
import { getHealthColor, FONTS } from '../constants';
import { AnimatedBristolIcon } from './AnimatedBristolIcons';
import { useTheme } from '../context';

interface BristolSelectorProps {
  types: BristolType[];
  selectedType: BristolType | null;
  onSelect: (type: BristolType) => void;
}

export const BristolSelector: React.FC<BristolSelectorProps> = ({
  types,
  selectedType,
  onSelect,
}) => {
  const { colors } = useTheme();

  const handleSelect = async (type: BristolType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(type);
  };

  return (
    <View style={styles.container}>
      {types.map((item) => {
        const isSelected = selectedType?.type === item.type;

        return (
          <TouchableOpacity
            key={item.type}
            style={[
              styles.typeButton,
              { backgroundColor: colors.surface },
              isSelected && { backgroundColor: `${colors.primary}30`, borderColor: colors.primary },
            ]}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.emojiContainer, { backgroundColor: colors.surfaceHover }]}>
              <AnimatedBristolIcon type={item.type} size={44} color={getHealthColor(item.health)} />
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.typeName, { color: colors.textPrimary }]}>
                Type {item.type}: {item.name}
              </Text>
              <Text style={[styles.typeDesc, { color: colors.textMuted }]}>{item.desc}</Text>
            </View>

            <View
              style={[
                styles.healthIndicator,
                { backgroundColor: getHealthColor(item.health) }
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    gap: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  typeName: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
  },
  typeDesc: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  healthIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
