/**
 * Entry point for the static GitHub Pages demo build (VITE_DEMO_MODE=true).
 * It renders the real app shell and views against an in-memory mock API with
 * synthetic data — no Entra sign-in, no network. main.tsx dynamically imports
 * this only when the demo flag is set, so the production bundle excludes it.
 *
 * An offline MSAL instance is provided purely so the shared `useAccount` hook
 * (which reads MSAL context) resolves to a signed-out state; the demo never
 * triggers a token request, so nothing here contacts the network.
 */
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  PublicClientApplication,
  LogLevel,
  type Configuration,
  type IPublicClientApplication,
} from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ApiClientContext } from '@/lib/apiClientContext';
import { NavigationProvider } from '@/store/navigation';
import { AppContent } from '@/App';
import { createMockApiClient } from './mockApiClient';
import { DemoBanner } from './DemoBanner';

export const demoMsalConfig: Configuration = {
  auth: {
    // A syntactically valid but unused client id — the demo never signs in.
    clientId: '00000000-0000-0000-0000-000000000000',
  },
  cache: { cacheLocation: 'sessionStorage' },
  system: {
    loggerOptions: { logLevel: LogLevel.Error, piiLoggingEnabled: false, loggerCallback: () => {} },
  },
};

/**
 * The demo provider tree: the real AppContent view-switcher wired to an
 * in-memory mock API, behind an (inert) MSAL provider so `useAccount` resolves.
 * Exported so it can be rendered directly in tests with an injected instance.
 */
export function DemoRoot({ instance }: { instance: IPublicClientApplication }) {
  // Build the query client and mock API client once per mount.
  const [queryClient] = useState(
    () =>
      new QueryClient({ defaultOptions: { queries: { retry: 0, refetchOnWindowFocus: false } } }),
  );
  const [apiClient] = useState(() => createMockApiClient());

  return (
    <ErrorBoundary>
      <MsalProvider instance={instance}>
        <QueryClientProvider client={queryClient}>
          <ApiClientContext.Provider value={apiClient}>
            <NavigationProvider>
              <AppContent />
              <DemoBanner />
            </NavigationProvider>
          </ApiClientContext.Provider>
        </QueryClientProvider>
      </MsalProvider>
    </ErrorBoundary>
  );
}

export async function bootstrapDemo(): Promise<void> {
  document.title = 'Team Poll — Demo';

  const instance = new PublicClientApplication(demoMsalConfig);
  await instance.initialize();

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element #root not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <DemoRoot instance={instance} />
    </StrictMode>,
  );
}
