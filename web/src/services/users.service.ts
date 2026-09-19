import type { UserProfile } from '@/types/user';
import { http } from './http';

export const usersService = {
  me: (signal?: AbortSignal) => http.get<UserProfile>('/users/me', { signal }),
};
