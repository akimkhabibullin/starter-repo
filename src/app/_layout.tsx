import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppErrorBoundary } from '@/components/app-error-boundary';
import { AppProviders } from '@/components/app-providers';
import { ConfigurationScreen } from '@/components/configuration-screen';
import { LoadingScreen } from '@/components/loading-screen';
import { clientEnvResult, getClientEnvIssueFields } from '@/config/env';
import { useAuth } from '@/features/auth/auth-context';
import { wrapRootComponent } from '@/lib/monitoring';

function AppNavigator() {
  const { restoring, session } = useAuth();

  if (restoring) {
    return <LoadingScreen label="Restoring your session…" />;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(public)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={Boolean(session)}>
          <Stack.Screen name="(authenticated)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
      </Stack>
    </>
  );
}

function RootLayout() {
  if (!clientEnvResult.success) {
    return <ConfigurationScreen issueFields={getClientEnvIssueFields()} />;
  }

  return (
    <AppErrorBoundary>
      <AppProviders>
        <AppNavigator />
      </AppProviders>
    </AppErrorBoundary>
  );
}

export default wrapRootComponent(RootLayout);
