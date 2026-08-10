import type { SupabaseClient } from '@supabase/supabase-js';
import {
  AppState,
  Platform,
  type AppStateStatus,
  type NativeEventSubscription,
} from 'react-native';

type AuthRefreshClient = Pick<SupabaseClient['auth'], 'startAutoRefresh' | 'stopAutoRefresh'>;

export interface SessionRefreshLifecycle {
  start(): void;
  stop(): void;
}

export function createSessionRefreshLifecycle(
  auth: AuthRefreshClient,
  platform = Platform.OS,
): SessionRefreshLifecycle {
  let subscription: NativeEventSubscription | undefined;

  const handleAppStateChange = (status: AppStateStatus) => {
    if (status === 'active') {
      void auth.startAutoRefresh();
    } else {
      void auth.stopAutoRefresh();
    }
  };

  return {
    start() {
      if (platform === 'web' || subscription) return;
      handleAppStateChange(AppState.currentState);
      subscription = AppState.addEventListener('change', handleAppStateChange);
    },
    stop() {
      if (!subscription) return;
      subscription.remove();
      subscription = undefined;
      void auth.stopAutoRefresh();
    },
  };
}
