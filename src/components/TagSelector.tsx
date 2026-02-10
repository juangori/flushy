import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Coffee,
  Flame,
  Wine,
  Salad,
  Frown,
  Pill,
  Plane,
  Droplets,
  Milk,
  Dumbbell,
  GlassWater,
  LucideIcon,
} from 'lucide-react-native';
import { QuickTag } from '../types';
import { useTheme } from '../context';
import { FONTS } from '../constants';

// Map icon names to components
const ICON_MAP: Record<string, LucideIcon> = {
  Coffee,
  Flame,
  Wine,
  Salad,
  Frown,
  Pill,
  Plane,
  Droplets,
  Milk,
  Dumbbell,
  GlassWater,
};

interface TagSelectorProps {
  tags: QuickTag[];
  selectedTags: string[];
  onToggle: (tagId: string) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTags,
  onToggle,
}) => {
  const { colors } = useTheme();

  const handleToggle = async (tagId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(tagId);
  };

  return (
    <View style={styles.container}>
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id);
        const IconComponent = ICON_MAP[tag.icon];

        return (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tagButton,
              { backgroundColor: colors.surfaceHover },
              isSelected && { backgroundColor: `${colors.primary}35`, borderColor: colors.primary },
            ]}
            onPress={() => handleToggle(tag.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: tag.bgColor }]}>
              {IconComponent && (
                <IconComponent size={14} color={tag.iconColor} strokeWidth={2.5} />
              )}
            </View>
            <Text style={[styles.label, { color: colors.textPrimary }]}>{tag.label}</Text>
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
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
});
