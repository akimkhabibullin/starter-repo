import { credentialsSchema, signUpSchema } from '../schemas';
import { getAuthRouteState } from '../routing';

describe('authentication contracts', () => {
  test('normalizes email and accepts a bounded password', () => {
    expect(
      credentialsSchema.parse({ email: '  USER@Example.COM ', password: 'password123' }),
    ).toEqual({ email: 'user@example.com', password: 'password123' });
  });

  test('rejects mismatched sign-up passwords', () => {
    expect(
      signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      }).success,
    ).toBe(false);
  });

  test.each([
    [true, false, 'loading'],
    [false, false, 'public'],
    [false, true, 'authenticated'],
  ] as const)('selects %s/%s as %s', (restoring, hasSession, expected) => {
    expect(getAuthRouteState(restoring, hasSession)).toBe(expected);
  });
});
