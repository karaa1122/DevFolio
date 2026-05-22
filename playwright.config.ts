import { defineConfig, devices } from '@playwright/test';
import { AUTH_FILE } from './e2e/global-setup';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  globalSetup: './e2e/global-setup.ts',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e/report' }]],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      // Auth tests: no stored state (test login itself)
      name: 'auth-tests',
      testMatch: '**/01-auth.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // All other tests reuse saved login session
      name: 'app-tests',
      testMatch: ['**/02-*.spec.ts', '**/03-*.spec.ts', '**/04-*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
    },
  ],
});
