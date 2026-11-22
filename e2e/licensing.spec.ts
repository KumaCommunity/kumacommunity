import {expect, test} from '@playwright/test';

// Opted-out project pages, empty placeholders, standalone and legal pages.
const adminRoutes = [
  '/', '/docs/intro', '/docs/Contributing%20Guide',
  '/docs/General%20Information/Creators',
  '/docs/General%20Information/Recommended%20Reading',
  '/docs/General%20Information/Resources%20&%20Links',
  '/blog', '/Policies', '/PrivacyPolicy', '/TermsOfUse', '/licensing',
];

// Published educational guides with metadata descriptions. The Exfil guide is
// omitted: Git tracks `EXFIL Plan.md`, so its URL differs between Linux CI and
// case-insensitive local filesystems until the filename case is settled.
const publishedGuides = [
  '/docs/Emergency%20Planning/Condition%20Plan',
  '/docs/Emergency%20Planning/PACE%20Plan',
  '/docs/Firearms/Firearm%20Safety/Range%20Safety',
  '/docs/Firearms/Firearm%20Safety/Safe%20Storage',
];

test('footer separates licenses without duplicate copyright or license links', async ({page}) => {
  await page.goto('/');
  const footer = page.locator('footer.footer');
  await expect(footer.locator('.footer__copyright')).toHaveText(
    `Copyright © ${new Date().getFullYear()} Kuma Community`,
  );
  const software = footer.getByRole('link', {name: /^GPLv3 \(Source Code\)/});
  const content = footer.getByRole('link', {name: 'CC BY-SA 4.0 (Content)', exact: true});
  await expect(software).toHaveCount(1);
  await expect(software).toHaveAttribute('href', 'https://github.com/KumaCommunity/kumacommunity/blob/main/LICENSE');
  await expect(content).toHaveCount(1);
  await expect(content).toHaveAttribute('href', '/licensing');
  await expect(footer.getByRole('link', {name: 'GPL-3.0 license', exact: true})).toHaveCount(0);
  for (const heading of ['Explore', 'Project', 'Legal']) {
    await expect(footer.getByText(heading, {exact: true})).toHaveCount(1);
  }
  await content.click();
  await expect(page).toHaveURL(/\/licensing\/?$/);
  await expect(page.getByRole('heading', {name: 'Educational content license', exact: true})).toBeVisible();
});

test('article notices stay off administrative pages, legal pages and empty placeholders', async ({page}) => {
  for (const route of adminRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole('complementary', {name: 'Content license', exact: true})).toHaveCount(0);
  }
});

test('published guides show one default content license notice in static HTML', async ({page, request}) => {
  for (const route of publishedGuides) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    expect(await response.text(), route).toContain('Unless otherwise noted, original educational content');
    await page.goto(route);
    const notice = page.getByRole('complementary', {name: 'Content license', exact: true});
    await expect(notice, route).toHaveCount(1);
    await expect(notice.getByRole('link', {name: 'CC BY-SA 4.0'})).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0/');
    await expect(notice.getByRole('link', {name: 'Scope and exclusions'})).toHaveAttribute('href', '/licensing');
  }
});

test('licensing page includes official terms, exclusions and attribution without broken internal links', async ({page, request}) => {
  await page.goto('/licensing');
  const main = page.locator('main');
  await expect(main.getByRole('link', {name: /Creative Commons Attribution-ShareAlike/}))
    .toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0/');
  await expect(main.getByRole('link', {name: 'official GPLv3 text'}))
    .toHaveAttribute('href', 'https://www.gnu.org/licenses/gpl-3.0.html');
  await expect(main).toContainText('GPL-3.0-or-later');
  await expect(main).toContainText('CC-BY-SA-4.0');
  await expect(main).toContainText('All rights reserved by their respective rights holders');
  await expect(main).toContainText('Third-party material');
  await expect(main).toContainText('additional legal terms or technological measures');
  await expect(main).toContainText('does not revoke rights already granted');
  for (const href of await page.locator('a[href^="/"]').evaluateAll((links) =>
    [...new Set(links.map((link) => link.getAttribute('href')!))])) {
    expect((await request.get(href)).ok(), href).toBeTruthy();
  }
});

test('contribution licensing keeps direct pull requests closed', async ({page}) => {
  await page.goto('/docs/Contributing%20Guide');
  const article = page.locator('article');
  await expect(article).toContainText(/(?:aren't|are not|not) (?:currently )?accepting direct code contributions or pull requests/i);
  await expect(article.locator('a[href="https://github.com/KumaCommunity/kumacommunity"]').first()).toBeVisible();
  await expect(article).toContainText('You retain copyright');
  await expect(article).toContainText('Flag uncertain rights for review');
});

for (const scheme of ['light', 'dark'] as const) {
  for (const width of [320, 1440]) {
    test(`licensing and legal pages reflow in ${scheme} at ${width}px`, async ({page}) => {
      await page.emulateMedia({colorScheme: scheme});
      await page.setViewportSize({width, height: 900});
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      for (const route of ['/licensing', '/TermsOfUse', '/Policies', '/docs/Contributing%20Guide']) {
        await page.goto(route);
        await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), route).toBe(0);
        await page.locator('html').evaluate((element) => { element.style.fontSize = '200%'; });
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${route} at 200% text`).toBe(0);
      }
      expect(errors).toEqual([]);
    });
  }
}

test.describe('Licensing visual regression', () => {
  test.skip(!process.env.KUMA_VISUAL, 'set KUMA_VISUAL=1 for reviewed same-platform visual baselines');
  for (const scheme of ['light', 'dark'] as const) {
    for (const width of [320, 1440]) {
      for (const [name, route] of [
        ['scope', '/licensing'], ['terms', '/TermsOfUse'], ['policies', '/Policies'],
        ['contributing', '/docs/Contributing%20Guide'],
      ]) {
        test(`${name} ${scheme} ${width}px`, async ({page}) => {
          await page.emulateMedia({colorScheme: scheme, reducedMotion: 'reduce'});
          await page.setViewportSize({width, height: 900});
          await page.goto(route);
          await expect(page).toHaveScreenshot(`${name}-${scheme}-${width}.png`, {
            fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.002,
          });
        });
      }
    }
  }
});
