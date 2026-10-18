import { defineConfig, devices } from '@playwright/test';

// Runs against a PRODUCTION build (`npm run build` first). Dev mode is unminified and
// behaves differently, so it proves nothing about the live site.
const PORT = 3100;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  // Headless browsers render the WebGL background in software; more parallel workers
  // starve the CPU and cause load-only timeouts.
  workers: 2,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.BASE_URL || `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npx next start -H 127.0.0.1 -p ${PORT}`,
        url: `http://127.0.0.1:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
  projects: [
    { name: 'static', testMatch: /static\.spec\.js/ },
    { name: 'chrome', testIgnore: /static\.spec\.js/, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'firefox', testIgnore: /static\.spec\.js/, use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    { name: 'webkit', testIgnore: /static\.spec\.js/, use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', testIgnore: /static\.spec\.js/, use: { ...devices['iPad (gen 7)'] } },
    { name: 'iphone-375', testIgnore: /static\.spec\.js/, use: { ...devices['iPhone 13 Mini'] } }, // 'iPhone SE' is the 320px model
    {
      name: 'android-360',
      testIgnore: /static\.spec\.js/,
      use: { ...devices['Galaxy S8'], viewport: { width: 360, height: 740 } },
    },
    {
      name: 'phone-320',
      testIgnore: /static\.spec\.js/,
      use: { ...devices['Galaxy S8'], viewport: { width: 320, height: 640 } },
    },
  ],
});
