import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppErrorBoundary } from '@/components/app-error-boundary';
import { ConfigurationScreen } from '@/components/configuration-screen';
import { clientEnvResult, getClientEnvIssueFields } from '@/config/env';

export default function RootLayout() {
  if (!clientEnvResult.success) {
    return <ConfigurationScreen issueFields={getClientEnvIssueFields()} />;
  }

  return (
    <AppErrorBoundary>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
        <Stack.Screen name="(authenticated)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
      </Stack>
    </AppErrorBoundary>
  );
}
