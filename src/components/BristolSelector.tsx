import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BristolType } from '../types';
import { COLORS, getHealthColor } from '../constants';
import { BristolIcon } from './BristolIcons';

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
              isSelected && styles.typeButtonSelected,
            ]}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
          >
            <View style={styles.emojiContainer}>
              <BristolIcon type={item.type} size={32} color={getHealthColor(item.health)} />
            </View>
            
            <View style={styles.textContainer}>
              <Text style={styles.typeName}>
                Type {item.type}: {item.name}
              </Text>
              <Text style={styles.typeDesc}>{item.desc}</Text>
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
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    gap: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: COLORS.primary,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.surfaceHover,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  textContainer: {
    flex: 1,
  },
  typeName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  typeDesc: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  healthIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
