export function canConfirmAccountDeletion(value: string, pending: boolean): boolean {
  return value === 'DELETE' && !pending;
}
