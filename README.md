# Kuma Community

Kuma Community is a collection of practical guides on civilian preparedness and technology. This repository contains the articles and source code for [www.kumacommunity.com](https://www.kumacommunity.com).

## Local development

The site uses Docusaurus. The project pins Node.js 26.13.1 and npm 12.2.3. With `nvm` installed, run these commands from the repository root:

```sh
nvm install
nvm use
npm install --global npm@12.2.3
npm ci
npm start
```

Open `http://localhost:3000`. The site reloads as you edit.

| Directory | Contents |
|---|---|
| `docs/` | Guides and reference articles |
| `blog/` | Blog posts, authors, and tags |
| `src/` | React components, standalone pages, and styles |
| `static/` | Images and other files served as-is |
| `e2e/` | Playwright tests |

## Checking changes

Install Chromium once with `npx playwright install chromium`. Then run `npm run check` to check TypeScript, build the site, and run the browser tests. To preview the production build locally, run `npm run serve`.

Keep the `@docusaurus/*` packages on the same version when upgrading. See the [modernization report](./MODERNIZATION_REPORT.md) for details on the TypeScript configuration and dependency overrides.

## Homepage content

The homepage is static, with metadata resolved during `npm start` and `npm run build` by `plugins/homepage/index.ts`. No runtime content requests or remote fonts are used. Typography uses system sans/serif/monospace fallbacks because approved font files and licenses were not supplied. The original logo is unchanged.

The initial library has no completed educational guides or real blog posts. Topic, starter-guide and recent-publication sections therefore stay hidden. Empty documents and the unlisted Docusaurus starter blog post retain their existing URLs.

To publish content for homepage discovery:

1. Finish and review substantive educational content. Add `homepage: true` to its Markdown front matter only after editorial approval. A nonempty metadata description (from front matter or content) is also required. This flag is an editorial assertion, not automatic content classification. Do not approve placeholders, template content or empty resource lists.
2. Keep drafts and unlisted material marked `draft: true` or `unlisted: true`; these never appear on the homepage.
3. Optionally give a guide an explicit publication `date: YYYY-MM-DD`. Undated guides can appear in topics and curated selections but not the recent feed. Blog posts use their explicit Docusaurus publication date, from front matter or the dated filename. Dates are calendar dates in UTC. Future dates stay hidden until a build on or after that date; editing a file never changes its publication date. Invalid dates fail the build with a clear message.
4. Add or change topic entries and curated document IDs in `src/data/homepage.ts`. References must match existing Docusaurus document IDs, including case and spaces. Missing IDs fail the build; existing ineligible references stay hidden. Pending PACE planning and storage-safety entries are already configured. New categories need only a typed entry and a supported local icon, not component changes. Homepage titles, descriptions and public URLs come from Docusaurus metadata, not duplicated card copy.
5. Run `npm run check`. Data tests cover eligibility, dates, sorting, required references, and empty/sparse feeds. The recent feed combines guides and articles, shows up to three entries, and sorts by publication date descending, then canonical URL ascending. No archive link appears until a real populated archive exists. Restore Blog navigation in `docusaurus.config.ts` when substantive blog content is published.

Shared project destinations live in `src/data/project.ts`. GitHub is the canonical source repository, including the published Contributing page. Contributions currently go through the existing email guidelines, not pull requests.

Optional visual tests: `npm run test:visual`. Baselines must be captured on the same OS/browser and reviewed before accepting updates.

Optional axe accessibility scans use external tooling, not a project or production dependency:

```sh
TOOLS="$(mktemp -d)"
npm install --prefix "$TOOLS" --no-package-lock --ignore-scripts --no-audit --no-fund axe-core@4.14.1
KUMA_AXE_SOURCE="$TOOLS/node_modules/axe-core/axe.min.js" \
KUMA_AXE_REPORT_DIR=/tmp/kuma-axe-reports npm run check
```

`e2e/axe.spec.ts` scans eight routes at 320px and 1440px in both themes, plus the open mobile navigation in both themes. It checks WCAG 2.0/2.1/2.2 A/AA tags supported by axe and best practices. Every reported violation fails the test; full JSON reports retain `incomplete` results for manual review. These opt-in tests skip when `KUMA_AXE_SOURCE` is unset. The empty blog archive has a minimal accessible heading; populated archives retain the original Docusaurus component. Automated scans do not prove full accessibility conformance or replace screen-reader testing.

See `HOMEPAGE_REDESIGN_PROGRESS.md` for phase checkpoints and verification details. No Cloudflare runtime services or deployment settings changed.

## Contributing

Pull requests are currently closed. To suggest a code change, report an error, or propose an article, follow the email instructions on the site’s Contributing page. For a bug, include steps to reproduce it. For an article, send a short outline and any sources you plan to use.

## License

The site source is licensed under the [GNU General Public License v3.0](./LICENSE).