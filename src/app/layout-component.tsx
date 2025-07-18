
import type { ReactNode } from 'react';
import { Toaster } from '../FMComponents/Toaster';

export function LayoutComponent({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
