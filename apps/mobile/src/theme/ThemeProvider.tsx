import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform, useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  isDark: boolean;
  mode: ThemeMode;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = 'squinder.theme';
const SYSTEM_BACKGROUND = {
  dark: '#0b1020',
  light: '#f7f7fb',
} as const;
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemeMode | null>(null);
  const mode: ThemeMode =
    preference ?? (systemScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    void AsyncStorage.getItem(THEME_STORAGE_KEY).then((storedMode) => {
      if (storedMode === 'light' || storedMode === 'dark') {
        setPreference(storedMode);
      }
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      void SystemUI.setBackgroundColorAsync(SYSTEM_BACKGROUND[mode]);
    }
  }, [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      isDark: mode === 'dark',
      mode,
      toggleTheme: () => {
        const nextMode = mode === 'dark' ? 'light' : 'dark';
        setPreference(nextMode);
        void AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
      },
    }),
    [mode],
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
