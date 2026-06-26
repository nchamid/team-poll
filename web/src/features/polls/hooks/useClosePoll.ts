import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/ApiClientProvider';
import { buildUrl } from '@/lib/url';
import { queryKeys } from '@/lib/queryKeys';
import { trackEvent } from '@/lib/telemetry';

/** Closes a poll (owner/admin only). Refreshes the detail and the lists. */
export function useClosePoll(pollId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.request<void>(buildUrl(`/api/polls/${pollId}/close`), { method: 'POST' }),
    onSuccess: () => {
      trackEvent('poll_closed', { pollId });
      void queryClient.invalidateQueries({ queryKey: queryKeys.polls.detail(pollId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.polls.lists() });
    },
  });
}
