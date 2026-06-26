import { useMemo, type ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { apiScopes, loginRequest } from '@/auth/msalConfig';
import { createApiClient } from './apiClient';
import { ApiClientContext } from './apiClientContext';

/**
 * Provides an ApiClient whose token getter acquires a bearer token silently for
 * the API scope, falling back to an interactive redirect when the silent flow
 * requires interaction (stale cache / consent). Tokens are never logged or
 * persisted outside MSAL's sessionStorage cache.
 */
export function ApiClientProvider({ children }: { children: ReactNode }) {
  const { instance } = useMsal();

  const client = useMemo(
    () =>
      createApiClient(async () => {
        const account = instance.getActiveAccount() ?? instance.getAllAccounts()[0] ?? null;
        if (!account) {
          return null;
        }
        try {
          const result = await instance.acquireTokenSilent({ scopes: apiScopes, account });
          return result.accessToken;
        } catch (error) {
          if (error instanceof InteractionRequiredAuthError) {
            await instance.acquireTokenRedirect(loginRequest);
          }
          return null;
        }
      }),
    [instance],
  );

  return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>;
}

export { useApiClient } from './apiClientContext';
