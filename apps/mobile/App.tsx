import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  createUser,
  getCurrentUser,
  type User,
} from './src/api/client';
import { I18nProvider } from './src/i18n/I18nProvider';
import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import {
  clearSessionToken,
  getSessionToken,
  saveSessionToken,
} from './src/storage/session';

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

function AppContent() {
  const { formatMessage } = useIntl();
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
        <View style={styles.center}>
          <ActivityIndicator color="#8b5cf6" size="large" />
          <Text style={styles.muted}>
            {formatMessage({ id: 'session.restoring' })}
          </Text>
        </View>
      );
    }

    if (restoreError) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>
            {formatMessage({ id: 'errors.apiUnavailableTitle' })}
          </Text>
          <Text style={styles.muted}>
            {formatMessage({ id: 'errors.apiUnavailable' })}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void restoreSession()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>
              {formatMessage({ id: 'actions.retry' })}
            </Text>
          </Pressable>
        </View>
      );
    }

    if (user) {
      return (
        <HomeScreen user={user} onResetSession={handleResetSession} />
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
    <SafeAreaView style={styles.safeArea}>
      {content}
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b1020',
  },
  center: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
  },
  muted: {
    color: '#a9b5cb',
    fontSize: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
