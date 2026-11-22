import {defineConfig, devices} from '@playwright/test';

// Smoke tests run against the static production build (`npm run build`),
// served locally by Docusaurus. Set BASE_URL to test another deployment.
const baseURL = process.env.BASE_URL ?? 'http://localhost:3100';
const ci = !!process.env.CI;
// Separate output per invocation, so `npm run test:licensing` (a second run
// against an isolated fixture site) never overwrites the main run's reports.
const suite = process.env.KUMA_TEST_SUITE ?? 'site';

// Node-only specs (no page or browser fixtures) are named *.unit.spec.ts.
const unitSpecs = /\.unit\.spec\.ts$/;

export default defineConfig({
  testDir: './e2e',
  outputDir: `test-results/${suite}`,
  // Optional override so visual baselines can live outside the repository.
  snapshotPathTemplate:
    process.env.KUMA_SNAPSHOT_DIR ?? '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: ci,
  // One retry in CI; the github and HTML reporters mark retried passes as flaky.
  retries: ci ? 1 : 0,
  // CI: annotations on failing lines, an HTML report and JSON for the job summary.
  reporter: ci
    ? [
        ['list'],
        ['github'],
        ['html', {open: 'never', outputFolder: `playwright-report/${suite}`}],
        // Outside the HTML folder, which the HTML reporter clears on write.
        ['json', {outputFile: `playwright-report/${suite}.json`}],
      ]
    : [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    colorScheme: 'light',
  },
  projects: [
    {name: 'unit', testMatch: unitSpecs},
    {name: 'chromium', testIgnore: unitSpecs, use: {...devices['Desktop Chrome']}},
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run serve -- --port 3100 --no-open',
        url: baseURL,
        reuseExistingServer: !ci,
        timeout: 120_000,
      },
});
