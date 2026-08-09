import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as Linking from 'expo-linking';

import { setMonitoringUser } from '@/lib/monitoring';
import { getSupabaseClient, type Session } from '@/lib/supabase/client';

import { processAuthRedirect } from './api';

interface AuthState {
  session: Session | null;
  restoring: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return undefined;
      setSession(data.session);
      setRestoring(false);
      return undefined;
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setRestoring(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMonitoringUser(session?.user.id);
  }, [session?.user.id]);

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;
      void processAuthRedirect(url).catch(() => {
        // Auth screens present sanitized errors for user-initiated redirect flows.
      });
    };

    void Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);

  const value = useMemo(() => ({ session, restoring }), [restoring, session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider.');
  return value;
}
