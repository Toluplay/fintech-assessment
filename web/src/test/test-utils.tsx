import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, RouterProvider, createMemoryRouter } from 'react-router-dom';
import { routes } from '@/routes/router';
import { useAuthStore } from '@/store/auth.store';
import { SESSION } from './fixtures';

/** A fresh, retry-free query client per test so failures surface immediately. */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
}

interface Options extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  queryClient?: QueryClient;
}

/** Renders a component inside providers + a memory router (unit/component tests). */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', queryClient = createTestQueryClient(), ...options }: Options = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }
  return { user: userEvent.setup(), queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}

/** Renders the real application route tree (integration tests). */
export function renderApp(route = '/', queryClient = createTestQueryClient()) {
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { user: userEvent.setup(), router, queryClient, ...utils };
}

/** Puts the auth store into a signed-in state without hitting the network. */
export function signIn() {
  useAuthStore.getState().setSession(SESSION);
}

export function signOut() {
  useAuthStore.getState().markAnonymous();
}
