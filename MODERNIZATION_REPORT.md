# Kuma Community – Modernization Report

Branch: `modernize/docusaurus-3.10` (off `main`, not merged).
Status: **M1–M6 complete; latest-stable follow-up below supersedes historical version choices. Not merged, not deployed.**

---

## Latest-stable follow-up — November 17, 2026

Follow-up starts at `66b36ac` on the same branch, clean working tree. Reviewed prior implementation commits and this report; no repository `AGENTS.md` exists (user-level instructions apply). No website content changes planned.

Fresh baseline on Node 26.13.1 / npm 11.20.0: `npm ci`, `npm run typecheck`, `npm run build`, Chromium installation, and Playwright with visual snapshots all exit 0: 22 functional + 20 visual tests. Saved pre-change production output and same-browser visual baselines outside the repository under `/tmp/kuma-modernization/`.

### TypeScript 7 migration

- npm `latest` verifies TypeScript **7.0.2**, not a prerelease. Installed native compiler and explicit latest stable types: `@types/react` / `@types/react-dom` **19.3.0**, `@types/node` **26.6.6**.
- First `tsc` attempt failed with **TS5102: Option 'baseUrl' has been removed**. Both project config and `@docusaurus/tsconfig@3.10.2` set it. An initial `null` reset let native type checking/build pass, but full verification caught a Playwright parser failure: **The "paths[1]" argument must be of type string. Received null**. Final fix: explicitly mirror the upstream compiler options in the project config, omit `baseUrl` entirely, and rebase `@site/*` to `./*`. No catch-all alias, deprecation suppression, patched dependency files, or error suppression added. Retain the aligned upstream config package as the reference; restore inheritance when upstream removes `baseUrl`.
- Upstream `moduleResolution: bundler`, `module: esnext`, `jsx: preserve`, ES2022/DOM, allowJs, esModuleInterop, and noEmit explicitly retained. Existing upstream `skipLibCheck` unchanged. Native `npm run typecheck` and production build both exit 0; React JSX, site aliases, Docusaurus config/types and Playwright TS files resolve.
- Reviewed Microsoft’s [TypeScript 6 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/) and [TypeScript 7 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), including removed options and documented side-by-side API approach: `typescript: npm:@typescript/typescript6@6.0.2` plus `@typescript/native: npm:typescript@7.0.2`. Registry confirms compatibility package 6.0.2. This fallback is **not needed**: current configured Docusaurus/MDX pipeline builds with TypeScript 7 alone. No new compatibility layer installed.
- Version-specific Context7 documentation available for `/microsoft/typescript/v7.0.2`; checked native compiler/editor guidance against official release documentation and actual installed package.

### Registry and official release verification

Checked during the November 17 local working session (November 18 UTC). npm registry: `https://registry.npmjs.org/`. Queried `version`, `dist-tags`, `engines`, and `peerDependencies` for every direct package; final `npm outdated --json` returns `{}` (exit 0). No prerelease dependencies intentionally introduced. Official release checks:

- [Docusaurus v3.10.2](https://github.com/facebook/docusaurus/releases/tag/v3.10.2): current stable, including MDX link and sidebar fixes. All five direct Docusaurus packages and their transitive family stay aligned. Registry has only a **canary** Docusaurus 4; deferred.
- [React v19.3.1](https://github.com/facebook/react/releases/tag/v19.3.1): registry stable for both React/React DOM; official patch notes concern RSC transport. Docusaurus peers accept React 19.
- [TypeScript v7.0.2](https://github.com/microsoft/TypeScript/releases/tag/v7.0.2): official native release, also corroborated by Microsoft announcements above. Latest stable 6.x is **6.0.3**; compatibility API package latest is **6.0.2**, distinct from that compiler release. Neither fallback required.
- [Node release index](https://nodejs.org/dist/index.json) and [official schedule](https://github.com/nodejs/Release/blob/main/schedule.json): **26.13.1**, security release dated November 10; **Lithium**, LTS since October 28. Node 24 compatibility tested with **24.22.3**.
- [npm v12.2.3](https://github.com/npm/cli/releases/tag/v12.2.3): registry latest and official release notes. Engines `^22.22.2 || ^24.15.0 || >=26.0.0` drive the project's revised minimum.
- [Playwright v1.65.1](https://github.com/microsoft/playwright/releases/tag/v1.65.1), [MDX 3.1.1](https://github.com/mdx-js/mdx/releases/tag/3.1.1), [Prism renderer 2.4.1](https://github.com/FormidableLabs/prism-react-renderer/releases/tag/prism-react-renderer%402.4.1), [clsx 2.1.1](https://github.com/lukeed/clsx/releases/tag/v2.1.1): latest stable, already installed; retained. Reviewed release notes; no forced major migration necessary.
- GitHub Actions official releases: [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1), [setup-node v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0), [upload-artifact v7.0.2](https://github.com/actions/upload-artifact/releases/tag/v7.0.2). Updated floating major references to these explicit latest stable tags. Tags are not immutable SHA pins.

### Previous and final versions

Previous means the completed modernization at `66b36ac`, not the original main branch.

| Component | Previous | Final |
|---|---|---|
| Preferred Node (`.nvmrc`) | 24 | **26.13.1 LTS** |
| Tested Node runtimes | historical 24/26 | **24.22.3 and 26.13.1**, fresh installs |
| Minimum supported Node | >=24.0.0 | **^24.15.0 or >=26.0.0** |
| npm | 11.20.0 locally, unpinned | **12.2.3**, packageManager + CI pin |
| TypeScript | 5.9.3 | **7.0.2** |
| @types/node | 25.2.0 transitive | **26.6.6**, explicit dev dependency |
| @types/react | 19.2.10 transitive | **19.3.0**, explicit dev dependency |
| @types/react-dom | absent | **19.3.0**, explicit dev dependency |
| @docusaurus/core, preset-classic, module-type-aliases, tsconfig, types | 3.10.2 | **3.10.2**, retained |
| react / react-dom | 19.3.1 | **19.3.1**, retained |
| @mdx-js/react | 3.1.1 | **3.1.1**, retained |
| clsx | 2.1.1 | **2.1.1**, retained |
| prism-react-renderer | 2.4.1 | **2.4.1**, retained |
| @playwright/test | 1.65.1 | **1.65.1**, retained |
| tinypool override | 2.1.2 | **2.2.0** |
| serialize-javascript override | 7.1.4 | **7.1.4**, retained |
| ajv (8.x tree) | 8.17.1 | **8.20.0**, supported upstream range |
| Security override entries | 16 top-level | **2** |
| checkout / setup-node / upload-artifact | v7 / v7 / v7 | **v7.0.1 / v7.1.0 / v7.0.2** |

`npm update` refreshed transitive packages only within supported parent ranges (apart from the two retained security-major overrides). Examples: webpack 5.112.2, terser 5.51.2, core-js 3.51.0, schema-utils 4.8.3; Babel runtime, markdown utilities and types also refreshed in the lockfile. No new linter, bundler, or browser platform added. `check` now avoids building twice: typecheck → test:e2e (build + tests).

### TypeScript compiler API and editor findings

Inspected installed Docusaurus core/utils/babel/MDX code and dependency metadata. Docusaurus loads TypeScript configuration with **jiti**, transpiles application TSX through **Babel**, and compiles MDX independently of the TypeScript programmatic API. Native `tsc` checks the project separately. Searches of runtime JavaScript in `@docusaurus`, `@mdx-js`, and Playwright found no direct `typescript` API imports.

**Latent API consumer:** transitive `cosmiconfig@8.3.6` declares an optional TypeScript peer and calls `typescript.transpileModule`, enums, and config APIs in its `.ts` config loaders. Those APIs are not provided by TypeScript 7's stable entry point. This site's configured build does not invoke those loaders: no custom PostCSS/SVGR TypeScript config. Existing Docusaurus config/sidebars TS files use jiti and work. A future `.postcssrc.ts`/SVGR TS configuration could activate that incompatibility; upgrade the loader or use Microsoft's documented side-by-side API package then. Do not infer universal ecosystem API compatibility from this successful migration.

Editor check limited to config/type resolution with native compiler and official TypeScript 7 language-server guidance. No VS Code executable/interactive editor session available; GUI diagnostics, completion, and rename were **not tested**. README documents a TypeScript-7-capable language service rather than pointing an old tsserver SDK setting at the native compiler. No global editor settings changed.

### Runtime, CI, and Cloudflare Pages

- Preferred Node **26.13.1**, npm **12.2.3**. npm 12 supports Node 24 starting at **24.15.0**, so engines exclude Node 25 and retain maintained Node 24. Latest Node 24 tested; the exact minimum patch was not separately exercised. Node 26 typings are appropriate to the preferred runtime; no new runtime APIs were added to website code.
- CI validation matrix runs Node **24 and 26**, installs pinned npm before clean install, then checks types, builds and runs existing browser tests. Reports use per-runtime names to avoid upload collisions. Audit job uses `.nvmrc`. No remote workflow run performed; local equivalent and `actionlint` pass.
- Cloudflare [official build image documentation](https://developers.cloudflare.com/pages/configuration/build-image/) confirms explicit Node selection and `.nvmrc`. README specifies v3 image, `NODE_VERSION=26.13.1`, `SKIP_DEPENDENCY_INSTALL=1`, and custom build `npm install --global npm@12.2.3 && npm ci && npm run build`. This avoids relying on legacy v1 `NPM_VERSION`, since v3's default npm follows Node. Apply to production and preview when configuring Pages. Output remains `build`; no deployment/account changes made or claimed.

### Security override review and residual advisories

Removed overrides for `body-parser`, `compression`, `fast-uri`, `joi`, `launch-editor`, `lodash`, `proxy-addr`, `shell-quote`, `websocket-driver`, `webpack-dev-server`, `http-proxy-middleware`, and nested Express `path-to-regexp`/`qs` and analyzer `ws`. Fresh resolution retains patched releases within upstream constraints. Removed the ineffective global `picomatch` override; it did not fix the advisory and could impose major downgrades. Current parent ranges still resolve 2.3.2; no patched release exists.

Retained only:

1. **tinypool 2.2.0**: beyond Docusaurus's `^1.0.2`; [official release notes](https://github.com/tinylibs/tinypool/releases/tag/v2.2.0) cover CJS-reference removal and URL filenames. Docusaurus dynamically imports the ESM default export. Normal small-site builds do not exercise pooled SSG, so **additional builds explicitly enabled `future.faster.ssgWorkerThreads` with `DOCUSAURUS_SSG_WORKER_THREAD_COUNT=2` on both runtimes**. Both exit 0, verifying real pool creation, tasks and destruction. Temporary config removed; permanent performance flags unchanged.
2. **serialize-javascript 7.1.4**: patched major beyond consumer ranges. Production webpack/minifier builds and browser hydration tests pass on both runtimes; no function/API shim used. Retain until upstream adopts patched major ranges.

Final `npm audit`: **35 total: 33 high, 2 moderate, 0 critical**, down from fresh baseline 36 (33 high, 3 moderate). Counts include vulnerable ancestor packages, not 35 distinct advisories. Two root advisories remain:

- **picomatch <=4.0.7**, high [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf): no fix available; build-time glob matching on repository paths. No user-supplied glob service deployed.
- **uuid <11.1.1**, moderate [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq): transitive 8.3.2 in tooling; no supported in-range fix. Did not force a breaking major or downgrade Docusaurus.

The ajv advisory is resolved through upstream-compatible update to 8.20.0. Static deployment does not expose development/build dependencies as a running server, but CI/build input remains a trust boundary. `npm audit` intentionally exits **1** for residual findings; existing critical-only gate `npm run audit` exits **0**. Gate was not weakened.

### Final validation

Full logs, registry metadata, official-release responses, pre-change build and visual baselines retained locally in **`/tmp/kuma-modernization/`** (temporary, not committed). Visual baseline was captured **before** dependency changes with the same Playwright/browser/OS, then reused without snapshot updates. Chromium **159.0.8154.6**, revision **1255**, verified against official Playwright release notes.

| Check | Command / method | Node 26.13.1 | Node 24.22.3 |
|---|---|---|---|
| Clean install, npm 12.2.3 | `npm ci` | exit 0 | exit 0 |
| Clear generated cache | `npm run clear` | exit 0 | exit 0 |
| Native type checking | `npm run typecheck` | exit 0 | exit 0 |
| Production build + broken links | `npm run build` | exit 0 | exit 0 |
| Functional + visual tests | `KUMA_VISUAL=1 KUMA_SNAPSHOT_DIR='/tmp/kuma-modernization/snapshots/{arg}{ext}' npx playwright test` | **42/42**, exit 0 | **42/42**, exit 0 |
| Forced two-worker SSG | Temporary config + worker count 2 | exit 0 | exit 0 |
| HTML route inventory | Compare against fresh baseline | identical **24** routes | identical **24** routes |
| Sitemap, RSS and Atom | Byte comparison against baseline | all identical | all identical |

Additional checks:

- `CI=1 npm run check`: exit **0** on Node 26, **22 passed / 20 optional visual tests skipped**. Full opt-in suite above independently ran all 42 on both runtimes. Tests cover doc/blog navigation, legal links, accessibility probes, responsive layouts and dark theme; 20 comparisons cover five pages × desktop/mobile × light/dark.
- `npx playwright install chromium`: exit **0**; existing binary matches retained latest Playwright. Linux `--with-deps` remains in CI, not executed on this macOS host.
- `npm ls --all`: exit **0**, no invalid/missing peers. `npm outdated --json`: exit **0**, `{}`.
- `npm audit --json`: exit **1**, residual advisories above. `npm run audit`: exit **0**.
- `actionlint` **1.7.12** on `.github/workflows/ci.yml`: exit **0**. GitHub-hosted job execution still unverified.
- Development server smoke on Node 26: homepage, `/docs/intro`, `/blog` each HTTP **200** using browser `Accept: text/html`. Early raw urllib probes returned 404 for SPA paths without that header; browser-style navigation works. No dev-server options changed.
- `git diff --check`: exit **0**. No website source/content, styles or public URLs changed.

Nonfatal warnings preserved: npm 12 blocks unapproved `core-js` postinstall and optional macOS `fsevents` install scripts; builds/tests pass without allow-list changes. Legacy uuid deprecation remains. Node 26 emits an experimental localStorage warning during SSG; no build/browser failure and no suppressing flag added.

### Remaining work / future migrations

- Restore Docusaurus tsconfig inheritance once upstream removes `baseUrl`; avoid drifting from its supported options meanwhile.
- Monitor cosmiconfig's optional TS API loaders before adding TypeScript PostCSS/SVGR config. Use documented Microsoft side-by-side installation only if a real consumer requires it.
- Monitor upstream patched picomatch/uuid and adoption of tinypool/serialize-javascript security majors; remove final overrides when supported by upstream.
- Docusaurus 4 remains deferred until stable. Consider immutable action SHA pins separately.
- Run actual GitHub CI and validate Cloudflare account/image settings before any deployment. Interactive editor validation remains outstanding.

Implementation commits: `8290439` (native TypeScript + explicit types), `f738504` (Playwright-compatible config), `c7558f0` (Node/npm/CI/dependency refresh and docs). Final report committed separately. No merge, push or deploy performed.

---

## Phase 1 – Baseline

### Repository facts

- Package manager: npm (`package-lock.json`, lockfile v3). Keep npm.
- Git remote: `https://github.com/KumaCommunity/kumacommunity.git` (already GitHub; README still says Codeberg).
- No `AGENTS.md` in repo (only the user-level one). No `.nvmrc`, no `.github/workflows`, no test runner, no ESLint, no Prettier, no Playwright.
- `.serena/` is untracked local tooling; not part of this work.
- Node declared `engines.node >=20.0`.
- Initial lock state: no `build/`, no `node_modules` committed (gitignored, correct).

### Initial versions

| Item | Version |
|---|---|
| Node (local) | v26.13.1 |
| npm (local) | 11.20.0 |
| `@docusaurus/core`, `preset-classic`, `module-type-aliases`, `tsconfig`, `types` | 3.9.2 |
| `@mdx-js/react` | 3.1.1 |
| `react` / `react-dom` | 19.2.4 / 19.2.4 |
| `typescript` | 5.6.3 (`~5.6.2` range) |
| `clsx` | 2.1.1 |
| `prism-react-renderer` | 2.4.1 |

Latest on npm at time of baseline (2026-11-17):

| Package | Latest |
|---|---|
| `@docusaurus/*` | 3.10.2 (`next` 3.0.0-rc.1, `canary` 4.0.0-canary-7110 – not used) |
| `react` / `react-dom` | 19.3.1 |
| `typescript` | 7.0.2 (major, native port); 5.9.3 is latest 5.x |

### Docusaurus plugins / presets / themes in use

- `classic` preset (`@docusaurus/preset-classic`): docs, blog, pages, theme-classic, sitemap, debug, etc. (implicit via preset).
- No standalone plugins, no third-party themes, no swizzled components, no webpack customization.

### Config state (`docusaurus.config.ts`)

- `future.v4: true` already set.
- `onBrokenLinks: 'throw'`.
- Blog: `onInlineTags/onInlineAuthors/onUntruncatedBlogPosts: 'warn'`, feeds rss+atom with xslt.
- `organizationName: 'Kuma Community'` (contains a space; not a valid GitHub org – harmless for non-GitHub-Pages deploy but should be corrected to `KumaCommunity` when GitHub is confirmed).
- Footer links to `/privacypolicy`, `/termsofuse`, `/policies` (lowercase) – see broken links below.
- Template leftovers: `src/pages/index.tsx` still shows "Docusaurus Tutorial - 5min" button linking `/docs/intro`; commented-out template links.
- `tagline` has typo "resilent" (content – not changed in this work).

### Source inventory

- `docs/`: `intro.md`, `Contributing Guide.md`, `Emergency Planning/*` (3), `Firearms/Firearm Safety/*` (2), `General Information/*` (3).
- `blog/`: `authors.yml`, `tags.yml`, one post `2021-08-26-welcome/index.md` (+ image).
- `src/pages/`: `index.tsx` (+ css), `PrivacyPolicy.md`, `TermsOfUse.md`, `Policies.md`.
- `src/components/HomepageFeatures/`: template component.
- `src/css/custom.css`.
- `sidebars.ts`: autogenerated from `docs/`.
- `static/img/`: favicon, logo.png, logo.svg; `static/.nojekyll`.
- `tsconfig.json` extends `@docusaurus/tsconfig`.

### Baseline verification

| Check | Command | Result |
|---|---|---|
| Clean install | `npm ci` | exit 0. Warnings: `core-js`, `core-js-pure`, `fsevents` install scripts not allow-listed (npm 11 `allowScripts` notice). 55 audit findings reported. |
| Type check | `npm run typecheck` (`tsc`) | exit 0, "No errors found" |
| Lint | none configured | N/A |
| Tests | none configured | N/A |
| Production build | `npm run build` | **exit 1** – `onBrokenLinks: 'throw'` triggers on `/privacypolicy`, `/termsofuse`, `/policies` (footer + `docs/intro.md` relative link `../policies`). Pages are actually routed as `/PrivacyPolicy`, `/TermsOfUse`, `/Policies`. Full log: not committed; key lines reproduced here. |
| Audit | `npm audit` | 55 total: 18 critical, 21 high, 15 moderate, 1 low |
| Outdated | `npm outdated` | Docusaurus 5 packages 3.9.2→3.10.2; react/react-dom 19.2.4→19.3.1; typescript 5.6.3→7.0.2 (major) |

Build baseline is therefore **red on main**. Must fix before the upgrade can be verified.

### Vulnerabilities (baseline)

Most findings are in Docusaurus' own transitive tree (`serve-handler`, `webpack-dev-server`, `serialize-javascript`, `tinypool`, `svgo`, `launch-editor`, `postcss`, `image-size`, `joi`, etc.). Notable:

- **critical** `tinypool` (GHSA-5gmw-xhrv-c9v3, GHSA-85c8-ppgw-ccpr) – prototype-pollution → RCE gadget; build-time path via Docusaurus core (`@docusaurus/core@3.7.0` in audit "fix" hint is a downgrade and not acceptable).
- **critical** `shell-quote` (GHSA-w7jw-789q-3m8p), `proxy-addr` (GHSA-jqcg-44mw-7w3h), `websocket-driver` (GHSA-xv26-6w52-cph6) – dev-server/transitive.
- **high** `serialize-javascript` (GHSA-5c6j-r48x-rmvq, RCE via RegExp.flags/Date) – used by Docusaurus build (SSG/bundling). Relevant to build-time.
- **high** `@babel/plugin-transform-modules-systemjs` (GHSA-fv7c-fp4j-7gwp), `svgo` (removeScripts bypasses), `postcss` (sourceMappingURL file read), `launch-editor`, `lodash`, `minimatch`, `picomatch`, `brace-expansion`, `fast-uri`, `ws`, `body-parser`, `compression`, `serve-handler`, `js-yaml`, `joi`, `nanoid`, `image-size`, `path-to-regexp`, `source-map-js`, `browserslist`.
- Audit `fixAvailable` for `@docusaurus/core` suggests `3.7.0` (a downgrade). **Not used.** Advisory ranges include 3.10.2; to be re-checked after the upgrade and each remaining advisory documented.

Exposure note: site is static. Dev-server and CLI-only advisories are not reachable in the deployed artifact; build-time and install-time advisories still matter.

### Deprecations / technical debt observed

- Dead `docusaurus.config.ts` commented-out blocks (template).
- Homepage is the unmodified Docusaurus template content (not changed – content owner decision).
- `browserslist` production set uses `>0.5%` (tends to pull in old polyfills); evaluate in Phase 3/5, do not change blindly.
- `package.json` `engines.node >=20` – supported Node LTS today is 24 (Krypton, active) and 26 (Lithium, LTS since 2026-10-28). Plan: pin to Node 24 LTS (see Phase 3).

---

## Proposed implementation sequence

1. **M1 (this commit)** – baseline recorded.
2. **M2 – Docusaurus 3.10.2**: align all `@docusaurus/*`; fix the build-breaking broken links (route casing / footer links) so `onBrokenLinks: 'throw'` passes; verify future flags (v4 already on).
3. **M3 – Deps & security**: react/react-dom 19.3.1; keep TypeScript on 5.x (5.9.3) – TS 7 is a major, evaluate separately; npm override only if parent cannot be upgraded; re-audit; document residual Docusaurus-tree advisories.
4. **M4 – Deprecations/cleanup**: template leftovers, `organizationName`, Node engines + `.nvmrc`.
5. **M5 – Tests**: typecheck + build gate; Playwright smoke + visual snapshots (before/after from `main`).
6. **M6 – CI (`.github/workflows`), docs, Cloudflare Pages notes, final report.

Risks: route casing change could alter public URLs (`/PrivacyPolicy` vs `/privacypolicy`) – must keep the public paths working; decide between correcting links and adding redirects. Homepage/template content stays as-is unless the owner says otherwise.

---

## Phase 2 – Docusaurus 3.10.2 (done, M2)

- All `@docusaurus/*` packages aligned at **3.10.2** (exact pins). `npm ls` shows one version.
- `future.v4` changed from `true` to explicit per-flag object:
  - `removeLegacyPostBuildHeadAttribute: true` (enabled)
  - `mdx1CompatDisabledByDefault: true` (enabled; required one content fix below)
  - `useCssCascadeLayers: false` (**deferred**: changes CSS cascade; needs visual verification in Phase 6)
  - `siteStorageNamespacing: false` (**deferred**: would reset stored theme preference once)
  - `fasterByDefault: false` (**deferred**: would switch to Rspack and require `@docusaurus/faster`; keeps webpack)
- Build failure found in 3.10.2 with MDX v3 defaults: `<!-- truncate -->` in `blog/2021-08-26-welcome/index.md` → replaced with `{/* truncate */}` (same excerpt marker, MDX-native).
- Pre-existing broken links fixed (these made `main` build fail):
  - Footer `href: '/privacypolicy' | '/termsofuse' | '/policies'` → `to: '/PrivacyPolicy' | '/TermsOfUse' | '/Policies'` (real routes generated from `src/pages/*.md`).
  - `docs/intro.md` `[Policies](../policies)` → `[Policies](/Policies)`.
  - Page routes/filenames unchanged.

## Phase 3 – Dependencies & toolchain (M3)

- `react` / `react-dom`: 19.2.4 → **19.3.1** (pinned exact, identical versions).
- `typescript`: `~5.6.2` → `~5.9.3` (`@docusaurus/tsconfig` 3.10.2 compatible). TypeScript 7.x (native port, major) **deferred**: separate migration.
- Node: `engines.node` `>=20.0` → `>=24.0.0`; added `.nvmrc` = `24`. Node 24 is Active LTS; Node 26 is current LTS and also builds locally (both verified).

## Phase 4 – Security (M3)

Audit before: 55 (18 critical, 21 high, 15 moderate, 1 low). Audit after: **36 (0 critical, 33 high, 3 moderate)**; the 33 "high" entries are all dependents of a single unfixed advisory (below).

Remediation via targeted `overrides` (patched versions kept inside each parent's declared semver range, except where noted). No `npm audit fix --force`.

| Package | Path | Advisory (summary) | Fix applied |
|---|---|---|---|
| tinypool | @docusaurus/core (SSG worker) | **critical** prototype-pollution → RCE gadget | `2.1.2` (**major**; API used by Docusaurus: `minThreads/maxThreads/run/destroy` unchanged; build verified) |
| proxy-addr | express ← webpack-dev-server | **critical** IP spoofing | `2.0.8` |
| shell-quote | launch-editor ← webpack-dev-server | **critical** newline escaping; high DoS | `1.12.0` |
| websocket-driver | sockjs ← webpack-dev-server | **critical** message corruption | `0.7.5` |
| serialize-javascript | copy-webpack-plugin, terser, css-minimizer (build) | **high** RCE via RegExp.flags/Date | `7.1.4` (**major** from 6; build verified) |
| ws | webpack-dev-server 8.x / webpack-bundle-analyzer 7.x | **high** memory exhaustion | `8.23.0` / `7.5.14` (nested) |
| launch-editor | webpack-dev-server | high existsSync bypass; moderate | `2.14.2` |
| lodash | core, preset | high code injection | `4.18.1` |
| joi | @docusaurus/types, utils-validation | high ReDoS, DoS | `17.13.9` |
| fast-uri | ajv ← schema-utils | multiple high | `3.1.9` |
| path-to-regexp | express (0.1.x) | high ReDoS | `0.1.13` (nested under express) |
| body-parser | express | high DoS | `1.20.9` |
| compression | webpack-dev-server | high memory leak DoS | `1.8.2` |
| proxy/http-proxy-middleware | webpack-dev-server | moderate | `^2.0.10` |
| webpack-dev-server | @docusaurus/core | moderate ×4 | `^5.2.7` (in-range) |
| qs | express | moderate/low | `6.16.2` (nested under express) |
| picomatch | micromatch/chokidar/jest-worker (build) | **high** ReDoS (`<=4.0.7`) | **No fix exists** (4.0.7 is latest 4.x; 2.3.2 forced by override). Residual, see below |

### Residual, documented risks

- **picomatch ≤4.0.7 ReDoS (high, GHSA-fc5q-39xc-vjpf)**: no patched release published as of 2026-11-17. Used only for build-time glob matching against repo paths (trusted). Not reachable from the deployed static artifact. Re-check each upgrade cycle; remove the override once a fixed version is available.
- **ajv <8.18.0 `$data` ReDoS (moderate)**: `$data` option not used. Not overridden (multiple ajv majors in tree; override would be unsafe).
- **uuid <11.1.1 buffer bounds check (moderate)**: only when caller passes `buf`; not overridden (legacy transitive v8.3.2 in dev tooling).
- Audit's suggested `@docusaurus/core` "fix" (3.7.0) is a downgrade and was not used.

## Phase 5 – Deprecations and cleanup (M4)

Removed:
- Template leftovers in `docusaurus.config.ts`: commented-out GitHub/Community/Discord/X footer and navbar links from the Docusaurus starter, and "Please change this to your repo" comments.
- Template comment block in `sidebars.ts` (the sidebar itself is unchanged: autogenerated from `docs/`).
- `organizationName: 'Kuma Community'` (invalid GitHub org, contains a space) → `'KumaCommunity'`. Used only by `docusaurus deploy`.
- `future.v4: true` shorthand replaced with explicit flags (see Phase 2).

Fixed compat issue:
- `src/css/custom.css`: dark variables were `[data-theme="dark"]` (specificity 0,1,0). Docusaurus 3.10 Infima sets `html[data-theme=dark]` (0,1,1), which silently replaced the dark background (`#121212` → `#1b1b1d`). Scoped to `html[data-theme="dark"]`. Caught by the new dark-mode screenshot/probe tests.

Checked and not applicable:
- No `require.context`, no custom blog metadata extraction, no swizzled theme components, no webpack customization, no custom plugins, no third-party themes in this repository.
- `static/.nojekyll` is a GitHub Pages artifact; left in place (harmless).

Warnings / deliberately not changed (content owner decisions):
- Homepage `src/pages/index.tsx` still shows the Docusaurus starter button ("Docusaurus Tutorial - 5min") and `HomepageFeatures` starter component.
- `blog/tags.yml` and `blog/2021-08-26-welcome/index.md` are starter content ("Facebook tag description", "Hola" tag, Welcome post text).
- Typo in public text: tagline `Building a resilent community.` and footer `Other Polcies`. Not changed (content).
- `.main-docs-wrapper` rules in `custom.css` target a class that no component renders, so the paper effect is dead CSS. Left as-is (changing it would change appearance).
- `tsconfig.json` sets `baseUrl`, which TypeScript 6+/7 deprecates. Not an issue on TS 5.9; must be removed before a TS 7 upgrade.

## Phase 6 – Tests and regression verification (M5)

Added:
- `@playwright/test@1.65.1` (dev dependency). Chromium only.
- `playwright.config.ts`: serves the production build on port 3100 (or `BASE_URL`).
- `e2e/site.spec.ts`, 22 functional tests:
  - Homepage: navbar, footer, logo loads, no console or page errors; footer legal links resolve.
  - Docs: intro renders, sidebar navigation to nested doc (`Emergency Planning/PACE Plan`), intro → `/Policies` link, one `h1`.
  - Blog: index shows post and truncates after `{/* truncate */}`; post renders with date, tag, no errors; tag page; archive/authors pages; RSS/Atom feeds 200.
  - Policy pages render.
  - Responsive: no horizontal overflow at 1920, 1440, 768, 390, 375 px; mobile navbar menu opens.
  - Keyboard focus visible; no `img` without `alt`; dark theme follows `prefers-color-scheme` (`--ifm-background-color` = `#121212`).
- Visual regression: 20 full-page snapshots (5 pages × 1440/390 px × light/dark), opt-in with `KUMA_VISUAL=1` because baselines are OS/browser specific. Baselines were generated from the pre-upgrade site (commit `7194ce1`, built locally with `onBrokenLinks: 'warn'`, not committed). Result: 20/20 pass at `maxDiffPixelRatio: 0.002`.
- Broken-link checking: already enforced by `onBrokenLinks: 'throw'`; the build fails on any broken internal link.
- Lint: no ESLint or Prettier is configured in this repo. Not added (would reformat the content files). Recommend a follow-up decision. `typecheck` is the static check.

Verification of the behavior change: route list identical between old and new builds (24 HTML pages, sitemap, RSS/Atom). Only differences in rendered HTML are the three footer hrefs (now real routes) and the CSS file hash.

Rendered comparison of `CSS cascade layers` on vs off: 20/20 visual passes both ways. Enabled.

## Phase 7 – CI and deployment readiness (M6)

- `.github/workflows/ci.yml` (added):
  - Triggers: pull requests, pushes to `main`, manual dispatch.
  - Permissions: `contents: read`. `persist-credentials: false`. No deployment secrets.
  - Job `validate`: `npm ci` → `npm run typecheck` → `npm run build` → `npx playwright install --with-deps chromium` → `npx playwright test`. Uploads the Playwright report on failure.
  - Job `audit`: `npm ci --ignore-scripts` → `npm run audit` (fails on **critical** advisories; the current residual is high, so the gate is set to critical).
  - Node version from `.nvmrc`. Actions pinned to major tags (`checkout@v7`, `setup-node@v7`, `upload-artifact@v7`). SHA pinning is a follow-up.
  - **Not executed on GitHub.** The same steps were run locally on a clean `npm ci`. YAML parsed locally; `actionlint` not available.
- Cloudflare Pages: **not configured.** README lists the intended settings: build `npm run build`, output `build`, production branch `main`, Node 24. Cloudflare settings were not verified by me.
- Repository references: README updated from Codeberg to GitHub (`origin` is `github.com/KumaCommunity/kumacommunity`). No other Codeberg references exist in code.
- Custom domain / DNS: not touched.
- URL review: `url: 'https://kumacommunity.com'`, `baseUrl: '/'`, sitemap generated (`/sitemap.xml`), feeds generated. Trailing slash behavior unchanged (Docusaurus default).

Open decision: the footer previously pointed to lowercase `/privacypolicy`, `/termsofuse`, `/policies`. Those paths were never produced by the build (the build failed on `main`), so there was no working public URL to preserve. Canonical routes are now `/PrivacyPolicy`, `/TermsOfUse`, `/Policies`. If the old lowercase URLs were published elsewhere, add Cloudflare redirects after confirming how Cloudflare Pages matches case. Not added: a case-insensitive match could loop.

## Phase 8 – Final verification

Clean reinstall (`rm -rf node_modules build`, then `npm ci`) on Node 26.13.1 and Node 24.22.3 (`.nvmrc`):

| Check | Command | Result |
|---|---|---|
| Install | `npm ci` | exit 0 |
| Type check | `npm run typecheck` | exit 0 |
| Production build | `npm run build` | exit 0, 24 HTML pages, no warnings (Node 26: ExperimentalWarning about localStorage from Node itself, not Docusaurus) |
| Smoke tests | `npx playwright test` (default) | 22 passed, 0 failed (Node 26 and Node 24) |
| Visual | `KUMA_VISUAL=1 ... --grep "Visual regression"` against pre-upgrade baseline | 20 passed (Node 26) |
| Combined gate | `npm run check` | exit 0 (Node 26 and Node 24) |
| Audit gate | `npm run audit` (`--audit-level=critical`) | exit 0 |
| Full audit | `npm audit` | 36 total: 0 critical, 33 high, 3 moderate (see residuals) |
| Outdated | `npm outdated` | only `typescript` 5.9.3 → 7.0.2 (major, deferred) |

Baseline values for comparison: build exit 1 (broken links), audit 55 (18 critical, 21 high, 15 moderate, 1 low), typecheck exit 0.

### Remaining security exceptions

| Advisory | Severity | Path | Status |
|---|---|---|---|
| picomatch ≤ 4.0.7 ReDoS (GHSA-fc5q-39xc-vjpf) | high | build-time globbing (micromatch/chokidar/jest-worker) | No fixed version published on npm. Not overridable. Its dependents appear as 33 "high" entries in `npm audit`. Build-time only, input is repo paths. Revisit each upgrade. |
| ajv < 8.18.0 `$data` ReDoS | moderate | schema-utils | `$data` option unused. Not overridden (multiple ajv majors in tree). |
| uuid < 11.1.1 buffer check | moderate | legacy transitive 8.3.2 | Only when `buf` is passed. Not overridden. |

Docusaurus-related advisories: the `npm audit` entries for `@docusaurus/*` (critical before, now only high) are range-matches (`<=4.0.0-canary-6835`) that propagate from the picomatch residual above. Its suggested `@docusaurus/core` fix (3.7.0) is a downgrade and was not used. Re-check when Docusaurus publishes a newer 3.x.

## Breaking changes and compatibility decisions

- **Node.js** `>=20` → `>=24`. Cloudflare Pages build image must use Node 24 (set `NODE_VERSION=24` if needed).
- **`future.v4`**: explicit flags. Enabled: `removeLegacyPostBuildHeadAttribute`, `mdx1CompatDisabledByDefault`, `useCssCascadeLayers`. Deferred: `siteStorageNamespacing` (would reset stored theme choice once), `fasterByDefault` (Rspack + `@docusaurus/faster` native deps).
- **Blog**: `<!-- truncate -->` → `{/* truncate */}` (MDX v3 requirement).
- **Policy links**: footer and `docs/intro.md` now point at real routes (see above).
- **Overrides**: `tinypool` 2.x and `serialize-javascript` 7.x are major versions forced onto Docusaurus' transitive tree. Both verified by a clean production build, SSG output, and visual parity.
- **React**: exact pins `react`/`react-dom` 19.3.1 (must stay identical).

## Tests added / modified

- Added: `playwright.config.ts`, `e2e/site.spec.ts`.
- Modified: `blog/2021-08-26-welcome/index.md` (truncate marker), `docs/intro.md` (policy link).
- Added CI: `.github/workflows/ci.yml`.

## Commits (branch `modernize/docusaurus-3.10`, unmerged)

1. `Record modernization baseline report`
2. `Upgrade Docusaurus to 3.10.2 and fix broken policy links`
3. `Update React, TypeScript, Node engine and patch vulnerable transitive deps`
4. `Remove template leftovers and correct GitHub org name in Docusaurus config`
5. `Enable CSS cascade layers and scope dark theme variables to html`
6. `Add Playwright smoke and opt-in visual regression tests`
7. `Add CI workflow and update README for GitHub, Node 24 and checks`

## Outstanding work and recommended follow-ups

1. Owner decisions on starter content: homepage template text, `blog/tags.yml` placeholder descriptions, welcome post, tagline typo, `Other Polcies` typo.
2. Decide whether to keep lowercase legal URLs working (Cloudflare `_redirects`), after testing Cloudflare's case-matching behavior.
3. Enable `future.faster` / `fasterByDefault` in a separate change (requires `@docusaurus/faster` and a visual re-check).
4. Enable `siteStorageNamespacing` when acceptable to reset theme preference once.
5. TypeScript 7: remove `baseUrl` from `tsconfig.json`, then evaluate the native compiler separately.
6. Add a linter/formatter only if the owner wants one (none configured today).
7. Pin GitHub Actions to commit SHAs; confirm the workflow passes on GitHub after first push.
8. Remove the picomatch override when a fixed version is published.
9. Configure Cloudflare Pages with the settings in README; not done here.
10. Visual baselines are not committed; generate them once per platform with `npm run test:visual`.
