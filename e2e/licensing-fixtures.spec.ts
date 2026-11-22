import {expect, test} from '@playwright/test';
import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

// Only the temporary site contains these articles. Never publish fixtures.
// npm run test:licensing supplies both the site and this environment flag.
test.skip(!process.env.KUMA_LICENSE_FIXTURES, 'run npm run test:licensing against the isolated fixture site');

const notice = (page: import('@playwright/test').Page) =>
  page.getByRole('complementary', {name: 'Content license', exact: true});

for (const kind of ['docs', 'blog']) {
  test(`${kind} full article retains Markdown, original footer and default notice`, async ({page, request}) => {
    const route = `/${kind}/license-fixture`;
    const response = await request.get(route);
    expect(response.ok()).toBeTruthy();
    // Verify notice is in static HTML, not inserted only after hydration.
    expect(await response.text()).toContain('Unless otherwise noted, original educational content');
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(route);
    await expect(notice(page)).toHaveCount(1);
    await expect(notice(page).getByRole('link', {name: 'CC BY-SA 4.0'}))
      .toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0/');
    await expect(notice(page).getByRole('link', {name: 'Scope and exclusions'})).toHaveAttribute('href', '/licensing');
    await expect(page.locator('article h1')).toHaveCount(1);
    await expect(page.locator('article strong')).toBeVisible();
    await expect(page.locator('article pre code')).toContainText('fixture');
    await expect(page.locator('article footer')).toBeVisible();
    if (kind === 'docs') {
      await page.getByRole('button', {name: 'Fixture count: 0'}).click();
      await expect(page.getByRole('button', {name: 'Fixture count: 1'})).toBeVisible();
      await page.getByText('Fixture details', {exact: true}).click();
      await expect(page.getByText('MDX details remain intact.', {exact: true})).toBeVisible();
      await expect(page.locator('article footer').getByRole('link', {name: 'license-fixture'})).toBeVisible();
    } else {
      await expect(page.locator('article footer').getByRole('link', {name: 'Hello'})).toBeVisible();
      await expect(page.locator('time').first()).toHaveAttribute('datetime', /2025-01-01/);
      await expect(page.locator('article')).toContainText('Fixture author');
    }
    // A unique licensing notice follows the pre-existing footer content.
    expect(await notice(page).evaluate((element) => Boolean(element.previousElementSibling?.matches('footer')))).toBeTruthy();
    expect(errors).toEqual([]);
  });

  test(`${kind} alternative license replaces rather than duplicates the default`, async ({page}) => {
    await page.goto(`/${kind}/license-alternate`);
    await expect(notice(page)).toHaveCount(1);
    await expect(notice(page).getByRole('link', {name: 'CC BY 4.0'}))
      .toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
    await expect(notice(page)).toContainText('Fixture exception applies to this article.');
    await expect(notice(page)).not.toContainText('CC BY-SA 4.0');
  });

  test(`${kind} rights-only exception and opt-out never inherit CC licensing`, async ({page}) => {
    await page.goto(`/${kind}/license-rights`);
    await expect(notice(page)).toHaveText('Third-party fixture. Permission is limited; see the original credit.');
    await expect(notice(page).getByRole('link')).toHaveCount(0);
    if (kind === 'blog') {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    }
    await page.goto(`/${kind}/license-opt-out`);
    await expect(page.locator('article h1')).toBeVisible();
    await expect(notice(page)).toHaveCount(0);
  });
}

test('drafts, empty docs and blog list/tag excerpts have no article notice', async ({page, request}) => {
  for (const route of ['/docs/license-draft', '/blog/license-draft']) {
    expect((await request.get(route)).status()).toBe(404);
  }
  for (const route of ['/docs/license-empty', '/blog', '/blog/tags/hello']) {
    await page.goto(route);
    await expect(page.locator('main').getByRole('heading').first()).toBeVisible();
    await expect(notice(page)).toHaveCount(0);
  }
  await page.goto('/blog');
  await expect(page.getByRole('link', {name: /Read more/}).first()).toBeVisible();
  await expect(page.locator('main').getByRole('link', {name: 'Blog license fixture', exact: true})).toBeVisible();
});

for (const scheme of ['light', 'dark'] as const) {
  for (const width of [320, 1440]) {
    test(`article notices remain readable in ${scheme} at ${width}px`, async ({page}) => {
      await page.emulateMedia({colorScheme: scheme, reducedMotion: 'reduce'});
      await page.setViewportSize({width, height: 900});
      for (const route of ['/docs/license-fixture', '/blog/license-fixture', '/docs/license-alternate', '/blog/license-rights']) {
        await page.goto(route);
        await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
        await notice(page).scrollIntoViewIfNeeded();
        await expect(notice(page)).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
        const mainStyle = await page.locator('main').evaluate((element) => getComputedStyle(element).color);
        expect(await notice(page).evaluate((element) => getComputedStyle(element).color)).toBe(mainStyle);
        await page.locator('html').evaluate((element) => { element.style.fontSize = '200%'; });
        await notice(page).scrollIntoViewIfNeeded();
        await expect(notice(page)).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
      }
    });
  }
}

test('article license notices pass focused axe checks in both themes and viewports', async ({page}) => {
  const axeSource = process.env.KUMA_AXE_SOURCE;
  test.skip(!axeSource, 'set KUMA_AXE_SOURCE to an external axe-core/axe.min.js');
  if (!axeSource) return;
  for (const scheme of ['light', 'dark'] as const) {
    for (const width of [320, 1440]) {
      for (const route of ['/docs/license-fixture', '/blog/license-fixture', '/docs/license-alternate', '/blog/license-rights']) {
        await page.emulateMedia({colorScheme: scheme});
        await page.setViewportSize({width, height: 900});
        await page.goto(route);
        await page.addScriptTag({path: axeSource});
        const results = await page.evaluate(async () => {
          const {axe} = window as unknown as {axe: {
            run(element: Element, options: object): Promise<{violations: unknown[]; incomplete: unknown[]}>;
          }};
          const element = document.querySelector('aside[aria-label="Content license"]');
          if (!element) throw new Error('Content license notice missing');
          return axe.run(element, {runOnly: {type: 'tag', values: [
            'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice',
          ]}});
        });
        const name = `notice-${route.replaceAll('/', '-')}-${scheme}-${width}`;
        const json = JSON.stringify(results, null, 2);
        await test.info().attach(name, {body: json, contentType: 'application/json'});
        if (process.env.KUMA_AXE_REPORT_DIR) {
          mkdirSync(process.env.KUMA_AXE_REPORT_DIR, {recursive: true});
          writeFileSync(join(process.env.KUMA_AXE_REPORT_DIR, `${name}.json`), json);
        }
        expect(results.violations, name).toEqual([]);
      }
    }
  }
});

test.describe('Licensing fixture visual regression', () => {
  test.skip(!process.env.KUMA_VISUAL, 'set KUMA_VISUAL=1 for reviewed same-platform visual baselines');
  for (const scheme of ['light', 'dark'] as const) {
    for (const width of [320, 1440]) {
      for (const route of ['/docs/license-fixture', '/blog/license-fixture', '/docs/license-alternate', '/blog/license-rights']) {
        test(`${route} ${scheme} ${width}px`, async ({page}) => {
          await page.emulateMedia({colorScheme: scheme, reducedMotion: 'reduce'});
          await page.setViewportSize({width, height: 900});
          await page.goto(route);
          await expect(page).toHaveScreenshot(`${route.replaceAll('/', '-')}-${scheme}-${width}.png`, {
            fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.002,
          });
        });
      }
    }
  }
});
