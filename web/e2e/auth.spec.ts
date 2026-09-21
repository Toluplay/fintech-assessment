import { expect, test } from '@playwright/test';
import { DEMO_USER, login, loginAndWaitForDashboard } from './helpers';

test.describe('authentication', () => {
  test('successful login lands on the dashboard and keeps the token out of storage', async ({ page }) => {
    await loginAndWaitForDashboard(page);
    await expect(page).toHaveURL(/\/dashboard$/);

    const storage = await page.evaluate(() => ({
      local: Object.entries(localStorage),
      session: Object.entries(sessionStorage),
      cookieNames: document.cookie.split(';').map((c) => c.trim().split('=')[0]).filter(Boolean),
    }));
    expect(storage.local).toEqual([['vf:has-session', '1']]);
    expect(storage.session).toEqual([]);
    // The refresh cookie is HttpOnly, so JavaScript cannot see it.
    expect(storage.cookieNames).not.toContain('vf_refresh');
  });

  test('failed login shows a friendly message and clears the password', async ({ page }) => {
    await login(page, { ...DEMO_USER, password: 'WrongPassword1' });
    await expect(page.getByRole('alert')).toHaveText(/Incorrect email\/phone number or password/);
    await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('"Use demo account" fills the form and signs in with one click', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Use demo account' }).click();
    await expect(page.getByLabel('Email or phone number')).toHaveValue(DEMO_USER.identifier);
    await expect(page.getByLabel('Password', { exact: true })).toHaveValue(DEMO_USER.password);
    await expect(page.getByRole('button', { name: 'Log in' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'John' })).toBeVisible();
  });

  test('client-side validation blocks an empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByText('Enter your email address or phone number')).toBeVisible();
    await expect(page.getByText('Enter your password')).toBeVisible();
    await expect(page.getByLabel('Email or phone number')).toBeFocused();
  });

  test('protected routes redirect to login and return after signing in', async ({ page }) => {
    await page.goto('/loans');
    await expect(page).toHaveURL(/\/login$/);
    await page.getByLabel('Email or phone number').fill(DEMO_USER.identifier);
    await page.getByLabel('Password', { exact: true }).fill(DEMO_USER.password);
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/loans$/);
    await expect(page.getByRole('heading', { name: 'Loan products' })).toBeVisible();
  });

  test('session survives a reload via the HttpOnly refresh cookie and ends on logout', async ({ page }) => {
    await loginAndWaitForDashboard(page);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'John' })).toBeVisible();

    // Only the sidebar logout is visible at desktop width.
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login$/);
  });
});
