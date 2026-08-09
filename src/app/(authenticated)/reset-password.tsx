import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Text } from 'react-native';

import { Screen } from '@/components/screen';
import { updatePassword } from '@/features/auth/api';
import { AuthCard, AuthError, SubmitButton } from '@/features/auth/components/auth-ui';
import { FormField } from '@/features/auth/components/form-field';
import {
  resetPasswordSchema,
  type ResetPassword,
  type ResetPasswordInput,
} from '@/features/auth/schemas';
import { normalizeApplicationError } from '@/lib/supabase/errors';

export default function ResetPasswordScreen() {
  const [submitError, setSubmitError] = useState<string>();
  const [updated, setUpdated] = useState(false);
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = useForm<ResetPasswordInput, unknown, ResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      await updatePassword(values);
      setUpdated(true);
    } catch (error) {
      setSubmitError(normalizeApplicationError(error).message);
    }
  });

  return (
    <Screen title="Choose a new password">
      <AuthCard>
        <FormField
          control={control}
          label="New password"
          name="password"
          secureTextEntry
          testID="reset-password"
        />
        <FormField
          control={control}
          label="Confirm new password"
          name="confirmPassword"
          secureTextEntry
          testID="reset-password-confirmation"
        />
        {updated ? <Text>Your password was updated.</Text> : null}
        <AuthError message={submitError} />
        <SubmitButton
          disabled={isSubmitting || updated}
          label={isSubmitting ? 'Updating…' : 'Update password'}
          onPress={() => void onSubmit()}
          testID="submit-reset-password"
        />
        {updated ? (
          <SubmitButton
            disabled={false}
            label="Continue to home"
            onPress={() => router.replace('/home')}
            testID="finish-reset-password"
          />
        ) : null}
      </AuthCard>
    </Screen>
  );
}
