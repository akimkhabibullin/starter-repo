import { createNoopAnalyticsAdapter } from '../index';

describe('disabled analytics adapter', () => {
  test('accepts only coarse lifecycle events without recording state', () => {
    const adapter = createNoopAnalyticsAdapter();
    expect(() => {
      adapter.identify('11111111-1111-4111-8111-111111111111');
      adapter.capture({ name: 'map_item_created', properties: { kind: 'polygon' } });
      adapter.reset();
    }).not.toThrow();
    expect(Object.keys(adapter)).toHaveLength(0);
  });
});
