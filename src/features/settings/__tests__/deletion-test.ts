import { canConfirmAccountDeletion } from '../deletion';

describe('account deletion confirmation', () => {
  test.each([
    ['DELETE', false, true],
    ['delete', false, false],
    ['DELETE ', false, false],
    ['DELETE', true, false],
  ] as const)('evaluates %s/pending=%s as %s', (value, pending, expected) => {
    expect(canConfirmAccountDeletion(value, pending)).toBe(expected);
  });
});
