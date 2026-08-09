/* eslint-disable typescript/no-unsafe-type-assertion, typescript/unbound-method */

import { act, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('expo-linking', () => ({
  getInitialURL: jest.fn(async () => null),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));
jest.mock('@/lib/analytics', () => ({
  analytics: { capture: jest.fn(), identify: jest.fn(), reset: jest.fn() },
}));
jest.mock('@/lib/monitoring', () => ({ setMonitoringUser: jest.fn() }));
jest.mock('@/lib/supabase/client', () => {
  let listener: (_event: string, session: unknown) => void = () => undefined;
  const unsubscribe = jest.fn();
  const auth = {
    getSession: jest.fn(async () => ({ data: { session: null } })),
    onAuthStateChange: jest.fn((next: typeof listener) => {
      listener = next;
      return { data: { subscription: { unsubscribe } } };
    }),
  };
  return {
    getSupabaseClient: () => ({ auth }),
    testMocks: {
      auth,
      emit: (session: unknown) => listener('SIGNED_IN', session),
      unsubscribe,
    },
  };
});

import * as Linking from 'expo-linking';

import { analytics } from '@/lib/analytics';
import { setMonitoringUser } from '@/lib/monitoring';

import { AuthProvider, useAuth } from '../auth-context';

interface AuthTestMocks {
  auth: { getSession: jest.Mock; onAuthStateChange: jest.Mock };
  emit: (session: unknown) => void;
  unsubscribe: jest.Mock;
}

const authMocks = jest.requireMock('@/lib/supabase/client').testMocks as AuthTestMocks;
const identify = jest.mocked(analytics.identify);
const reset = jest.mocked(analytics.reset);
const monitoringUser = jest.mocked(setMonitoringUser);

function SessionState() {
  const { restoring, session } = useAuth();
  return <Text>{restoring ? 'restoring' : (session?.user.id ?? 'signed-out')}</Text>;
}

describe('authentication session lifecycle', () => {
  beforeEach(() => {
    identify.mockReset();
    reset.mockReset();
    monitoringUser.mockReset();
    authMocks.unsubscribe.mockReset();
  });

  test('restores, identifies, clears identity on sign-out, and unsubscribes', async () => {
    const rendered = await render(
      <AuthProvider>
        <SessionState />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText('signed-out')).toBeOnTheScreen());
    expect(reset).toHaveBeenCalled();

    await act(() => authMocks.emit({ user: { id: '11111111-1111-4111-8111-111111111111' } }));
    expect(identify).toHaveBeenLastCalledWith('11111111-1111-4111-8111-111111111111');
    expect(monitoringUser).toHaveBeenLastCalledWith('11111111-1111-4111-8111-111111111111');

    await act(() => authMocks.emit(null));
    expect(reset).toHaveBeenCalled();
    expect(monitoringUser).toHaveBeenLastCalledWith(undefined);

    await rendered.unmount();
    expect(authMocks.unsubscribe).toHaveBeenCalledTimes(1);
    const linking = jest.mocked(Linking.addEventListener);
    expect(linking.mock.results[0]?.value.remove).toHaveBeenCalledTimes(1);
  });
});
