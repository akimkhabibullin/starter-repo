import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/screen';

export default function NotFoundScreen() {
  return (
    <Screen title="Page not found" description="The requested starter route does not exist.">
      <Link href="/" style={styles.link}>
        <Text>Return to start</Text>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: { minHeight: 48, paddingVertical: 14, fontSize: 16, fontWeight: '700', color: '#2563EB' },
});
