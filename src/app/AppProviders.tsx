import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../store/appState';
import { PlatformStoreProvider } from '../store/PlatformStore';
import { queryClient } from './queryClient';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppStateProvider>
          <PlatformStoreProvider>{children}</PlatformStoreProvider>
        </AppStateProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
