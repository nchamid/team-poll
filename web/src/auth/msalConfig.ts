import {
  type Configuration,
  type PopupRequest,
  type RedirectRequest,
  LogLevel,
} from '@azure/msal-browser';

/**
 * MSAL configuration. All values come from VITE_* environment variables —
 * never hardcoded (api-client-auth.md). The token cache lives in
 * sessionStorage (clears on tab close; not shared across tabs) — never
 * localStorage, which would leave refresh tokens reachable from any
 * same-origin script.
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
  system: {
    loggerOptions: {
      // MSAL must never log PII or tokens.
      logLevel: LogLevel.Warning,
      piiLoggingEnabled: false,
      loggerCallback: () => {},
    },
  },
};

/** The API scope the SPA requests so the bearer token is accepted by the API. */
export const apiScopes: string[] = [import.meta.env.VITE_API_SCOPE];

/** Interactive sign-in request — requests the API scope up front. */
export const loginRequest: RedirectRequest & PopupRequest = {
  scopes: apiScopes,
};
