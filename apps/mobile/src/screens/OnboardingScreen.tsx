import {
  GENDERS,
  INTEREST_CATEGORIES,
  INTERESTED_IN,
  MAX_PROFILE_INTERESTS,
} from '@squinder/shared';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';

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

import type { Gender, LookingFor, User } from '../api/client';

type OnboardingInput = Pick<
  User,
  'name' | 'gender' | 'lookingFor' | 'birthDate' | 'interests'
>;

type Props = {
  error: boolean;
  submitting: boolean;
  onComplete: (input: OnboardingInput) => Promise<void>;
};

const genderMessageIds: Record<Gender, string> = {
  male: 'onboarding.gender.male',
  female: 'onboarding.gender.female',
  non_binary: 'onboarding.gender.nonBinary',
  prefer_not_to_say: 'onboarding.gender.preferNotToSay',
};

const genderOptions: Array<{ value: Gender; messageId: string }> =
  GENDERS.map((value) => ({
    value,
    messageId: genderMessageIds[value],
  }));

const lookingForMessageIds: Record<LookingFor, string> = {
  male: 'onboarding.lookingFor.male',
  female: 'onboarding.lookingFor.female',
  everyone: 'onboarding.lookingFor.everyone',
};

const lookingForOptions: Array<{
  value: LookingFor;
  messageId: string;
}> = INTERESTED_IN.map((value) => ({
  value,
  messageId: lookingForMessageIds[value],
}));

const titleIds = [
  'onboarding.name.title',
  'onboarding.gender.title',
  'onboarding.lookingFor.title',
  'onboarding.birthDate.title',
  'onboarding.interests.title',
];
const subtitles = [
  'onboarding.name.subtitle',
  'onboarding.gender.subtitle',
  'onboarding.lookingFor.subtitle',
  'onboarding.birthDate.subtitle',
  'onboarding.interests.subtitle',
];
const totalSteps = titleIds.length;
const interestsStep = 4;

type ChoiceRadioGroupProps = {
  onChange: (value: string) => void;
  options: Array<{ value: string; messageId: string }>;
  value: string;
};

function ChoiceRadioGroup({
  onChange,
  options,
  value,
}: ChoiceRadioGroupProps) {
  const { formatMessage } = useIntl();

  return (
    <RadioGroup onChange={onChange} value={value}>
      {options.map((option) => (
        <Radio
          className="min-h-14 justify-between rounded-2xl border border-border bg-card p-4 data-[checked=true]:border-primary data-[checked=true]:bg-accent"
          key={option.value}
          size="lg"
          value={option.value}
        >
          <RadioLabel>{formatMessage({ id: option.messageId })}</RadioLabel>
          <RadioIndicator>
            <RadioIcon as={CircleIcon} />
          </RadioIndicator>
        </Radio>
      ))}
    </RadioGroup>
  );
}

type InterestChipsProps = {
  selected: string[];
  onToggle: (slug: string) => void;
};

function InterestChips({ selected, onToggle }: InterestChipsProps) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const limitReached = selected.length >= MAX_PROFILE_INTERESTS;

  return (
    <VStack space="lg">
      {INTEREST_CATEGORIES.map((category) => (
        <VStack key={category.slug} space="sm">
          <Text bold className="text-foreground" size="md">
            {category.label}
          </Text>
          <Box className="flex-row flex-wrap gap-2">
            {category.interests.map((item) => {
              const isSelected = selectedSet.has(item.slug);
              const isDisabled = !isSelected && limitReached;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: isSelected,
                    disabled: isDisabled,
                  }}
                  className={`rounded-full border px-4 py-2 ${
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-border bg-card'
                  } ${isDisabled ? 'opacity-40' : ''}`}
                  disabled={isDisabled}
                  key={item.slug}
                  onPress={() => onToggle(item.slug)}
                >
                  <Text
                    className={
                      isSelected
                        ? 'text-primary-foreground'
                        : 'text-foreground'
                    }
                    size="sm"
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </Box>
        </VStack>
      ))}
    </VStack>
  );
}

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
  const [lookingFor, setLookingFor] = useState<LookingFor>('everyone');
  const [day, setDay] = useState('15');
  const [month, setMonth] = useState('05');
  const [year, setYear] = useState('1995');
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (slug: string) => {
    setInterests((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : current.length < MAX_PROFILE_INTERESTS
          ? [...current, slug]
          : current,
    );
  };

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
    step === 0
      ? name.trim().length >= 2
      : step === 3
        ? dateIsValid
        : true;

  const handleContinue = async () => {
    if (!canContinue || submitting) return;
    if (step < totalSteps - 1) {
      setStep((current) => current + 1);
      return;
    }

    await onComplete({
      name: name.trim(),
      gender,
      lookingFor,
      birthDate,
      interests,
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
              { current: step + 1, total: totalSteps },
            )}
            className="h-1"
            value={((step + 1) / totalSteps) * 100}
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
                { current: step + 1, total: totalSteps },
              )}{' '}
              ·{' '}
              {formatMessage(
                { id: 'onboarding.stepsRemaining' },
                { count: totalSteps - step - 1 },
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
              <ChoiceRadioGroup
                onChange={(value) => setGender(value as Gender)}
                options={genderOptions}
                value={gender}
              />
            )}

            {step === 2 && (
              <ChoiceRadioGroup
                onChange={(value) => setLookingFor(value as LookingFor)}
                options={lookingForOptions}
                value={lookingFor}
              />
            )}

            {step === 3 && (
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

            {step === interestsStep && (
              <VStack space="md">
                <Text
                  bold
                  className="tracking-wider text-muted-foreground"
                  size="xs"
                >
                  {formatMessage(
                    { id: 'onboarding.interests.counter' },
                    {
                      count: interests.length,
                      max: MAX_PROFILE_INTERESTS,
                    },
                  )}
                </Text>
                <InterestChips
                  onToggle={toggleInterest}
                  selected={interests}
                />
              </VStack>
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
                    step === totalSteps - 1
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
