import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface ReminderSettings {
  enabled: boolean;
  hour: number; // 0-23
  minute: number; // 0-59
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  hour: 21,
  minute: 0,
};

const REMINDER_MESSAGES = [
  "How was your gut today? Take a moment to log.",
  "Don't forget to track today's bowel movement!",
  "Quick check-in: how's your digestion today?",
  "Time for your daily log. Keep your streak going!",
  "A minute to log now saves a trip to remember later.",
];

async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function scheduleDaily(hour: number, minute: number): Promise<void> {
  // Cancel existing reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Pick a random message
  const message = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Flushy Reminder',
      body: message,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function useReminders() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved settings
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
        if (saved) {
          setSettings(JSON.parse(saved));
        }
      } catch {
        // Use defaults
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveSettings = useCallback(async (newSettings: ReminderSettings) => {
    setSettings(newSettings);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(newSettings));

    if (newSettings.enabled) {
      const granted = await requestPermissions();
      if (granted) {
        await scheduleDaily(newSettings.hour, newSettings.minute);
      } else {
        // Permission denied, disable
        const disabled = { ...newSettings, enabled: false };
        setSettings(disabled);
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(disabled));
        return false;
      }
    } else {
      await cancelAll();
    }
    return true;
  }, []);

  const toggleEnabled = useCallback(async () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    return saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setTime = useCallback(async (hour: number, minute: number) => {
    const newSettings = { ...settings, hour, minute };
    return saveSettings(newSettings);
  }, [settings, saveSettings]);

  return {
    settings,
    isLoading,
    toggleEnabled,
    setTime,
    saveSettings,
  };
}
