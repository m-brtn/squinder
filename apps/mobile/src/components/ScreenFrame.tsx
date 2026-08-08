import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';

type Props = {
  readonly children: ReactNode;
};

export function ScreenFrame({ children }: Props) {
  return (
    <Box className="flex-1 bg-background">
      <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
    </Box>
  );
}
