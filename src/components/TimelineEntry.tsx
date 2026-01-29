import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LogEntry } from '../types';
import { BRISTOL_TYPES, QUICK_TAGS, COLORS, getHealthColor } from '../constants';
import { BristolIcon } from './BristolIcons';

interface TimelineEntryProps {
  entry: LogEntry;
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({ entry }) => {
  const bristolType = BRISTOL_TYPES[entry.type - 1];
  
  return (
    <View style={[
      styles.container,
      { borderLeftColor: getHealthColor(bristolType.health) }
    ]}>
      <View style={styles.emojiContainer}>
        <BristolIcon type={entry.type} size={28} color={getHealthColor(bristolType.health)} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>
          Type {entry.type}: {bristolType.name}
        </Text>
        <Text style={styles.time}>{entry.time}</Text>
        
        {entry.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {entry.tags.map(tagId => {
              const tag = QUICK_TAGS.find(t => t.id === tagId);
              if (!tag) return null;
              
              return (
                <View key={tagId} style={styles.tag}>
                  <Text style={styles.tagText}>
                    {tag.emoji} {tag.label}
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
    backgroundColor: COLORS.surface,
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
    backgroundColor: COLORS.surfaceHover,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tagText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
});
