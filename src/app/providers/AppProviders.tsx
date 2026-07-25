import type { ReactNode } from 'react';
import { AuthProvider } from '../../features/auth/AuthProvider';
import { CustomizationProvider } from '../../features/customize/CustomizationProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CustomizationProvider>{children}</CustomizationProvider>
    </AuthProvider>
  );
}
