import { parseClientEnv } from '../env';

const validEnvironment = {
  appEnv: 'development' as const,
  appName: 'Test app',
  supabaseUrl: 'https://example.supabase.co',
  supabasePublishableKey: `sb_publishable_${'x'.repeat(24)}`,
  googleWebClientId: 'web.apps.googleusercontent.com',
  googleIosClientId: 'ios.apps.googleusercontent.com',
  googleAndroidClientId: 'android.apps.googleusercontent.com',
  googleMapsAndroidApiKey: 'maps-key-that-is-long-enough',
  sentryDsn: 'https://public@example.ingest.sentry.io/1',
};

describe('client environment schema', () => {
  test('accepts a development configuration with deferred release fields', () => {
    expect(parseClientEnv(validEnvironment).success).toBe(true);
  });

  test('rejects malformed required service configuration', () => {
    const result = parseClientEnv({ ...validEnvironment, supabaseUrl: 'http://localhost:54321' });
    expect(result.success).toBe(false);
  });

  test('requires PostHog key and host as a pair', () => {
    const result = parseClientEnv({ ...validEnvironment, posthogApiKey: 'phc_test' });
    expect(result.success).toBe(false);
  });

  test('requires release and legal identity fields in production', () => {
    const result = parseClientEnv({ ...validEnvironment, appEnv: 'production' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(['appScheme', 'iosBundleIdentifier', 'privacyPolicyUrl']),
      );
    }
  });
});
