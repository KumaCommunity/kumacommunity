import {expect, test} from '@playwright/test';

// Focused regression checks, not a substitute for a full accessibility audit.
for (const scheme of ['light', 'dark'] as const) {
  test(`homepage text contrast in ${scheme} mode`, async ({page}) => {
    await page.emulateMedia({colorScheme: scheme});
    await page.goto('/');
    const results = await page.locator('main h1, main h2, main h3, main p, main a, footer a, .navbar__title, .navbar__link').evaluateAll((elements) => {
      function rgb(color: string) { return (color.match(/[\d.]+/g) ?? []).map(Number); }
      function luminance(color: number[]) {
        const values = color.slice(0, 3).map((value) => {
          const s = value / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
      }
      return elements.filter((el) => el.getBoundingClientRect().width > 0).map((el) => {
        const style = getComputedStyle(el);
        let current: Element | null = el;
        let bg = [244, 242, 233];
        while (current) {
          const color = rgb(getComputedStyle(current).backgroundColor);
          if (color.length === 3 || color[3] === 1) { bg = color; break; }
          current = current.parentElement;
        }
        const fg = luminance(rgb(style.color));
        const background = luminance(bg);
        const contrast = (Math.max(fg, background) + 0.05) / (Math.min(fg, background) + 0.05);
        const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
        return {text: el.textContent?.trim(), contrast, required: large ? 3 : 4.5};
      });
    });
    for (const result of results) expect(result.contrast, result.text).toBeGreaterThanOrEqual(result.required);
  });

  // The blog has no posts; its empty archive is the shared blog surface.
  test(`shared docs and blog surfaces ${scheme}`, async ({page}) => {
    await page.setViewportSize({width: 1440, height: 900});
    await page.emulateMedia({colorScheme: scheme});
    for (const [name, path, heading] of [
      ['docs', '/docs/intro', 'Welcome'],
      ['guide', '/docs/Emergency%20Planning/PACE%20Plan', 'PACE Plan'],
      ['blog', '/blog', 'Blog'],
    ] as const) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
      await expect(page.getByRole('main').getByRole('heading', {level: 1})).toHaveText(heading);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), path).toBe(0);
      if (process.env.KUMA_CAPTURE_DIR) {
        await page.screenshot({path: `${process.env.KUMA_CAPTURE_DIR}/${name}-1440-${scheme}.png`, fullPage: true});
      }
    }
  });
}
