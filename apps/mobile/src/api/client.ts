import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type Gender =
  | 'male'
  | 'female'
  | 'non_binary'
  | 'prefer_not_to_say';

export type LookingFor = 'male' | 'female' | 'everyone';

export type User = {
  id: string;
  name: string;
  gender: Gender;
  lookingFor: LookingFor;
  birthDate: string;
  createdAt: string;
};

export type Health = {
  status: 'ok';
  version: string;
  timestamp: string;
};

const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
const localHost =
  expoHost ?? (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ??
  `http://${localHost}:3001`;

export const WS_URL = `${API_URL.replace(/^http/, 'ws')}/ws`;

const request = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
};

export const getHealth = (): Promise<Health> => request('/health');

export const createUser = (
  input: Pick<User, 'name' | 'gender' | 'lookingFor' | 'birthDate'>,
): Promise<{ user: User; sessionToken: string }> =>
  request('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const getCurrentUser = (
  sessionToken: string,
): Promise<{ user: User }> =>
  request('/me', {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
