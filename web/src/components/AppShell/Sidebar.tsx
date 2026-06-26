import { ChartBarHorizontal, SignOut } from '@phosphor-icons/react';
import { Lockup } from '@/components/Lockup';
import { Avatar } from '@/components/Avatar';
import { IconButton } from '@/components/IconButton';
import { useAccount } from '@/auth/useAccount';
import { useNavigation } from '@/store/navigation';
import styles from './Sidebar.module.css';

/**
 * Navy sidebar: McDermott lockup, a single "Polls" nav item (the app's only
 * section), and a pinned user block with sign-out at the bottom. Rendered
 * persistently on desktop and inside the mobile drawer.
 */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAccount();
  const { goList } = useNavigation();

  function handlePolls(event: React.MouseEvent): void {
    event.preventDefault();
    goList();
    onNavigate?.();
  }

  return (
    <div className={styles.inner}>
      <div className={styles.top}>
        <Lockup name="Team Poll" surface="sidebar" />
        <nav aria-label="Sections" className={styles.nav}>
          <a href="#polls" onClick={handlePolls} aria-current="page" className={styles.navItem}>
            <ChartBarHorizontal size={20} weight="regular" aria-hidden="true" />
            <span>Polls</span>
          </a>
        </nav>
      </div>

      <div className={styles.userBlock}>
        <Avatar name={user?.displayName ?? 'You'} size={32} />
        <div className={styles.userMeta}>
          <span className={styles.userName}>{user?.displayName ?? 'You'}</span>
          <span className={styles.userRole}>Team member</span>
        </div>
        <IconButton icon={SignOut} label="Sign out" onClick={signOut} />
      </div>
    </div>
  );
}
