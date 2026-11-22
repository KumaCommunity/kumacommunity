import {expect, test, type Page} from '@playwright/test';

// Collects console errors and uncaught exceptions for a page.
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  return errors;
}

// Published guide used wherever a real, content-rich article is needed.
const guidePath = '/docs/Emergency%20Planning/PACE%20Plan';
// Docusaurus starter post removed in 3bdb320. Only checked for absence.
const removedStarterPost = '/blog/welcome';

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
}

test.describe('Homepage', () => {
  test('loads with navbar, content, footer and no errors', async ({page}) => {
    const errors = trackErrors(page);
    await page.goto('/');
    await expect(page).toHaveTitle(/Kuma Community/);
    await expect(page.locator('nav.navbar')).toBeVisible();
    await expect(page.locator('nav.navbar').getByRole('link', {name: 'Guides'})).toBeVisible();
    await expect(page.locator('nav.navbar').getByRole('link', {name: 'About'})).toBeVisible();
    await expect(page.locator('nav.navbar').getByRole('link', {name: 'Blog'})).toHaveCount(0);
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
    const logo = page.locator('nav.navbar img').first();
    await expect(logo).toBeVisible();
    expect(await logo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test('footer legal links resolve', async ({page}) => {
    for (const [name, path] of [
      [/Privacy Policy/, '/PrivacyPolicy'],
      [/Terms of Use/, '/TermsOfUse'],
      [/Other Pol/, '/Policies'],
    ] as const) {
      await page.goto('/');
      await page.locator('footer').getByRole('link', {name}).click();
      await expect(page).toHaveURL(new RegExp(`${path}/?$`));
      await expect(page.locator('h1').first()).toBeVisible();
    }
  });
});

test.describe('Documentation', () => {
  test('intro renders and sidebar navigates to nested article', async ({page}) => {
    const errors = trackErrors(page);
    await page.goto('/docs/intro');
    await expect(page.locator('h1').first()).toBeVisible();
    const sidebar = page.locator('.theme-doc-sidebar-container');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toContainText('Emergency Planning');
    await sidebar.getByRole('link', {name: 'Contributing', exact: true}).click();
    await expect(page).toHaveURL(/\/docs\/Contributing(%20|\s)Guide\/?$/);
    await expect(page.locator('article h1').first()).toBeVisible();
    await page.goto('/docs/Emergency%20Planning/PACE%20Plan');
    await expect(page.locator('article h1').first()).toBeVisible();
    await expect(page.locator('.theme-doc-sidebar-container')).toContainText('PACE Plan');
    expect(errors).toEqual([]);
  });

  test('contribution source is GitHub and pull requests remain closed', async ({page}) => {
    const response = await page.goto('/docs/Contributing%20Guide');
    expect(response?.status()).toBe(200);
    const article = page.getByRole('article');
    // Destination matters, not the visible link label.
    await expect(article.locator('a[href="https://github.com/KumaCommunity/kumacommunity"]').first()).toBeVisible();
    await expect(article.locator('a[href*="codeberg.org"]')).toHaveCount(0);
    await expect(article).toContainText(/(?:aren't|are not|not) (?:currently )?accepting direct code contributions or pull requests/i);
  });

  test('intro policy link resolves', async ({page}) => {
    await page.goto('/docs/intro');
    await page.locator('article').getByRole('link', {name: 'Policies'}).click();
    await expect(page).toHaveURL(/\/Policies\/?$/);
  });

  test('published guide has one h1, markdown content, tags and metadata', async ({page}) => {
    const response = await page.goto(guidePath);
    expect(response?.status()).toBe(200);
    const article = page.getByRole('article');
    await expect(article.getByRole('heading', {level: 1})).toHaveCount(1);
    await expect(article.getByRole('heading', {level: 2}).first()).toBeVisible();
    await expect(article.getByRole('list').first()).toBeVisible();
    await expect(article.getByRole('link', {name: 'planning', exact: true})).toHaveAttribute('href', '/docs/tags/planning');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });

  test('empty placeholder doc still renders its title', async ({page}) => {
    const response = await page.goto('/docs/General%20Information/Recommended%20Reading');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('article').getByRole('heading', {level: 1})).toHaveCount(1);
  });
});

test.describe('Blog', () => {
  // The blog has no published posts. Populated post rendering, tags, dates,
  // authors and unlisted noindex metadata are covered by isolated fixtures in
  // e2e/licensing-fixtures.spec.ts (npm run test:licensing, run in CI).
  test('empty archive returns 200 with one H1 and no posts', async ({page}) => {
    const errors = trackErrors(page);
    const response = await page.goto('/blog');
    expect(response?.status()).toBe(200);
    const main = page.getByRole('main');
    await expect(main).toHaveCount(1);
    await expect(main.getByRole('heading', {level: 1})).toHaveText('Blog');
    await expect(main.getByRole('article')).toHaveCount(0);
    await expect(page.locator(`a[href="${removedStarterPost}"]`)).toHaveCount(0);
    await expect(page).toHaveTitle(/^Blog \| Kuma Community$/);
    expect(errors).toEqual([]);
  });

  test('removed starter post is unavailable and absent from discovery', async ({page, request}) => {
    const removed = await request.get(removedStarterPost);
    expect(removed.status()).toBe(404);
    await page.goto('/');
    await expect(page.locator('a[href="/blog"]')).toHaveCount(0);
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).not.toContain(removedStarterPost);
    // Feeds are only generated once posts exist. If present, they must not
    // advertise removed content.
    for (const path of ['/blog/rss.xml', '/blog/atom.xml']) {
      const response = await request.get(path);
      if (response.ok()) expect(await response.text()).not.toContain(removedStarterPost);
    }
  });
});

test.describe('Not found', () => {
  test('unknown route returns 404 with the site layout', async ({page}) => {
    const response = await page.goto('/this-route-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();
    await expect(page.getByRole('navigation', {name: 'Main'})).toBeVisible();
  });
});

test.describe('Policy pages', () => {
  for (const path of ['/PrivacyPolicy', '/TermsOfUse', '/Policies']) {
    test(`${path} renders`, async ({page}) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('article').getByRole('heading', {level: 1}).first()).toBeVisible();
    });
  }
});

test.describe('Responsive layout', () => {
  const widths = [1920, 1440, 768, 390, 375];
  for (const width of widths) {
    test(`no horizontal scroll at ${width}px`, async ({page}) => {
      await page.setViewportSize({width, height: 900});
      for (const path of ['/', '/docs/intro', guidePath, '/blog']) {
        const response = await page.goto(path);
        expect(response?.status(), path).toBe(200);
        await expectNoHorizontalScroll(page);
      }
    });
  }

  test('mobile navbar toggle opens the menu', async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto('/');
    const toggle = page.getByRole('button', {name: /Toggle navigation bar/});
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.navbar-sidebar').getByRole('link', {name: 'Guides', exact: true})).toBeVisible();
  });
});

test.describe('Accessibility and interaction', () => {
  test('keyboard focus is visible on first navigation link', async ({page}) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('images have alt text on home, guides and blog', async ({page}) => {
    for (const path of ['/', guidePath, '/blog']) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      const missing = await page.locator('img:not([alt])').count();
      expect(missing, `images without alt on ${path}`).toBe(0);
    }
  });

  test('follows prefers-color-scheme in dark mode', async ({page}) => {
    // colorMode.respectPrefersColorScheme is enabled, so the initial theme
    // must follow the OS/browser preference.
    await page.emulateMedia({colorScheme: 'dark'});
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--ifm-background-color'),
    );
    expect(bg.trim()).toBe('#1c231f');
  });
});

// Pixel comparison needs baselines generated on the same OS/browser, so it is
// opt-in: KUMA_VISUAL=1 npm run test:visual (first run writes baselines).
test.describe('Visual regression', () => {
  test.skip(!process.env.KUMA_VISUAL, 'set KUMA_VISUAL=1 to run pixel comparisons');

  const pages = [
    ['home', '/'],
    ['docs-intro', '/docs/intro'],
    ['blog-index', '/blog'],
    // Replaces the removed starter post, which captured only the 404 page.
    ['guide', guidePath],
    ['privacy-policy', '/PrivacyPolicy'],
  ] as const;
  const viewports = [
    {name: 'desktop-1440', width: 1440, height: 900},
    {name: 'mobile-390', width: 390, height: 844},
  ];
  const schemes = ['light', 'dark'] as const;

  for (const [name, path] of pages) {
    for (const vp of viewports) {
      for (const scheme of schemes) {
        test(`${name} @ ${vp.name} ${scheme}`, async ({page}) => {
          await page.emulateMedia({colorScheme: scheme});
          await page.setViewportSize({width: vp.width, height: vp.height});
          await page.goto(path);
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveScreenshot(`${name}-${vp.name}-${scheme}.png`, {
            fullPage: true,
            animations: 'disabled',
            maxDiffPixelRatio: 0.002,
          });
        });
      }
    }
  }
});
