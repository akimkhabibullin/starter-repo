import 'react-native-url-polyfill/auto';

import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';

import { getClientEnv } from '@/config/env';

import { sessionStorage } from './session-storage';

let client: SupabaseClient | undefined;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const env = getClientEnv();
  client = createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: {
      storage: sessionStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  });

  return client;
}
