import { useAuthStore } from '@/store/auth.store';
import type { LoginResponse } from '@/types/auth';
import { API_BASE_URL, CSRF_HEADER } from './config';

let inflight: Promise<boolean> | null = null;

/**
 * Exchanges the HttpOnly refresh cookie for a new access token.
 *
 * Single-flight: if several requests hit 401 at the same time only one refresh
 * call is made and they all await the same promise. Returns `true` when a new
 * session was established, `false` when the user must sign in again.
 */
export function refreshSession(): Promise<boolean> {
  if (!inflight) {
    inflight = doRefresh().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

async function doRefresh(): Promise<boolean> {
  const store = useAuthStore.getState();
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: CSRF_HEADER,
    });
    if (!response.ok) {
      store.clearSession();
      return false;
    }
    const session = (await response.json()) as LoginResponse;
    store.setSession(session);
    return true;
  } catch {
    // Network failure: keep whatever state we had; the caller surfaces the error.
    if (store.status === 'unknown') store.markAnonymous();
    return false;
  }
}

/** Ends the session on the server (revokes the refresh token) and locally. */
export async function endSession(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: CSRF_HEADER,
      keepalive: true,
    });
  } catch {
    // Best effort - the local session is cleared regardless.
  } finally {
    useAuthStore.getState().clearSession();
  }
}
