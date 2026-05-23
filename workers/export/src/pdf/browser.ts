import { chromium, type Browser } from 'playwright';

/**
 * Playwright browser singleton. We launch one Chromium per worker process and
 * reuse it across PDF jobs, opening a fresh context per job to isolate state.
 * Closing the browser on graceful shutdown is the caller's responsibility.
 */
let browser: Browser | null = null;
let launching: Promise<Browser> | null = null;

export async function getBrowser(): Promise<Browser> {
  if (browser) return browser;
  if (launching) return launching;

  launching = chromium
    .launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    })
    .then((b) => {
      browser = b;
      launching = null;
      return b;
    });

  return launching;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    const b = browser;
    browser = null;
    await b.close();
  }
}
