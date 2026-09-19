/** Base URL for API calls. Same-origin `/api` by default (proxied to NestJS). */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

/**
 * Sent on cookie-authenticated endpoints. A cross-site form cannot add custom
 * headers, so this is a lightweight CSRF defence on top of SameSite cookies.
 */
export const CSRF_HEADER: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' };
