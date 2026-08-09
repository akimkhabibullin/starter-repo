import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { signOut } from '@/features/auth/api';
import { normalizeApplicationError } from '@/lib/supabase/errors';
import { queryClient } from '@/lib/query/client';

export default function HomeScreen() {
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string>();

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setError(undefined);
    try {
      await signOut();
      queryClient.clear();
    } catch (caught) {
      setError(normalizeApplicationError(caught).message);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Screen
      title="Starter home"
      description="Feature foundations will appear here as each gated phase lands."
    >
      <View style={styles.card}>
        <Text style={styles.title}>Architecture ready</Text>
        <Text style={styles.body}>
          Your session is active. Map and moderation modules arrive in their gated phases.
        </Text>
        <Link href="/settings" asChild>
          <Pressable accessibilityRole="button" style={styles.button} testID="open-settings">
            <Text style={styles.buttonText}>Open settings</Text>
          </Pressable>
        </Link>
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={signingOut}
          onPress={() => void handleSignOut()}
          style={[styles.signOutButton, signingOut ? styles.disabled : null]}
          testID="sign-out"
        >
          <Text style={styles.signOutText}>{signingOut ? 'Signing out…' : 'Sign out'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, padding: 20, borderRadius: 16, backgroundColor: '#FFFFFF' },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  body: { fontSize: 16, lineHeight: 24, color: '#334155' },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  signOutButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  signOutText: { fontSize: 16, fontWeight: '600', color: '#334155' },
  disabled: { opacity: 0.55 },
  error: { color: '#B91C1C' },
});
