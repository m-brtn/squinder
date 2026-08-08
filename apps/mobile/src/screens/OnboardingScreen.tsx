import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { Box } from '@/components/ui/box';
import {
  Button,
  ButtonSpinner,
  ButtonText,
} from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { AlertCircleIcon, CircleIcon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from '@/components/ui/radio';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import type { Gender, User } from '../api/client';

type OnboardingInput = Pick<User, 'name' | 'gender' | 'birthDate'>;

type Props = {
  error: boolean;
  submitting: boolean;
  onComplete: (input: OnboardingInput) => Promise<void>;
};

const genderOptions: Array<{ value: Gender; messageId: string }> = [
  { value: 'male', messageId: 'onboarding.gender.male' },
  { value: 'female', messageId: 'onboarding.gender.female' },
  { value: 'non_binary', messageId: 'onboarding.gender.nonBinary' },
  {
    value: 'prefer_not_to_say',
    messageId: 'onboarding.gender.preferNotToSay',
  },
];

const titleIds = [
  'onboarding.name.title',
  'onboarding.gender.title',
  'onboarding.birthDate.title',
];
const subtitles = [
  'onboarding.name.subtitle',
  'onboarding.gender.subtitle',
  'onboarding.birthDate.subtitle',
];

export function OnboardingScreen({
  error,
  submitting,
  onComplete,
}: Props) {
  const { formatMessage } = useIntl();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(() =>
    formatMessage({ id: 'onboarding.name.devDefault' }),
  );
  const [gender, setGender] = useState<Gender>('male');
  const [day, setDay] = useState('15');
  const [month, setMonth] = useState('05');
  const [year, setYear] = useState('1995');

  const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const dateIsValid = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return false;
    const date = new Date(`${birthDate}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === birthDate &&
      date <= new Date()
    );
  }, [birthDate]);

  const canContinue =
    step === 0 ? name.trim().length >= 2 : step === 1 ? true : dateIsValid;

  const handleContinue = async () => {
    if (!canContinue || submitting) return;
    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }

    await onComplete({
      name: name.trim(),
      gender,
      birthDate,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <VStack
          space="2xl"
          className="w-full max-w-xl flex-1 self-center justify-center p-6"
        >
          <Text bold className="tracking-widest text-primary" size="xs">
            {formatMessage({ id: 'common.brand' })}
          </Text>

          <Progress
            accessibilityLabel={formatMessage(
              { id: 'onboarding.stepCounter' },
              { current: step + 1, total: 3 },
            )}
            className="h-1"
            value={((step + 1) / 3) * 100}
          >
            <ProgressFilledTrack />
          </Progress>

          <VStack space="md">
            <Text
              bold
              className="tracking-wider text-muted-foreground"
              size="xs"
            >
              {formatMessage(
                { id: 'onboarding.stepCounter' },
                { current: step + 1, total: 3 },
              )}{' '}
              ·{' '}
              {formatMessage(
                { id: 'onboarding.stepsRemaining' },
                { count: 2 - step },
              )}
            </Text>
            <Text bold className="text-foreground" size="3xl">
              {formatMessage({ id: titleIds[step] })}
            </Text>
            <Text className="leading-6 text-muted-foreground" size="md">
              {formatMessage({ id: subtitles[step] })}
            </Text>
          </VStack>

          <FormControl
            className="min-h-56"
            isInvalid={error}
            isRequired
          >
            {step === 0 && (
              <Input className="min-h-16 rounded-2xl bg-card px-5">
                <InputField
                  autoCapitalize="words"
                  autoCorrect={false}
                  className="text-2xl"
                  maxLength={80}
                  onChangeText={setName}
                  placeholder={formatMessage({
                    id: 'onboarding.name.placeholder',
                  })}
                  value={name}
                />
              </Input>
            )}

            {step === 1 && (
              <RadioGroup
                onChange={(value) => setGender(value as Gender)}
                value={gender}
              >
                {genderOptions.map((option) => (
                  <Radio
                    className="min-h-14 justify-between rounded-2xl border border-border bg-card p-4 data-[checked=true]:border-primary data-[checked=true]:bg-accent"
                    key={option.value}
                    size="lg"
                    value={option.value}
                  >
                    <RadioLabel>
                      {formatMessage({ id: option.messageId })}
                    </RadioLabel>
                    <RadioIndicator>
                      <RadioIcon as={CircleIcon} />
                    </RadioIndicator>
                  </Radio>
                ))}
              </RadioGroup>
            )}

            {step === 2 && (
              <HStack space="sm">
                <FormControl className="flex-1">
                  <FormControlLabel>
                    <FormControlLabelText className="text-xs">
                      {formatMessage({ id: 'onboarding.birthDate.day' })}
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="min-h-14 rounded-2xl bg-card">
                    <InputField
                      className="text-xl"
                      keyboardType="number-pad"
                      maxLength={2}
                      onChangeText={setDay}
                      textAlign="center"
                      value={day}
                    />
                  </Input>
                </FormControl>
                <FormControl className="flex-1">
                  <FormControlLabel>
                    <FormControlLabelText className="text-xs">
                      {formatMessage({ id: 'onboarding.birthDate.month' })}
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="min-h-14 rounded-2xl bg-card">
                    <InputField
                      className="text-xl"
                      keyboardType="number-pad"
                      maxLength={2}
                      onChangeText={setMonth}
                      textAlign="center"
                      value={month}
                    />
                  </Input>
                </FormControl>
                <FormControl className="flex-1">
                  <FormControlLabel>
                    <FormControlLabelText className="text-xs">
                      {formatMessage({ id: 'onboarding.birthDate.year' })}
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="min-h-14 rounded-2xl bg-card">
                    <InputField
                      className="text-xl"
                      keyboardType="number-pad"
                      maxLength={4}
                      onChangeText={setYear}
                      textAlign="center"
                      value={year}
                    />
                  </Input>
                </FormControl>
              </HStack>
            )}

            {error && (
              <FormControlError className="mt-4">
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>
                  {formatMessage({ id: 'errors.createProfile' })}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          <HStack space="md" className="items-center justify-end">
            {step > 0 && (
              <Button
                isDisabled={submitting}
                onPress={() => setStep((current) => current - 1)}
                size="lg"
                variant="ghost"
              >
                <ButtonText>
                  {formatMessage({ id: 'actions.back' })}
                </ButtonText>
              </Button>
            )}
            <Button
              className="min-w-40"
              isDisabled={!canContinue || submitting}
              onPress={() => void handleContinue()}
              size="lg"
            >
              {submitting && <ButtonSpinner />}
              <ButtonText>
                {formatMessage({
                  id:
                    step === 2
                      ? 'actions.createProfile'
                      : 'actions.continue',
                })}
              </ButtonText>
            </Button>
          </HStack>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
