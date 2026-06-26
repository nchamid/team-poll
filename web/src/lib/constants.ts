/**
 * Shared, named numeric and string constants. Magic numbers are forbidden in
 * component/hook code (web-coding-standards.md) — import from here instead.
 */

// Pagination — mirrors the API contract (default 50, max 100).
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

// Poll validation bounds — mirror the server (plan §3; question is 1–280, not
// the prototype's 140 — overridden per the reconciliation log).
export const QUESTION_MIN_LENGTH = 1;
export const QUESTION_MAX_LENGTH = 280;
export const OPTION_MIN_LENGTH = 1;
export const OPTION_MAX_LENGTH = 80;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;

// localStorage key — the only key the app stores there (web-persistence.md).
export const THEME_STORAGE_KEY = 'theme-preference';
