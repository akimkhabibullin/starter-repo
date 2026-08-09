import { shouldRetry } from '../client';
import { queryKeys } from '../keys';
import { ApplicationError } from '../../supabase/errors';

describe('Query contracts', () => {
  test('builds stable hierarchical keys', () => {
    expect(queryKeys.mapItems.updates('item-1')).toEqual([
      'map-items',
      'detail',
      'item-1',
      'updates',
    ]);
    expect(queryKeys.mapItems.viewport('bounds')).toEqual(['map-items', 'viewport', 'bounds']);
  });

  test('retries retryable failures at most twice', () => {
    const error = new ApplicationError('network', 'offline', true);
    expect(shouldRetry(0, error)).toBe(true);
    expect(shouldRetry(1, error)).toBe(true);
    expect(shouldRetry(2, error)).toBe(false);
  });

  test('does not retry authorization failures', () => {
    expect(shouldRetry(0, { status: 401 })).toBe(false);
  });
});
