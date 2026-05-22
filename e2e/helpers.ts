import { Page, expect } from '@playwright/test';

export const BASE = 'http://localhost:3000';
export const API  = 'http://localhost:3001/api/v1';

// Unique test-run email to avoid collisions between runs
const RUN_ID = Date.now().toString(36);
export const TEST_USER = {
  name:     `QA Runner ${RUN_ID}`,
  email:    `qa+${RUN_ID}@devfolio.test`,
  password: 'QApassword1!',
};

/** Register → verify email via API → login. Returns after landing on /dashboard. */
export async function registerAndLogin(page: Page): Promise<void> {
  // 1. Register
  await page.goto(`${BASE}/register`);
  await page.getByPlaceholder('Karaa Kamaran').fill(TEST_USER.name);
  await page.getByPlaceholder('you@example.com').fill(TEST_USER.email);
  await page.getByPlaceholder('Min 8 characters').fill(TEST_USER.password);
  await page.getByRole('button', { name: /create account/i }).click();

  // 2. Skip real email: verify via API directly
  const vRes = await fetch(`${API}/auth/dev-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_USER.email }),
  });
  if (!vRes.ok) {
    // Endpoint may not exist — just try logging in directly
  }

  // 3. Login
  await page.goto(`${BASE}/login`);
  await page.getByPlaceholder('you@example.com').fill(TEST_USER.email);
  await page.getByPlaceholder('••••••••').fill(TEST_USER.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
}

/** Login with an already-verified account. */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto(`${BASE}/login`);
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
}

/** Click "New Resume" (or the first resume card) and wait for the editor to load. */
export async function openOrCreateResume(page: Page): Promise<void> {
  // Try clicking an existing resume first
  const existing = page.locator('a[href*="/resume/"]').first();
  if (await existing.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await existing.click();
  } else {
    // Create new
    await page.getByRole('button', { name: /new resume|create resume/i }).first().click();
  }
  // Wait for the resume editor to appear
  await page.waitForURL('**/resume/**', { timeout: 20_000 });
  await expect(page.locator('#resume-page')).toBeVisible({ timeout: 15_000 });
}

/** Expand the Personal Details accordion in the sidebar. */
export async function openPersonalDetails(page: Page): Promise<void> {
  const card = page.getByText('Personal Details', { exact: true });
  if (await card.isVisible()) {
    // Check if already expanded — look for the "Full Name" input
    const nameInput = page.getByPlaceholder('Jane Smith');
    if (!await nameInput.isVisible({ timeout: 800 }).catch(() => false)) {
      await card.click();
    }
    await expect(page.getByPlaceholder('Jane Smith')).toBeVisible();
  }
}
