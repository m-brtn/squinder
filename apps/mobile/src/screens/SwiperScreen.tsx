import { useIntl } from 'react-intl';

import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { ChevronLeftIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

import { ThemeToggle } from '../components/ThemeToggle';

type Props = {
  onBack: () => void;
};

export function SwiperScreen({ onBack }: Props) {
  const { formatMessage } = useIntl();

  return (
    <Box className="w-full max-w-3xl flex-1 self-center p-6">
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
      <Box className="flex-1" />
    </Box>
  );
}
