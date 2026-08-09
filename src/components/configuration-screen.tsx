import { StyleSheet, Text, View } from 'react-native';

type Props = { issueFields: readonly string[] };

export function ConfigurationScreen({ issueFields }: Props) {
  const showDetails = __DEV__ && issueFields.length > 0;

  return (
    <View accessibilityRole="alert" style={styles.container}>
      <Text style={styles.title}>App unavailable</Text>
      <Text style={styles.body}>
        {showDetails
          ? `Complete the local configuration for: ${issueFields.join(', ')}.`
          : 'The application configuration could not be loaded. Please try again later.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#0F172A' },
  body: { maxWidth: 480, fontSize: 16, lineHeight: 24, textAlign: 'center', color: '#475569' },
});
