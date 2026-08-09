import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform, useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'system' | ThemeMode;

type ThemeContextValue = {
  isDark: boolean;
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const THEME_STORAGE_KEY = 'squinder.theme';
export const nativeThemeColors = {
  dark: {
    background: '#0b1020',
    mutedForeground: '#a9b5cb',
    primary: '#7c3aed',
  },
  light: {
    background: '#f7f7fb',
    mutedForeground: '#5f687b',
    primary: '#6d28d9',
  },
} as const;
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] =
    useState<ThemePreference>('system');
  const mode: ThemeMode =
    preference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  useEffect(() => {
    void AsyncStorage.getItem(THEME_STORAGE_KEY).then((storedMode) => {
      if (
        storedMode === 'system' ||
        storedMode === 'light' ||
        storedMode === 'dark'
      ) {
        setPreferenceState(storedMode);
      }
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      void SystemUI.setBackgroundColorAsync(nativeThemeColors[mode].background);
    }
  }, [mode]);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, nextPreference);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      isDark: mode === 'dark',
      mode,
      preference,
      setPreference,
    }),
    [mode, preference, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return theme;
}
