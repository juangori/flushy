import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { STORAGE_KEYS } from '../constants';

// Keys to include in backup (user data only, not UI state)
const BACKUP_KEYS = [
  STORAGE_KEYS.HISTORY,
  STORAGE_KEYS.USER_PROFILE,
  STORAGE_KEYS.ACHIEVEMENTS,
  STORAGE_KEYS.THEME,
] as const;

interface BackupData {
  version: number;
  createdAt: string;
  appVersion: string;
  data: Record<string, string | null>;
}

const BACKUP_VERSION = 1;
const APP_VERSION = '1.0.0';

/**
 * Create a backup of all user data and share as JSON file
 */
export async function createBackup(): Promise<boolean> {
  try {
    // Gather all data
    const pairs = await AsyncStorage.multiGet([...BACKUP_KEYS]);
    const data: Record<string, string | null> = {};
    pairs.forEach(([key, value]) => {
      data[key] = value;
    });

    const backup: BackupData = {
      version: BACKUP_VERSION,
      createdAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      data,
    };

    // Write to temp file
    const fileName = `flushy-backup-${new Date().toISOString().split('T')[0]}.json`;
    const file = new File(Paths.cache, fileName);
    if (file.exists) {
      file.delete();
    }
    file.create();
    file.write(JSON.stringify(backup, null, 2));

    // Share the file
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return false;
    }

    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Save your Flushy backup',
    });

    // Record backup timestamp
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());

    return true;
  } catch (error) {
    console.error('Failed to create backup:', error);
    return false;
  }
}

/**
 * Restore data from a backup JSON file
 */
export async function restoreBackup(): Promise<{ success: boolean; message: string }> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return { success: false, message: 'No file selected.' };
    }

    const fileUri = result.assets[0].uri;
    const file = new File(fileUri);
    const content = await file.text();

    let backup: BackupData;
    try {
      backup = JSON.parse(content);
    } catch {
      return { success: false, message: 'Invalid backup file. The file is not valid JSON.' };
    }

    // Validate backup structure
    if (!backup.version || !backup.data || typeof backup.data !== 'object') {
      return { success: false, message: 'Invalid backup file. Missing required fields.' };
    }

    if (backup.version > BACKUP_VERSION) {
      return { success: false, message: 'This backup was created with a newer version of Flushy. Please update the app first.' };
    }

    // Restore each key
    const pairs: [string, string][] = [];
    for (const [key, value] of Object.entries(backup.data)) {
      if (value !== null) {
        pairs.push([key, value]);
      }
    }

    if (pairs.length === 0) {
      return { success: false, message: 'The backup file is empty.' };
    }

    await AsyncStorage.multiSet(pairs);

    return {
      success: true,
      message: `Restored ${pairs.length} items from backup (${backup.createdAt.split('T')[0]}).`,
    };
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return { success: false, message: 'Failed to restore backup. Please try again.' };
  }
}

/**
 * Check if user should be reminded to backup (monthly)
 */
export async function shouldShowBackupReminder(): Promise<boolean> {
  try {
    const lastBackup = await AsyncStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
    if (!lastBackup) {
      // Check if user has any data worth backing up
      const history = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!history) return false;
      const parsed = JSON.parse(history);
      // Only remind if they have at least 7 days of data
      return Array.isArray(parsed) && parsed.length >= 7;
    }

    const lastDate = new Date(lastBackup);
    const now = new Date();
    const diffMs = now.getTime() - lastDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Remind after 30 days
    return diffDays >= 30;
  } catch {
    return false;
  }
}

/**
 * Get the last backup date for display
 */
export async function getLastBackupDate(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
  } catch {
    return null;
  }
}
