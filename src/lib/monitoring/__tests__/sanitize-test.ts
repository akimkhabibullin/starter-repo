import { sanitizeMonitoringEvent, sanitizeMonitoringText } from '../sanitize';

describe('monitoring redaction', () => {
  test('redacts emails, JWTs, query secrets, and coordinate pairs', () => {
    const input =
      'user@example.com eyJheader.payload.signature ?access_token=secret 37.7749,-122.4194';
    expect(sanitizeMonitoringText(input)).toBe(
      '[redacted-email] [redacted-token] ?access_token=[redacted] [redacted-coordinates]',
    );
  });

  test('removes sensitive event fields and non-allowlisted metadata', () => {
    const event = sanitizeMonitoringEvent({
      message: 'contact user@example.com',
      request: { url: 'https://example.com?token=secret' },
      extra: { secret: 'value' },
      server_name: 'private-host',
      user: { id: 'opaque-id', email: 'user@example.com', ip_address: '127.0.0.1' },
      tags: { 'app-version': '1.0.0', secret: 'nope' },
      contexts: { app: { app_name: 'starter' }, private: { token: 'nope' } },
      breadcrumbs: [
        { category: 'navigation', message: 'user@example.com', data: { secret: true } },
        { category: 'http', message: 'https://private.example' },
      ],
    });

    expect(event.request).toBeUndefined();
    expect(event.extra).toBeUndefined();
    expect(event.user).toEqual({ id: 'opaque-id' });
    expect(event.tags).toEqual({ 'app-version': '1.0.0' });
    expect(event.contexts).toEqual({ app: { app_name: 'starter' } });
    expect(event.breadcrumbs).toEqual([{ category: 'navigation', message: '[redacted-email]' }]);
  });
});
