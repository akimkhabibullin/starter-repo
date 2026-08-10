import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { captureUnexpectedError } from '@/lib/monitoring';

type State = { failed: boolean };

export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, _info: ErrorInfo): void {
    captureUnexpectedError(error);
  }

  override render(): ReactNode {
    if (this.state.failed) {
      return (
        <View accessibilityRole="alert" style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>
            Close and reopen the app. If this continues, try again later.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
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
  body: { maxWidth: 420, fontSize: 16, lineHeight: 24, textAlign: 'center', color: '#475569' },
});
