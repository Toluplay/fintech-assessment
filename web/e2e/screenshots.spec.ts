import { test } from '@playwright/test';
import { login, loginAndWaitForDashboard } from './helpers';

/**
 * Captures the screenshots referenced by the README at the three breakpoints
 * required by the assessment (desktop 1440, tablet 768, mobile 360).
 * Run with: npm run screenshots
 */
const OUT = '../docs/screenshots';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 360, height: 780 },
};

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  test(`${name} screenshots`, async ({ page }) => {
    await page.setViewportSize(viewport);
    // Full-page captures only on desktop: mobile/tablet have a fixed bottom bar.
    const fullPage = name === 'desktop';

    await page.goto('/login');
    await page.getByRole('heading', { name: 'Welcome back' }).waitFor();
    await page.screenshot({ path: `${OUT}/${name}-login.png` });

    // Validation state
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByText('Enter your password').waitFor();
    await page.screenshot({ path: `${OUT}/${name}-login-validation.png` });

    await loginAndWaitForDashboard(page);
    await page.screenshot({ path: `${OUT}/${name}-dashboard.png`, fullPage });

    await page.goto('/savings');
    await page.getByTestId('product-card').nth(2).waitFor();
    await page.screenshot({ path: `${OUT}/${name}-savings.png`, fullPage });

    await page.goto('/savings/3');
    await page.getByText('Terms & conditions').waitFor();
    await page.screenshot({ path: `${OUT}/${name}-savings-detail.png`, fullPage });

    if (name === 'desktop') {
      await page.getByRole('button', { name: 'Start Saving' }).click();
      await page.getByRole('dialog').waitFor();
      await page.screenshot({ path: `${OUT}/${name}-start-saving-modal.png` });
      await page.keyboard.press('Escape');
    }

    await page.goto('/loans');
    await page.getByTestId('product-card').nth(2).waitFor();
    await page.screenshot({ path: `${OUT}/${name}-loans.png`, fullPage });

    await page.goto('/loans/1');
    await page.getByText('Requirements').waitFor();
    await page.screenshot({ path: `${OUT}/${name}-loan-detail.png`, fullPage });

    await page.goto('/profile');
    await page.getByText('******6789').waitFor();
    await page.screenshot({ path: `${OUT}/${name}-profile.png`, fullPage });

    if (name === 'desktop') {
      // Skeleton loading state: hold the response so the skeletons stay visible.
      await page.route('**/api/loan-products', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 4000));
        // The page may have moved on by the time the delay elapses.
        await route.continue().catch(() => undefined);
      });
      await page.goto('/loans');
      await page.getByTestId('product-grid-skeleton').waitFor();
      await page.screenshot({ path: `${OUT}/${name}-loans-loading.png` });
      await page.unrouteAll({ behavior: 'ignoreErrors' });

      // Error state
      await page.route('**/api/savings-products', (route) =>
        route.fulfill({ status: 503, contentType: 'application/json', body: '{"statusCode":503}' }),
      );
      await page.goto('/savings');
      await page.getByRole('alert').waitFor();
      await page.screenshot({ path: `${OUT}/${name}-savings-error.png` });
      await page.unrouteAll({ behavior: 'ignoreErrors' });
    }
  });
}

test('login page (fresh visitor)', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.desktop);
  await login(page, { identifier: 'john@example.com', password: 'WrongPassword1', name: '' });
  await page.getByRole('alert').waitFor();
  await page.screenshot({ path: `${OUT}/desktop-login-failed.png` });
});
