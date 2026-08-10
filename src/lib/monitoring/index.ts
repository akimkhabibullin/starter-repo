import type { ComponentType } from 'react';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import * as Sentry from '@sentry/react-native';

import { clientEnvResult } from '@/config/env';
import { ApplicationError } from '@/lib/supabase/errors';
import {
  isSafeMonitoringBreadcrumbCategory,
  sanitizeMonitoringEvent,
  sanitizeMonitoringText,
} from './sanitize';

Sentry.init({
  dsn: clientEnvResult.success ? clientEnvResult.data.sentryDsn : undefined,
  environment: clientEnvResult.success ? clientEnvResult.data.appEnv : 'configuration-error',
  sendDefaultPii: false,
  enableLogs: false,
  attachScreenshot: false,
  attachViewHierarchy: false,
  tracesSampleRate: 0,
  beforeBreadcrumb(breadcrumb) {
    if (!isSafeMonitoringBreadcrumbCategory(breadcrumb.category)) {
      return null;
    }
    delete breadcrumb.data;
    const message = sanitizeMonitoringText(breadcrumb.message);
    if (message) breadcrumb.message = message;
    else delete breadcrumb.message;
    return breadcrumb;
  },
  beforeSend(event) {
    return sanitizeMonitoringEvent(event);
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
