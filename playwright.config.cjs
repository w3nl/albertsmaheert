// @ts-check
// Playwright-tests voor de escaperoom (src/escaperoom). De site zelf heeft geen tests nodig: `npm run validate` bouwt hem.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/escaperoom',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174/escaperoom/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // PW_CHROMIUM: een al geïnstalleerde Chromium gebruiken in plaats van die van Playwright
    ...(process.env.PW_CHROMIUM ? { launchOptions: { executablePath: process.env.PW_CHROMIUM } } : {}),
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } }, testIgnore: /phone\.spec/ },
    { name: 'phone', use: { ...devices['Pixel 7'] }, testMatch: /phone\.spec/ },
  ],
  webServer: {
    command: 'node tests/escaperoom/serve.js',
    url: 'http://127.0.0.1:4174/escaperoom/',
    reuseExistingServer: !process.env.CI,
  },
});
