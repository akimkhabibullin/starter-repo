import { ApplicationError, normalizeApplicationError } from '@/lib/supabase/errors';
import { analytics } from '@/lib/analytics';
import { getSupabaseClient } from '@/lib/supabase/client';

export interface BlockedUser {
  blocked_id: string;
  created_at: string;
}

export async function listBlockedUsers(): Promise<BlockedUser[]> {
  const { data, error } = await getSupabaseClient()
    .from('user_blocks')
    .select('blocked_id, created_at')
    .order('created_at', { ascending: false });

  if (error) throw normalizeApplicationError(error);
  return data;
}

export async function unblockUser(blockedId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('user_blocks')
    .delete()
    .eq('blocked_id', blockedId);

  if (error) throw normalizeApplicationError(error);
}

export async function deleteAccount(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });

  if (error) {
    const status =
      typeof error.context === 'object' &&
      error.context !== null &&
      'status' in error.context &&
      typeof error.context.status === 'number'
        ? error.context.status
        : undefined;

    if (status === 409) {
      throw new ApplicationError(
        'authorization',
        'Deletion is unavailable for this linked sign-in provider until its reauthorization setup is completed.',
        false,
        error,
      );
    }
    throw normalizeApplicationError(error);
  }

  analytics.capture({ name: 'account_deletion_succeeded', properties: {} });
  const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
  if (signOutError) throw normalizeApplicationError(signOutError);
}
