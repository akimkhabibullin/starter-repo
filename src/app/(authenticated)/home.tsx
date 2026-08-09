import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';

export default function HomeScreen() {
  return (
    <Screen
      title="Starter home"
      description="Feature foundations will appear here as each gated phase lands."
    >
      <View style={styles.card}>
        <Text style={styles.title}>Architecture ready</Text>
        <Text style={styles.body}>
          Server state, authentication, map, and moderation modules are pending.
        </Text>
        <Link href="/settings" asChild>
          <Pressable accessibilityRole="button" style={styles.button} testID="open-settings">
            <Text style={styles.buttonText}>Open settings</Text>
          </Pressable>
        </Link>
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
});
