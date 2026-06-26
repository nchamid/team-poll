import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import styles from './AppShell.module.css';

interface AppShellProps {
  breadcrumbLeaf: string | null;
  children: ReactNode;
}

/**
 * The persistent app frame: navy sidebar (persistent ≥1024px, slide-in drawer
 * below), sticky top bar, and a max-1200px main column. The drawer closes on
 * Escape, scrim click, and nav-link click; focus returns to the hamburger.
 */
export function AppShell({ breadcrumbLeaf, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hamburgerWasTrigger = useRef(false);

  const openDrawer = useCallback(() => {
    hamburgerWasTrigger.current = true;
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    if (hamburgerWasTrigger.current) {
      // Return focus to the hamburger that opened the drawer.
      const hamburger = document.querySelector<HTMLButtonElement>('[aria-label="Open menu"]');
      hamburger?.focus();
      hamburgerWasTrigger.current = false;
    }
  }, []);

  // Escape closes the drawer.
  useEffect(() => {
    if (!drawerOpen) {
      return;
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen, closeDrawer]);

  return (
    <div className={styles.shell}>
      {/* Desktop persistent sidebar. */}
      <aside aria-label="Primary" className={styles.sidebarDesktop}>
        <Sidebar />
      </aside>

      {/* Mobile drawer + scrim. */}
      <div
        className={`${styles.scrim} ${drawerOpen ? styles.scrimOpen : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <aside
        aria-label="Primary"
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
        inert={!drawerOpen}
      >
        <Sidebar onNavigate={closeDrawer} />
      </aside>

      <div className={styles.content}>
        <TopBar breadcrumbLeaf={breadcrumbLeaf} onOpenDrawer={openDrawer} />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
