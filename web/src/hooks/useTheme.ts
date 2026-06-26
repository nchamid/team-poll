import { useCallback, useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY } from '@/lib/constants';

export type Theme = 'light' | 'dark';

function getCurrentTheme(): Theme {
  if (typeof document === 'undefined') {
    return 'light';
  }
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

// The data-theme attribute on <html> is the single source of truth; subscribe
// to it so all consumers stay in sync.
function subscribe(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => observer.disconnect();
}

/**
 * Reads and toggles the app theme. The initial value is applied before first
 * paint by the inline script in index.html; this hook only flips it and
 * persists the choice to localStorage (the only key the app stores there).
 */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const theme = useSyncExternalStore(subscribe, getCurrentTheme, () => 'light' as Theme);

  const toggleTheme = useCallback(() => {
    const next: Theme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (private mode / disabled). Theme still applies
      // for the session.
    }
  }, []);

  return { theme, toggleTheme };
}
