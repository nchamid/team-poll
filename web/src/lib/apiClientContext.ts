import { createContext, useContext } from 'react';
import { type ApiClient } from './apiClient';

/** Context holding the configured ApiClient. Split out so tests can supply a
 * stub client without depending on the MSAL-backed provider. */
export const ApiClientContext = createContext<ApiClient | null>(null);

export function useApiClient(): ApiClient {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error('useApiClient must be used within an ApiClientProvider');
  }
  return client;
}
