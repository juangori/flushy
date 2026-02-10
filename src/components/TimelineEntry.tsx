import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LogEntry } from '../types';
import { BRISTOL_TYPES, QUICK_TAGS, getHealthColor, getStoolColorById, FONTS } from '../constants';
import { AnimatedBristolIcon } from './AnimatedBristolIcons';
import { useTheme } from '../context';

interface TimelineEntryProps {
  entry: LogEntry;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({ entry }) => {
  const { colors } = useTheme();
  const bristolType = BRISTOL_TYPES[entry.type - 1];
  const stoolColor = entry.color ? getStoolColorById(entry.color) : null;

  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.surface, borderLeftColor: getHealthColor(bristolType.health) }
    ]}>
      <View style={[styles.emojiContainer, { backgroundColor: colors.surfaceHover }]}>
        <AnimatedBristolIcon type={entry.type} size={32} color={getHealthColor(bristolType.health)} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Type {entry.type}: {bristolType.name}
          </Text>
          {stoolColor && (
            <View style={[styles.colorDot, { backgroundColor: stoolColor.hex }]} />
          )}
        </View>
        <Text style={[styles.time, { color: colors.textMuted }]}>{entry.time}</Text>

        {entry.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {entry.tags.map(tagId => {
              const tag = QUICK_TAGS.find(t => t.id === tagId);
              if (!tag) return null;

              return (
                <View key={tagId} style={[styles.tag, { backgroundColor: tag.bgColor }]}>
                  <Text style={[styles.tagText, { color: tag.iconColor }]}>
                    {tag.label}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  time: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tagText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
});
