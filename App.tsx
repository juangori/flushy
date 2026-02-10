import React, { useState, useEffect } from 'react';
import { StatusBar, Text, StyleSheet, ActivityIndicator, TextStyle } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { House, CalendarDays, ChartBar } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';

import { HomeScreen, LogScreen, TimelineScreen, InsightsScreen, OnboardingScreen, ProfileSetupScreen, AchievementsScreen } from './src/screens';
import { usePoopHistory } from './src/hooks/usePoopHistory';
import { useAppRating } from './src/hooks/useAppRating';
import { useWeeklyDigest } from './src/hooks/useWeeklyDigest';
import { useAchievements } from './src/hooks/useAchievements';
import { WeeklyDigest, AchievementToast, ErrorBoundary } from './src/components';
import { BristolType } from './src/types';
import { ThemeProvider, useTheme, UserProfileProvider, useUserProfile } from './src/context';
import { STORAGE_KEYS } from './src/constants';

const Tab = createMaterialTopTabNavigator();

// Main app content that uses theme
const AppContent: React.FC = () => {
  const { colors } = useTheme();
  const { profile, hasCompletedProfile, isLoading: profileLoading, resetProfile } = useUserProfile();
  const { history, isLoading, addEntry, deleteEntry, clearAllData } = usePoopHistory();
  const { incrementEntryCount, checkAndRequestRating, resetRatingData } = useAppRating();
  const { showDigest, digestData, dismissDigest, resetDigestState, viewDigest } = useWeeklyDigest(history);
  const [showLogScreen, setShowLogScreen] = useState(false);
  const [logForDate, setLogForDate] = useState<string | null>(null); // For past date logging
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showAchievementsScreen, setShowAchievementsScreen] = useState(false);

  // Achievements
  const {
    newlyUnlocked,
    dismissNewlyUnlocked,
    hasNewAchievements,
    resetAchievements,
    trackInsightsView,
    getWeeklyUnlocks,
  } = useAchievements(history);

  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING);
        setShowOnboarding(value !== 'true');
      } catch (error) {
        console.error('Failed to load onboarding state:', error);
        setShowOnboarding(true); // Default to showing onboarding on error
      }
    };
    loadOnboardingState();
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
    // Show profile setup after onboarding if not completed
    if (!hasCompletedProfile) {
      setShowProfileSetup(true);
    }
    setShowOnboarding(false);
  };

  const handleProfileComplete = () => {
    setShowProfileSetup(false);
  };

  const handleProfileSkip = () => {
    setShowProfileSetup(false);
  };

  const handleResetApp = async () => {
    // Reset in-memory state
    await clearAllData();
    await resetProfile();
    await resetRatingData();
    await resetDigestState();
    await resetAchievements();
    // Show onboarding again
    setShowOnboarding(true);
  };

  const handleSaveEntry = async (type: BristolType, tags: string[], color: string, time?: string): Promise<boolean> => {
    const success = await addEntry(type, tags, undefined, color, logForDate || undefined, time);
    if (success) {
      setShowLogScreen(false);
      setLogForDate(null);
      // Track entry for rating prompt
      await incrementEntryCount();
      // Check if we should show rating prompt (after a delay to not interrupt)
      setTimeout(() => {
        checkAndRequestRating();
      }, 2000);
    }
    return success;
  };

  const handleAddLogForDate = (date: string) => {
    setLogForDate(date);
    setShowLogScreen(true);
  };

  const isLightTheme = colors.bgPrimary === '#FFFFFF' || colors.bgPrimary === '#FDF2F8';

  // Loading state
  if (isLoading || profileLoading || showOnboarding === null) {
    return (
      <LinearGradient
        colors={[colors.bgPrimary, colors.bgSecondary, colors.bgTertiary]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading...</Text>
      </LinearGradient>
    );
  }

  // Onboarding
  if (showOnboarding) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isLightTheme ? 'dark-content' : 'light-content'} />
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </SafeAreaProvider>
    );
  }

  // Profile setup (after onboarding)
  if (showProfileSetup) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isLightTheme ? 'dark-content' : 'light-content'} />
        <ProfileSetupScreen
          onComplete={handleProfileComplete}
          onSkip={handleProfileSkip}
        />
      </SafeAreaProvider>
    );
  }

  // Log screen overlay
  if (showLogScreen) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isLightTheme ? 'dark-content' : 'light-content'} />
        <LogScreen
          onSave={handleSaveEntry}
          onCancel={() => {
            setShowLogScreen(false);
            setLogForDate(null);
          }}
          forDate={logForDate || undefined}
        />
      </SafeAreaProvider>
    );
  }

  // Achievements screen overlay
  if (showAchievementsScreen) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle={isLightTheme ? 'dark-content' : 'light-content'} />
        <AchievementsScreen
          history={history}
          onBack={() => setShowAchievementsScreen(false)}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle={isLightTheme ? 'dark-content' : 'light-content'} />
        <NavigationContainer
          theme={{
            dark: !isLightTheme,
            colors: {
              primary: colors.primary,
              background: colors.bgTertiary,
              card: 'rgba(0,0,0,0.3)',
              text: colors.textPrimary,
              border: colors.border,
              notification: colors.primary,
            },
            fonts: {
              regular: { fontFamily: 'Outfit_400Regular', fontWeight: 'normal' as const },
              medium: { fontFamily: 'Outfit_500Medium', fontWeight: '500' as const },
              bold: { fontFamily: 'Outfit_700Bold', fontWeight: 'bold' as const },
              heavy: { fontFamily: 'Outfit_700Bold', fontWeight: '800' as const },
            },
          }}
        >
          <Tab.Navigator
            tabBarPosition="bottom"
            screenOptions={{
              swipeEnabled: true,
              animationEnabled: true,
              tabBarStyle: [styles.tabBar, { backgroundColor: colors.bgTertiary, borderTopColor: colors.border }],
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.textMuted,
              tabBarLabelStyle: styles.tabLabel,
              tabBarIndicatorStyle: [styles.tabIndicator, { backgroundColor: colors.primary }],
              tabBarPressColor: 'transparent',
              tabBarItemStyle: styles.tabItem,
            }}
          >
            <Tab.Screen
              name="Home"
              options={{
                tabBarIcon: ({ focused }) => (
                  <House size={22} color={focused ? colors.primary : colors.textMuted} strokeWidth={focused ? 2.5 : 1.5} />
                ),
              }}
            >
              {({ navigation }) => (
                <HomeScreen
                  history={history}
                  onLogPress={() => setShowLogScreen(true)}
                  onTimelinePress={() => navigation.navigate('Timeline')}
                  onResetApp={handleResetApp}
                  onViewDigest={viewDigest}
                  onAchievementsPress={() => setShowAchievementsScreen(true)}
                  hasNewAchievements={hasNewAchievements}
                />
              )}
            </Tab.Screen>

            <Tab.Screen
              name="Timeline"
              options={{
                tabBarIcon: ({ focused }) => (
                  <CalendarDays size={22} color={focused ? colors.primary : colors.textMuted} strokeWidth={focused ? 2.5 : 1.5} />
                ),
              }}
            >
              {() => <TimelineScreen history={history} onDeleteEntry={deleteEntry} onAddLogForDate={handleAddLogForDate} />}
            </Tab.Screen>

            <Tab.Screen
              name="Insights"
              options={{
                tabBarIcon: ({ focused }) => (
                  <ChartBar size={22} color={focused ? colors.primary : colors.textMuted} strokeWidth={focused ? 2.5 : 1.5} />
                ),
              }}
            >
              {() => <InsightsScreen history={history} onTrackView={trackInsightsView} />}
            </Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>

        {/* Weekly Digest Modal */}
        <WeeklyDigest
          visible={showDigest}
          data={digestData}
          onDismiss={dismissDigest}
          weeklyAchievements={getWeeklyUnlocks()}
        />

        {/* Achievement Toast */}
        {newlyUnlocked && (
          <AchievementToast
            achievement={newlyUnlocked}
            onDismiss={dismissNewlyUnlocked}
            onPress={() => {
              dismissNewlyUnlocked();
              setShowAchievementsScreen(true);
            }}
          />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

// Set default font for all Text components
interface TextWithDefaultProps extends React.ComponentClass<Text['props']> {
  defaultProps?: { style?: TextStyle };
}
(Text as TextWithDefaultProps).defaultProps = {
  ...(Text as TextWithDefaultProps).defaultProps,
  style: { fontFamily: 'Outfit_400Regular' },
};

// Root app with ThemeProvider
export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Expo handles splash screen until fonts load
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProfileProvider>
          <AppContent />
        </UserProfileProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
    fontFamily: 'Outfit_400Regular',
  },
  tabBar: {
    borderTopWidth: 1,
    height: 85,
    paddingTop: 6,
    paddingBottom: 25,
    elevation: 0,
  },
  tabItem: {
    paddingTop: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Outfit_500Medium',
    textTransform: 'none',
    marginTop: 2,
  },
  tabIndicator: {
    height: 2,
    top: 0,
  },
});
