import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { Screen } from '@/components/screen';
import { signUpWithEmail } from '@/features/auth/api';
import { AuthCard, AuthError, SubmitButton } from '@/features/auth/components/auth-ui';
import { FormField } from '@/features/auth/components/form-field';
import { signUpSchema, type SignUp, type SignUpInput } from '@/features/auth/schemas';
import { normalizeApplicationError } from '@/lib/supabase/errors';

export default function SignUpScreen() {
  const [submitError, setSubmitError] = useState<string>();
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = useForm<SignUpInput, unknown, SignUp>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      const result = await signUpWithEmail(values);
      if (result.confirmationRequired) {
        router.replace({ pathname: '/confirm-email', params: { email: values.email } });
      }
    } catch (error) {
      setSubmitError(normalizeApplicationError(error).message);
    }
  });

  return (
    <Screen title="Create account" description="Start with a verified email and a strong password.">
      <AuthCard>
        <FormField control={control} label="Email" name="email" testID="sign-up-email" />
        <FormField
          control={control}
          label="Password"
          name="password"
          secureTextEntry
          testID="sign-up-password"
        />
        <FormField
          control={control}
          label="Confirm password"
          name="confirmPassword"
          secureTextEntry
          testID="sign-up-confirm-password"
        />
        <AuthError message={submitError} />
        <SubmitButton
          disabled={isSubmitting}
          label={isSubmitting ? 'Creating account…' : 'Create account'}
          onPress={() => void onSubmit()}
          testID="submit-sign-up"
        />
      </AuthCard>
      <Link href="/sign-in" style={styles.link}>
        Already have an account? Sign in
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: { paddingVertical: 8, textAlign: 'center', fontSize: 15, color: '#1D4ED8' },
});
