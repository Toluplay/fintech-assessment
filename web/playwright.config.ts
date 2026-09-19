import { defineConfig, devices } from '@playwright/test';

/**
 * E2E runs against the production build (`vite preview`) with the real
 * NestJS API, using the locally installed Chrome (no browser download).
 * Latency is disabled so the suite is fast; the UI is exercised for real.
 */
const WEB_URL = 'http://localhost:4173';
const API_URL = 'http://localhost:3100';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: WEB_URL,
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' }, testIgnore: /screenshots/ },
    { name: 'screenshots', testMatch: /screenshots\.spec\.ts/, use: { channel: 'chrome' } },
  ],
  webServer: [
    {
      command: 'npm run start:e2e',
      cwd: '../api',
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npm run build && npm run preview',
      url: WEB_URL,
      env: { VITE_API_PROXY_TARGET: API_URL },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
