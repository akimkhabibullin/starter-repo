import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/screen';
import { resendConfirmation } from '@/features/auth/api';
import { AuthCard, AuthError, SubmitButton } from '@/features/auth/components/auth-ui';
import { FormField } from '@/features/auth/components/form-field';
import { emailSchema, type Email, type EmailInput } from '@/features/auth/schemas';
import { normalizeApplicationError } from '@/lib/supabase/errors';

export default function ConfirmEmailScreen() {
  const parameters = useLocalSearchParams<{ email?: string }>();
  const [submitError, setSubmitError] = useState<string>();
  const [sent, setSent] = useState(false);
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = useForm<EmailInput, unknown, Email>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: parameters.email ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    setSent(false);
    try {
      await resendConfirmation(values);
      setSent(true);
    } catch (error) {
      setSubmitError(normalizeApplicationError(error).message);
    }
  });

  return (
    <Screen title="Check your email" description="Open the confirmation message before signing in.">
      <AuthCard>
        <FormField control={control} label="Email" name="email" testID="confirmation-email" />
        {sent ? (
          <Text style={styles.success}>A new confirmation message was requested.</Text>
        ) : null}
        <AuthError message={submitError} />
        <SubmitButton
          disabled={isSubmitting}
          label={isSubmitting ? 'Sending…' : 'Resend confirmation'}
          onPress={() => void onSubmit()}
          testID="resend-confirmation"
        />
      </AuthCard>
      <Link href="/sign-in" style={styles.link}>
        Return to sign in
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  success: { color: '#166534' },
  link: { paddingVertical: 8, textAlign: 'center', fontSize: 15, color: '#1D4ED8' },
});
