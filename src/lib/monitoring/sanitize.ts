import type { Event } from '@sentry/react-native';

const SAFE_BREADCRUMB_PREFIXES = ['app.lifecycle', 'device.event', 'navigation'];
const SAFE_CONTEXT_KEYS = ['app', 'os', 'runtime'];
const SAFE_TAG_KEYS = new Set([
  'app-version',
  'build-version',
  'expo-channel',
  'expo-is-embedded-update',
  'expo-runtime-version',
  'expo-update-id',
]);

export function sanitizeMonitoringText(value: string | undefined): string | undefined {
  if (!value) return value;
  return value
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/gu, '[redacted-email]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/gu, '[redacted-token]')
    .replace(
      /([?&](?:code|token|access_token|refresh_token|authorization_code)=)[^&\s]+/giu,
      '$1[redacted]',
    )
    .replace(/-?\d{1,3}\.\d{4,}\s*[,/]\s*-?\d{1,3}\.\d{4,}/gu, '[redacted-coordinates]')
    .slice(0, 500);
}

export function sanitizeMonitoringEvent<T extends Event>(event: T): T {
  delete event.request;
  delete event.extra;
  delete event.server_name;

  const message = sanitizeMonitoringText(event.message);
  if (message) event.message = message;
  else delete event.message;

  const logMessage = sanitizeMonitoringText(event.logentry?.message);
  if (logMessage) event.logentry = { message: logMessage };
  else delete event.logentry;

  if (event.user?.id) event.user = { id: String(event.user.id) };
  else delete event.user;

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.filter((breadcrumb) =>
      SAFE_BREADCRUMB_PREFIXES.some((prefix) => breadcrumb.category?.startsWith(prefix)),
    );
    event.breadcrumbs.forEach((breadcrumb) => {
      delete breadcrumb.data;
      const breadcrumbMessage = sanitizeMonitoringText(breadcrumb.message);
      if (breadcrumbMessage) breadcrumb.message = breadcrumbMessage;
      else delete breadcrumb.message;
    });
  }
  event.exception?.values?.forEach((exception) => {
    const exceptionValue = sanitizeMonitoringText(exception.value);
    if (exceptionValue) exception.value = exceptionValue;
    else delete exception.value;
  });

  if (event.contexts) {
    event.contexts = Object.fromEntries(
      Object.entries(event.contexts).filter(([key]) => SAFE_CONTEXT_KEYS.includes(key)),
    );
  }
  if (event.tags) {
    event.tags = Object.fromEntries(
      Object.entries(event.tags).filter(([key]) => SAFE_TAG_KEYS.has(key)),
    );
  }
  return event;
}

export function isSafeMonitoringBreadcrumbCategory(category: string | undefined): boolean {
  return SAFE_BREADCRUMB_PREFIXES.some((prefix) => category?.startsWith(prefix));
}
