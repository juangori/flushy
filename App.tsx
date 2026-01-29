import React, { useState } from 'react';
import { StatusBar, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { House, CalendarDays, ChartBar } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HomeScreen, LogScreen, TimelineScreen, InsightsScreen } from './src/screens';
import { usePoopHistory } from './src/hooks/usePoopHistory';
import { COLORS } from './src/constants';
import { BristolType } from './src/types';

const Tab = createBottomTabNavigator();

// Home wrapper to handle navigation to Log screen
const HomeWrapper = ({ 
  history, 
  onLogPress, 
  navigation 
}: { 
  history: any; 
  onLogPress: () => void;
  navigation: any;
}) => {
  return (
    <HomeScreen 
      history={history} 
      onLogPress={onLogPress}
      onTimelinePress={() => navigation.navigate('Timeline')}
    />
  );
};

export default function App() {
  const { history, isLoading, addEntry, deleteEntry } = usePoopHistory();
  const [showLogScreen, setShowLogScreen] = useState(false);

  const handleSaveEntry = async (type: BristolType, tags: string[]): Promise<boolean> => {
    const success = await addEntry(type, tags);
    if (success) {
      setShowLogScreen(false);
    }
    return success;
  };

  // Loading state
  if (isLoading) {
    return (
      <LinearGradient
        colors={[COLORS.bgPrimary, COLORS.bgSecondary, COLORS.bgTertiary]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  // Log screen overlay
  if (showLogScreen) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <LogScreen 
          onSave={handleSaveEntry}
          onCancel={() => setShowLogScreen(false)}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: COLORS.primary,
            background: COLORS.bgTertiary,
            card: 'rgba(0,0,0,0.3)',
            text: COLORS.textPrimary,
            border: COLORS.border,
            notification: COLORS.primary,
          },
          fonts: {
            regular: { fontFamily: 'System', fontWeight: 'normal' as const },
            medium: { fontFamily: 'System', fontWeight: '500' as const },
            bold: { fontFamily: 'System', fontWeight: 'bold' as const },
            heavy: { fontFamily: 'System', fontWeight: '800' as const },
          },
        }}
      >
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarLabelStyle: styles.tabLabel,
          }}
        >
          <Tab.Screen
            name="Home"
            options={{
              tabBarIcon: ({ focused }) => (
                <House size={22} color={focused ? COLORS.primary : COLORS.textMuted} strokeWidth={focused ? 2.5 : 1.5} />
              ),
            }}
          >
            {({ navigation }) => (
              <HomeWrapper
                history={history}
                onLogPress={() => setShowLogScreen(true)}
                navigation={navigation}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Timeline"
            options={{
              tabBarIcon: ({ focused }) => (
                <CalendarDays size={22} color={focused ? COLORS.primary : COLORS.textMuted} strokeWidth={focused ? 2.5 : 1.5} />
              ),
            }}
          >
            {() => <TimelineScreen history={history} onDeleteEntry={deleteEntry} />}
          </Tab.Screen>

          <Tab.Screen
            name="Insights"
            options={{
              tabBarIcon: ({ focused }) => (
                <ChartBar size={22} color={focused ? COLORS.primary : COLORS.textMuted} strokeWidth={focused ? 2.5 : 1.5} />
              ),
            }}
          >
            {() => <InsightsScreen history={history} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 12,
  },
  tabBar: {
    backgroundColor: COLORS.bgTertiary,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    height: 85,
    paddingTop: 8,
    paddingBottom: 25,
    elevation: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
