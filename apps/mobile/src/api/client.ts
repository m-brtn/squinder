import type {
  Alcohol,
  Gender,
  Kids,
  LookingFor,
  Pets,
  Smoking,
  Workouts,
} from '@squinder/shared';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type { Gender, LookingFor };

export type Persona = {
  id: string;
  name: string;
  bio: string;
  birthDate: string;
  gender: Gender;
  interestedIn: LookingFor;
  smoking: Smoking;
  alcohol: Alcohol;
  workouts: Workouts;
  pets: Pets;
  kids: Kids;
  country: string;
  city: string;
  photoUrls: string[];
  interests: string[];
};

export type User = {
  id: string;
  name: string;
  gender: Gender;
  lookingFor: LookingFor;
  birthDate: string;
  interests: string[];
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
  `http://${localHost}:7131`;

export const WS_URL = `${API_URL.replace(/^http/, 'ws')}/ws`;

// Local S3 (MinIO) public bucket; same host as the API, port 7133.
export const MEDIA_URL =
  process.env.EXPO_PUBLIC_MEDIA_URL?.replace(/\/$/, '') ??
  `http://${localHost}:7133/squinder`;

export const resolvePhotoUrl = (path: string): string =>
  /^https?:\/\//.test(path)
    ? path
    : `${MEDIA_URL}/${path.replace(/^\//, '')}`;

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
  input: Pick<
    User,
    'name' | 'gender' | 'lookingFor' | 'birthDate' | 'interests'
  >,
): Promise<{ user: User; sessionToken: string }> =>
  request('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const getPersonas = (): Promise<{ personas: Persona[] }> =>
  request('/personas');

export const getCurrentUser = (
  sessionToken: string,
): Promise<{ user: User }> =>
  request('/me', {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
