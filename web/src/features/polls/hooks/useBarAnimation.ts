import { useEffect, useState } from 'react';

/**
 * Drives the result-bar reveal: bars start at width 0, then ease to their
 * percentage once `active` is true (results shown / a vote was cast). Re-runs
 * whenever `resetKey` changes so a fresh vote replays the animation.
 */
export function useBarAnimation(active: boolean, resetKey: unknown): boolean {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!active) {
      setAnimated(false);
      return;
    }
    setAnimated(false);
    const id = window.setTimeout(() => setAnimated(true), 50);
    return () => window.clearTimeout(id);
  }, [active, resetKey]);

  return animated;
}
