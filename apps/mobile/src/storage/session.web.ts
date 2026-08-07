const SESSION_KEY = 'squinder.session-token';

export const getSessionToken = async (): Promise<string | null> =>
  globalThis.localStorage?.getItem(SESSION_KEY) ?? null;

export const saveSessionToken = async (token: string): Promise<void> => {
  globalThis.localStorage?.setItem(SESSION_KEY, token);
};

export const clearSessionToken = async (): Promise<void> => {
  globalThis.localStorage?.removeItem(SESSION_KEY);
};
