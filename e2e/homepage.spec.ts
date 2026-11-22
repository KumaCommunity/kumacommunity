import {expect, test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import type {HomepageData} from '../src/data/homepage';

const headline = 'Building a more resilient community.';
const description = 'Guides and resources for emergency preparedness, personal safety, communications, privacy, and independent technology.';
const contributionCopy = 'Found an error, have a suggestion, or want to contribute a guide? Contributions to Kuma Community are welcome.';

for (const scheme of ['light', 'dark'] as const) {
  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`homepage ${scheme} at ${width}px`, async ({page}) => {
      await page.emulateMedia({colorScheme: scheme, reducedMotion: 'reduce'});
      await page.setViewportSize({width, height: 900});
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
      await expect(page.getByRole('heading', {level: 1})).toHaveText(headline);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
      for (const name of ['Explore the Guides', 'About the Project', 'Contribution guidelines', 'GitHub']) {
        const link = page.getByRole('link', {name, exact: true});
        await expect(link).toBeVisible();
        expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
      if (process.env.KUMA_CAPTURE_DIR && [375, 768, 1440].includes(width)) {
        await page.screenshot({path: `${process.env.KUMA_CAPTURE_DIR}/home-${width}-${scheme}.png`, fullPage: true, animations: 'disabled'});
      }
    });
  }
}

test('approved copy, semantic structure and content-dependent omission', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByText(description, {exact: true})).toBeVisible();
  for (const label of ['Kuma Community / Field guides', 'Our principles', 'Read. Learn. Share feedback.', 'What guides the work']) {
    await expect(page.getByText(label, {exact: true})).toHaveCount(0);
  }
  await expect(page.locator('main [class*="eyebrow"], main [class*="sectionHeading"]')).toHaveCount(0);
  await expect(page.getByRole('heading', {name: /^Open project/})).toHaveCount(0);
  const contribute = page.getByRole('region', {name: /^Contribute/});
  await expect(contribute.locator('p')).toHaveText(contributionCopy);
  await expect(contribute.locator(':scope > div a')).toHaveCount(2);
  await expect(contribute.getByRole('link', {name: 'Contribution guidelines', exact: true})).toHaveAttribute('href', '/docs/Contributing Guide');
  await expect(contribute.getByRole('link', {name: 'GitHub', exact: true})).toHaveAttribute('href', 'https://github.com/KumaCommunity/kumacommunity');
  await expect(page.getByRole('link', {name: /^(Report an error|Suggest content)$/})).toHaveCount(0);
  for (const [title, copy] of [['Accessible', 'Education without barriers'], ['Practical', 'Real world applications'], ['Independent', 'Built on open standards']]) {
    await expect(page.getByRole('heading', {name: title, exact: true})).toBeVisible();
    await expect(page.getByText(copy, {exact: true})).toBeVisible();
  }
  const data = JSON.parse(readFileSync('.docusaurus/globalData.json', 'utf8'))['kuma-homepage'].default as HomepageData;
  for (const [name, items] of [['Explore by topic', data.topics], ['Where to start', data.featured], ['Recently published', data.recent]] as const) {
    await expect(page.getByRole('heading', {name: new RegExp(`^${name}`)})).toHaveCount(items.length ? 1 : 0);
  }
  await expect(page.locator('main')).not.toContainText(/Docusaurus Tutorial|coming soon|systems thinking|thinking in systems|—/i);
  await expect(page.locator('main svg:not([aria-hidden="true"])')).toHaveCount(0);
});

test('hero and contribution guidelines reach real routes and anchors', async ({page}) => {
  for (const [name, path, heading] of [
    ['Explore the Guides', '/docs/intro', 'Welcome'],
    ['About the Project', '/docs/intro#about-us', 'About Us'],
    ['Contribution guidelines', '/docs/Contributing%20Guide', 'Contributing'],
  ]) {
    await page.goto('/');
    await page.getByRole('link', {name, exact: true}).click();
    expect(decodeURI(new URL(page.url()).pathname + new URL(page.url()).hash)).toBe(decodeURI(path));
    await expect(page.getByRole('heading', {name: new RegExp(`^${heading}`)}).first()).toBeVisible();
  }
});

test('static HTML contains copy, canonical and social metadata without JavaScript', async ({browser, request}) => {
  const response = await request.get('/');
  const html = await response.text();
  expect(html).toContain(headline);
  expect(html).toContain('Education without barriers');
  expect(html).toContain(contributionCopy);
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', {level: 1})).toHaveText(headline);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://kumacommunity.com/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://kumacommunity.com/img/logo.png');
  await context.close();
});

test('initial load requests only same-origin resources', async ({page}) => {
  const external: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== new URL(test.info().project.use.baseURL!).origin) external.push(request.url());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(external).toEqual([]);
});

test('keyboard skip link and CTA have visible focus; theme control works', async ({page}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', {name: 'Skip to main content'})).toBeFocused();
  await page.keyboard.press('Enter');
  // Actual keyboard traversal, not programmatic focus.
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press('Tab');
    if (await page.getByRole('link', {name: 'Explore the Guides', exact: true}).evaluate((el) => el === document.activeElement)) break;
  }
  const primary = page.getByRole('link', {name: 'Explore the Guides', exact: true});
  await expect(primary).toBeFocused();
  expect(await primary.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
  expect(await primary.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
  const toggle = page.getByRole('button', {name: /Switch between dark and light mode/});
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('mobile menu keyboard operation retains Guides and About', async ({page}) => {
  await page.setViewportSize({width: 375, height: 812});
  await page.goto('/');
  const toggle = page.getByRole('button', {name: /Toggle navigation bar/});
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const sidebar = page.locator('.navbar-sidebar');
  await expect(sidebar.getByRole('link', {name: 'Guides', exact: true})).toBeVisible();
  await sidebar.getByRole('link', {name: 'About', exact: true}).click();
  await expect(page).toHaveURL(/\/docs\/intro#about-us$/);
});

for (const scheme of ['light', 'dark'] as const) {
  test(`200% text and long headings reflow without clipping in ${scheme} mode`, async ({page}) => {
    await page.emulateMedia({colorScheme: scheme});
    await page.setViewportSize({width: 320, height: 900});
    await page.goto('/');
    await page.addStyleTag({content: 'html {font-size: 200% !important}'});
    await page.locator('main h1').evaluate((el) => { el.textContent = 'Building a more resilient community with practical household preparedness and independent communications'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    await expect(page.getByRole('link', {name: 'Explore the Guides', exact: true})).toBeVisible();
    const contribute = page.getByRole('region', {name: /^Contribute/});
    await expect(contribute.locator('p')).toHaveText(contributionCopy);
    await expect(contribute.getByRole('link', {name: 'Contribution guidelines', exact: true})).toBeVisible();
    await expect(contribute.getByRole('link', {name: 'GitHub', exact: true})).toBeVisible();
  });
}
