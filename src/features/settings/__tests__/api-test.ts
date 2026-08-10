/* eslint-disable typescript/no-unsafe-type-assertion, typescript/unbound-method */

jest.mock('@/lib/supabase/client', () => ({
  ...(() => {
    const invoke = jest.fn();
    const signOut = jest.fn();
    const client = { functions: { invoke }, auth: { signOut } };
    return { getSupabaseClient: () => client, testMocks: { invoke, signOut } };
  })(),
}));
jest.mock('@/lib/analytics', () => ({
  analytics: { capture: jest.fn(), identify: jest.fn(), reset: jest.fn() },
}));

import { analytics } from '@/lib/analytics';
import { deleteAccount } from '../api';

const supabaseMocks = jest.requireMock('@/lib/supabase/client').testMocks as {
  invoke: jest.Mock;
  signOut: jest.Mock;
};
const mockInvoke = supabaseMocks.invoke;
const mockLocalSignOut = supabaseMocks.signOut;
const mockCapture = jest.mocked(analytics.capture);

describe('account deletion lifecycle', () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    mockLocalSignOut.mockReset();
    mockCapture.mockReset();
  });

  test('preserves the local session when server deletion fails', async () => {
    mockInvoke.mockResolvedValue({ error: { context: { status: 500 } } });

    await expect(deleteAccount()).rejects.toMatchObject({ code: 'service' });
    expect(mockLocalSignOut).not.toHaveBeenCalled();
    expect(mockCapture).not.toHaveBeenCalled();
  });

  test('clears only the local session after server deletion succeeds', async () => {
    mockInvoke.mockResolvedValue({ error: null });
    mockLocalSignOut.mockResolvedValue({ error: null });

    await deleteAccount();

    expect(mockLocalSignOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(mockCapture).toHaveBeenCalledWith({
      name: 'account_deletion_succeeded',
      properties: {},
    });
  });
});
