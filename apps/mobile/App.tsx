import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  createUser,
  getCurrentUser,
  type User,
} from './src/api/client';
import { BottomNavBar } from './src/components/BottomNavBar';
import { ScreenFrame } from './src/components/ScreenFrame';
import { preloadSwiperImages } from './src/constants/swiperProfiles';
import { I18nProvider } from './src/i18n/I18nProvider';
import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SwiperScreen } from './src/screens/SwiperScreen';
import { ThemeSettingsScreen } from './src/screens/ThemeSettingsScreen';
import {
  clearSessionToken,
  getSessionToken,
  saveSessionToken,
} from './src/storage/session';
import {
  ThemeProvider,
  useTheme,
} from './src/theme/ThemeProvider';

type RootTabParamList = {
  Home: undefined;
  Swiper: undefined;
  ThemeSettings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nProvider>
          <ThemeProvider>
            <ThemedApp />
          </ThemeProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedApp() {
  const { preference } = useTheme();

  return (
    <GluestackUIProvider mode={preference}>
      <AppContent />
    </GluestackUIProvider>
  );
}

function AppContent() {
  const { formatMessage } = useIntl();
  const { isDark } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const restoreSession = useCallback(async () => {
    setRestoring(true);
    setRestoreError(false);

    try {
      const token = await getSessionToken();
      if (!token) {
        setUser(null);
        return;
      }

      const result = await getCurrentUser(token);
      setUser(result.user);
    } catch (error) {
      if (error instanceof Error && error.message === 'HTTP 401') {
        await clearSessionToken();
        setUser(null);
      } else {
        setRestoreError(true);
      }
    } finally {
      setRestoring(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (user) {
      void preloadSwiperImages();
    }
  }, [user]);

  const handleComplete = async (
    input: Pick<User, 'name' | 'gender' | 'lookingFor' | 'birthDate'>,
  ) => {
    setSubmitting(true);
    setSubmitError(false);
    try {
      const result = await createUser(input);
      await saveSessionToken(result.sessionToken);
      setUser(result.user);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSession = async () => {
    await clearSessionToken();
    setUser(null);
  };

  const content = (() => {
    if (restoring) {
      return (
        <Center className="flex-1 p-6">
          <VStack space="lg" className="items-center">
            <Spinner className="text-primary" size="large" />
            <Text className="text-center text-muted-foreground">
              {formatMessage({ id: 'session.restoring' })}
            </Text>
          </VStack>
        </Center>
      );
    }

    if (restoreError) {
      return (
        <Center className="flex-1 p-6">
          <VStack space="lg" className="items-center">
            <Text bold className="text-center text-foreground" size="xl">
              {formatMessage({ id: 'errors.apiUnavailableTitle' })}
            </Text>
            <Text className="text-center text-muted-foreground">
              {formatMessage({ id: 'errors.apiUnavailable' })}
            </Text>
            <Button onPress={() => void restoreSession()} size="lg">
              <ButtonText>
                {formatMessage({ id: 'actions.retry' })}
              </ButtonText>
            </Button>
          </VStack>
        </Center>
      );
    }

    if (user) {
      return (
        <AuthenticatedNavigator
          user={user}
          onResetSession={handleResetSession}
        />
      );
    }

    return (
      <OnboardingScreen
        error={submitError}
        onComplete={handleComplete}
        submitting={submitting}
      />
    );
  })();

  return (
    <Box className="flex-1 bg-background">
      {!restoring && !restoreError && user ? (
        content
      ) : (
        <ScreenFrame>{content}</ScreenFrame>
      )}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </Box>
  );
}

function AuthenticatedNavigator({
  user,
  onResetSession,
}: {
  user: User;
  onResetSession: () => Promise<void>;
}) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <BottomNavBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home">
          {({ navigation }) => (
            <ScreenFrame edges={['top', 'left', 'right']}>
              <HomeScreen
                user={user}
                onOpenThemeSettings={() =>
                  navigation.navigate('ThemeSettings')
                }
                onOpenSwiper={() => navigation.navigate('Swiper')}
                onResetSession={onResetSession}
              />
            </ScreenFrame>
          )}
        </Tab.Screen>
        <Tab.Screen name="Swiper">
          {({ navigation }) => (
            <ScreenFrame edges={['top', 'left', 'right']}>
              <SwiperScreen
                onOpenMenu={() => navigation.navigate('ThemeSettings')}
              />
            </ScreenFrame>
          )}
        </Tab.Screen>
        <Tab.Screen name="ThemeSettings">
          {() => (
            <ScreenFrame edges={['top', 'left', 'right']}>
              <ThemeSettingsScreen />
            </ScreenFrame>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
