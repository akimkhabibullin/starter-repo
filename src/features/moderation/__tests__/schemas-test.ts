import { reportDraftSchema, reportTargetSchema } from '../schemas';

const uuid = '11111111-1111-4111-8111-111111111111';

describe('moderation schemas', () => {
  test('accepts an allowlisted reason and trims bounded details', () => {
    expect(reportDraftSchema.parse({ reason: 'spam_or_misleading', details: ' context ' })).toEqual(
      {
        reason: 'spam_or_misleading',
        details: 'context',
      },
    );
  });

  test('requires exactly one recognized report target kind', () => {
    expect(
      reportTargetSchema.safeParse({ kind: 'profile', id: uuid, authorId: uuid }).success,
    ).toBe(false);
  });
});
