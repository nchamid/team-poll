import { SignIn } from '@phosphor-icons/react';
import { Lockup } from '@/components/Lockup';
import { Button } from '@/components/Button';
import { useAccount } from '@/auth/useAccount';
import styles from './SignInPage.module.css';

/**
 * S1 — Sign in. Shown by UnauthenticatedTemplate. A centered McDermott lockup
 * and a single Sign in button that triggers the Entra redirect. No bespoke
 * fields; user provisioning happens server-side on the first API call.
 */
export function SignInPage() {
  const { signIn } = useAccount();
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Lockup name="Team Poll" surface="light" />
        <h1 className={styles.title}>Sign in to continue</h1>
        <p className={styles.body}>
          Team Poll uses your firm account. Sign in to create polls and vote with your team.
        </p>
        <Button icon={SignIn} onClick={signIn}>
          Sign in
        </Button>
      </div>
    </main>
  );
}
