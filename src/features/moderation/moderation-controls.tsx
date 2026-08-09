import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { queryClient } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';
import { normalizeApplicationError } from '@/lib/supabase/errors';

import { blockUser, reportContent } from './api';
import {
  type ReportDraft,
  type ReportReason,
  reportDraftSchema,
  type ReportTarget,
} from './schemas';

const REASONS: readonly { value: ReportReason; label: string }[] = [
  { value: 'abuse_or_harassment', label: 'Abuse or harassment' },
  { value: 'hate_or_discrimination', label: 'Hate or discrimination' },
  { value: 'sexual_content', label: 'Sexual content' },
  { value: 'violence_or_threats', label: 'Violence or threats' },
  { value: 'spam_or_misleading', label: 'Spam or misleading' },
  { value: 'other', label: 'Other' },
];

interface ReportFormProps {
  onCancel: () => void;
  onSubmitted: () => void;
  target: ReportTarget;
}

export function ReportForm({ onCancel, onSubmitted, target }: ReportFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<ReportDraft>({
    resolver: zodResolver(reportDraftSchema),
    defaultValues: { reason: 'abuse_or_harassment', details: '' },
  });

  const report = useMutation({
    mutationFn: (draft: ReportDraft) => reportContent({ target, draft }),
    onSuccess: onSubmitted,
  });

  return (
    <View style={styles.reportCard}>
      <Text accessibilityRole="header" style={styles.title}>
        Report content
      </Text>
      <Text style={styles.body}>
        Choose the closest reason. An authorized human must review submitted reports.
      </Text>
      <Controller
        control={control}
        name="reason"
        render={({ field: { onChange, value } }) => (
          <View accessibilityRole="radiogroup" style={styles.reasonList}>
            {REASONS.map((reason) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: value === reason.value }}
                key={reason.value}
                onPress={() => onChange(reason.value)}
                style={value === reason.value ? styles.selectedReason : styles.reason}
              >
                <Text
                  style={value === reason.value ? styles.selectedReasonText : styles.reasonText}
                >
                  {reason.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      />
      <Controller
        control={control}
        name="details"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            accessibilityLabel="Optional report details"
            maxLength={2000}
            multiline
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Optional details"
            style={styles.input}
            value={value}
          />
        )}
      />
      {errors.details ? <Text style={styles.error}>{errors.details.message}</Text> : null}
      {report.isError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {normalizeApplicationError(report.error).message}
        </Text>
      ) : null}
      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="button"
          disabled={report.isPending}
          onPress={() => void handleSubmit((draft) => report.mutate(draft))()}
          style={[styles.reportButton, report.isPending ? styles.disabled : null]}
        >
          <Text style={styles.reportButtonText}>
            {report.isPending ? 'Submitting…' : 'Submit report'}
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface BlockUserButtonProps {
  authorId: string;
  onBlocked: () => void;
}

export function BlockUserButton({ authorId, onBlocked }: BlockUserButtonProps) {
  const block = useMutation({
    mutationFn: blockUser,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.blocks }),
        queryClient.invalidateQueries({ queryKey: queryKeys.mapItems.all }),
      ]);
      onBlocked();
    },
  });

  return (
    <View style={styles.blockGroup}>
      <Pressable
        accessibilityRole="button"
        disabled={block.isPending}
        onPress={() => block.mutate(authorId)}
        style={[styles.blockButton, block.isPending ? styles.disabled : null]}
      >
        <Text style={styles.blockButtonText}>{block.isPending ? 'Blocking…' : 'Block user'}</Text>
      </Pressable>
      {block.isError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {normalizeApplicationError(block.error).message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  reportCard: {
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 14,
    backgroundColor: '#FFFBEB',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  body: { fontSize: 15, lineHeight: 22, color: '#475569' },
  reasonList: { gap: 8 },
  reason: {
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  selectedReason: {
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1D4ED8',
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 11,
  },
  reasonText: { fontSize: 15, color: '#334155' },
  selectedReasonText: { fontSize: 15, fontWeight: '700', color: '#1D4ED8' },
  input: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    fontSize: 16,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reportButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#B45309',
    paddingHorizontal: 16,
  },
  reportButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  cancelButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12 },
  cancelButtonText: { fontSize: 15, fontWeight: '700', color: '#334155' },
  blockGroup: { gap: 6 },
  blockButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B91C1C',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  blockButtonText: { fontSize: 15, fontWeight: '700', color: '#B91C1C' },
  disabled: { opacity: 0.5 },
  error: { fontSize: 14, lineHeight: 20, color: '#B91C1C' },
});
