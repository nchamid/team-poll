import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/ApiClientProvider';
import { buildUrl } from '@/lib/url';
import { queryKeys } from '@/lib/queryKeys';
import { trackEvent } from '@/lib/telemetry';
import { type CreatePollRequest, type CreatePollResponse } from '../types';

/** Creates a poll, then invalidates the list so the new poll appears on top. */
export function useCreatePoll() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePollRequest) =>
      api.request<CreatePollResponse>(buildUrl('/api/polls'), { method: 'POST', body }),
    onSuccess: (response) => {
      trackEvent('poll_created', { pollId: response.pollId });
      void queryClient.invalidateQueries({ queryKey: queryKeys.polls.all });
    },
  });
}
