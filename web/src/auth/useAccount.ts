import { useMsal } from '@azure/msal-react';
import { loginRequest } from './msalConfig';

export interface SignedInUser {
  displayName: string;
  username: string;
}

/**
 * Reads the active (or first) signed-in account and exposes sign-in/out.
 * The display name comes from the token `name` claim; never logged.
 */
export function useAccount() {
  const { instance, accounts } = useMsal();
  const account = instance.getActiveAccount() ?? accounts[0] ?? null;

  const user: SignedInUser | null = account
    ? { displayName: account.name ?? account.username, username: account.username }
    : null;

  function signIn(): void {
    void instance.loginRedirect(loginRequest);
  }

  function signOut(): void {
    void instance.logoutRedirect({ account: account ?? undefined });
  }

  return { account, user, signIn, signOut };
}
