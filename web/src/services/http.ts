import { useAuthStore } from '@/store/auth.store';
import type { ApiErrorBody } from '@/types/api';
import { ApiError } from '@/utils/errors';
import { API_BASE_URL } from './config';
import { refreshSession } from './session';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Skip attaching the Authorization header (login etc.). */
  anonymous?: boolean;
  /** Internal: prevents an infinite refresh loop. */
  isRetry?: boolean;
}

/**
 * Thin fetch wrapper that:
 *  - prefixes the API base URL and serialises JSON
 *  - attaches the in-memory access token
 *  - transparently refreshes an expired session once and retries
 *  - converts every failure into a user-safe ApiError
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, signal, anonymous = false, isRetry = false } = options;
  const token = useAuthStore.getState().accessToken;

  const init: RequestInit = {
    method,
    signal,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(!anonymous && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw ApiError.network();
  }

  if (response.status === 401 && !anonymous && !isRetry) {
    const refreshed = await refreshSession();
    if (refreshed) return request<T>(path, { ...options, isRetry: true });
  }

  if (!response.ok) {
    const errorBody = await parseJson<Partial<ApiErrorBody>>(response);
    throw ApiError.fromResponse(response.status, errorBody);
  }

  if (response.status === 204) return undefined as T;
  return (await parseJson<T>(response)) as T;
}

async function parseJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body: body ?? {} }),
};
