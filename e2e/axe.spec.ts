import {expect, test, type Page} from '@playwright/test';
import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

// Opt-in external tooling: no axe package or browser code added to the site.
// KUMA_AXE_SOURCE must point to a locally installed axe-core/axe.min.js.
const axeSource = process.env.KUMA_AXE_SOURCE;
const reportDir = process.env.KUMA_AXE_REPORT_DIR;

type AxeFinding = {
  id: string;
  impact: string | null;
  help: string;
  nodes: {target: unknown; failureSummary?: string}[];
};
type AxeResults = {
  testEngine: {name: string; version: string};
  violations: AxeFinding[];
  incomplete: AxeFinding[];
};
type BrowserAxe = {
  run(context: Document, options: {runOnly: {type: string; values: string[]}}): Promise<AxeResults>;
};

async function scan(page: Page, name: string) {
  await page.addScriptTag({path: axeSource!});
  const results = await page.evaluate(async () => {
    const {axe} = window as unknown as {axe: BrowserAxe};
    return axe.run(document, {runOnly: {type: 'tag', values: [
      'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice',
    ]}});
  });
  const json = JSON.stringify(results, null, 2);
  await test.info().attach('axe-results', {body: json, contentType: 'application/json'});
  if (reportDir) {
    mkdirSync(reportDir, {recursive: true});
    writeFileSync(join(reportDir, `${name}.json`), json);
  }
  expect(results.violations.map(({id, impact, help, nodes}) => ({id, impact, help, nodes}))).toEqual([]);
}

const routes = process.env.KUMA_LICENSE_FIXTURES ? [
  ['educational-doc', '/docs/license-fixture'],
  ['educational-blog', '/blog/license-fixture'],
  ['alternate-license', '/docs/license-alternate'],
  ['rights-notice', '/blog/license-rights'],
] as const : [
  ['home', '/'],
  ['welcome', '/docs/intro'],
  ['contributing', '/docs/Contributing%20Guide'],
  ['guide', '/docs/Emergency%20Planning/PACE%20Plan'],
  ['blog-index', '/blog'],
  ['licensing', '/licensing'],
  ['privacy', '/PrivacyPolicy'],
  ['terms', '/TermsOfUse'],
  ['policies', '/Policies'],
] as const;

test.describe('Axe accessibility', () => {
  test.skip(!axeSource, 'set KUMA_AXE_SOURCE to an external axe-core/axe.min.js');
  for (const scheme of ['light', 'dark'] as const) {
    for (const width of [320, 1440]) {
      for (const [name, route] of routes) {
        test(`${name} ${scheme} ${width}px`, async ({page}) => {
          await page.setViewportSize({width, height: 900});
          await page.emulateMedia({colorScheme: scheme, reducedMotion: 'reduce'});
          await page.goto(route);
          await page.waitForLoadState('networkidle');
          await scan(page, `${name}-${scheme}-${width}`);
        });
      }
    }
    test(`mobile navigation open ${scheme}`, async ({page}) => {
      await page.setViewportSize({width: 320, height: 900});
      await page.emulateMedia({colorScheme: scheme, reducedMotion: 'reduce'});
      await page.goto('/');
      await page.getByRole('button', {name: /Toggle navigation bar/}).click();
      await expect(page.locator('.navbar-sidebar')).toBeVisible();
      await scan(page, `mobile-navigation-${scheme}`);
    });
  }
});
