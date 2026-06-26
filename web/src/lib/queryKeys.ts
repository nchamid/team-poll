/**
 * Centralised TanStack Query keys. All cache keys are defined here so
 * invalidation stays consistent and components never inline raw key arrays.
 */
export const queryKeys = {
  polls: {
    all: ['polls'] as const,
    lists: () => ['polls', 'list'] as const,
    list: (page: number, pageSize: number) => ['polls', 'list', { page, pageSize }] as const,
    detail: (id: number) => ['polls', 'detail', id] as const,
  },
};
