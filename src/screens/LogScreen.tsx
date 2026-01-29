import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import { BristolSelector, TagSelector, PrimaryButton } from '../components';
import { BristolType } from '../types';
import { COLORS, BRISTOL_TYPES, QUICK_TAGS } from '../constants';

interface LogScreenProps {
  onSave: (type: BristolType, tags: string[]) => Promise<boolean>;
  onCancel: () => void;
}

export const LogScreen: React.FC<LogScreenProps> = ({
  onSave,
  onCancel,
}) => {
  const [selectedType, setSelectedType] = useState<BristolType | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTypeSelect = (type: BristolType) => {
    setSelectedType(type);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    if (!selectedType || isSaving) return;
    
    setIsSaving(true);
    
    try {
      const success = await onSave(selectedType, selectedTags);
      
      if (success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowSuccess(true);
        
        setTimeout(() => {
          onCancel();
        }, 1200);
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  // Success overlay
  if (showSuccess) {
    return (
      <LinearGradient
        colors={[COLORS.bgPrimary, COLORS.bgSecondary, COLORS.bgTertiary]}
        style={styles.successContainer}
      >
        <Animated.Text style={styles.successEmoji}>✨</Animated.Text>
        <Text style={styles.successText}>Logged!</Text>
      </LinearGradient>
    );
  }

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
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Quick Log</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onCancel}
          >
            <X size={20} color={COLORS.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Bristol Scale Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How did it look?</Text>
            <BristolSelector
              types={BRISTOL_TYPES}
              selectedType={selectedType}
              onSelect={handleTypeSelect}
            />
          </View>

          {/* Tags (only show after type selected) */}
          {selectedType && (
            <View style={[styles.section, styles.tagsSection]}>
              <Text style={styles.sectionLabel}>Quick tags (optional)</Text>
              <TagSelector
                tags={QUICK_TAGS}
                selectedTags={selectedTags}
                onToggle={handleTagToggle}
              />
            </View>
          )}
        </ScrollView>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={selectedType ? '✓ Save Log' : 'Select a type'}
            onPress={handleSave}
            disabled={!selectedType}
            loading={isSaving}
            variant={selectedType ? 'success' : 'secondary'}
          />
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerSpacer: {
    width: 44,
  },
  closeButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  tagsSection: {
    marginTop: 8,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 10,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successEmoji: {
    fontSize: 80,
  },
  successText: {
    color: COLORS.healthy,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    letterSpacing: -0.5,
  },
});
