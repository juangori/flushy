import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeId, ThemeColors, THEMES, DEFAULT_THEME_ID } from '../constants/themes';
import { STORAGE_KEYS } from '../constants';

interface ThemeContextType {
  themeId: ThemeId;
  colors: ThemeColors;
  setTheme: (themeId: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme && THEMES[savedTheme as ThemeId]) {
          setThemeId(savedTheme as ThemeId);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newThemeId: ThemeId) => {
    setThemeId(newThemeId);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, newThemeId);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = THEMES[themeId].colors;

  // Don't render until theme is loaded to avoid flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ themeId, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
