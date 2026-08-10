import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren, useEffect, useMemo } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { configureQueryOnlineManager, queryClient } from '@/lib/query/client';
import { getSupabaseClient } from '@/lib/supabase/client';
import { createSessionRefreshLifecycle } from '@/lib/supabase/session-refresh';
import { AuthProvider } from '@/features/auth/auth-context';

configureQueryOnlineManager();

export function AppProviders({ children }: PropsWithChildren) {
  const supabase = getSupabaseClient();
  const sessionRefresh = useMemo(
    () => createSessionRefreshLifecycle(supabase.auth),
    [supabase.auth],
  );

  useEffect(() => {
    sessionRefresh.start();
    return () => sessionRefresh.stop();
  }, [sessionRefresh]);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;

    const handleAppStateChange = (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    };
    handleAppStateChange(AppState.currentState);

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
