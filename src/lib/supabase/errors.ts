export type ApplicationErrorCode =
  | 'authorization'
  | 'validation'
  | 'network'
  | 'service'
  | 'unknown';

export class ApplicationError extends Error {
  readonly code: ApplicationErrorCode;
  readonly retryable: boolean;

  constructor(code: ApplicationErrorCode, message: string, retryable: boolean, cause?: unknown) {
    super(message, { cause });
    this.name = 'ApplicationError';
    this.code = code;
    this.retryable = retryable;
  }
}

function readNumber(value: unknown, key: string): number | undefined {
  if (typeof value !== 'object' || value === null || !(key in value)) return undefined;
  const candidate = Reflect.get(value, key);
  return typeof candidate === 'number' ? candidate : undefined;
}

function readString(value: unknown, key: string): string | undefined {
  if (typeof value !== 'object' || value === null || !(key in value)) return undefined;
  const candidate = Reflect.get(value, key);
  return typeof candidate === 'string' ? candidate : undefined;
}

export function normalizeApplicationError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) return error;

  const status = readNumber(error, 'status');
  const code = readString(error, 'code');

  if (code === 'invalid_credentials') {
    return new ApplicationError(
      'authorization',
      'The email or password is incorrect.',
      false,
      error,
    );
  }

  if (code === 'email_not_confirmed') {
    return new ApplicationError(
      'authorization',
      'Confirm your email before signing in.',
      false,
      error,
    );
  }

  if (
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    status === 429
  ) {
    return new ApplicationError(
      'service',
      'Too many attempts. Wait a moment before trying again.',
      false,
      error,
    );
  }
  if (status === 401 || status === 403) {
    return new ApplicationError(
      'authorization',
      'You are not authorized to perform that action.',
      false,
      error,
    );
  }

  if (status === 400 || status === 409 || status === 422) {
    return new ApplicationError('validation', 'The submitted data is not valid.', false, error);
  }

  if (error instanceof TypeError) {
    return new ApplicationError(
      'network',
      'The service could not be reached. Check your connection and try again.',
      true,
      error,
    );
  }

  if (status !== undefined && status >= 500) {
    return new ApplicationError(
      'service',
      'The service is temporarily unavailable. Try again shortly.',
      true,
      error,
    );
  }

  return new ApplicationError('unknown', 'Something went wrong. Please try again.', false, error);
}
