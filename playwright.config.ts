import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  timeout: 30000,

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  outputDir: 'test-results',          // artefacts des tests

  reporter: [
    ['html', { outputFolder: 'playwright-report' }]  // rapport HTML à la racine
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://dummyjson.com',
    trace: 'on-first-retry',
  },
});