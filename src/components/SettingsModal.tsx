import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X, Check, Moon, Sun, Leaf, Flower2, Circle, Shield, Heart, RotateCcw, CalendarDays } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context';
import { THEME_LIST, ThemeId, ThemeIcon } from '../constants/themes';
import { FONTS, ALL_STORAGE_KEYS } from '../constants';
import { PRIVACY_STATEMENT, FULL_DISCLAIMER } from '../constants/wellnessTips';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onResetApp?: () => Promise<void>;
  onViewDigest?: () => void;
}

const ThemeIconComponent: React.FC<{ icon: ThemeIcon; size: number; color: string }> = ({ icon, size, color }) => {
  const iconProps = { size, color, strokeWidth: 2 };
  switch (icon) {
    case 'Moon': return <Moon {...iconProps} />;
    case 'Sun': return <Sun {...iconProps} />;
    case 'Leaf': return <Leaf {...iconProps} />;
    case 'Flower2': return <Flower2 {...iconProps} />;
    case 'Circle': return <Circle {...iconProps} />;
    default: return <Circle {...iconProps} />;
  }
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose, onResetApp, onViewDigest }) => {
  const { themeId, colors, setTheme } = useTheme();

  const handleThemeSelect = (newThemeId: ThemeId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(newThemeId);
  };

  const handleResetApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Reset All Data',
      'This will delete all your logs, profile, and settings. You will see the onboarding screens again. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear storage
              await AsyncStorage.multiRemove(ALL_STORAGE_KEYS);
              // Reset in-memory state via callback
              if (onResetApp) {
                await onResetApp();
              }
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to reset app data. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Background overlay - tapping this closes the modal */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal content - positioned above overlay */}
        <View
          style={[
            styles.content,
            {
              backgroundColor: colors.bgSecondary,
              borderColor: colors.border,
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.surface }]}
            >
              <X size={20} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={true}
            bounces={true}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {/* Theme Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Appearance</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                directionalLockEnabled={true}
                contentContainerStyle={styles.themesScroll}
              >
                {THEME_LIST.map((theme) => {
                  const isSelected = theme.id === themeId;
                  return (
                    <TouchableOpacity
                      key={theme.id}
                      style={[
                        styles.themeCard,
                        { borderColor: isSelected ? theme.colors.primary : 'transparent' },
                      ]}
                      onPress={() => handleThemeSelect(theme.id)}
                      activeOpacity={0.7}
                    >
                      {/* Theme preview gradient */}
                      <LinearGradient
                        colors={[theme.colors.bgPrimary, theme.colors.bgSecondary, theme.colors.bgTertiary]}
                        style={styles.themePreview}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        {/* Accent dot */}
                        <View style={[styles.accentDot, { backgroundColor: theme.colors.primary }]} />

                        {/* Icon */}
                        <View style={[styles.themeIconContainer, { backgroundColor: `${theme.colors.primary}25` }]}>
                          <ThemeIconComponent
                            icon={theme.icon}
                            size={22}
                            color={theme.colors.primary}
                          />
                        </View>

                        {/* Selected indicator */}
                        {isSelected && (
                          <View style={[styles.selectedBadge, { backgroundColor: theme.colors.primary }]}>
                            <Check size={10} color="#FFF" strokeWidth={3} />
                          </View>
                        )}
                      </LinearGradient>

                      {/* Theme name */}
                      <Text style={[
                        styles.themeName,
                        { color: isSelected ? colors.primary : colors.textSecondary }
                      ]}>
                        {theme.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Weekly Digest Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Weekly Summary</Text>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onClose();
                  setTimeout(() => onViewDigest?.(), 300);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                  <CalendarDays size={18} color={colors.primary} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>View Weekly Digest</Text>
                  <Text style={[styles.actionDesc, { color: colors.textMuted }]}>
                    See your last week's summary
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Privacy Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Privacy</Text>
              <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
                <View style={styles.infoCardHeader}>
                  <View style={[styles.infoIconContainer, { backgroundColor: `${colors.healthy}20` }]}>
                    <Shield size={18} color={colors.healthy} />
                  </View>
                  <Text style={[styles.infoCardTitle, { color: colors.textPrimary }]}>
                    {PRIVACY_STATEMENT.title}
                  </Text>
                </View>
                <Text style={[styles.infoCardHighlight, { color: colors.healthy }]}>
                  {PRIVACY_STATEMENT.mainMessage}
                </Text>
                {PRIVACY_STATEMENT.details.map((detail, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <Text style={[styles.bullet, { color: colors.textMuted }]}>•</Text>
                    <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
                      {detail}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Health Disclaimer Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Health Info</Text>
              <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
                <View style={styles.infoCardHeader}>
                  <View style={[styles.infoIconContainer, { backgroundColor: `${colors.warning}20` }]}>
                    <Heart size={18} color={colors.warning} />
                  </View>
                  <Text style={[styles.infoCardTitle, { color: colors.textPrimary }]}>
                    {FULL_DISCLAIMER.title}
                  </Text>
                </View>

                {FULL_DISCLAIMER.sections.map((section, index) => (
                  <View key={index} style={styles.disclaimerSection}>
                    <Text style={[styles.disclaimerHeading, { color: colors.textPrimary }]}>
                      {section.heading}
                    </Text>
                    <Text style={[styles.disclaimerContent, { color: colors.textSecondary }]}>
                      {section.content}
                    </Text>
                  </View>
                ))}

              </View>
            </View>

            {/* Reset Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Data</Text>
              <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: `${colors.alert}15`, borderColor: `${colors.alert}30` }]}
                onPress={handleResetApp}
                activeOpacity={0.7}
              >
                <View style={[styles.resetIconContainer, { backgroundColor: `${colors.alert}20` }]}>
                  <RotateCcw size={18} color={colors.alert} />
                </View>
                <View style={styles.resetTextContainer}>
                  <Text style={[styles.resetTitle, { color: colors.alert }]}>Reset App Data</Text>
                  <Text style={[styles.resetDesc, { color: colors.textMuted }]}>
                    Clear all logs and start fresh
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

              {/* App info */}
            <View style={[styles.appInfo, { borderTopColor: colors.border }]}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.appLogo}
              />
              <Text style={[styles.appName, { color: colors.textSecondary }]}>
                Flushy
              </Text>
              <Text style={[styles.appVersion, { color: colors.textMuted }]}>
                Version 1.0.0
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    borderWidth: 1,
  },
  scrollContentContainer: {
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.bold,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  themesScroll: {
    gap: 12,
    paddingRight: 4,
  },
  themeCard: {
    width: 90,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 20,
    padding: 6,
  },
  themePreview: {
    width: '100%',
    height: 80,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  accentDot: {
    position: 'absolute',
    top: -15,
    right: -15,
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.4,
  },
  themeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeName: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    marginTop: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  appLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: 8,
  },
  appName: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  appVersion: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardTitle: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    flex: 1,
  },
  infoCardHighlight: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    marginBottom: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 12,
    lineHeight: 18,
  },
  bulletText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    flex: 1,
  },
  disclaimerSection: {
    marginBottom: 12,
  },
  disclaimerHeading: {
    fontSize: 13,
    fontFamily: FONTS.semiBold,
    marginBottom: 4,
  },
  disclaimerContent: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  actionDesc: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  resetIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetTextContainer: {
    flex: 1,
  },
  resetTitle: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  resetDesc: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
});
