export const queryKeys = {
  session: ['session'] as const,
  profile: (userId: string) => ['profiles', userId] as const,
  mapItems: {
    all: ['map-items'] as const,
    viewport: (boundsKey: string) => ['map-items', 'viewport', boundsKey] as const,
    detail: (itemId: string) => ['map-items', 'detail', itemId] as const,
    updates: (itemId: string) => ['map-items', 'detail', itemId, 'updates'] as const,
  },
  blocks: ['user-blocks'] as const,
};
