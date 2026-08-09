/* eslint-disable typescript/no-unsafe-type-assertion, typescript/unbound-method */

jest.mock('@/lib/supabase/client', () => ({
  ...(() => {
    const insert = jest.fn();
    const from = jest.fn(() => ({ insert }));
    return { getSupabaseClient: () => ({ from }), testMocks: { from, insert } };
  })(),
}));
jest.mock('@/lib/analytics', () => ({
  analytics: { capture: jest.fn(), identify: jest.fn(), reset: jest.fn() },
}));

import { analytics } from '@/lib/analytics';
import { blockUser, reportContent } from '../api';

const supabaseMocks = jest.requireMock('@/lib/supabase/client').testMocks as {
  from: jest.Mock;
  insert: jest.Mock;
};
const mockFrom = supabaseMocks.from;
const mockInsert = supabaseMocks.insert;
const mockCapture = jest.mocked(analytics.capture);

const targetId = '11111111-1111-4111-8111-111111111111';
const authorId = '22222222-2222-4222-8222-222222222222';

describe('moderation data flows', () => {
  beforeEach(() => {
    mockInsert.mockReset();
    mockFrom.mockClear();
    mockCapture.mockReset();
  });

  test('submits a report with one target and coarse analytics', async () => {
    mockInsert.mockResolvedValue({ error: null });

    await reportContent({
      target: { kind: 'map_item', id: targetId, authorId },
      draft: { reason: 'spam_or_misleading', details: 'context' },
    });

    expect(mockFrom).toHaveBeenCalledWith('content_reports');
    expect(mockInsert).toHaveBeenCalledWith({
      map_item_id: targetId,
      reason: 'spam_or_misleading',
      details: 'context',
    });
    expect(mockCapture).toHaveBeenCalledWith({
      name: 'report_submitted',
      properties: { target: 'map_item' },
    });
  });

  test('inserts an opaque blocked user ID', async () => {
    mockInsert.mockResolvedValue({ error: null });
    await blockUser(authorId);
    expect(mockFrom).toHaveBeenCalledWith('user_blocks');
    expect(mockInsert).toHaveBeenCalledWith({ blocked_id: authorId });
  });

  test('normalizes a failed block without analytics', async () => {
    mockInsert.mockResolvedValue({ error: { status: 403 } });
    await expect(blockUser(authorId)).rejects.toMatchObject({ code: 'authorization' });
    expect(mockCapture).not.toHaveBeenCalled();
  });
});
