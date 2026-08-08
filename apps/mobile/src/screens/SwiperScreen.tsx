import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useIntl } from 'react-intl';
import { Image, ImageBackground, useWindowDimensions } from 'react-native';
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
  ChevronLeftIcon,
  CloseIcon,
  FavouriteIcon,
  StarIcon,
} from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { ThemeToggle } from '../components/ThemeToggle';

type Props = {
  onBack: () => void;
};

type SwipeDirection = 'left' | 'right' | 'up';

type Profile = {
  id: string;
  nameMessageId: string;
  age: number;
  distance: number;
  bioMessageId: string;
  imageUrl: string;
};

const profiles: readonly Profile[] = [
  {
    id: 'maya',
    nameMessageId: 'swiper.profiles.maya.name',
    age: 26,
    distance: 2,
    bioMessageId: 'swiper.profiles.maya.bio',
    imageUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'emma',
    nameMessageId: 'swiper.profiles.emma.name',
    age: 27,
    distance: 5,
    bioMessageId: 'swiper.profiles.emma.bio',
    imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'sofia',
    nameMessageId: 'swiper.profiles.sofia.name',
    age: 25,
    distance: 8,
    bioMessageId: 'swiper.profiles.sofia.bio',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'lina',
    nameMessageId: 'swiper.profiles.lina.name',
    age: 24,
    distance: 11,
    bioMessageId: 'swiper.profiles.lina.bio',
    imageUrl:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=85',
  },
];

const AnimatedBox = Animated.createAnimatedComponent(Box);
const SWIPE_THRESHOLD = 100;

export function SwiperScreen({ onBack }: Props) {
  const { formatMessage } = useIntl();
  const { width } = useWindowDimensions();
  const [profileIndex, setProfileIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const profile = profiles[profileIndex % profiles.length];
  const nextProfile = profiles[(profileIndex + 1) % profiles.length];

  useEffect(() => {
    void Promise.allSettled(
      profiles.map(({ imageUrl }) => Image.prefetch(imageUrl)),
    );
  }, []);

  useLayoutEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [profileIndex, translateX, translateY]);

  const advanceProfile = useCallback(() => {
    setProfileIndex((current) => current + 1);
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
          translateY.value = event.translationY * 0.18;
        })
        .onEnd((event) => {
          const projectedX = event.translationX + event.velocityX * 0.12;

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

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Box className="w-full max-w-3xl flex-1 self-center bg-background px-4 pb-4 pt-3">
      <HStack space="md" className="items-center">
        <Button
          accessibilityLabel={formatMessage({ id: 'actions.back' })}
          onPress={onBack}
          size="icon"
          variant="outline"
        >
          <ButtonIcon as={ChevronLeftIcon} />
        </Button>
        <Text
          bold
          className="flex-1 text-foreground"
          numberOfLines={1}
          size="xl"
        >
          {formatMessage({ id: 'screens.swiper.title' })}
        </Text>
        <ThemeToggle />
      </HStack>

      <GestureDetector gesture={panGesture}>
        <Box className="relative my-4 min-h-96 flex-1">
          {[nextProfile, profile].map((visibleProfile, index) => {
            const isActive = index === 1;

            return (
              <AnimatedBox
                key={visibleProfile.id}
                className="absolute inset-0 overflow-hidden rounded-3xl bg-card shadow-hard-5"
                style={isActive ? cardStyle : undefined}
              >
                <ProfileCard
                  age={visibleProfile.age}
                  bio={formatMessage({ id: visibleProfile.bioMessageId })}
                  distance={visibleProfile.distance}
                  imageUrl={visibleProfile.imageUrl}
                  name={formatMessage({ id: visibleProfile.nameMessageId })}
                />

                {isActive ? (
                  <>
                    <AnimatedBox
                      className="absolute left-5 top-6 rotate-[-10deg] rounded-lg border-4 border-success px-3 py-1"
                      style={likeStyle}
                    >
                      <Text bold className="text-success" size="2xl">
                        {formatMessage({ id: 'swiper.likeStamp' })}
                      </Text>
                    </AnimatedBox>

                    <AnimatedBox
                      className="absolute right-5 top-6 rotate-[10deg] rounded-lg border-4 border-destructive px-3 py-1"
                      style={nopeStyle}
                    >
                      <Text bold className="text-destructive" size="2xl">
                        {formatMessage({ id: 'swiper.nopeStamp' })}
                      </Text>
                    </AnimatedBox>
                  </>
                ) : null}
              </AnimatedBox>
            );
          })}
        </Box>
      </GestureDetector>

      <HStack space="xl" className="items-center justify-center pb-2">
        <Button
          accessibilityLabel={formatMessage({ id: 'swiper.actions.pass' })}
          className="h-14 w-14 rounded-full border-destructive bg-card shadow-hard-2"
          onPress={() => animateSwipe('left')}
          size="icon"
          variant="outline"
        >
          <ButtonIcon as={CloseIcon} className="h-7 w-7 text-destructive" />
        </Button>
        <Button
          accessibilityLabel={formatMessage({ id: 'swiper.actions.superLike' })}
          className="h-12 w-12 rounded-full border-primary bg-card shadow-hard-2"
          onPress={() => animateSwipe('up')}
          size="icon"
          variant="outline"
        >
          <ButtonIcon as={StarIcon} className="h-6 w-6 text-primary" />
        </Button>
        <Button
          accessibilityLabel={formatMessage({ id: 'swiper.actions.like' })}
          className="h-14 w-14 rounded-full border-success bg-card shadow-hard-2"
          onPress={() => animateSwipe('right')}
          size="icon"
          variant="outline"
        >
          <ButtonIcon
            as={FavouriteIcon}
            className="h-7 w-7 text-success"
          />
        </Button>
      </HStack>
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

  return (
    <Box className="absolute inset-0 overflow-hidden rounded-3xl border border-border bg-card">
      <ImageBackground
        accessibilityLabel={formatMessage(
          { id: 'swiper.profilePhoto' },
          { name },
        )}
        resizeMode="cover"
        source={{ uri: imageUrl }}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <Box className="bg-background/90 p-5">
          <VStack space="sm">
            <HStack space="sm" className="items-end">
              <Text bold className="text-foreground" size="3xl">
                {name}
              </Text>
              <Text className="pb-0.5 text-foreground" size="2xl">
                {age}
              </Text>
            </HStack>
            <Text className="text-muted-foreground" size="sm">
              {formatMessage(
                { id: 'swiper.distance' },
                { distance },
              )}
            </Text>
            <Text className="text-foreground" numberOfLines={2}>
              {bio}
            </Text>
          </VStack>
        </Box>
      </ImageBackground>
    </Box>
  );
}
