import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { getClientEnv } from '@/config/env';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ApplicationError, normalizeApplicationError } from '@/lib/supabase/errors';

import type { Credentials, Email, ResetPassword, SignUp } from './schemas';

WebBrowser.maybeCompleteAuthSession();

function throwIfError(error: unknown): void {
  if (error) throw normalizeApplicationError(error);
}

function getRedirectUri(path: string): string {
  const env = getClientEnv();
  if (!env.appScheme) {
    throw new ApplicationError(
      'validation',
      'This redirect flow needs the custom app scheme that is currently deferred.',
      false,
    );
  }
  return makeRedirectUri({ scheme: env.appScheme, path });
}

function parseRedirectParameters(url: string): URLSearchParams {
  const parsed = new URL(url);
  const parameters = new URLSearchParams(parsed.search);
  const fragment = new URLSearchParams(parsed.hash.startsWith('#') ? parsed.hash.slice(1) : '');
  fragment.forEach((value, key) => parameters.set(key, value));
  return parameters;
}

export async function processAuthRedirect(url: string): Promise<void> {
  const parameters = parseRedirectParameters(url);
  const errorCode = parameters.get('error_code') ?? parameters.get('error');
  if (errorCode) {
    throw new ApplicationError(
      'authorization',
      'The authentication link is invalid or has expired.',
      false,
    );
  }

  const supabase = getSupabaseClient();
  const code = parameters.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    throwIfError(error);
    return;
  }

  const accessToken = parameters.get('access_token');
  const refreshToken = parameters.get('refresh_token');
  if (!accessToken || !refreshToken) return;

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  throwIfError(error);
}

export async function signInWithEmail(values: Credentials): Promise<void> {
  const { error } = await getSupabaseClient().auth.signInWithPassword(values);
  throwIfError(error);
}

export async function signUpWithEmail(values: SignUp): Promise<{ confirmationRequired: boolean }> {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email: values.email,
    password: values.password,
  });
  throwIfError(error);
  return { confirmationRequired: !data.session };
}

export async function resendConfirmation(values: Email): Promise<void> {
  const { error } = await getSupabaseClient().auth.resend({
    type: 'signup',
    email: values.email,
  });
  throwIfError(error);
}

export async function requestPasswordReset(values: Email): Promise<void> {
  const redirectTo = getRedirectUri('reset-password');
  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(values.email, {
    redirectTo,
  });
  throwIfError(error);
}

export async function updatePassword(values: ResetPassword): Promise<void> {
  const { error } = await getSupabaseClient().auth.updateUser({ password: values.password });
  throwIfError(error);
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut();
  throwIfError(error);
}

export type GoogleSignInResult = 'cancelled' | 'signed-in';

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const redirectTo = getRedirectUri('auth/callback');
  const { data, error } = await getSupabaseClient().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  throwIfError(error);
  if (!data.url) throw new ApplicationError('service', 'Google sign-in is unavailable.', false);

  const response = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (response.type !== 'success') return 'cancelled';

  await processAuthRedirect(response.url);
  return 'signed-in';
}
