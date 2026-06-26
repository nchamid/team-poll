import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/ApiClientProvider';
import { buildUrl } from '@/lib/url';
import { queryKeys } from '@/lib/queryKeys';
import { trackEvent } from '@/lib/telemetry';

/** Soft-deletes a poll (owner/admin only). Removes it from the lists. */
export function useDeletePoll(pollId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.request<void>(buildUrl(`/api/polls/${pollId}`), { method: 'DELETE' }),
    onSuccess: () => {
      trackEvent('poll_deleted', { pollId });
      queryClient.removeQueries({ queryKey: queryKeys.polls.detail(pollId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.polls.lists() });
    },
  });
}
