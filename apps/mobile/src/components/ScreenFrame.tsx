import type { ComponentProps, ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';

type Props = {
  readonly children: ReactNode;
  readonly edges?: ComponentProps<typeof SafeAreaView>['edges'];
};

export function ScreenFrame({ children, edges }: Props) {
  return (
    <Box className="flex-1 bg-background">
      <SafeAreaView edges={edges} style={{ flex: 1 }}>
        {children}
      </SafeAreaView>
    </Box>
  );
}
