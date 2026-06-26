import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiClientContext } from '@/lib/apiClientContext';
import { type ApiClient } from '@/lib/apiClient';
import { NavigationProvider } from '@/store/navigation';

/** A stub ApiClient whose `request` is a vi.fn the test controls. */
export function createMockApiClient(
  request: ApiClient['request'] = (() => Promise.resolve(undefined)) as ApiClient['request'],
): ApiClient {
  return { request };
}

interface ProvidersProps {
  children: ReactNode;
  apiClient?: ApiClient;
  withNavigation?: boolean;
}

/** Wraps a tree in a fresh QueryClient, the stub ApiClient, and (optionally)
 * the navigation provider — the standard provider set for feature tests. */
export function TestProviders({ children, apiClient, withNavigation = true }: ProvidersProps) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const client = apiClient ?? createMockApiClient();
  const content = withNavigation ? <NavigationProvider>{children}</NavigationProvider> : children;
  return (
    <QueryClientProvider client={queryClient}>
      <ApiClientContext.Provider value={client}>{content}</ApiClientContext.Provider>
    </QueryClientProvider>
  );
}

interface RenderOptions {
  apiClient?: ApiClient;
  withNavigation?: boolean;
}

/** Render a component with the standard provider set. */
export function renderWithProviders(ui: ReactElement, options: RenderOptions = {}): RenderResult {
  return render(
    <TestProviders apiClient={options.apiClient} withNavigation={options.withNavigation}>
      {ui}
    </TestProviders>,
  );
}
