import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getClientEnv } from '@/config/env';
import { normalizeApplicationError } from '@/lib/supabase/errors';

import { signInWithGoogle } from '../api';
import { AuthError } from './auth-ui';

export function GoogleSignInButton() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const configured = Boolean(getClientEnv().appScheme);

  const handlePress = async () => {
    if (!configured || submitting) return;
    setSubmitting(true);
    setError(undefined);
    try {
      await signInWithGoogle();
    } catch (caught) {
      setError(normalizeApplicationError(caught).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        disabled={!configured || submitting}
        onPress={() => void handlePress()}
        style={[styles.button, !configured || submitting ? styles.disabled : null]}
        testID="google-sign-in"
      >
        <Text style={styles.text}>{submitting ? 'Opening Google…' : 'Continue with Google'}</Text>
      </Pressable>
      {!configured ? (
        <Text style={styles.note}>
          Google redirect sign-in is deferred with the custom app scheme.
        </Text>
      ) : null}
      <AuthError message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  disabled: { opacity: 0.55 },
  text: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  note: { fontSize: 13, lineHeight: 18, color: '#64748B' },
});
