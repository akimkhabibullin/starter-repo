import { z } from 'zod';

import { mapIdentifierSchema } from '@/features/map/schemas';

export const reportReasonSchema = z.enum([
  'abuse_or_harassment',
  'hate_or_discrimination',
  'sexual_content',
  'violence_or_threats',
  'spam_or_misleading',
  'other',
]);

export const reportDraftSchema = z.object({
  reason: reportReasonSchema,
  details: z.string().trim().max(2000),
});

export const reportTargetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('map_item'), id: mapIdentifierSchema, authorId: mapIdentifierSchema }),
  z.object({
    kind: z.literal('map_update'),
    id: mapIdentifierSchema,
    authorId: mapIdentifierSchema,
  }),
]);

export type ReportDraft = z.infer<typeof reportDraftSchema>;
export type ReportReason = z.infer<typeof reportReasonSchema>;
export type ReportTarget = z.infer<typeof reportTargetSchema>;
