/**
 * Single shared URL-construction utility. Component code never assembles query
 * strings via template literals or ad-hoc URLSearchParams blocks
 * (web-coding-standards.md) — it calls buildUrl so encoding stays consistent
 * and components remain testable.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export type QueryValue = string | number | boolean | null | undefined;

export function buildUrl(path: string, params?: Record<string, QueryValue>): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const search = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        search.append(key, String(value));
      }
    }
  }
  const queryString = search.toString();
  return queryString ? `${base}${normalizedPath}?${queryString}` : `${base}${normalizedPath}`;
}
