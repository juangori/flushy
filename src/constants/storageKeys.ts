// Centralized storage keys for AsyncStorage
// All keys used in the app are defined here for consistency

export const STORAGE_KEYS = {
  HISTORY: '@flushy_history',
  USER_PROFILE: '@flushy_user_profile',
  THEME: '@flushy_theme',
  WELLNESS_TIPS: '@flushy_wellness_tips',
  ONBOARDING: '@flushy_onboarding_done',
  APP_RATING: '@flushy_app_rating',
  WEEKLY_DIGEST: '@flushy_weekly_digest',
  ACHIEVEMENTS: '@flushy_achievements',
  LAST_BACKUP: '@flushy_last_backup',
  NOTIFICATION_SETTINGS: '@flushy_notification_settings',
} as const;

// Array of all keys for bulk operations (like reset)
export const ALL_STORAGE_KEYS = Object.values(STORAGE_KEYS);

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
