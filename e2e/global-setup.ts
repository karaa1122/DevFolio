/**
 * Runs once before all tests. Logs in and saves the browser storage state
 * so individual tests don't need to login (avoids rate limits).
 */
import { chromium } from '@playwright/test';
import path from 'path';

const BASE  = 'http://localhost:3000';
const EMAIL = process.env.TEST_EMAIL    ?? 'qa@devfolio.test';
const PASS  = process.env.TEST_PASSWORD ?? 'QApassword1!';

export const AUTH_FILE = path.join(__dirname, '.auth-state.json');

export default async function globalSetup() {
  const browser = await chromium.launch();
  const page    = await browser.newPage();

  await page.goto(`${BASE}/login`);
  await page.getByPlaceholder('you@example.com').fill(EMAIL);
  await page.getByPlaceholder('••••••••').fill(PASS);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 20_000 });

  // Save cookies + localStorage so tests start already authenticated
  await page.context().storageState({ path: AUTH_FILE });
  await browser.close();
}
