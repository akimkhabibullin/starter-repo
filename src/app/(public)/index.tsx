import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { getClientEnv } from '@/config/env';

export default function WelcomeScreen() {
  const env = getClientEnv();

  return (
    <Screen
      title={env.appName}
      description="A production-oriented collaborative map starter with typed data boundaries."
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Starter status</Text>
        <Text style={styles.body}>Public navigation and environment validation are active.</Text>
        <Link href="/home" asChild>
          <Pressable accessibilityRole="button" style={styles.button} testID="open-starter-home">
            <Text style={styles.buttonText}>Open starter home</Text>
          </Pressable>
        </Link>
        <Text style={styles.note}>
          Authentication protection replaces this development link in the authentication phase.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, padding: 20, borderRadius: 16, backgroundColor: '#FFFFFF' },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  body: { fontSize: 16, lineHeight: 24, color: '#334155' },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  note: { fontSize: 14, lineHeight: 20, color: '#64748B' },
});
