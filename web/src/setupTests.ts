/* ============================================================
   jsdom polyfill pack — wired at scaffold time (web-testing.md).
   Ordering matters: TextEncoder/Decoder must land on globalThis
   BEFORE the undici import (undici's module-load code reads them),
   and crypto must be Node's real webcrypto instance (not a wrapper)
   so MSAL's BrowserCrypto.validateCryptoAvailable() passes.
   Do not patch these inline in individual test files.
   ============================================================ */
import { TextEncoder, TextDecoder } from 'node:util';
import { webcrypto } from 'node:crypto';

// 1. TextEncoder/TextDecoder — must precede the undici import below.
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  // @ts-expect-error — Node's TextDecoder is structurally compatible with the DOM type.
  globalThis.TextDecoder = TextDecoder;
}

// 2. fetch / Request / Response / Headers via undici (jsdom lacks them).
//    Imported with require-after-assignment semantics by being below (1).
const { fetch, Request, Response, Headers } = await import('undici');
if (typeof globalThis.fetch === 'undefined') {
  // @ts-expect-error — undici's fetch matches the DOM fetch shape closely enough.
  globalThis.fetch = fetch;
  // @ts-expect-error — undici Request.
  globalThis.Request = Request;
  // @ts-expect-error — undici Response.
  globalThis.Response = Response;
  // @ts-expect-error — undici Headers.
  globalThis.Headers = Headers;
}

// 3. crypto — bind Node's real webcrypto instance, then ensure randomUUID.
if (!globalThis.crypto || typeof globalThis.crypto.subtle === 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
    writable: true,
  });
}
if (typeof globalThis.crypto.randomUUID !== 'function') {
  globalThis.crypto.randomUUID = () => webcrypto.randomUUID();
}

// 4. matchMedia — jsdom does not implement it.
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// 5. ResizeObserver.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

// 6. IntersectionObserver.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): [] {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

// 7. scrollTo / Element.scrollIntoView — no-ops under jsdom.
if (typeof window !== 'undefined' && !window.scrollTo) {
  window.scrollTo = () => {};
}
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// 8. HTMLCanvasElement.getContext — jsdom defines it but throws "Not
//    implemented"; axe-core probes it during colour-contrast checks. Override
//    it to return null so those checks skip quietly instead of logging noise.
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as typeof HTMLCanvasElement.prototype.getContext;
}

// jest-dom matchers (toBeInTheDocument, etc.) and vitest-axe matchers.
import '@testing-library/jest-dom/vitest';
import * as axeMatchers from 'vitest-axe/matchers';
import { expect } from 'vitest';

expect.extend(axeMatchers);
