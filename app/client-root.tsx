'use client';

import { Providers } from './providers';
import { LayoutWrapper } from './layout-wrapper';

export function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <LayoutWrapper>
        {children}
      </LayoutWrapper>
    </Providers>
  );
} 