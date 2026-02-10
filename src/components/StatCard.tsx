import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context';
import { FONTS } from '../constants';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  hint?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  color,
  hint,
  onPress,
}) => {
  const { colors } = useTheme();
  const valueColor = color || colors.textPrimary;

  const content = (
    <>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
        {unit && <Text style={[styles.unit, { color: colors.textPrimary }]}>{unit}</Text>}
      </View>
      {hint && <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: FONTS.medium,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  value: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    letterSpacing: -1,
  },
  unit: {
    fontSize: 14,
    marginLeft: 4,
    fontFamily: FONTS.regular,
  },
  hint: {
    fontSize: 9,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
});
