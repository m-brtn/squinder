import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.brand}>
          {formatMessage({ id: 'common.brand' })}
        </Text>
        <View style={styles.progress}>
          {[0, 1, 2].map((item) => (
            <View
              key={item}
              style={[styles.progressItem, item <= step && styles.progressActive]}
            />
          ))}
        </View>

        <View style={styles.copy}>
          <Text style={styles.step}>
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
          <Text style={styles.title}>
            {formatMessage({ id: titleIds[step] })}
          </Text>
          <Text style={styles.subtitle}>
            {formatMessage({ id: subtitles[step] })}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 0 && (
            <TextInput
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={80}
              onChangeText={setName}
              placeholder={formatMessage({
                id: 'onboarding.name.placeholder',
              })}
              placeholderTextColor="#66738d"
              selectionColor="#a78bfa"
              style={styles.nameInput}
              value={name}
            />
          )}

          {step === 1 && (
            <View style={styles.options}>
              {genderOptions.map((option) => {
                const selected = gender === option.value;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    key={option.value}
                    onPress={() => setGender(option.value)}
                    style={[styles.option, selected && styles.optionSelected]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {formatMessage({ id: option.messageId })}
                    </Text>
                    <View
                      style={[styles.radio, selected && styles.radioSelected]}
                    />
                  </Pressable>
                );
              })}
            </View>
          )}

          {step === 2 && (
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>
                  {formatMessage({ id: 'onboarding.birthDate.day' })}
                </Text>
                <TextInput
                  keyboardType="number-pad"
                  maxLength={2}
                  onChangeText={setDay}
                  style={styles.dateInput}
                  value={day}
                />
              </View>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>
                  {formatMessage({ id: 'onboarding.birthDate.month' })}
                </Text>
                <TextInput
                  keyboardType="number-pad"
                  maxLength={2}
                  onChangeText={setMonth}
                  style={styles.dateInput}
                  value={month}
                />
              </View>
              <View style={[styles.dateField, styles.yearField]}>
                <Text style={styles.dateLabel}>
                  {formatMessage({ id: 'onboarding.birthDate.year' })}
                </Text>
                <TextInput
                  keyboardType="number-pad"
                  maxLength={4}
                  onChangeText={setYear}
                  style={styles.dateInput}
                  value={year}
                />
              </View>
            </View>
          )}

          {error && (
            <Text style={styles.error}>
              {formatMessage({ id: 'errors.createProfile' })}
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          {step > 0 && (
            <Pressable
              accessibilityRole="button"
              disabled={submitting}
              onPress={() => setStep((current) => current - 1)}
              style={styles.backButton}
            >
              <Text style={styles.backText}>
                {formatMessage({ id: 'actions.back' })}
              </Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={!canContinue || submitting}
            onPress={() => void handleContinue()}
            style={[
              styles.continueButton,
              (!canContinue || submitting) && styles.buttonDisabled,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.continueText}>
                {formatMessage({
                  id:
                    step === 2
                      ? 'actions.createProfile'
                      : 'actions.continue',
                })}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#0b1020',
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    maxWidth: 560,
    padding: 24,
    width: '100%',
  },
  brand: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 20,
  },
  progress: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 44,
  },
  progressItem: {
    backgroundColor: '#26314f',
    borderRadius: 3,
    flex: 1,
    height: 5,
  },
  progressActive: {
    backgroundColor: '#8b5cf6',
  },
  copy: {
    marginBottom: 32,
  },
  step: {
    color: '#8b9bb8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    color: '#a9b5cb',
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    minHeight: 220,
  },
  nameInput: {
    backgroundColor: '#151c31',
    borderColor: '#364464',
    borderRadius: 16,
    borderWidth: 1,
    color: '#f8fafc',
    fontSize: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  options: {
    gap: 10,
  },
  option: {
    alignItems: 'center',
    backgroundColor: '#151c31',
    borderColor: '#26314f',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  optionSelected: {
    backgroundColor: '#241a42',
    borderColor: '#8b5cf6',
  },
  optionText: {
    color: '#c3cce0',
    fontSize: 17,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  radio: {
    borderColor: '#66738d',
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    width: 20,
  },
  radioSelected: {
    backgroundColor: '#8b5cf6',
    borderColor: '#c4b5fd',
    borderWidth: 4,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateField: {
    flex: 1,
    gap: 8,
  },
  yearField: {
    flex: 1.35,
  },
  dateLabel: {
    color: '#8b9bb8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dateInput: {
    backgroundColor: '#151c31',
    borderColor: '#364464',
    borderRadius: 14,
    borderWidth: 1,
    color: '#f8fafc',
    fontSize: 22,
    paddingHorizontal: 14,
    paddingVertical: 16,
    textAlign: 'center',
  },
  error: {
    color: '#fb7185',
    marginTop: 16,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    marginTop: 28,
  },
  backButton: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  backText: {
    color: '#a9b5cb',
    fontSize: 16,
    fontWeight: '700',
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    minWidth: 160,
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  continueText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
