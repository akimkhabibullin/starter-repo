import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <View accessibilityLabel={label} accessibilityRole="progressbar" style={styles.container}>
      <ActivityIndicator color="#2563EB" size="large" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  label: { fontSize: 16, color: '#475569' },
});
