import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { useAuthStore } from '@/store/auth.store';
import { SESSION } from './fixtures';
import { failWith, VALID_CREDENTIALS } from './handlers';
import { server } from './server';
import { renderApp, signIn } from './test-utils';

async function fillLogin(user: ReturnType<typeof renderApp>['user'], password = VALID_CREDENTIALS.password) {
  await user.type(await screen.findByLabelText(/email or phone number/i), VALID_CREDENTIALS.identifier);
  await user.type(screen.getByLabelText(/^password$/i), password);
  await user.click(screen.getByRole('button', { name: /log in/i }));
}

describe('application flows', () => {
  it('redirects unauthenticated visitors from a protected route to /login and back after signing in', async () => {
    const { user, router } = renderApp('/loans');

    // Bounced to the login page...
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');

    // ...and returned to the page they wanted after a successful login.
    await fillLogin(user);
    expect(await screen.findByRole('heading', { name: /loan products/i })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/loans');
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().user).toEqual(SESSION.user);
  });

  it('logs in successfully and lands on the dashboard', async () => {
    const { user, router } = renderApp('/login');
    await fillLogin(user);

    expect(await screen.findByRole('heading', { name: 'John' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/dashboard');
    // The access token stays in memory only.
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(Object.keys(localStorage)).toEqual(['vf:has-session']);
  });

  it('shows a clear message on a failed login and stays on the page', async () => {
    const { user, router } = renderApp('/login');
    await fillLogin(user, 'WrongPassword1');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Incorrect email/phone number or password');
    expect(router.state.location.pathname).toBe('/login');
    expect(useAuthStore.getState().status).toBe('anonymous');
  });

  it('handles rate limiting (429) on login', async () => {
    server.use(failWith('post', '/auth/login', 429));
    const { user } = renderApp('/login');
    await fillLogin(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many attempts. Please wait a moment and try again.',
    );
  });

  it('shows an error state with retry when a product API fails', async () => {
    signIn();
    server.use(failWith('get', '/savings-products', 500));
    const { user } = renderApp('/savings');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Unable to load savings products.');

    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByRole('link', { name: /view details for fixed savings/i })).toBeInTheDocument();
  });

  it('silently refreshes an expired session and retries the request', async () => {
    signIn();
    let calls = 0;
    server.use(
      http.get('http://localhost/api/savings-products', ({ request }) => {
        calls += 1;
        if (request.headers.get('authorization') === 'Bearer test-access-token') {
          return HttpResponse.json(
            { statusCode: 401, error: 'Unauthorized', message: 'Session expired' },
            { status: 401 },
          );
        }
        return HttpResponse.json([]);
      }),
      http.post('http://localhost/api/auth/refresh', ({ request }) => {
        // The CSRF header must accompany cookie-authenticated calls.
        if (request.headers.get('x-requested-with') !== 'XMLHttpRequest') {
          return HttpResponse.json({ statusCode: 403, message: 'Missing CSRF header' }, { status: 403 });
        }
        return HttpResponse.json({ ...SESSION, accessToken: 'rotated-token' });
      }),
    );

    renderApp('/savings');

    await waitFor(() => expect(screen.getByRole('list', { name: 'Savings products' })).toBeInTheDocument());
    expect(calls).toBe(2);
    expect(useAuthStore.getState().accessToken).toBe('rotated-token');
  });

  it('signs the user out when the refresh token is also invalid', async () => {
    signIn();
    server.use(failWith('get', '/savings-products', 401, 'Session expired'));
    const { router } = renderApp('/savings');

    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(useAuthStore.getState().status).toBe('anonymous');
  });

  it('logs out, clears the session and returns to /login', async () => {
    signIn();
    const { user, router } = renderApp('/profile');

    expect(await screen.findByText('******6789')).toBeInTheDocument();
    // Navigation also has a logout control; use the one on the profile page.
    await user.click(within(screen.getByRole('main')).getByRole('button', { name: /^logout$/i }));

    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(localStorage.getItem('vf:has-session')).toBeNull();
  });

  it('completes the Start Saving action with a confirmation and success toast', async () => {
    signIn();
    const { user } = renderApp('/savings/1');

    await user.click(await screen.findByRole('button', { name: /start saving/i }));
    expect(await screen.findByRole('heading', { name: 'Start Target Savings' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /create plan/i }));
    expect(await screen.findByText('Savings plan created')).toBeInTheDocument();
  });
});
