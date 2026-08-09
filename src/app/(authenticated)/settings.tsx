import { useMutation, useQuery } from '@tanstack/react-query';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/screen';
import { signOut } from '@/features/auth/api';
import { useAuth } from '@/features/auth/auth-context';
import { deleteAccount, listBlockedUsers, unblockUser } from '@/features/settings/api';
import { canConfirmAccountDeletion } from '@/features/settings/deletion';
import { throwMonitoringDiagnostic } from '@/lib/monitoring';
import { queryClient } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';
import { normalizeApplicationError } from '@/lib/supabase/errors';

function displayValue(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value : 'Development build';
}

export default function SettingsScreen() {
  const { session } = useAuth();
  const [error, setError] = useState<string>();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const blocks = useQuery({
    queryKey: queryKeys.blocks,
    queryFn: listBlockedUsers,
  });

  const unblock = useMutation({
    mutationFn: unblockUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.blocks });
    },
    onError: (caught) => setError(normalizeApplicationError(caught).message),
  });

  const deletion = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => queryClient.clear(),
    onError: (caught) => setError(normalizeApplicationError(caught).message),
  });

  const handleSignOut = async () => {
    setError(undefined);
    try {
      await signOut();
      queryClient.clear();
    } catch (caught) {
      setError(normalizeApplicationError(caught).message);
    }
  };

  const metadataName = session?.user.user_metadata.name;
  const displayName = typeof metadataName === 'string' ? metadataName : 'Map Explorer';
  const deletionAllowed = canConfirmAccountDeletion(deleteConfirmation, deletion.isPending);

  return (
    <Screen
      title="Settings"
      description="Manage your account, blocked users, session, and local build details."
    >
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Profile
        </Text>
        <Text style={styles.primaryText}>{displayName}</Text>
        <Text style={styles.secondaryText}>{session?.user.email ?? 'Email unavailable'}</Text>
      </View>

      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Blocked users
        </Text>
        {blocks.isPending ? <Text style={styles.secondaryText}>Loading blocked users…</Text> : null}
        {blocks.isError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {normalizeApplicationError(blocks.error).message}
          </Text>
        ) : null}
        {blocks.data?.length === 0 ? (
          <Text style={styles.secondaryText}>You have not blocked anyone.</Text>
        ) : null}
        {blocks.data?.map((block) => (
          <View key={block.blocked_id} style={styles.blockRow}>
            <Text numberOfLines={1} style={styles.blockId}>
              {block.blocked_id}
            </Text>
            <Pressable
              accessibilityLabel={`Unblock user ${block.blocked_id}`}
              accessibilityRole="button"
              disabled={unblock.isPending}
              onPress={() => unblock.mutate(block.blocked_id)}
              style={styles.outlineButton}
            >
              <Text style={styles.outlineButtonText}>Unblock</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Build information
        </Text>
        <Text style={styles.secondaryText}>
          Version{' '}
          {displayValue(Application.nativeApplicationVersion ?? Constants.expoConfig?.version)}
        </Text>
        <Text style={styles.secondaryText}>
          Build {displayValue(Application.nativeBuildVersion)}
        </Text>
        <Text style={styles.secondaryText}>Channel {displayValue(Updates.channel)}</Text>
        <Text style={styles.secondaryText}>Runtime {displayValue(Updates.runtimeVersion)}</Text>
        <Text style={styles.secondaryText}>Update {displayValue(Updates.updateId)}</Text>
      </View>

      {__DEV__ ? (
        <Pressable
          accessibilityRole="button"
          onPress={throwMonitoringDiagnostic}
          style={styles.outlineButton}
          testID="monitoring-diagnostic"
        >
          <Text style={styles.outlineButtonText}>Trigger monitoring diagnostic</Text>
        </Pressable>
      ) : null}

      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => void handleSignOut()}
        style={styles.outlineButton}
        testID="settings-sign-out"
      >
        <Text style={styles.outlineButtonText}>Sign out</Text>
      </Pressable>

      <View style={styles.dangerCard}>
        <Text accessibilityRole="header" style={styles.dangerTitle}>
          Delete account
        </Text>
        <Text style={styles.secondaryText}>
          Permanently deletes your login and owned content. Shared content may disappear. This
          cannot be undone.
        </Text>
        {showDeleteConfirmation ? (
          <View style={styles.confirmation}>
            <Text style={styles.primaryText}>Type DELETE to confirm.</Text>
            <TextInput
              accessibilityLabel="Type DELETE to confirm account deletion"
              autoCapitalize="characters"
              onChangeText={setDeleteConfirmation}
              placeholder="DELETE"
              style={styles.input}
              testID="delete-account-confirmation"
              value={deleteConfirmation}
            />
            <Pressable
              accessibilityRole="button"
              disabled={!deletionAllowed}
              onPress={() => {
                setError(undefined);
                deletion.mutate();
              }}
              style={[styles.deleteButton, !deletionAllowed ? styles.disabled : null]}
              testID="confirm-delete-account"
            >
              <Text style={styles.deleteButtonText}>
                {deletion.isPending ? 'Deleting…' : 'Permanently delete account'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={deletion.isPending}
              onPress={() => {
                setShowDeleteConfirmation(false);
                setDeleteConfirmation('');
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.outlineButtonText}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowDeleteConfirmation(true)}
            style={styles.deleteButton}
            testID="delete-account"
          >
            <Text style={styles.deleteButtonText}>Delete account</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, padding: 20, borderRadius: 16, backgroundColor: '#FFFFFF' },
  dangerCard: {
    gap: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  dangerTitle: { fontSize: 20, fontWeight: '700', color: '#991B1B' },
  primaryText: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  secondaryText: { fontSize: 15, lineHeight: 22, color: '#475569' },
  blockRow: { gap: 10, paddingTop: 8 },
  blockId: { fontFamily: 'monospace', fontSize: 13, color: '#475569' },
  outlineButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
  },
  outlineButtonText: { fontSize: 16, fontWeight: '700', color: '#334155' },
  confirmation: { gap: 12 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#0F172A',
  },
  deleteButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#B91C1C',
    paddingHorizontal: 18,
  },
  deleteButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  cancelButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
  error: { fontSize: 15, color: '#B91C1C' },
});
