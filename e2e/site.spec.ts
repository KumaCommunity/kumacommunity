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
    await page.goto('/docs/Contributing%20Guide');
    await expect(page.locator('article').getByRole('link', {name: 'GitHub', exact: true})).toHaveAttribute('href', 'https://github.com/KumaCommunity/kumacommunity');
    await expect(page.locator('article a[href*="codeberg.org"]')).toHaveCount(0);
    await expect(page.locator('article')).toContainText("aren't accepting direct code contributions or pull requests yet");
  });

  test('intro policy link resolves', async ({page}) => {
    await page.goto('/docs/intro');
    await page.locator('article').getByRole('link', {name: 'Policies'}).click();
    await expect(page).toHaveURL(/\/Policies\/?$/);
  });

  test('doc article has one h1 and markdown content', async ({page}) => {
    await page.goto('/docs/General%20Information/Recommended%20Reading');
    await expect(page.locator('article h1')).toHaveCount(1);
    await expect(page.locator('article .theme-doc-markdown').first()).toBeVisible();
  });
});

test.describe('Blog', () => {
  test('empty archive retains one H1 and no starter post links', async ({page}) => {
    await page.goto('/blog');
    await expect(page.locator('main h1')).toHaveText('Blog');
    await expect(page.locator('a[href="/blog/welcome"]')).toHaveCount(0);
    await expect(page.locator('main')).toHaveCount(1);
  });

  test('starter post excluded from public discovery', async ({page, request}) => {
    await page.goto('/');
    await expect(page.locator('a[href="/blog"]')).toHaveCount(0);
    const sitemap = await request.get('/sitemap.xml');
    expect(await sitemap.text()).not.toContain('/blog/welcome');
    for (const path of ['/blog/rss.xml', '/blog/atom.xml']) {
      const response = await request.get(path);
      if (response.ok()) expect(await response.text()).not.toContain('/blog/welcome');
    }
  });

  test('post renders with metadata, tags and no errors', async ({page}) => {
    const errors = trackErrors(page);
    await page.goto('/blog/welcome');
    await expect(page.locator('article h1')).toHaveText('Welcome');
    await expect(page.locator('article')).toContainText('Simply add Markdown files');
    await expect(page.locator('time').first()).toHaveAttribute('datetime', /2021-08-26/);
    await expect(page.locator('article').getByRole('link', {name: 'hello'})).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('unlisted post retains URL and has noindex metadata', async ({page}) => {
    await page.goto('/blog/welcome');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});

test.describe('Policy pages', () => {
  for (const path of ['/PrivacyPolicy', '/TermsOfUse', '/Policies']) {
    test(`${path} renders`, async ({page}) => {
      await page.goto(path);
      await expect(page.locator('article h1').first()).toBeVisible();
    });
  }
});

test.describe('Responsive layout', () => {
  const widths = [1920, 1440, 768, 390, 375];
  for (const width of widths) {
    test(`no horizontal scroll at ${width}px`, async ({page}) => {
      await page.setViewportSize({width, height: 900});
      for (const path of ['/', '/docs/intro', '/blog/welcome']) {
        await page.goto(path);
        await expectNoHorizontalScroll(page);
      }
    });
  }

  test('mobile navbar toggle opens the menu', async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto('/');
    const toggle = page.locator('.navbar__toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('.navbar-sidebar')).toBeVisible();
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

  test('images have alt text on home and blog', async ({page}) => {
    for (const path of ['/', '/blog/welcome']) {
      await page.goto(path);
      const missing = await page.locator('img:not([alt])').count();
      expect(missing, `images without alt on ${path}`).toBe(0);
    }
  });

  test('follows prefers-color-scheme in dark mode', async ({page}) => {
    // colorMode.respectPrefersColorScheme is enabled, so the toggle is disabled
    // and the theme must follow the OS/browser preference.
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
    ['blog-post', '/blog/welcome'],
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
