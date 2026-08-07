import { useIntl } from 'react-intl';

import { Switch } from '@/components/ui/switch';

import { useTheme } from '../theme/ThemeProvider';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const { formatMessage } = useIntl();

  return (
    <Switch
      accessibilityLabel={formatMessage({
        id: isDark ? 'theme.switchToLight' : 'theme.switchToDark',
      })}
      onValueChange={toggleTheme}
      size="sm"
      value={isDark}
    />
  );
}
