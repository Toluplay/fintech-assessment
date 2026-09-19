import { create } from 'zustand';
import type { AuthStatus, LoginResponse, PublicUser } from '@/types/auth';

/**
 * Client-side authentication state.
 *
 * The access token lives ONLY in memory (this store). It is never written to
 * localStorage/sessionStorage, so a script injected through XSS cannot read a
 * durable credential. Session continuity across reloads comes from the
 * HttpOnly refresh cookie set by the API - see services/session.ts.
 */
interface AuthState {
  status: AuthStatus;
  user: PublicUser | null;
  accessToken: string | null;
  /** Epoch ms when the access token expires. */
  expiresAt: number | null;
  setSession: (session: LoginResponse) => void;
  clearSession: () => void;
  /** Called when the boot-time refresh finds no session. */
  markAnonymous: () => void;
}

/**
 * Non-sensitive hint that a refresh cookie probably exists, so first-time
 * visitors skip a pointless network round-trip on boot. It contains no
 * credential - only a boolean.
 */
const SESSION_HINT_KEY = 'vf:has-session';

export function hasSessionHint(): boolean {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === '1';
  } catch {
    return false;
  }
}

function setSessionHint(value: boolean): void {
  try {
    if (value) localStorage.setItem(SESSION_HINT_KEY, '1');
    else localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    // Storage unavailable (private mode) - the app still works, it just refreshes on boot.
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'unknown',
  user: null,
  accessToken: null,
  expiresAt: null,
  setSession: ({ accessToken, expiresIn, user }) => {
    setSessionHint(true);
    set({
      status: 'authenticated',
      user,
      accessToken,
      expiresAt: Date.now() + expiresIn * 1000,
    });
  },
  clearSession: () => {
    setSessionHint(false);
    set({ status: 'anonymous', user: null, accessToken: null, expiresAt: null });
  },
  markAnonymous: () => set({ status: 'anonymous', user: null, accessToken: null, expiresAt: null }),
}));

/* Narrow selectors keep components from re-rendering on unrelated changes. */
export const selectStatus = (state: AuthState) => state.status;
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.status === 'authenticated';
