/**
 * Settings panel + PDF export + dashboard resume-management tests.
 * Auth state is pre-loaded by global setup.
 */

import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:3000';

async function openResume(page: Page) {
  await page.goto(`${BASE}/dashboard`);
  const resumeLink = page.locator('a[href*="/resume/"]').first();
  if (await resumeLink.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await resumeLink.click();
  } else {
    await page.getByRole('button', { name: /new resume|create resume|build resume/i }).first().click();
  }
  await page.waitForURL('**/resume/**', { timeout: 20_000 });
  await expect(page.locator('#resume-page')).toBeVisible({ timeout: 15_000 });
}

// ─── Settings panel ───────────────────────────────────────────────────────────

test.describe('Settings Panel', () => {

  test.beforeEach(async ({ page }) => {
    await openResume(page);
    await page.getByRole('button', { name: 'Settings' }).click();
  });

  test('Resume Title field is visible and editable', async ({ page }) => {
    const field = page.getByPlaceholder('My Resume');
    await expect(field).toBeVisible();
    await field.fill('QA Senior Engineer Resume');
    await field.press('Tab');
    await expect(field).toHaveValue('QA Senior Engineer Resume');
  });

  test('Target Role field accepts text', async ({ page }) => {
    const field = page.getByPlaceholder('Software Engineer');
    await field.fill('Full-Stack Developer');
    await field.press('Tab');
    await expect(field).toHaveValue('Full-Stack Developer');
  });

  test('Target Company field is present', async ({ page }) => {
    await expect(page.getByPlaceholder('Google, Meta...')).toBeVisible();
  });

  test('updating resume title reflects in the toolbar header', async ({ page }) => {
    await page.getByPlaceholder('My Resume').fill('My Awesome Resume');
    await page.getByPlaceholder('My Resume').press('Tab');
    // The toolbar span shows the current title
    await expect(page.locator('header span').filter({ hasText: 'My Awesome Resume' })).toBeVisible({ timeout: 4_000 });
  });

});

// ─── PDF Export ───────────────────────────────────────────────────────────────

test.describe('PDF Export', () => {

  test.beforeEach(async ({ page }) => {
    await openResume(page);
  });

  test('"Download PDF" button is visible in the toolbar', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Download PDF' })).toBeVisible();
  });

  test('clicking Download PDF triggers an export API request', async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse(
        res => res.url().includes('/export') && res.request().method() === 'POST',
        { timeout: 20_000 }
      ),
      page.getByRole('button', { name: 'Download PDF' }).click(),
    ]);
    expect(response.status()).toBeLessThan(500);
  });

  test('after clicking Download PDF a processing/status panel appears', async ({ page }) => {
    await page.getByRole('button', { name: 'Download PDF' }).click();
    // The export panel should appear with a spinner or status message
    await expect(
      page.locator('text=/generating|processing|pending|exporting|seconds/i').first()
    ).toBeVisible({ timeout: 15_000 });
  });

});

// ─── Dashboard resume management ──────────────────────────────────────────────

test.describe('Dashboard — Resume Management', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
  });

  test('dashboard page loads and shows a resume section heading', async ({ page }) => {
    await expect(page.getByText(/resume/i)).toBeVisible();
  });

  test('existing resume card links to /resume/:id', async ({ page }) => {
    const resumeLink = page.locator('a[href*="/resume/"]').first();
    if (await resumeLink.isVisible({ timeout: 4_000 }).catch(() => false)) {
      await expect(resumeLink).toHaveAttribute('href', /\/resume\//);
    }
  });

  test('one-resume limit: creating again redirects to the same resume', async ({ page }) => {
    // Ensure resume exists
    const firstLink = page.locator('a[href*="/resume/"]').first();
    const exists = await firstLink.isVisible({ timeout: 3_000 }).catch(() => false);
    if (!exists) {
      await page.getByRole('button', { name: /new resume|create resume|build resume/i }).first().click();
      await page.waitForURL('**/resume/**', { timeout: 15_000 });
      const resumeId = page.url().split('/resume/')[1];
      await page.goto(`${BASE}/dashboard`);
      await page.getByRole('button', { name: /new resume|create resume|build resume/i }).first().click();
      await page.waitForURL('**/resume/**', { timeout: 10_000 });
      expect(page.url()).toContain(resumeId);
    } else {
      const href = await firstLink.getAttribute('href') ?? '';
      const resumeId = href.split('/resume/')[1];
      await page.getByRole('button', { name: /new resume|create resume|build resume/i }).first().click();
      await page.waitForURL('**/resume/**', { timeout: 10_000 });
      expect(page.url()).toContain(resumeId);
    }
  });

  test('Delete Resume button exists on the dashboard card', async ({ page }) => {
    const firstLink = page.locator('a[href*="/resume/"]').first();
    if (await firstLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(
        page.getByRole('button', { name: /delete/i }).first()
      ).toBeVisible({ timeout: 3_000 });
    }
  });

});
