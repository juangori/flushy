import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  DEFAULT_USER_PROFILE,
  AgeRange,
  BiologicalSex,
  HealthCondition,
  STORAGE_KEYS,
} from '../constants';

interface UserProfileContextType {
  profile: UserProfile;
  isLoading: boolean;
  hasCompletedProfile: boolean;
  updateAge: (age: AgeRange) => Promise<void>;
  updateSex: (sex: BiologicalSex) => Promise<void>;
  updateConditions: (conditions: HealthCondition[]) => Promise<void>;
  completeProfile: () => Promise<void>;
  skipProfile: () => Promise<void>;
  resetProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        if (saved) {
          const parsed = JSON.parse(saved);
          setProfile({ ...DEFAULT_USER_PROFILE, ...parsed });
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Save profile to storage
  const saveProfile = async (newProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  };

  const updateAge = async (age: AgeRange) => {
    const newProfile = { ...profile, ageRange: age };
    await saveProfile(newProfile);
  };

  const updateSex = async (sex: BiologicalSex) => {
    const newProfile = { ...profile, biologicalSex: sex };
    await saveProfile(newProfile);
  };

  const updateConditions = async (conditions: HealthCondition[]) => {
    const newProfile = { ...profile, conditions };
    await saveProfile(newProfile);
  };

  const completeProfile = async () => {
    const newProfile = {
      ...profile,
      profileCompletedAt: Date.now(),
      profileSkipped: false,
    };
    await saveProfile(newProfile);
  };

  const skipProfile = async () => {
    const newProfile = {
      ...profile,
      profileSkipped: true,
      profileCompletedAt: Date.now(),
    };
    await saveProfile(newProfile);
  };

  const resetProfile = async () => {
    await saveProfile(DEFAULT_USER_PROFILE);
  };

  const hasCompletedProfile = !!(profile.profileCompletedAt || profile.profileSkipped);

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        isLoading,
        hasCompletedProfile,
        updateAge,
        updateSex,
        updateConditions,
        completeProfile,
        skipProfile,
        resetProfile,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
