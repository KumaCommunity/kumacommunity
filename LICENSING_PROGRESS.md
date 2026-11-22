# Licensing implementation progress

## Scope and baseline

User authorized GPLv3 software / CC BY-SA 4.0 original educational content split, reserved branding, third-party exclusions, reusable article notices, limited legal updates, tests and logical local commits. No push, merge or deployment.

Repository `/Users/jacksonchandler/Documents/Projects/kumacommunity`, branch `modernize/licensing`, starting HEAD `d715d71`. Homepage work is already committed. At task start, `docusaurus.config.ts` and `src/pages/{Policies,PrivacyPolicy,TermsOfUse}.md` had local edits. Full originals saved under `/tmp/kuma-licensing/before/`. Preserve these edits; do not commit unrelated pre-existing legal rewrites. Copyright's pre-existing local change already matches the requested format and belongs to the requested footer outcome.

Installed Docusaurus 3.10.2, React 19.3.1, TypeScript 7.0.2, Playwright 1.65.1; npm lockfile, existing `npm run check` and optional visual/axe infrastructure. No repository AGENTS.md. Serena not used. Context7 has no 3.10.2 snapshot; verify theme wrappers against installed source/types.

Root LICENSE remains unchanged. Its existing project-specific application notice already grants version 3 or later; use `GPL-3.0-or-later`, not a narrower grant. SHA-256: `288b73f6bf775697e5374bae71f7fe99caed5b4d76a38d9dc568296f285f3f50`. Privacy Policy at task start: `bd1aa5b78339b5e82c375dae1cccda308230629c2c64a523d1a626fd9243f784`; licensing requires no changes to its Cloudflare/email disclosures.

Content audit: seven zero-byte guide/resource files; unfinished Creators list; Welcome and Contributing are project information, not published educational guides. No blog posts now exist (starter removed since homepage implementation). Static assets are `logo.svg`, `logo.png`, `favicon.ico`; excluded as branding, ownership/provenance not documented. Homepage inline SVG icon provenance also unrecorded. Dependencies and generated third-party license notices retain their own terms. Do not infer ownership from repository location.

Baseline `npm run check`: exit 1; typecheck/build pass; 51 tests pass, 54 optional tests skip, five existing failures. Two docs/blog surface checks and two direct-post checks still expect removed `/blog/welcome`; contribution test expects old raw URL label and wording. Full log `/tmp/kuma-licensing/baseline.log`. Do not disguise these failures or restore starter material.

## Plan

1. Add content scope, exclusions, attribution/video/contributor guidance; concise README distinction; narrowly update Terms/Policies, leave Privacy unchanged.
2. Reusable small content notice with front-matter exceptions. Wrap original DocItem/Footer and BlogPostItem/Footer, preserving original rendering. Exclude administrative docs and empty placeholders; never apply to application/legal pages or blog excerpts.
3. Add focused unit/browser tests, including a temporary copied fixture site for published docs/blogs and exceptions. No test articles in final public content. Verify official/local license links, static rendering, themes/mobile, visual changes.
4. Review/commit licensing-only changes in logical groups. Keep unrelated starting legal edits uncommitted. Report unresolved ownership, test failures and deployment status.

## Checkpoints

- [x] Repository, rights and baseline audit
- [x] Licensing documents and attribution workflow
- [x] Reusable website notices and footer
- [x] Validation and screenshots
- [x] Local licensing-only commits and final report

## Implementation and verification

- Added `LICENSE-CONTENT.md` and `ATTRIBUTION.md`; README distinguishes GPLv3-or-later software/code examples, CC BY-SA 4.0 original education, reserved branding, and third-party/separate terms. The existing root grant is not narrowed, and earlier grants are not revoked. ShareAlike, commercial reuse, flexible attribution, compatible adapter licenses, and exceptions/limitations are described without extra conditions.
- `/licensing` renders the root content-license document through the existing MDX pipeline, avoiding a second copy of its text. Footer structure remains Explore / Project / Legal, with exactly one copyright and one link for each license. CC links to this scope document, which links the official CC terms; GPL retains its existing source-license destination.
- Shared `ContentLicenseNotice` and two small `@theme-original` wrappers preserve original tags/edit metadata/Markdown/MDX. Default notices link official CC terms and local scope/exclusions. Front matter supports the default SPDX string, a named alternate license/URL, a rights-only notice, or `false`. Project-information docs explicitly opt out. Empty metadata descriptions and drafts are excluded; blog excerpts get no notice. An eligible article must have a nonempty description, extracted by Docusaurus or supplied in front matter.
- Contributing keeps the existing email workflow and closed direct-PR policy. Added only rights/attribution guidance and administrative opt-out. Policies adds one licensing section; Terms replaces only its licensing paragraph. Privacy is byte-for-byte identical to its task-start backup, preserving Cloudflare/email disclosures. Liability, safety, and other legal language remain untouched relative to task start.
- Accessibility checks required small CSS fixes: prose links have visible underlines without changing colors; longer footer labels are width-constrained; existing document pagination permits word wrapping at 320px/200% text. No homepage copy, fonts, colors, routes, dependencies, lockfile, or Cloudflare settings changed.
- An unrelated untracked `.markdownlint.json` appeared during work. Leave it untouched/uncommitted.

### Final checks

1. `npm run typecheck`: exit 0 (`/tmp/kuma-licensing/typecheck-final.log`). Production build: exit 0 as part of the final check. Official GPL, CC summary and CC legal-code URLs: HTTP 200 (`official-links.log`). Strict Docusaurus broken-link checking remains enabled; browser checks traverse local licensing-page links and verify existing routes.
2. Full current-site check with external axe and reviewed visual baselines:

   ```sh
   KUMA_VISUAL=1 \
   KUMA_SNAPSHOT_DIR='/tmp/kuma-licensing/visual/{testFilePath}/{arg}{ext}' \
   KUMA_AXE_SOURCE=/tmp/kuma-redesign/accessibility-tools/node_modules/axe-core/axe.min.js \
   KUMA_AXE_REPORT_DIR=/tmp/kuma-licensing/axe-final npm run check
   ```

   Exit 1, **134 passed, four failed, 28 isolated fixture tests skipped** in the real site run. All new current-site licensing checks, 36 visual checks and 34 full-page axe configurations pass. The four failures already existed at baseline and require removed `/blog/welcome`: two shared surface tests, the starter-post rendering test, and its noindex test. The fifth baseline failure, contribution assertions for old link text/wording, was updated to the actual GitHub label and closed-PR text on the changed contribution page. No starter content was restored and no stale test was disabled. Full log: `/tmp/kuma-licensing/validation-final.log`.
3. Isolated production fixture site:

   ```sh
   KUMA_LICENSE_PORT=3109 KUMA_VISUAL=1 \
   KUMA_SNAPSHOT_DIR='/tmp/kuma-licensing/visual/{testFilePath}/{arg}{ext}' \
   KUMA_AXE_SOURCE=/tmp/kuma-redesign/accessibility-tools/node_modules/axe-core/axe.min.js \
   KUMA_AXE_REPORT_DIR=/tmp/kuma-licensing/notice-axe-final npm run test:licensing
   ```

   Exit 0, **28 passed**, no skips. Includes default/alternate/rights-only/opt-out docs and blog articles, static HTML notices, original tags/date/author/footer, interactive MDX, drafts/unlisted behavior, empty docs, archive/tag excerpts, both themes, 320px/1440px and 200% text, 16 reviewed visual snapshots, and a focused axe test covering 16 notice configurations. Those notice scans report zero violations and zero incomplete results. Log: `/tmp/kuma-licensing/fixture-validation-final.log`. The script builds/copies in a disposable OS temp directory, confirms a unique server marker, runs tests, stops the server and removes the temp tree; test publications never enter production docs/blog. An occupied-port attempt correctly refused to test a retained older server.
4. Negative build: an unsafe `javascript:` article license URL in a separate retained fixture copy causes production build exit 1 with `Invalid content_license`, as intended (`invalid-metadata.log`). Parser tests also cover missing/invalid fields and unknown SPDX strings. Actual repository content was never changed for this test.
5. Visual review: built an exact pre-task source snapshot plus the four starting local edits under `/tmp/kuma-licensing/before-site`. Captured 20 old smoke baselines in `visual-before/`, reviewed before/after differences, then reviewed 16 new licensing-page and 16 fixture snapshots. Same-platform baselines remain outside Git at `/tmp/kuma-licensing/visual/`; no tolerance increases. Homepage pixel changes begin only inside the footer (desktop row 1324, mobile row 1563); body and hero remain unchanged. Other expected changes are licensing text, footer height, and prose-link underlines. Old smoke `blog-post` screenshots show the already-missing route's 404 page, not actual article coverage; real article coverage is provided by the isolated fixture suite. Difference report: `visual-difference-review.log`; eight contact sheets: `review-{0..7}.png`; final notice crops: `notice-*.png`.
6. Additional full-page fixture axe run deliberately kept broader findings visible: **five of 18 configurations fail** on existing Prism syntax-token contrast (4.29/4.32:1) and the original blog table-of-contents column outside a landmark. None targets a license notice. Full reports: `/tmp/kuma-licensing/fixture-axe/`; log: `fixtures-visual-initial.log`. Do not describe the entire fixture site as axe-clean or WCAG conformant. No unrelated Prism palette or blog-layout refactor was undertaken. Current-site scans retain 18 incomplete checks across 26 nodes for manual review; full JSON is preserved.
7. Root `LICENSE` and Privacy hashes still match the task-start backups. `git diff --check`: exit 0. No new dependencies or lockfile changes. A clean staged-source snapshot, excluding the pre-existing local legal rewrites, also builds successfully (exit 0) at `/tmp/kuma-licensing/committed-site`; log `committed-build.log`.

### Owner review and remaining work

- Confirm creator/ownership or permission records for all three branding files, including third-party elements and any restrictions. Reserving branding does not revoke earlier grants or establish ownership.
- Confirm whether homepage SVG icon paths are original or copied, and supply any upstream license/notice.
- Before publishing educational material, confirm authorship/authority to offer CC BY-SA 4.0 and list third-party exceptions. Keep unresolved material out of blanket grants.
- Decide separately whether to update the four stale starter-blog tests and address the syntax-color/TOC accessibility findings. Manual screen-reader and deployed Cloudflare verification remain outside this local implementation.
- Do not push, merge, deploy, or commit the unrelated pre-existing legal rewrites.

## Local commits

- `26875e6` `docs: separate software and educational content licensing`
- `7cd24f6` `feat: add scoped article license notices and footer links`
- The test/progress commit contains the reusable isolated fixture runner, parser/site/exception/MDX/responsive/visual/notice-axe coverage, updated axe route coverage, and corrected contribution assertions.

Only licensing additions to Policies/Terms were staged through separate index blobs based on the original HEAD versions. The live files were never reverted or overwritten to stage them. Their pre-existing local rewrites, and the entire pre-existing Privacy change, remain uncommitted. Footer copyright was already locally corrected and is included because the user explicitly requested that outcome. `.markdownlint.json` stays untracked and untouched. Root LICENSE, lockfile, and branding assets remain unchanged. No push, merge, or deployment.

### Concurrent changes observed after validation

`docs/Emergency Planning/Condition Plan.md` and `EXFIL Plan.md` became modified externally after the final validation and staging snapshot. Neither was edited or committed by this task. The recorded test results apply to the validated licensing snapshot, not those newer guide edits. Working-tree `git diff --check` now reports trailing whitespace on Condition Plan lines 38 and 39 (Markdown hard-break spaces). `git diff d715d71..HEAD --check` for licensing commits remains clean. Further guide edits and a Storage Safety / Safe Storage rename appeared during finalization, so this is an actively changing content tree, not an exhaustive final file list. None was staged by this task. Leave these guide edits, `.markdownlint.json`, and the original legal rewrites to the owner. Recheck routes, configured homepage document IDs, and the combined working tree once concurrent content work is finished.
