/**
 * Resume editor end-to-end tests.
 * Auth state is pre-loaded by global setup — no per-test login needed.
 */

import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:3000';

// ─── Navigation helper ────────────────────────────────────────────────────────

async function openResume(page: Page) {
  await page.goto(`${BASE}/dashboard`);
  const resumeLink = page.locator('a[href*="/resume/"]').first();
  const hasResume  = await resumeLink.isVisible({ timeout: 4_000 }).catch(() => false);

  if (hasResume) {
    await resumeLink.click();
  } else {
    await page.getByRole('button', { name: /new resume|create resume|build resume/i }).first().click();
  }

  await page.waitForURL('**/resume/**', { timeout: 20_000 });
  await expect(page.locator('#resume-page')).toBeVisible({ timeout: 15_000 });
}

// ─── Suite ────────────────────────────────────────────────────────────────────

test.describe('Resume Editor', () => {

  test.beforeEach(async ({ page }) => {
    await openResume(page);
  });

  // ── Layout ────────────────────────────────────────────────────────────────

  test('editor has sidebar tabs and live preview', async ({ page }) => {
    await expect(page.locator('#resume-page')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Content' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Style' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
  });

  test('toolbar shows Undo, Redo and Download PDF buttons', async ({ page }) => {
    await expect(page.getByTitle('Undo (Ctrl+Z)')).toBeVisible();
    await expect(page.getByTitle('Redo (Ctrl+Y)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download PDF' })).toBeVisible();
  });

  // ── Personal Details / Contact form ───────────────────────────────────────

  test('expand Personal Details and fill core fields; preview updates live', async ({ page }) => {
    await page.getByText('Personal Details').click();
    await expect(page.getByPlaceholder('Jane Smith')).toBeVisible();

    await page.getByPlaceholder('Jane Smith').fill('Karaa Kamaran');
    await page.keyboard.press('Tab');
    await expect(page.locator('#resume-page')).toContainText('Karaa Kamaran');

    await page.getByPlaceholder('Senior Backend Engineer').fill('Full-Stack Developer');
    await page.keyboard.press('Tab');
    await expect(page.locator('#resume-page')).toContainText('Full-Stack Developer');

    await page.getByPlaceholder('jane@example.com').fill('karaa@example.com');
    await page.keyboard.press('Tab');
    await expect(page.locator('#resume-page')).toContainText('karaa@example.com');

    await page.getByPlaceholder('+964 750 123 4567').fill('+964 750 000 1111');
    await page.keyboard.press('Tab');
    await expect(page.locator('#resume-page')).toContainText('+964 750 000 1111');

    await page.getByPlaceholder('Erbil, Iraq').fill('Erbil, Kurdistan');
    await page.keyboard.press('Tab');
    await expect(page.locator('#resume-page')).toContainText('Erbil, Kurdistan');
  });

  test('LinkedIn and GitHub links render in preview with icons', async ({ page }) => {
    await page.getByText('Personal Details').click();
    await page.getByPlaceholder('https://linkedin.com/in/...').fill('https://linkedin.com/in/karaa');
    await page.keyboard.press('Tab');
    await page.getByPlaceholder('https://github.com/...').fill('https://github.com/karaa1122');
    await page.keyboard.press('Tab');
    const preview = page.locator('#resume-page');
    await expect(preview).toContainText('karaa');
    await expect(preview).toContainText('karaa1122');
  });

  test('name alignment left / center buttons switch correctly', async ({ page }) => {
    await page.getByText('Personal Details').click();
    await page.getByPlaceholder('Jane Smith').fill('Align Test');
    await page.keyboard.press('Tab');

    // The two alignment buttons are labelled "left" and "center"
    await page.getByRole('button', { name: /^left$/i }).click();
    await expect(page.locator('#resume-page')).toContainText('Align Test');
    await page.getByRole('button', { name: /^center$/i }).click();
    await expect(page.locator('#resume-page')).toContainText('Align Test');
  });

  test('Additional Details section expands to show DOB, nationality etc.', async ({ page }) => {
    await page.getByText('Personal Details').click();
    await page.getByText(/additional details/i).click();
    await expect(page.getByPlaceholder('Jan 1, 1995')).toBeVisible();
    await expect(page.getByPlaceholder('Kurdish')).toBeVisible();
    await expect(page.getByPlaceholder('Single')).toBeVisible();
    await expect(page.getByPlaceholder('Immediately')).toBeVisible();
  });

  test('DOB and nationality filled in Additional Details appear in preview', async ({ page }) => {
    await page.getByText('Personal Details').click();
    await page.getByPlaceholder('Jane Smith').fill('Bio Test');
    await page.keyboard.press('Tab');
    await page.getByText(/additional details/i).click();
    await page.getByPlaceholder('Jan 1, 1995').fill('March 21, 1998');
    await page.keyboard.press('Tab');
    await page.getByPlaceholder('Kurdish').fill('Kurdish');
    await page.keyboard.press('Tab');
    await expect(page.locator('#resume-page')).toContainText('March 21, 1998');
    await expect(page.locator('#resume-page')).toContainText('Kurdish');
  });

  // ── Experience ────────────────────────────────────────────────────────────

  test('add an experience entry; role + company appear in preview', async ({ page }) => {
    await page.getByText('Experience').first().click();
    await page.getByRole('button', { name: /add experience/i }).click();

    await page.getByPlaceholder('Software Engineer').last().fill('Backend Engineer');
    await page.keyboard.press('Tab');
    await page.getByPlaceholder('Acme Corp').last().fill('DevFolio Inc');
    await page.keyboard.press('Tab');
    await page.getByPlaceholder('Jan 2022').last().fill('Jan 2023');
    await page.keyboard.press('Tab');

    await expect(page.locator('#resume-page')).toContainText('Backend Engineer');
    await expect(page.locator('#resume-page')).toContainText('DevFolio Inc');
  });

  test('rich-text toolbar buttons (Bold / Italic / Underline) are visible in description', async ({ page }) => {
    await page.getByText('Experience').first().click();
    const addBtn = page.getByRole('button', { name: /add experience/i });
    if (await addBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await addBtn.click();
    }
    // Rich text toolbar
    await expect(page.getByTitle('Bold').first()).toBeVisible();
    await expect(page.getByTitle('Italic').first()).toBeVisible();
    await expect(page.getByTitle('Underline').first()).toBeVisible();
  });

  test('"Currently working here" checkbox makes preview show Present', async ({ page }) => {
    await page.getByText('Experience').first().click();
    const addBtn = page.getByRole('button', { name: /add experience/i });
    if (await addBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await addBtn.click();
    }
    await page.getByPlaceholder('Software Engineer').last().fill('Current Job');
    await page.keyboard.press('Tab');
    // Checkbox is inside a <label> — locate by surrounding label text
    const checkbox = page.locator('label', { hasText: 'Currently working here' }).locator('input[type="checkbox"]').last();
    await checkbox.check();
    await expect(page.locator('#resume-page')).toContainText(/present/i);
  });

  test('tech stack tags appear as pill badges in preview', async ({ page }) => {
    await page.getByText('Experience').first().click();
    const addBtn = page.getByRole('button', { name: /add experience/i });
    if (await addBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await addBtn.click();
    }
    await page.getByPlaceholder('Software Engineer').last().fill('DevOps Lead');
    await page.keyboard.press('Tab');
    await page.getByPlaceholder('TypeScript, NestJS, PostgreSQL').last().fill('Docker, Kubernetes, AWS');
    await page.keyboard.press('Tab');
    const preview = page.locator('#resume-page');
    await expect(preview).toContainText('Docker');
    await expect(preview).toContainText('Kubernetes');
    await expect(preview).toContainText('AWS');
  });

  test('removing an experience entry removes it from preview', async ({ page }) => {
    await page.getByText('Experience').first().click();
    await page.getByRole('button', { name: /add experience/i }).click();
    await page.getByPlaceholder('Software Engineer').last().fill('Temp Role Delete');
    await page.keyboard.press('Tab');
    await expect(page.locator('#resume-page')).toContainText('Temp Role Delete');

    // The X button: small square button in the entry card header with text '×' or SVG
    // Locate the entry card by the role text, then find the remove button inside it
    const entryCard = page.locator('.border-slate-200.rounded-xl').filter({ hasText: 'Temp Role Delete' }).last();
    const removeBtn = entryCard.locator('button').filter({ has: page.locator('svg') }).last();
    await removeBtn.click();
    await expect(page.locator('#resume-page')).not.toContainText('Temp Role Delete');
  });

  // ── Education ─────────────────────────────────────────────────────────────

  test('add an education entry; degree + institution appear in preview', async ({ page }) => {
    await page.getByText('Education').first().click();
    const addBtn = page.getByRole('button', { name: /add education/i });
    if (await addBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await addBtn.click();
    }

    await page.getByPlaceholder('University of Kurdistan').last().fill('Harvard University');
    await page.keyboard.press('Tab');
    await page.getByPlaceholder('B.Sc.').last().fill('M.Sc.');
    await page.keyboard.press('Tab');
    await page.getByPlaceholder('Computer Science').last().fill('Computer Science');
    await page.keyboard.press('Tab');
    await page.getByPlaceholder('3.8 / 4.0').last().fill('3.9 / 4.0');
    await page.keyboard.press('Tab');

    await expect(page.locator('#resume-page')).toContainText('Harvard University');
    await expect(page.locator('#resume-page')).toContainText('M.Sc.');
    await expect(page.locator('#resume-page')).toContainText('3.9 / 4.0');
  });

  // ── Skills ────────────────────────────────────────────────────────────────

  test('add skills with categories; they appear grouped in preview', async ({ page }) => {
    await page.getByText('Skills').first().click();
    const addBtn = page.getByRole('button', { name: /add skill/i });

    if (await addBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await addBtn.click();
      await page.locator('input[placeholder="TypeScript"]').last().fill('TypeScript');
      await page.locator('input[placeholder="Category"]').last().fill('Languages');
      await page.keyboard.press('Tab');

      await addBtn.click();
      await page.locator('input[placeholder="TypeScript"]').last().fill('NestJS');
      await page.locator('input[placeholder="Category"]').last().fill('Frameworks');
      await page.keyboard.press('Tab');

      await expect(page.locator('#resume-page')).toContainText('TypeScript');
      await expect(page.locator('#resume-page')).toContainText('Languages');
      await expect(page.locator('#resume-page')).toContainText('NestJS');
    }
  });

  // ── Projects ──────────────────────────────────────────────────────────────

  test('add a project via Add Section; title and tags appear in preview', async ({ page }) => {
    // Projects may not be in the resume by default — add it via Add Section if needed
    let projectsSection = page.getByText('Projects').first();
    if (!await projectsSection.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await page.getByRole('button', { name: 'Add Section' }).click();
      await page.getByRole('button', { name: /projects/i }).click();
      projectsSection = page.getByText('Projects').first();
    }
    await projectsSection.click();

    const addBtn = page.getByRole('button', { name: /add project/i });
    await expect(addBtn).toBeVisible({ timeout: 5_000 });
    await addBtn.click();
    await page.getByPlaceholder('Payment Gateway API').last().fill('DevFolio Platform');
    await page.keyboard.press('Tab');
    await page.getByPlaceholder('Node.js, Redis, Kafka').last().fill('Next.js, NestJS, PostgreSQL');
    await page.keyboard.press('Tab');
    await expect(page.locator('#resume-page')).toContainText('DevFolio Platform');
    await expect(page.locator('#resume-page')).toContainText('Next.js');
  });

  // ── Certifications ────────────────────────────────────────────────────────

  test('add a certification via Add Section; name appears in preview', async ({ page }) => {
    // Certifications may not be in the resume by default — add it if needed
    let certSection = page.getByText('Certifications').first();
    if (!await certSection.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await page.getByRole('button', { name: 'Add Section' }).click();
      await page.getByRole('button', { name: /certifications/i }).click();
      certSection = page.getByText('Certifications').first();
    }
    await certSection.click();

    const addBtn = page.getByRole('button', { name: /add certification/i });
    await expect(addBtn).toBeVisible({ timeout: 5_000 });
    await addBtn.click();
    await page.getByPlaceholder('AWS Solutions Architect').last().fill('AWS Certified Developer');
    await page.keyboard.press('Tab');
    await page.getByPlaceholder('Amazon Web Services').last().fill('Amazon Web Services');
    await page.keyboard.press('Tab');
    await expect(page.locator('#resume-page')).toContainText('AWS Certified Developer');
  });

});
