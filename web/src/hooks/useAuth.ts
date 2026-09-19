import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { selectStatus, selectUser, useAuthStore } from '@/store/auth.store';
import type { LoginRequest } from '@/types/auth';

/** Facade over the auth store + service used by pages and navigation. */
export function useAuth() {
  const status = useAuthStore(selectStatus);
  const user = useAuthStore(selectUser);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const login = useCallback((credentials: LoginRequest) => authService.login(credentials), []);

  const logout = useCallback(async () => {
    await authService.logout();
    // Drop every cached server response belonging to the previous user.
    queryClient.clear();
    navigate('/login', { replace: true });
  }, [navigate, queryClient]);

  return { status, user, isAuthenticated: status === 'authenticated', login, logout };
}
