import { z } from 'zod';

const unsetValues = new Set(['', 'REPLACE_ME', 'REPLACE_ME_AFTER_EAS_INIT']);

const optionalConfiguredString = z.preprocess((value) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (unsetValues.has(trimmed) || trimmed.includes('REPLACE_ME')) return undefined;
  return trimmed;
}, z.string().min(1).optional());

const optionalHttpsUrl = optionalConfiguredString.pipe(z.url().startsWith('https://').optional());

const clientEnvSchema = z
  .object({
    appEnv: z.enum(['development', 'preview', 'production']).default('development'),
    appName: z.preprocess(
      (value) => (typeof value === 'string' && value.includes('REPLACE_ME') ? undefined : value),
      z.string().trim().min(1).max(80).default('Map Starter'),
    ),
    appScheme: optionalConfiguredString,
    iosBundleIdentifier: optionalConfiguredString,
    androidPackage: optionalConfiguredString,
    privacyPolicyUrl: optionalHttpsUrl,
    termsUrl: optionalHttpsUrl,
    supportUrl: optionalHttpsUrl,
    supportEmail: optionalConfiguredString.pipe(z.email().optional()),
    supabaseUrl: z.url().startsWith('https://'),
    supabasePublishableKey: z.string().startsWith('sb_publishable_').min(24),
    googleWebClientId: z.string().endsWith('.apps.googleusercontent.com'),
    googleIosClientId: z.string().endsWith('.apps.googleusercontent.com'),
    googleAndroidClientId: z.string().endsWith('.apps.googleusercontent.com'),
    googleMapsAndroidApiKey: z.string().min(20),
    sentryDsn: z.url().startsWith('https://'),
    posthogApiKey: optionalConfiguredString,
    posthogHost: optionalHttpsUrl,
  })
  .superRefine((value, context) => {
    if (Boolean(value.posthogApiKey) !== Boolean(value.posthogHost)) {
      context.addIssue({
        code: 'custom',
        message: 'PostHog API key and host must both be configured or both be empty.',
        path: ['posthogApiKey'],
      });
    }

    if (value.appEnv === 'production') {
      const releaseFields = [
        ['appScheme', value.appScheme],
        ['iosBundleIdentifier', value.iosBundleIdentifier],
        ['androidPackage', value.androidPackage],
        ['privacyPolicyUrl', value.privacyPolicyUrl],
        ['termsUrl', value.termsUrl],
        ['supportUrl', value.supportUrl],
        ['supportEmail', value.supportEmail],
      ] as const;

      for (const [field, configured] of releaseFields) {
        if (!configured) {
          context.addIssue({
            code: 'custom',
            message: `${field} is required in production.`,
            path: [field],
          });
        }
      }
    }
  });

const rawClientEnv = {
  appEnv: process.env.EXPO_PUBLIC_APP_ENV,
  appName: process.env.EXPO_PUBLIC_APP_NAME,
  appScheme: process.env.EXPO_PUBLIC_APP_SCHEME,
  iosBundleIdentifier: process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER,
  androidPackage: process.env.EXPO_PUBLIC_ANDROID_PACKAGE,
  privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL,
  termsUrl: process.env.EXPO_PUBLIC_TERMS_URL,
  supportUrl: process.env.EXPO_PUBLIC_SUPPORT_URL,
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL,
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  googleMapsAndroidApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY,
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  posthogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
  posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
};

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export const clientEnvResult = clientEnvSchema.safeParse(rawClientEnv);

export function getClientEnv(): ClientEnv {
  if (!clientEnvResult.success) {
    throw new Error('Client configuration is invalid.');
  }
  return clientEnvResult.data;
}

export function getClientEnvIssueFields(): readonly string[] {
  if (clientEnvResult.success) return [];
  return [...new Set(clientEnvResult.error.issues.map((issue) => issue.path.join('.')))].sort();
}
