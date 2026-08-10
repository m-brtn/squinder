import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  ArrowCounterClockwiseIcon,
  ListIcon,
} from 'phosphor-react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { useIntl } from 'react-intl';
import {
  ImageBackground,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import {
  CloseIcon,
  FavouriteIcon,
  InfoIcon,
  MessageCircleIcon,
  StarIcon,
  Icon,
} from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { createPhosphorIcon } from '../components/PhosphorIcon';
import { swiperProfiles } from '../constants/swiperProfiles';
import { nativeThemeColors, useTheme } from '../theme/ThemeProvider';

type Props = {
  onOpenMenu: () => void;
};

type SwipeDirection = 'left' | 'right' | 'up';

const AnimatedBox = Animated.createAnimatedComponent(Box);
const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);
const SWIPE_THRESHOLD = 100;
const IMAGE_FADE_DURATION = 400;
const VERTICAL_DRAG_FACTOR = 0.18;
// Native gradients cannot consume NativeWind's semantic scrim token directly.
const PROFILE_SCRIM_GRADIENT = [
  'rgba(0, 0, 0, 0)',
  'rgba(0, 0, 0, 0.38)',
  'rgba(0, 0, 0, 0.9)',
] as const;
const LIQUID_GLASS_AVAILABLE = isLiquidGlassAvailable();
const UndoBoldIcon = createPhosphorIcon(
  ArrowCounterClockwiseIcon,
  'bold',
  28,
);
const MenuBoldIcon = createPhosphorIcon(ListIcon, 'bold', 28);

export function SwiperScreen({ onOpenMenu }: Props) {
  const { formatMessage } = useIntl();
  const { mode } = useTheme();
  const colors = nativeThemeColors[mode];
  const { width } = useWindowDimensions();
  const [profileIndex, setProfileIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const profile = swiperProfiles[profileIndex % swiperProfiles.length];
  const nextProfile =
    swiperProfiles[(profileIndex + 1) % swiperProfiles.length];

  useLayoutEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [profileIndex, translateX, translateY]);

  const advanceProfile = useCallback(() => {
    setProfileIndex((current) => current + 1);
  }, []);

  const undoLastSwipe = useCallback(() => {
    setProfileIndex((current) => Math.max(0, current - 1));
  }, []);

  const animateSwipe = useCallback(
    (direction: SwipeDirection) => {
      const destination =
        direction === 'left'
          ? -width * 1.4
          : direction === 'right'
            ? width * 1.4
            : -700;

      if (direction === 'up') {
        translateY.value = withTiming(destination, { duration: 240 }, (done) => {
          if (done) {
            runOnJS(advanceProfile)();
          }
        });
        return;
      }

      translateX.value = withTiming(destination, { duration: 240 }, (done) => {
        if (done) {
          runOnJS(advanceProfile)();
        }
      });
    },
    [advanceProfile, translateX, translateY, width],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((event) => {
          translateX.value = event.translationX;
          translateY.value = event.translationY * VERTICAL_DRAG_FACTOR;
        })
        .onEnd((event) => {
          const projectedX = event.translationX + event.velocityX * 0.12;
          const projectedY = event.translationY + event.velocityY * 0.12;

          if (
            projectedY <= -SWIPE_THRESHOLD &&
            Math.abs(projectedY) > Math.abs(projectedX)
          ) {
            translateY.value = withTiming(-700, { duration: 240 }, (done) => {
              if (done) {
                runOnJS(advanceProfile)();
              }
            });
            return;
          }

          if (Math.abs(projectedX) >= SWIPE_THRESHOLD) {
            const destination =
              projectedX > 0 ? width * 1.4 : -width * 1.4;
            translateX.value = withTiming(
              destination,
              { duration: 240 },
              (done) => {
                if (done) {
                  runOnJS(advanceProfile)();
                }
              },
            );
            return;
          }

          translateX.value = withSpring(0, { damping: 18, stiffness: 190 });
          translateY.value = withSpring(0, { damping: 18, stiffness: 190 });
        }),
    [advanceProfile, translateX, translateY, width],
  );

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width, 0, width],
      [-14, 0, 14],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return (
    <Box className="w-full max-w-3xl flex-1 self-center bg-background px-2 pb-2 pt-2">
      <HStack space="sm" className="items-center px-1">
        <Text
          bold
          className="flex-1 text-foreground"
          numberOfLines={1}
          size="3xl"
        >
          {formatMessage({ id: 'screens.swiper.title' })}
        </Text>
        <Button
          accessibilityLabel={formatMessage({ id: 'swiper.actions.undo' })}
          isDisabled={profileIndex === 0}
          onPress={undoLastSwipe}
          size="icon"
          variant="ghost"
        >
          <ButtonIcon as={UndoBoldIcon} className="h-7 w-7" />
        </Button>
        <Button
          accessibilityLabel={formatMessage({ id: 'swiper.actions.menu' })}
          onPress={onOpenMenu}
          size="icon"
          variant="ghost"
        >
          <ButtonIcon as={MenuBoldIcon} className="h-7 w-7" />
        </Button>
      </HStack>

      <Box className="relative mt-3 min-h-96 flex-1">
        <GestureDetector gesture={panGesture}>
          <Box className="absolute inset-0">
            {[nextProfile, profile].map((visibleProfile, index) => {
              const isActive = index === 1;

              return (
                <AnimatedBox
                  key={visibleProfile.id}
                  className="absolute inset-0 overflow-hidden rounded-3xl bg-card shadow-hard-4"
                  style={isActive ? cardStyle : undefined}
                >
                  <ProfileCard
                    age={visibleProfile.age}
                    bio={formatMessage({ id: visibleProfile.bioMessageId })}
                    distance={visibleProfile.distance}
                    imageUrl={visibleProfile.imageUrl}
                    name={formatMessage({ id: visibleProfile.nameMessageId })}
                  />
                </AnimatedBox>
              );
            })}
          </Box>
        </GestureDetector>

        <HStack
          space="lg"
          className="absolute inset-x-0 bottom-5 z-10 items-center justify-center"
        >
          <GlassView
            colorScheme={mode}
            glassEffectStyle="clear"
            isInteractive
            style={styles.largeGlassButton}
            tintColor={colors.glassDestructive}
          >
            <Button
              accessibilityLabel={formatMessage({
                id: 'swiper.actions.pass',
              })}
              className={`h-full w-full rounded-full border-0 ${
                LIQUID_GLASS_AVAILABLE ? 'bg-transparent' : 'bg-destructive'
              }`}
              onPress={() => animateSwipe('left')}
              size="icon"
              variant="ghost"
            >
              <ButtonIcon
                as={CloseIcon}
                className="h-8 w-8 text-foreground"
              />
            </Button>
          </GlassView>
          <GlassView
            colorScheme={mode}
            glassEffectStyle="clear"
            isInteractive
            style={styles.mediumGlassButton}
          >
            <Button
              accessibilityLabel={formatMessage({
                id: 'swiper.actions.superLike',
              })}
              className={`h-full w-full rounded-full border-0 ${
                LIQUID_GLASS_AVAILABLE
                  ? 'bg-transparent'
                  : 'bg-background/80'
              }`}
              onPress={() => animateSwipe('up')}
              size="icon"
              variant="ghost"
            >
              <ButtonIcon as={StarIcon} className="h-7 w-7 text-foreground" />
            </Button>
          </GlassView>
          <GlassView
            colorScheme={mode}
            glassEffectStyle="clear"
            isInteractive
            style={styles.largeGlassButton}
            tintColor={colors.glassSuccess}
          >
            <Button
              accessibilityLabel={formatMessage({
                id: 'swiper.actions.like',
              })}
              className={`h-full w-full rounded-full border-0 ${
                LIQUID_GLASS_AVAILABLE ? 'bg-transparent' : 'bg-success'
              }`}
              onPress={() => animateSwipe('right')}
              size="icon"
              variant="ghost"
            >
              <ButtonIcon
                as={FavouriteIcon}
                className="h-8 w-8 text-foreground"
              />
            </Button>
          </GlassView>
        </HStack>
      </Box>
    </Box>
  );
}

type ProfileCardProps = {
  readonly age: number;
  readonly bio: string;
  readonly distance: number;
  readonly imageUrl: string;
  readonly name: string;
};

function ProfileCard({
  age,
  bio,
  distance,
  imageUrl,
  name,
}: ProfileCardProps) {
  const { formatMessage } = useIntl();
  const imageOpacity = useSharedValue(0);
  const imageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  const revealImage = useCallback(() => {
    imageOpacity.value = withTiming(1, { duration: IMAGE_FADE_DURATION });
  }, [imageOpacity]);

  return (
    <Box className="absolute inset-0 overflow-hidden rounded-3xl bg-card">
      <AnimatedImageBackground
        accessibilityLabel={formatMessage(
          { id: 'swiper.profilePhoto' },
          { name },
        )}
        onLoad={revealImage}
        resizeMode="cover"
        source={{ uri: imageUrl }}
        style={[{ flex: 1, justifyContent: 'flex-end' }, imageStyle]}
      >
        <LinearGradient
          colors={PROFILE_SCRIM_GRADIENT}
          locations={[0.42, 0.68, 1]}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        />
        <Box className="px-5 pb-24 pt-6">
          <VStack space="sm">
            <Box className="self-start rounded-full bg-primary px-3 py-1">
              <Text bold className="text-primary-foreground" size="xs">
                {formatMessage({ id: 'swiper.newHere' })}
              </Text>
            </Box>
            <HStack space="sm" className="items-end">
              <Text bold className="text-primary-foreground" size="4xl">
                {name}
              </Text>
              <Text className="pb-0.5 text-primary-foreground" size="3xl">
                {age}
              </Text>
            </HStack>
            <HStack space="sm" className="items-center">
              <Icon
                as={MessageCircleIcon}
                className="text-primary-foreground"
                size="md"
              />
              <Text
                className="flex-1 text-primary-foreground"
                numberOfLines={1}
              >
                {bio}
              </Text>
            </HStack>
            <HStack space="sm" className="items-center">
              <Icon
                as={InfoIcon}
                className="text-primary-foreground"
                size="md"
              />
              <Text className="text-primary-foreground" size="sm">
                {formatMessage(
                  { id: 'swiper.distance' },
                  { distance },
                )}
              </Text>
            </HStack>
          </VStack>
        </Box>
      </AnimatedImageBackground>
    </Box>
  );
}

const styles = StyleSheet.create({
  largeGlassButton: {
    borderRadius: 32,
    height: 64,
    overflow: 'hidden',
    width: 64,
  },
  mediumGlassButton: {
    borderRadius: 28,
    height: 56,
    overflow: 'hidden',
    width: 56,
  },
});
