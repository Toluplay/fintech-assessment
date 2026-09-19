import { expect, test } from '@playwright/test';
import { loginAndWaitForDashboard } from './helpers';

test.describe('products', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndWaitForDashboard(page);
  });

  test('savings list -> detail -> Start Saving (authenticated action)', async ({ page }) => {
    await page.getByRole('link', { name: 'Savings', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: 'Savings products' })).toBeVisible();
    const cards = page.getByTestId('product-card');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText('Target Savings');
    await expect(cards.nth(0)).toContainText('12% p.a.');
    await expect(cards.nth(0)).toContainText('₦5,000');
    await expect(cards.nth(0)).toContainText('12 months');

    await page.getByRole('link', { name: 'View details for Fixed Savings' }).click();
    await expect(page).toHaveURL(/\/savings\/3$/);
    await expect(page.getByRole('heading', { name: 'Fixed Savings', level: 1 })).toBeVisible();
    await expect(page.getByText('Key features')).toBeVisible();
    await expect(page.getByText('Terms & conditions')).toBeVisible();
    await expect(page.getByText('₦100,000,000')).toBeVisible();

    const startRequest = page.waitForRequest((req) => req.url().endsWith('/savings-products/3/start'));
    await page.getByRole('button', { name: 'Start Saving' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Create plan' }).click();
    const request = await startRequest;
    // The authenticated action carries the bearer token.
    expect(request.headers()['authorization']).toMatch(/^Bearer /);
    await expect(page.getByText('Savings plan created')).toBeVisible();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('loan list -> detail -> Apply for Loan', async ({ page }) => {
    await page.goto('/loans');
    const cards = page.getByTestId('product-card');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(2)).toContainText('Business Loan');
    await expect(cards.nth(2)).toContainText('Based on assessment');

    await page.getByRole('link', { name: 'View details for Personal Loan' }).click();
    await expect(page.getByRole('heading', { name: 'Personal Loan', level: 1 })).toBeVisible();
    await expect(page.getByText('Eligibility')).toBeVisible();
    await expect(page.getByText('Requirements')).toBeVisible();

    await page.getByRole('button', { name: 'Apply for Loan' }).click();
    await page.getByRole('button', { name: 'Submit application' }).click();
    await expect(page.getByText('Application received')).toBeVisible();
  });

  test('product API failure shows a retry state and recovers', async ({ page }) => {
    let fail = true;
    await page.route('**/api/loan-products', async (route) => {
      if (fail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ statusCode: 500, error: 'Internal Server Error', message: 'boom' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/loans');
    const alert = page.getByRole('alert');
    await expect(alert).toContainText('Unable to load loan products.');
    await expect(alert).not.toContainText('boom');
    await expect(alert).not.toContainText('500');

    fail = false;
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByTestId('product-card')).toHaveCount(3);
  });

  test('unknown product id shows the not-found page', async ({ page }) => {
    await page.goto('/savings/does-not-exist');
    await expect(page.getByRole('heading', { name: 'We could not find that page' })).toBeVisible();
  });

  test('navigating between sections reuses cached product data', async ({ page }) => {
    const productRequests: string[] = [];
    page.on('request', (req) => {
      if (/\/api\/(savings|loan)-products$/.test(req.url())) productRequests.push(req.url());
    });

    await page.goto('/savings');
    await expect(page.getByTestId('product-card')).toHaveCount(3);
    await page.getByRole('link', { name: 'Dashboard' }).first().click();
    await expect(page.getByRole('heading', { name: 'John' })).toBeVisible();
    await page.getByRole('link', { name: 'Savings', exact: true }).first().click();
    await expect(page.getByTestId('product-card')).toHaveCount(3);

    // savings fetched once (on /savings), loans fetched once (on the dashboard).
    expect(productRequests.filter((u) => u.endsWith('savings-products'))).toHaveLength(1);
    expect(productRequests.filter((u) => u.endsWith('loan-products'))).toHaveLength(1);
  });
});
