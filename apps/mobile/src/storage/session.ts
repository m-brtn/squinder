import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'squinder.session-token';

export const getSessionToken = (): Promise<string | null> =>
  SecureStore.getItemAsync(SESSION_KEY);

export const saveSessionToken = (token: string): Promise<void> =>
  SecureStore.setItemAsync(SESSION_KEY, token);

export const clearSessionToken = (): Promise<void> =>
  SecureStore.deleteItemAsync(SESSION_KEY);
