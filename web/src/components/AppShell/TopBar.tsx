import { List, CaretRight } from '@phosphor-icons/react';
import { McDermottSymbol } from '@/components/Lockup/McDermottSymbol';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar } from '@/components/Avatar';
import { useAccount } from '@/auth/useAccount';
import { useNavigation } from '@/store/navigation';
import styles from './TopBar.module.css';

interface TopBarProps {
  /** Current-page leaf for the breadcrumb (null on the list view). */
  breadcrumbLeaf: string | null;
  onOpenDrawer: () => void;
}

/**
 * Sticky top bar: hamburger (mobile only), breadcrumb (symbol › Polls › leaf),
 * theme toggle and avatar. Nothing wraps to a second line — the leaf truncates.
 */
export function TopBar({ breadcrumbLeaf, onOpenDrawer }: TopBarProps) {
  const { user } = useAccount();
  const { goList } = useNavigation();

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          type="button"
          aria-label="Open menu"
          className={styles.hamburger}
          onClick={onOpenDrawer}
        >
          <List size={22} weight="regular" aria-hidden="true" />
        </button>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <span className={styles.symbol} aria-hidden="true">
            <McDermottSymbol size={16} />
          </span>
          <CaretRight size={14} weight="regular" aria-hidden="true" className={styles.sep} />
          <button type="button" onClick={goList} className={styles.crumbLink}>
            Polls
          </button>
          {breadcrumbLeaf && (
            <>
              <CaretRight size={14} weight="regular" aria-hidden="true" className={styles.sep} />
              <span aria-current="page" className={styles.leaf}>
                {breadcrumbLeaf}
              </span>
            </>
          )}
        </nav>
      </div>
      <div className={styles.right}>
        <ThemeToggle />
        <Avatar name={user?.displayName ?? 'You'} size={32} />
      </div>
    </header>
  );
}
