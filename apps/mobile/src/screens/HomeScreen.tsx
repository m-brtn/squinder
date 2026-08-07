import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { ChevronRightIcon, Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import {
  API_URL,
  getHealth,
  type Health,
  type User,
  WS_URL,
} from '../api/client';
import { ThemeToggle } from '../components/ThemeToggle';

type SocketStatus = 'connecting' | 'connected' | 'disconnected';

type Props = {
  user: User;
  onOpenSwiper: () => void;
  onResetSession: () => Promise<void>;
};

export function HomeScreen({ user, onOpenSwiper, onResetSession }: Props) {
  const { formatMessage, formatTime } = useIntl();
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [socketStatus, setSocketStatus] =
    useState<SocketStatus>('connecting');
  const [lastPing, setLastPing] = useState<Date | null>(null);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    try {
      setHealth(await getHealth());
    } catch {
      setHealth(null);
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
    <VStack
      space="lg"
      className="w-full max-w-xl flex-1 self-center justify-center bg-background p-6"
    >
      <HStack className="items-center justify-between">
        <Text
          bold
          className="tracking-widest text-primary"
          size="xs"
        >
          {formatMessage({ id: 'common.brand' })}
        </Text>
        <ThemeToggle />
      </HStack>
      <Text bold className="text-foreground" size="3xl">
        {formatMessage({ id: 'home.greeting' }, { name: user.name })}
      </Text>
      <Text className="text-muted-foreground" size="md">
        {formatMessage({ id: 'home.profileCreated' })}
      </Text>

      <VStack space="sm">
        <Text
          bold
          className="tracking-wider text-muted-foreground"
          size="2xs"
        >
          {formatMessage({ id: 'home.developmentStatus' })}
        </Text>
        <Box className="overflow-hidden rounded-2xl border border-border bg-card">
          <HStack space="sm" className="min-h-12 items-center px-4">
            <Box
              className={`h-2 w-2 rounded-full ${
                health ? 'bg-success' : 'bg-warning'
              }`}
            />
            <Text bold className="text-card-foreground" size="xs">
              {formatMessage({ id: 'home.apiLabel' })}
            </Text>
            <Box className="ml-auto shrink">
              {loading ? (
                <Spinner className="text-primary" size="small" />
              ) : health ? (
                <Text className="text-muted-foreground" size="xs">
                  {formatMessage(
                    { id: 'home.apiVersion' },
                    { version: health.version },
                  )}
                </Text>
              ) : (
                <Button onPress={loadHealth} size="sm" variant="link">
                  <ButtonText>
                    {formatMessage({ id: 'actions.retry' })}
                  </ButtonText>
                </Button>
              )}
            </Box>
          </HStack>
          <Divider className="ml-9" />
          <HStack space="sm" className="min-h-12 items-center px-4">
            <Box
              className={`h-2 w-2 rounded-full ${
                socketStatus === 'connected' ? 'bg-success' : 'bg-warning'
              }`}
            />
            <Text bold className="text-card-foreground" size="xs">
              {formatMessage({ id: 'home.socketLabel' })}
            </Text>
            <Text
              className="ml-auto shrink text-right text-muted-foreground"
              size="xs"
            >
              {lastPing
                ? formatMessage(
                    { id: 'home.lastPing' },
                    { time: formatTime(lastPing) },
                  )
                : formatMessage({ id: 'home.waitingForPing' })}
            </Text>
          </HStack>
        </Box>
      </VStack>

      <VStack space="sm">
        <Text
          bold
          className="tracking-wider text-muted-foreground"
          size="2xs"
        >
          {formatMessage({ id: 'home.screens' })}
        </Text>
        <Pressable
          accessibilityLabel={formatMessage(
            { id: 'screens.open' },
            { screen: formatMessage({ id: 'screens.swiper.title' }) },
          )}
          onPress={onOpenSwiper}
          className="min-h-14 flex-row items-center rounded-2xl border border-border bg-card px-4 data-[hover=true]:border-primary data-[hover=true]:bg-accent data-[active=true]:border-primary data-[active=true]:bg-accent"
        >
          <Text
            bold
            className="flex-1 text-card-foreground"
            size="md"
          >
            {formatMessage({ id: 'screens.swiper.title' })}
          </Text>
          <Icon
            as={ChevronRightIcon}
            className="text-muted-foreground"
            size="md"
          />
        </Pressable>
      </VStack>

      <Text className="text-center text-muted-foreground" size="xs">
        {API_URL}
      </Text>
      <Button
        onPress={() => void onResetSession()}
        size="sm"
        variant="link"
      >
        <ButtonText>
          {formatMessage({ id: 'actions.resetDevSession' })}
        </ButtonText>
      </Button>
    </VStack>
  );
}
