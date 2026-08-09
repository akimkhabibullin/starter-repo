import * as Network from 'expo-network';
import { onlineManager, QueryClient } from '@tanstack/react-query';

import { normalizeApplicationError } from '@/lib/supabase/errors';

export function shouldRetry(failureCount: number, error: unknown): boolean {
  const normalized = normalizeApplicationError(error);
  return normalized.retryable && failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 10_000),
    },
    mutations: {
      retry: false,
    },
  },
});

let onlineManagerConfigured = false;

export function configureQueryOnlineManager(): void {
  if (onlineManagerConfigured) return;
  onlineManagerConfigured = true;

  onlineManager.setEventListener((setOnline) => {
    let initialized = false;
    const subscription = Network.addNetworkStateListener((state) => {
      initialized = true;
      setOnline(Boolean(state.isConnected));
    });

    void Network.getNetworkStateAsync()
      .then((state) => {
        if (!initialized) setOnline(Boolean(state.isConnected));
        return undefined;
      })
      .catch(() => {
        // A later network event will establish connectivity state.
      });

    return () => subscription.remove();
  });
}
