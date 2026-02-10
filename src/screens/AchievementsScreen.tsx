import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Trophy } from 'lucide-react-native';
import { Achievement, AchievementCategory, DayData } from '../types';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getAchievementsByCategory } from '../constants/achievements';
import { BadgeCard, BadgeModal } from '../components';
import { useTheme } from '../context';
import { useAchievements } from '../hooks/useAchievements';
import { FONTS } from '../constants';

interface AchievementsScreenProps {
  history: DayData[];
  onBack: () => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  history,
  onBack,
}) => {
  const { colors } = useTheme();
  const {
    unlockedCount,
    totalCount,
    isUnlocked,
    getUnlockedAt,
    getProgress,
    markAchievementsSeen,
  } = useAchievements(history);

  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mark achievements as seen when viewing
  React.useEffect(() => {
    markAchievementsSeen();
  }, [markAchievementsSeen]);

  const handleBadgePress = useCallback((achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedAchievement(null);
  }, []);

  const progressPercentage = (unlockedCount / totalCount) * 100;

  const categories: AchievementCategory[] = ['consistency', 'health', 'timing', 'insights', 'special'];

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary, colors.bgTertiary]}
      style={styles.container}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={onBack}
          >
            <ChevronLeft size={20} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Achievements
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Card */}
          <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
            <View style={styles.progressHeader}>
              <View style={[styles.trophyContainer, { backgroundColor: '#FEF3C7' }]}>
                <Trophy size={24} color="#F59E0B" strokeWidth={2} />
              </View>
              <View style={styles.progressText}>
                <Text style={[styles.progressCount, { color: colors.textPrimary }]}>
                  {unlockedCount} / {totalCount}
                </Text>
                <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                  achievements unlocked
                </Text>
              </View>
            </View>
            <View style={[styles.progressBarContainer, { backgroundColor: colors.bgTertiary }]}>
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
              />
            </View>
          </View>

          {/* Categories */}
          {categories.map((category) => {
            const categoryAchievements = getAchievementsByCategory(category);
            const categoryUnlocked = categoryAchievements.filter(a => isUnlocked(a.id)).length;

            return (
              <View key={category} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Text style={[styles.categoryTitle, { color: colors.textPrimary }]}>
                    {ACHIEVEMENT_CATEGORIES[category]}
                  </Text>
                  <Text style={[styles.categoryCount, { color: colors.textMuted }]}>
                    {categoryUnlocked}/{categoryAchievements.length}
                  </Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.badgesRow}
                >
                  {categoryAchievements.map((achievement) => {
                    const unlocked = isUnlocked(achievement.id);
                    const unlockedAt = getUnlockedAt(achievement.id);
                    const progress = !unlocked ? getProgress(achievement) : null;

                    return (
                      <BadgeCard
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={unlocked}
                        unlockedAt={unlockedAt}
                        progress={progress}
                        onPress={() => handleBadgePress(achievement)}
                        size="medium"
                      />
                    );
                  })}
                </ScrollView>
              </View>
            );
          })}

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>

      {/* Badge Modal */}
      <BadgeModal
        visible={modalVisible}
        achievement={selectedAchievement}
        isUnlocked={selectedAchievement ? isUnlocked(selectedAchievement.id) : false}
        unlockedAt={selectedAchievement ? getUnlockedAt(selectedAchievement.id) : undefined}
        progress={selectedAchievement && !isUnlocked(selectedAchievement.id)
          ? getProgress(selectedAchievement)
          : null}
        onClose={handleCloseModal}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  progressCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trophyContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  progressText: {
    flex: 1,
  },
  progressCount: {
    fontSize: 24,
    fontFamily: FONTS.bold,
  },
  progressLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  categoryCount: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  badgesRow: {
    gap: 12,
    paddingRight: 4,
  },
  bottomSpacing: {
    height: 40,
  },
});
