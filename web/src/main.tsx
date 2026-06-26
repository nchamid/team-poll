import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PublicClientApplication, EventType, type AuthenticationResult } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { msalConfig } from '@/auth/msalConfig';
import { initTelemetry } from '@/lib/telemetry';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { App } from './App';

import './mws/tokens.css';
import './styles/global.css';

initTelemetry();

const msalInstance = new PublicClientApplication(msalConfig);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

async function bootstrap(): Promise<void> {
  await msalInstance.initialize();

  // Set the first account active so silent token acquisition has a target.
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  // Promote the account from a completed redirect login to active.
  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const result = event.payload as AuthenticationResult;
      msalInstance.setActiveAccount(result.account);
    }
  });

  await msalInstance.handleRedirectPromise();

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element #root not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <MsalProvider instance={msalInstance}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </MsalProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}

void bootstrap();
