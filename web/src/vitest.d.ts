import 'vitest';
import type { AxeResults } from 'axe-core';

// Augment vitest's matcher interfaces with the vitest-axe matcher. The package
// ships an augmentation for the legacy `Vi` namespace; vitest 3 reads matchers
// off its own `Assertion`/`AsymmetricMatchersContaining`, so declare it here.
declare module 'vitest' {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}

// Keep AxeResults referenced so the import is not elided.
export type { AxeResults };
