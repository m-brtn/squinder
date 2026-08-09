import { useIntl } from 'react-intl';

import { Box } from '@/components/ui/box';
import { CircleIcon } from '@/components/ui/icon';
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from '@/components/ui/radio';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import {
  type ThemePreference,
  useTheme,
} from '../theme/ThemeProvider';

const themeOptions: ReadonlyArray<{
  value: ThemePreference;
  labelMessageId: string;
  descriptionMessageId: string;
}> = [
  {
    value: 'system',
    labelMessageId: 'theme.options.system.label',
    descriptionMessageId: 'theme.options.system.description',
  },
  {
    value: 'light',
    labelMessageId: 'theme.options.light.label',
    descriptionMessageId: 'theme.options.light.description',
  },
  {
    value: 'dark',
    labelMessageId: 'theme.options.dark.label',
    descriptionMessageId: 'theme.options.dark.description',
  },
];

export function ThemeSettingsScreen() {
  const { formatMessage } = useIntl();
  const { preference, setPreference } = useTheme();

  return (
    <Box className="w-full max-w-3xl flex-1 self-center bg-background px-4 pb-4 pt-3">
      <Text bold className="text-foreground" size="xl">
        {formatMessage({ id: 'screens.theme.title' })}
      </Text>

      <VStack space="lg" className="pt-8">
        <Text className="text-muted-foreground">
          {formatMessage({ id: 'theme.description' })}
        </Text>

        <RadioGroup
          onChange={(value) => setPreference(value as ThemePreference)}
          value={preference}
        >
          {themeOptions.map((option) => (
            <Radio
              className="min-h-20 justify-between rounded-2xl border border-border bg-card p-4 data-[checked=true]:border-primary data-[checked=true]:bg-accent"
              key={option.value}
              size="lg"
              value={option.value}
            >
              <VStack space="xs" className="flex-1 pr-4">
                <RadioLabel>
                  {formatMessage({ id: option.labelMessageId })}
                </RadioLabel>
                <Text className="text-muted-foreground" size="sm">
                  {formatMessage({ id: option.descriptionMessageId })}
                </Text>
              </VStack>
              <RadioIndicator>
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
            </Radio>
          ))}
        </RadioGroup>
      </VStack>
    </Box>
  );
}
