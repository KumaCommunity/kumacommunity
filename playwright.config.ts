import {defineConfig, devices} from '@playwright/test';

// Smoke tests run against the static production build (`npm run build`),
// served locally by Docusaurus. Set BASE_URL to test another deployment.
const baseURL = process.env.BASE_URL ?? 'http://localhost:3100';

export default defineConfig({
  testDir: './e2e',
  // Optional override so visual baselines can live outside the repository.
  snapshotPathTemplate:
    process.env.KUMA_SNAPSHOT_DIR ?? '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    colorScheme: 'light',
  },
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run serve -- --port 3100 --no-open',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
