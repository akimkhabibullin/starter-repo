import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { signInWithEmail } from '@/features/auth/api';
import { AuthCard, AuthError, SubmitButton } from '@/features/auth/components/auth-ui';
import { FormField } from '@/features/auth/components/form-field';
import { GoogleSignInButton } from '@/features/auth/components/google-sign-in-button';
import {
  credentialsSchema,
  type Credentials,
  type CredentialsInput,
} from '@/features/auth/schemas';
import { normalizeApplicationError } from '@/lib/supabase/errors';

export default function SignInScreen() {
  const [submitError, setSubmitError] = useState<string>();
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = useForm<CredentialsInput, unknown, Credentials>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      await signInWithEmail(values);
    } catch (error) {
      setSubmitError(normalizeApplicationError(error).message);
    }
  });

  return (
    <Screen title="Sign in" description="Use your email and password to continue.">
      <AuthCard>
        <FormField control={control} label="Email" name="email" testID="sign-in-email" />
        <FormField
          control={control}
          label="Password"
          name="password"
          secureTextEntry
          testID="sign-in-password"
        />
        <AuthError message={submitError} />
        <SubmitButton
          disabled={isSubmitting}
          label={isSubmitting ? 'Signing in…' : 'Sign in'}
          onPress={() => void onSubmit()}
          testID="submit-sign-in"
        />
        <Link href="/forgot-password" style={styles.link}>
          Forgot password?
        </Link>
      </AuthCard>
      <View style={styles.providerSection}>
        <Text style={styles.divider}>Or</Text>
        <GoogleSignInButton />
      </View>
      <Link href="/sign-up" style={styles.link}>
        Need an account? Sign up
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: { paddingVertical: 8, textAlign: 'center', fontSize: 15, color: '#1D4ED8' },
  providerSection: { gap: 12 },
  divider: { textAlign: 'center', color: '#64748B' },
});
