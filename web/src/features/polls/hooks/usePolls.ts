import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/ApiClientProvider';
import { buildUrl } from '@/lib/url';
import { queryKeys } from '@/lib/queryKeys';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { type PollListResponse } from '../types';

/** Fetches the paginated poll list (open-first then closed, per the API). */
export function usePolls(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.polls.list(page, pageSize),
    queryFn: ({ signal }) =>
      api.request<PollListResponse>(buildUrl('/api/polls', { page, pageSize }), { signal }),
  });
}
