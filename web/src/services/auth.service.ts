import { useAuthStore } from '@/store/auth.store';
import type { LoginRequest, LoginResponse } from '@/types/auth';
import { http } from './http';
import { endSession } from './session';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const session = await http.post<LoginResponse>('/auth/login', credentials, {
      anonymous: true,
    });
    useAuthStore.getState().setSession(session);
    return session;
  },

  logout(): Promise<void> {
    return endSession();
  },
};
