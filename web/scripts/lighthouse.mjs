/**
 * Lighthouse performance audit for public AND authenticated pages.
 *
 * Uses the Lighthouse user-flow API on top of the locally installed Chrome:
 * a real login is performed once, then each page is audited as a cold
 * navigation (fresh page load) with the session cookie in place.
 *
 * The script starts what it needs (API with MOCK_LATENCY_MS=0 on :3100 and
 * the production build on :4173 via `vite preview`) and stops them afterwards.
 * Run `npm run build` first, then `npm run perf`.
 *
 * Output: docs/lighthouse/{desktop,mobile}-flow.html + summary.json + summary.md
 */
import { launch } from 'chrome-launcher';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startFlow } from 'lighthouse';
import puppeteer from 'puppeteer-core';

const BASE_URL = process.env.LH_BASE_URL ?? 'http://localhost:4173';
const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/lighthouse');
const CREDENTIALS = { identifier: 'john@example.com', password: 'Password123!' };

const PAGES = [
  { name: 'Login', path: '/login', authenticated: false },
  { name: 'Dashboard', path: '/dashboard', authenticated: true },
  { name: 'Savings', path: '/savings', authenticated: true },
  { name: 'Savings detail', path: '/savings/3', authenticated: true },
  { name: 'Loans', path: '/loans', authenticated: true },
  { name: 'Profile', path: '/profile', authenticated: true },
];

const FORM_FACTORS = {
  mobile: { formFactor: 'mobile', screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false } },
  desktop: {
    formFactor: 'desktop',
    screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false },
    throttling: { rttMs: 40, throughputKbps: 10 * 1024, cpuSlowdownMultiplier: 1 },
  },
};

async function auditFormFactor(name, settings) {
  // A dedicated, writable profile dir keeps each run cold (no cache, no cookies).
  const userDataDir = resolve(webRoot, `node_modules/.cache/lighthouse/${name}-${Date.now()}`);
  mkdirSync(userDataDir, { recursive: true });
  const chrome = await launch({ chromeFlags: ['--headless=new', '--no-first-run'], userDataDir });
  const browser = await puppeteer.connect({ browserURL: `http://localhost:${chrome.port}` });
  const page = await browser.newPage();
  const flow = await startFlow(page, {
    name: `Veridian ${name}`,
    config: { extends: 'lighthouse:default', settings: { ...settings, onlyCategories: ['performance', 'accessibility', 'best-practices'] } },
  });

  for (const target of PAGES) {
    if (target.authenticated && !(await isLoggedIn(page))) {
      await login(page);
    }
    await flow.navigate(`${BASE_URL}${target.path}`, { name: `${target.name} (${name})` });
  }

  const report = await flow.generateReport();
  const json = await flow.createFlowResult();
  await browser.disconnect();
  await chrome.kill();

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(resolve(OUT_DIR, `${name}-flow.html`), report);

  return json.steps.map((step) => {
    const lhr = step.lhr;
    const audits = lhr.audits;
    return {
      formFactor: name,
      page: step.name.replace(` (${name})`, ''),
      performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((lhr.categories['best-practices']?.score ?? 0) * 100),
      fcp: audits['first-contentful-paint']?.displayValue,
      lcp: audits['largest-contentful-paint']?.displayValue,
      tbt: audits['total-blocking-time']?.displayValue,
      cls: audits['cumulative-layout-shift']?.displayValue,
      speedIndex: audits['speed-index']?.displayValue,
      transferKb: Math.round((audits['total-byte-weight']?.numericValue ?? 0) / 1024),
    };
  });
}

async function isLoggedIn(page) {
  return page.evaluate(() => localStorage.getItem('vf:has-session') === '1');
}

async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await page.type('input[name="identifier"]', CREDENTIALS.identifier);
  await page.type('input[name="password"]', CREDENTIALS.password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => undefined),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForFunction(() => localStorage.getItem('vf:has-session') === '1', { timeout: 10_000 });
}

function toMarkdown(rows) {
  const header =
    '| Page | Form factor | Perf | A11y | Best practices | FCP | LCP | TBT | CLS | Speed Index | Transfer |\n' +
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |';
  const body = rows
    .map(
      (r) =>
        `| ${r.page} | ${r.formFactor} | ${r.performance} | ${r.accessibility} | ${r.bestPractices} | ${r.fcp} | ${r.lcp} | ${r.tbt} | ${r.cls} | ${r.speedIndex} | ${r.transferKb} kB |`,
    )
    .join('\n');
  return `${header}\n${body}\n`;
}

function startServer(command, cwd, env, readyUrl) {
  const child = spawn(command, { cwd, env: { ...process.env, ...env }, shell: true, stdio: 'ignore' });
  const ready = (async () => {
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
      try {
        const res = await fetch(readyUrl);
        if (res.ok) return;
      } catch {
        // not up yet
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(`Timed out waiting for ${readyUrl}`);
  })();
  return { child, ready };
}

const api = startServer('npm run start:e2e', resolve(webRoot, '../api'), {}, 'http://localhost:3100/health');
const web = startServer('npx vite preview --port 4173 --strictPort', webRoot, { VITE_API_PROXY_TARGET: 'http://localhost:3100' }, BASE_URL);
await Promise.all([api.ready, web.ready]);

const all = [];
for (const [name, settings] of Object.entries(FORM_FACTORS)) {
  console.log(`\nAuditing ${name}…`);
  const rows = await auditFormFactor(name, settings);
  all.push(...rows);
  console.table(rows.map(({ page, performance, accessibility, bestPractices, lcp, tbt, cls }) => ({ page, performance, accessibility, bestPractices, lcp, tbt, cls })));
}

writeFileSync(resolve(OUT_DIR, 'summary.json'), JSON.stringify(all, null, 2));
writeFileSync(resolve(OUT_DIR, 'summary.md'), toMarkdown(all));
console.log(`\nReports written to ${OUT_DIR}`);
