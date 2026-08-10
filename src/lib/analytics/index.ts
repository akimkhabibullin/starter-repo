export type AnalyticsEvent =
  | { name: 'sign_in_succeeded'; properties: { method: 'email' | 'google' } }
  | { name: 'account_deletion_succeeded'; properties: Record<string, never> }
  | { name: 'map_screen_viewed'; properties: Record<string, never> }
  | { name: 'map_item_created'; properties: { kind: 'point' | 'polygon' } }
  | { name: 'report_submitted'; properties: { target: 'map_item' | 'map_update' } };

export interface AnalyticsAdapter {
  capture(event: AnalyticsEvent): void;
  identify(userId: string): void;
  reset(): void;
}

class NoopAnalyticsAdapter implements AnalyticsAdapter {
  capture(_event: AnalyticsEvent): void {}

  identify(_userId: string): void {}

  reset(): void {}
}

export function createNoopAnalyticsAdapter(): AnalyticsAdapter {
  return new NoopAnalyticsAdapter();
}

export const analytics: AnalyticsAdapter = createNoopAnalyticsAdapter();
