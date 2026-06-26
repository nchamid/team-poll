import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/ApiClientProvider';
import { buildUrl } from '@/lib/url';
import { queryKeys } from '@/lib/queryKeys';
import { type PollDetail } from '../types';

/** Fetches a single poll's detail (vote state + gated results). */
export function usePoll(pollId: number) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.polls.detail(pollId),
    queryFn: ({ signal }) => api.request<PollDetail>(buildUrl(`/api/polls/${pollId}`), { signal }),
  });
}
