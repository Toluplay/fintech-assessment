import { useEffect } from 'react';
import { refreshSession } from '@/services/session';
import { hasSessionHint, useAuthStore } from '@/store/auth.store';

/**
 * Runs once on app start. If a previous session probably exists (hint flag),
 * silently exchange the HttpOnly refresh cookie for a new access token so the
 * customer stays signed in across reloads. Otherwise mark the visitor as
 * anonymous immediately - no network request, no blank screen.
 */
export function useSessionBootstrap(): void {
  useEffect(() => {
    if (useAuthStore.getState().status !== 'unknown') return;
    if (hasSessionHint()) {
      void refreshSession();
    } else {
      useAuthStore.getState().markAnonymous();
    }
  }, []);
}
