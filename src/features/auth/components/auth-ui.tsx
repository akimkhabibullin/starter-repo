import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function AuthCard({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

export function AuthError({ message }: { message: string | undefined }) {
  return message ? (
    <Text accessibilityRole="alert" style={styles.error}>
      {message}
    </Text>
  ) : null;
}

export function SubmitButton({
  disabled,
  label,
  onPress,
  testID,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled ? styles.buttonDisabled : null]}
      testID={testID}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16, borderRadius: 16, backgroundColor: '#FFFFFF', padding: 20 },
  error: { borderRadius: 8, backgroundColor: '#FEF2F2', padding: 12, color: '#991B1B' },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
  },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
