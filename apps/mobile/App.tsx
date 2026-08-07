import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createUser,
  getCurrentUser,
  type User,
} from './src/api/client';
import { I18nProvider } from './src/i18n/I18nProvider';
import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SwiperScreen } from './src/screens/SwiperScreen';
import {
  clearSessionToken,
  getSessionToken,
  saveSessionToken,
} from './src/storage/session';
import {
  ThemeProvider,
  useTheme,
} from './src/theme/ThemeProvider';

type RootStackParamList = {
  Home: undefined;
  Swiper: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </I18nProvider>
  );
}

function ThemedApp() {
  const { mode } = useTheme();

  return (
    <GluestackUIProvider mode={mode}>
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

  const handleComplete = async (
    input: Pick<User, 'name' | 'gender' | 'birthDate'>,
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
    <SafeAreaView className="bg-background" style={{ flex: 1 }}>
      {content}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </SafeAreaView>
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
      <Stack.Navigator
        screenOptions={{
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home">
          {({ navigation }) => (
            <HomeScreen
              user={user}
              onOpenSwiper={() => navigation.navigate('Swiper')}
              onResetSession={onResetSession}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Swiper">
          {({ navigation }) => (
            <SwiperScreen onBack={() => navigation.goBack()} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
