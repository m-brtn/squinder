import type { ComponentProps, ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';

type Props = {
  readonly bottomInset?: number;
  readonly children: ReactNode;
  readonly edges?: ComponentProps<typeof SafeAreaView>['edges'];
};

export function ScreenFrame({ bottomInset = 0, children, edges }: Props) {
  return (
    <Box className="flex-1 bg-background">
      <SafeAreaView
        edges={edges}
        style={{ flex: 1, paddingBottom: bottomInset }}
      >
        {children}
      </SafeAreaView>
    </Box>
  );
}
