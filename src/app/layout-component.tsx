
import type { ReactNode } from 'react';
import { Toaster } from '@/FMComponents/ui/toaster';

export function LayoutComponent({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
