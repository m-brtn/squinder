import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Health = {
  status: 'ok';
  version: string;
  timestamp: string;
};

type SocketStatus = 'connecting' | 'connected' | 'disconnected';

const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
const localHost =
  expoHost ?? (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ??
  `http://${localHost}:3001`;
const WS_URL = `${API_URL.replace(/^http/, 'ws')}/ws`;

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [socketStatus, setSocketStatus] =
    useState<SocketStatus>('connecting');
  const [lastPing, setLastPing] = useState<string | null>(null);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    setHealthError(null);

    try {
      const response = await fetch(`${API_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      setHealth((await response.json()) as Health);
    } catch (error) {
      setHealth(null);
      setHealthError(error instanceof Error ? error.message : 'Unknown error');
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
            setLastPing(new Date(message.timestamp).toLocaleTimeString());
          }
        } catch {
          // Ignore non-JSON service messages.
        }
      };
      socket.onerror = () => setSocketStatus('disconnected');
      socket.onclose = () => {
        setSocketStatus('disconnected');
        if (!stopped) {
          reconnectTimer = setTimeout(connect, 3_000);
        }
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>SQUINDER</Text>
        <Text style={styles.title}>Backend status</Text>

        <View style={styles.card}>
          <Text style={styles.label}>API</Text>
          {loading ? (
            <ActivityIndicator color="#7c3aed" />
          ) : health ? (
            <>
              <Text style={styles.value}>Online</Text>
              <Text style={styles.detail}>Version {health.version}</Text>
            </>
          ) : (
            <>
              <Text style={[styles.value, styles.error]}>Unavailable</Text>
              <Text style={styles.detail}>{healthError}</Text>
              <Pressable style={styles.button} onPress={loadHealth}>
                <Text style={styles.buttonText}>Retry</Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>WEBSOCKET</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                socketStatus === 'connected'
                  ? styles.dotOnline
                  : styles.dotOffline,
              ]}
            />
            <Text style={styles.value}>{socketStatus}</Text>
          </View>
          <Text style={styles.detail}>
            {lastPing ? `Last ping: ${lastPing}` : 'Waiting for first ping…'}
          </Text>
        </View>

        <Text style={styles.endpoint}>{API_URL}</Text>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b1020',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
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
  button: {
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
    marginTop: 4,
    textAlign: 'center',
  },
});
