import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getHealth,
  type Health,
  type User,
  WS_URL,
  API_URL,
} from '../api/client';

type SocketStatus = 'connecting' | 'connected' | 'disconnected';

type Props = {
  user: User;
  onResetSession: () => Promise<void>;
};

export function HomeScreen({ user, onResetSession }: Props) {
  const { formatMessage, formatTime } = useIntl();
  const [health, setHealth] = useState<Health | null>(null);
  const [healthError, setHealthError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socketStatus, setSocketStatus] =
    useState<SocketStatus>('connecting');
  const [lastPing, setLastPing] = useState<Date | null>(null);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    setHealthError(false);
    try {
      setHealth(await getHealth());
    } catch (error) {
      setHealth(null);
      setHealthError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHealth();
  }, [loadHealth]);

  useEffect(() => {
    let stopped = false;
    let socket: WebSocket | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      setSocketStatus('connecting');
      socket = new WebSocket(WS_URL);
      socket.onopen = () => setSocketStatus('connected');
      socket.onmessage = ({ data }) => {
        try {
          const message = JSON.parse(String(data)) as {
            type?: string;
            timestamp?: string;
          };
          if (message.type === 'ping' && message.timestamp) {
            setLastPing(new Date(message.timestamp));
          }
        } catch {
          // Ignore non-JSON service messages.
        }
      };
      socket.onerror = () => setSocketStatus('disconnected');
      socket.onclose = () => {
        setSocketStatus('disconnected');
        if (!stopped) reconnectTimer = setTimeout(connect, 3_000);
      };
    };

    connect();
    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>
        {formatMessage({ id: 'common.brand' })}
      </Text>
      <Text style={styles.title}>
        {formatMessage({ id: 'home.greeting' }, { name: user.name })}
      </Text>
      <Text style={styles.subtitle}>
        {formatMessage({ id: 'home.profileCreated' })}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          {formatMessage({ id: 'home.apiLabel' })}
        </Text>
        {loading ? (
          <ActivityIndicator color="#7c3aed" />
        ) : health ? (
          <>
            <Text style={styles.value}>
              {formatMessage({ id: 'home.apiOnline' })}
            </Text>
            <Text style={styles.detail}>
              {formatMessage(
                { id: 'home.apiVersion' },
                { version: health.version },
              )}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.value, styles.error]}>
              {formatMessage({ id: 'errors.apiUnavailableTitle' })}
            </Text>
            {healthError && (
              <Text style={styles.detail}>
                {formatMessage({ id: 'errors.apiUnavailable' })}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              style={styles.retryButton}
              onPress={loadHealth}
            >
              <Text style={styles.buttonText}>
                {formatMessage({ id: 'actions.retry' })}
              </Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          {formatMessage({ id: 'home.socketLabel' })}
        </Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              socketStatus === 'connected'
                ? styles.dotOnline
                : styles.dotOffline,
            ]}
          />
          <Text style={styles.value}>
            {formatMessage({
              id:
                socketStatus === 'connected'
                  ? 'home.socketConnected'
                  : socketStatus === 'connecting'
                    ? 'home.socketConnecting'
                    : 'home.socketDisconnected',
            })}
          </Text>
        </View>
        <Text style={styles.detail}>
          {lastPing
            ? formatMessage(
                { id: 'home.lastPing' },
                { time: formatTime(lastPing) },
              )
            : formatMessage({ id: 'home.waitingForPing' })}
        </Text>
      </View>

      <Text style={styles.endpoint}>{API_URL}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => void onResetSession()}
      >
        <Text style={styles.reset}>
          {formatMessage({ id: 'actions.resetDevSession' })}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
    maxWidth: 560,
    padding: 24,
    width: '100%',
    gap: 16,
  },
  eyebrow: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
  },
  title: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: '700',
  },
  subtitle: {
    color: '#a9b5cb',
    fontSize: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#151c31',
    borderColor: '#26314f',
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    padding: 22,
  },
  label: {
    color: '#8b9bb8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  value: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detail: {
    color: '#a9b5cb',
    fontSize: 15,
  },
  error: {
    color: '#fb7185',
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  dotOnline: {
    backgroundColor: '#34d399',
  },
  dotOffline: {
    backgroundColor: '#f59e0b',
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  endpoint: {
    color: '#66738d',
    fontSize: 12,
    textAlign: 'center',
  },
  reset: {
    color: '#8b9bb8',
    fontSize: 13,
    padding: 10,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
