import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/screen';
import { requestPasswordReset } from '@/features/auth/api';
import { AuthCard, AuthError, SubmitButton } from '@/features/auth/components/auth-ui';
import { FormField } from '@/features/auth/components/form-field';
import { emailSchema, type Email, type EmailInput } from '@/features/auth/schemas';
import { getClientEnv } from '@/config/env';
import { normalizeApplicationError } from '@/lib/supabase/errors';

export default function ForgotPasswordScreen() {
  const configured = Boolean(getClientEnv().appScheme);
  const [submitError, setSubmitError] = useState<string>();
  const [sent, setSent] = useState(false);
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = useForm<EmailInput, unknown, Email>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      await requestPasswordReset(values);
      setSent(true);
    } catch (error) {
      setSubmitError(normalizeApplicationError(error).message);
    }
  });

  return (
    <Screen
      title="Reset password"
      description="Request a link without revealing whether an account exists."
    >
      <AuthCard>
        <FormField control={control} label="Email" name="email" testID="forgot-password-email" />
        {!configured ? (
          <Text style={styles.note}>
            Password-reset links are deferred with the custom app scheme.
          </Text>
        ) : null}
        {sent ? (
          <Text style={styles.success}>If the account exists, a reset message was sent.</Text>
        ) : null}
        <AuthError message={submitError} />
        <SubmitButton
          disabled={!configured || isSubmitting || sent}
          label={isSubmitting ? 'Requesting…' : 'Send reset link'}
          onPress={() => void onSubmit()}
          testID="submit-forgot-password"
        />
      </AuthCard>
      <Link href="/sign-in" style={styles.link}>
        Return to sign in
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 13, lineHeight: 18, color: '#64748B' },
  success: { color: '#166534' },
  link: { paddingVertical: 8, textAlign: 'center', fontSize: 15, color: '#1D4ED8' },
});
