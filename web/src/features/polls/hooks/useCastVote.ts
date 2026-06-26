import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/ApiClientProvider';
import { buildUrl } from '@/lib/url';
import { queryKeys } from '@/lib/queryKeys';
import { trackEvent } from '@/lib/telemetry';
import { type PollDetail, type CastVoteRequest } from '../types';

/**
 * Casts or changes the caller's vote (idempotent PUT). The API returns the
 * updated detail, which is written straight into the detail cache; the list is
 * invalidated so its total-votes meta refreshes.
 */
export function useCastVote(pollId: number) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CastVoteRequest) =>
      api.request<PollDetail>(buildUrl(`/api/polls/${pollId}/vote`), { method: 'PUT', body }),
    onSuccess: (detail) => {
      trackEvent('vote_cast', { pollId });
      // Write the fresh detail straight into cache (keeps the just-cast vote);
      // invalidate only the list queries so their total-votes meta refreshes.
      queryClient.setQueryData(queryKeys.polls.detail(pollId), detail);
      void queryClient.invalidateQueries({ queryKey: queryKeys.polls.lists() });
    },
  });
}
