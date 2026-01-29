import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { DayData } from '../types';
import { COLORS, QUICK_TAGS, BRISTOL_TYPES, getHealthColor } from '../constants';
import { calculateStats, getTypeDistribution, getTagCorrelations } from '../utils';
import { BristolIcon } from '../components/BristolIcons';

interface InsightsScreenProps {
  history: DayData[];
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ history }) => {
  const stats = calculateStats(history);
  const typeDistribution = getTypeDistribution(history);
  const tagCorrelations = getTagCorrelations(history, QUICK_TAGS);
  const maxCount = Math.max(...typeDistribution.map(t => t.count), 1);

  return (
    <LinearGradient
      colors={[COLORS.bgPrimary, COLORS.bgSecondary, COLORS.bgTertiary]}
      style={styles.container}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>Patterns from your data</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyText}>No data yet</Text>
              <Text style={styles.emptySubtext}>
                Start logging to see insights
              </Text>
            </View>
          ) : (
            <>
              {/* Type Distribution */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Type Distribution</Text>
                <View style={styles.distributionList}>
                  {typeDistribution.map(item => (
                    <View key={item.type} style={styles.distributionItem}>
                      <View style={styles.distributionEmoji}>
                        <BristolIcon type={item.type} size={24} color={getHealthColor(item.health)} />
                      </View>
                      <View style={styles.barContainer}>
                        <View 
                          style={[
                            styles.bar,
                            { 
                              width: `${(item.count / maxCount) * 100}%`,
                              backgroundColor: getHealthColor(item.health),
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.distributionCount}>{item.count}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Health Score */}
              <LinearGradient
                colors={['rgba(74, 222, 128, 0.15)', 'rgba(34, 197, 94, 0.08)']}
                style={styles.healthCard}
              >
                <View style={styles.healthContent}>
                  <View>
                    <Text style={styles.healthLabel}>Gut Health Score</Text>
                    <Text style={styles.healthScore}>{stats.healthScore}</Text>
                  </View>
                  <Text style={styles.healthEmoji}>🎯</Text>
                </View>
                <Text style={styles.healthDesc}>
                  Based on proximity to ideal Type 4. Keep it up!
                </Text>
              </LinearGradient>

              {/* Average Type */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Average Type</Text>
                <View style={styles.avgTypeContent}>
                  <Text style={styles.avgTypeValue}>{stats.avgType}</Text>
                  <View style={styles.avgTypeInfo}>
                    {stats.avgType !== '-' && (
                      <>
                        <View style={styles.avgTypeEmoji}>
                          <BristolIcon
                            type={Math.round(parseFloat(stats.avgType))}
                            size={28}
                            color={getHealthColor(BRISTOL_TYPES[Math.round(parseFloat(stats.avgType)) - 1]?.health)}
                          />
                        </View>
                        <Text style={styles.avgTypeName}>
                          {BRISTOL_TYPES[Math.round(parseFloat(stats.avgType)) - 1]?.name}
                        </Text>
                        <View style={[
                          styles.avgTypeBadge,
                          { backgroundColor: getHealthColor(BRISTOL_TYPES[Math.round(parseFloat(stats.avgType)) - 1]?.health) }
                        ]}>
                          <Text style={styles.avgTypeBadgeText}>
                            {BRISTOL_TYPES[Math.round(parseFloat(stats.avgType)) - 1]?.desc}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
                <Text style={styles.avgTypeHint}>
                  Weekly average across {stats.weekCount} logs
                </Text>
              </View>

              {/* Tag Correlations */}
              {tagCorrelations.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>What affects you</Text>
                  <View style={styles.correlationList}>
                    {tagCorrelations.slice(0, 5).map(tag => (
                      <View key={tag.id} style={styles.correlationItem}>
                        <View style={styles.correlationLeft}>
                          <Text style={styles.correlationEmoji}>{tag.emoji}</Text>
                          <Text style={styles.correlationLabel}>{tag.label}</Text>
                        </View>
                        <Text style={styles.correlationStats}>
                          {tag.count}× → avg Type {tag.avgType}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Tips */}
              <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
                <Text style={styles.tipText}>
                  • Types 3-4 are ideal (smooth, easy to pass)
                </Text>
                <Text style={styles.tipText}>
                  • Types 1-2 suggest you need more water and fiber
                </Text>
                <Text style={styles.tipText}>
                  • Types 5-7 may indicate digestive issues
                </Text>
              </View>

              {/* Disclaimer */}
              <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>
                  Stool classifications are based on the Bristol Stool Chart, a medical diagnostic tool developed at the Bristol Royal Infirmary. Health guidelines follow recommendations from the World Gastroenterology Organisation (WGO) and the World Health Organization (WHO). This app is for informational purposes only and does not replace professional medical advice. If you have concerns about your digestive health, please consult a healthcare professional.
                </Text>
              </View>
            </>
          )}
        </ScrollView>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -1,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  distributionList: {
    gap: 10,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distributionEmoji: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barContainer: {
    flex: 1,
    height: 24,
    backgroundColor: COLORS.surfaceHover,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 12,
    minWidth: 4,
  },
  distributionCount: {
    color: COLORS.textSecondary,
    fontSize: 14,
    width: 30,
    textAlign: 'right',
  },
  healthCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  healthContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  healthScore: {
    color: COLORS.healthy,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -2,
    marginTop: 4,
  },
  healthEmoji: {
    fontSize: 60,
  },
  healthDesc: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 12,
  },
  avgTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avgTypeValue: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -2,
  },
  avgTypeInfo: {
    flex: 1,
    gap: 4,
  },
  avgTypeEmoji: {
    marginBottom: 2,
  },
  avgTypeName: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  avgTypeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  avgTypeBadgeText: {
    color: COLORS.bgTertiary,
    fontSize: 11,
    fontWeight: '700',
  },
  avgTypeHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 12,
  },
  correlationList: {
    gap: 12,
  },
  correlationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceHover,
    borderRadius: 12,
    padding: 12,
  },
  correlationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  correlationEmoji: {
    fontSize: 20,
  },
  correlationLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  correlationStats: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  tipsCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  tipsTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 22,
  },
  disclaimer: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  disclaimerText: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
});
