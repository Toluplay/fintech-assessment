import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { selectIsAuthenticated, useAuthStore } from '@/store/auth.store';
import { queryKeys } from './queryKeys';

/** Full profile from GET /users/me. Only runs once a session exists. */
export function useCurrentUser() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: ({ signal }) => usersService.me(signal),
    enabled: isAuthenticated,
  });
}
