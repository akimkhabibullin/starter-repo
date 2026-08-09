import type { ComponentType } from 'react';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import * as Sentry from '@sentry/react-native';

import { clientEnvResult } from '@/config/env';
import { ApplicationError } from '@/lib/supabase/errors';

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

function sanitizeText(value: string | undefined): string | undefined {
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

Sentry.init({
  dsn: clientEnvResult.success ? clientEnvResult.data.sentryDsn : undefined,
  environment: clientEnvResult.success ? clientEnvResult.data.appEnv : 'configuration-error',
  sendDefaultPii: false,
  enableLogs: false,
  attachScreenshot: false,
  attachViewHierarchy: false,
  tracesSampleRate: 0,
  beforeBreadcrumb(breadcrumb) {
    if (!SAFE_BREADCRUMB_PREFIXES.some((prefix) => breadcrumb.category?.startsWith(prefix))) {
      return null;
    }
    delete breadcrumb.data;
    const message = sanitizeText(breadcrumb.message);
    if (message) breadcrumb.message = message;
    else delete breadcrumb.message;
    return breadcrumb;
  },
  beforeSend(event) {
    delete event.request;
    delete event.extra;
    delete event.server_name;

    const message = sanitizeText(event.message);
    if (message) event.message = message;
    else delete event.message;

    const logMessage = sanitizeText(event.logentry?.message);
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
        const breadcrumbMessage = sanitizeText(breadcrumb.message);
        if (breadcrumbMessage) breadcrumb.message = breadcrumbMessage;
        else delete breadcrumb.message;
      });
    }
    event.exception?.values?.forEach((exception) => {
      const exceptionValue = sanitizeText(exception.value);
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
  },
});

function setTagIfPresent(key: string, value: string | number | null | undefined): void {
  if (value === null || value === undefined || String(value).length === 0) return;
  Sentry.setTag(key, String(value));
}

setTagIfPresent('expo-update-id', Updates.updateId);
setTagIfPresent('expo-is-embedded-update', String(Updates.isEmbeddedLaunch));
setTagIfPresent('expo-channel', Updates.channel);
setTagIfPresent('expo-runtime-version', Updates.runtimeVersion);
setTagIfPresent('app-version', Application.nativeApplicationVersion);
setTagIfPresent('build-version', Application.nativeBuildVersion);

export function setMonitoringUser(userId: string | undefined): void {
  Sentry.setUser(userId ? { id: userId } : null);
}

export function captureUnexpectedError(error: unknown): void {
  if (
    error instanceof ApplicationError &&
    (error.code === 'authorization' || error.code === 'validation' || error.code === 'network')
  ) {
    return;
  }
  Sentry.captureException(
    error instanceof Error ? error : new Error('Unexpected application error'),
  );
}

export function throwMonitoringDiagnostic(): never {
  throw new Error('Development monitoring diagnostic');
}

export const wrapRootComponent: <P extends Record<string, unknown>>(
  component: ComponentType<P>,
) => ComponentType<P> = Sentry.wrap;
