import { getSupabaseClient } from '@/lib/supabase/client';
import { normalizeApplicationError } from '@/lib/supabase/errors';

import {
  type ReportDraft,
  reportDraftSchema,
  type ReportTarget,
  reportTargetSchema,
} from './schemas';

export async function reportContent(input: {
  target: ReportTarget;
  draft: ReportDraft;
}): Promise<void> {
  const target = reportTargetSchema.parse(input.target);
  const draft = reportDraftSchema.parse(input.draft);
  const targetColumns =
    target.kind === 'map_item' ? { map_item_id: target.id } : { map_update_id: target.id };
  const { error } = await getSupabaseClient()
    .from('content_reports')
    .insert({ ...targetColumns, reason: draft.reason, details: draft.details });

  if (error) throw normalizeApplicationError(error);
}

export async function blockUser(blockedId: string): Promise<void> {
  const target = reportTargetSchema.options[0].shape.authorId.parse(blockedId);
  const { error } = await getSupabaseClient().from('user_blocks').insert({ blocked_id: target });
  if (error) throw normalizeApplicationError(error);
}
