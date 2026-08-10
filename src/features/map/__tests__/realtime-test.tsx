/* eslint-disable eslint/no-underscore-dangle, typescript/no-unsafe-type-assertion, typescript/unbound-method */

import { renderHook } from '@testing-library/react-native';

jest.mock('@/lib/query/client', () => ({
  queryClient: { invalidateQueries: jest.fn() },
}));
jest.mock('@/lib/monitoring', () => ({ captureUnexpectedError: jest.fn() }));
jest.mock('@/lib/supabase/client', () => {
  const handlers: Array<() => void> = [];
  const channel: { on: jest.Mock; subscribe: jest.Mock } = {
    on: jest.fn((_kind: string, _filter: unknown, handler: () => void) => {
      handlers.push(handler);
      return channel;
    }),
    subscribe: jest.fn(() => channel),
  };
  return {
    __test: { channel, handlers, removeChannel: jest.fn() },
    getSupabaseClient: () => ({
      channel: () => channel,
      removeChannel: jest.requireMock('@/lib/supabase/client').__test.removeChannel,
    }),
  };
});

import { queryClient } from '@/lib/query/client';

import { useMapRealtime } from '../use-map-realtime';

interface SupabaseTestMock {
  __test: {
    channel: { on: jest.Mock; subscribe: jest.Mock };
    handlers: Array<() => void>;
    removeChannel: jest.Mock;
  };
}

const supabaseMock = jest.requireMock('@/lib/supabase/client') as SupabaseTestMock;
const invalidateQueries = jest.mocked(queryClient.invalidateQueries);

describe('map Realtime lifecycle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    supabaseMock.__test.handlers.length = 0;
    invalidateQueries.mockReset();
    supabaseMock.__test.removeChannel.mockReset();
    supabaseMock.__test.channel.on.mockClear();
    supabaseMock.__test.channel.subscribe.mockClear();
  });

  afterEach(() => jest.useRealTimers());

  test('coalesces invalidation and removes the channel on unmount', async () => {
    const rendered = await renderHook(() => useMapRealtime('item-1'));
    expect(supabaseMock.__test.handlers).toHaveLength(2);

    supabaseMock.__test.handlers[0]?.();
    supabaseMock.__test.handlers[0]?.();
    await jest.advanceTimersByTimeAsync(250);
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['map-items'] });

    await rendered.unmount();
    expect(supabaseMock.__test.removeChannel).toHaveBeenCalledWith(supabaseMock.__test.channel);
  });
});
