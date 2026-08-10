import { ApplicationError, normalizeApplicationError } from '../errors';

describe('application error normalization', () => {
  test('maps provider codes to safe user-facing errors', () => {
    expect(normalizeApplicationError({ code: 'invalid_credentials' })).toMatchObject({
      code: 'authorization',
      message: 'The email or password is incorrect.',
      retryable: false,
    });
  });

  test('maps transport failures to retryable network errors', () => {
    expect(normalizeApplicationError(new TypeError('secret host detail'))).toMatchObject({
      code: 'network',
      retryable: true,
    });
  });

  test('preserves an already normalized application error', () => {
    const error = new ApplicationError('validation', 'safe', false);
    expect(normalizeApplicationError(error)).toBe(error);
  });
});
