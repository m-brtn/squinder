import { getLocales } from 'expo-localization';
import type { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';

import en from './messages/en.json';

const messages = { en } as const;
type SupportedLocale = keyof typeof messages;

const fallbackLocale: SupportedLocale = 'en';

const getSupportedLocale = (): SupportedLocale => {
  const languageCode = getLocales()[0]?.languageCode;
  return languageCode && languageCode in messages
    ? (languageCode as SupportedLocale)
    : fallbackLocale;
};

type Props = {
  children: ReactNode;
};

export function I18nProvider({ children }: Props) {
  const locale = getSupportedLocale();

  return (
    <IntlProvider
      defaultLocale={fallbackLocale}
      locale={locale}
      messages={messages[locale]}
    >
      {children}
    </IntlProvider>
  );
}
