import { expect, type Page } from '@playwright/test';

export const DEMO_USER = { identifier: 'john@example.com', password: 'Password123!', name: 'John Doe' };

export async function login(page: Page, credentials = DEMO_USER) {
  await page.goto('/login');
  await page.getByLabel('Email or phone number').fill(credentials.identifier);
  await page.getByLabel('Password', { exact: true }).fill(credentials.password);
  await page.getByRole('button', { name: 'Log in' }).click();
}

export async function loginAndWaitForDashboard(page: Page) {
  await login(page);
  await expect(page.getByRole('heading', { name: 'John' })).toBeVisible();
}
