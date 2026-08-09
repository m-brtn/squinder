import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  GearIcon,
  HouseIcon,
  SparkleIcon,
} from 'phosphor-react-native';
import { useIntl } from 'react-intl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { nativeThemeColors, useTheme } from '../theme/ThemeProvider';

const tabConfig = {
  Home: {
    icon: HouseIcon,
    labelMessageId: 'navigation.home',
  },
  Swiper: {
    icon: SparkleIcon,
    labelMessageId: 'navigation.swiper',
  },
  ThemeSettings: {
    icon: GearIcon,
    labelMessageId: 'navigation.appearance',
  },
} as const;

export function BottomNavBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { formatMessage } = useIntl();
  const { bottom } = useSafeAreaInsets();
  const { mode } = useTheme();
  const colors = nativeThemeColors[mode];

  return (
    <Box
      className="bg-background"
      style={{ paddingBottom: bottom }}
    >
      <HStack className="min-h-14 items-stretch">
        {state.routes.map((route, index) => {
          const config = tabConfig[route.name as keyof typeof tabConfig];
          const isFocused = state.index === index;
          const TabIcon = config.icon;
          const label = formatMessage({ id: config.labelMessageId });
          const colorClassName = isFocused
            ? 'text-primary'
            : 'text-muted-foreground';

          const handlePress = () => {
            const event = navigation.emit({
              canPreventDefault: true,
              target: route.key,
              type: 'tabPress',
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const handleLongPress = () => {
            navigation.emit({
              target: route.key,
              type: 'tabLongPress',
            });
          };

          return (
            <Pressable
              accessibilityLabel={
                descriptors[route.key].options.tabBarAccessibilityLabel ??
                label
              }
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              className="flex-1 items-center justify-center px-2 py-1.5"
              key={route.key}
              onLongPress={handleLongPress}
              onPress={handlePress}
              style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}
            >
              <VStack space="xs" className="items-center">
                <TabIcon
                  color={isFocused ? colors.primary : colors.mutedForeground}
                  size={26}
                  weight="fill"
                />
                <Text
                  className={colorClassName}
                  numberOfLines={1}
                  size="2xs"
                >
                  {label}
                </Text>
              </VStack>
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
}
