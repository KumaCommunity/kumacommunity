# Attribution and asset records

This file records licensing evidence and unresolved questions. It is not a
license grant for third-party material. The [software license](./LICENSE) and
[educational content license](./LICENSE-CONTENT.md) have separate scopes.

## Current inventory

| Material | Treatment | Evidence or review needed |
| --- | --- | --- |
| `static/img/logo.svg` | Branding excluded from GPL and CC grants; all rights reserved by the respective rights holders | Creator, source files, and ownership or permission records are not recorded in the repository. Owner confirmation needed. |
| `static/img/logo.png` | Same branding exclusion | Confirm origin and any third-party elements. Do not assume the SVG and PNG have identical provenance. |
| `static/img/favicon.ico` | Same branding exclusion | Confirm source and permission records. |
| Inline SVG icon paths in `src/components/Homepage/index.tsx` | Part of the UI, not educational illustrations offered under CC BY-SA 4.0 | No creator or upstream icon license is recorded. Confirm whether original or copied from an icon library, then retain any required notices. No new ownership claim is made here. |
| Project-information docs and unfinished guides in `docs/` | Do not treat placeholders as completed educational works | No completed educational guides were found during this audit. Confirm authorship and third-party permissions before publishing new material. |
| `blog/` | No published articles currently present | Author and tag configuration alone do not establish rights in future posts. |
| Dependencies, framework code, and generated third-party notices | Respective licenses | Preserve package license files, source notices, and generated bundle license notices. The repository's licenses do not replace them. |

No educational image, video, diagram, or downloadable checklist asset was found
in the current tree. This inventory does not establish that every asset is
original or that historical copies of removed material may be relicensed.
Previously granted rights remain in effect.

## Proposing material

Direct pull requests are currently closed. Send proposals and supporting
information through the
[contribution guidelines](https://kumacommunity.com/docs/Contributing%20Guide).

For each contribution and each third-party element, provide:

- Title, creator, and any other required attribution parties.
- Original source URL and the file or page where it will be used.
- License name, version, official license URL, and SPDX identifier where one exists.
- Supplied copyright notices and required attribution text.
- Changes made, including translation, cropping, redrawing, or editing.
- Permission evidence when a public license does not cover the intended use,
  plus any limits on reuse.

Retain credits near the material or in a clearly linked credits section on the
article. Asset records may also be added to this file. Keep existing notices
when moving or editing material. Do not substitute a page-wide CC notice for an
asset's separate terms. Mark uncertain rights for editorial review rather than
assigning a license. Link to a source instead of embedding a copy when
redistribution permission is not established.

Creators should confirm they have authority to offer their original educational
contributions under CC BY-SA 4.0 and identify all exceptions. This does not
require transfer of copyright to Kuma Community. Original code examples follow
the existing GPLv3 software grant unless explicitly licensed otherwise.

## Article notice metadata

The reusable licensing notice appears on documentation and full blog articles
with a nonempty metadata description. It does not appear on blog excerpts,
drafts, empty placeholders, application pages, or legal pages. Administrative
docs use `content_license: false`. Use this opt-out for other non-educational
documents as needed.

An original educational article needs no licensing boilerplate. Its default
notice links to CC BY-SA 4.0. It may explicitly state the default SPDX
identifier:

```yaml
content_license: CC-BY-SA-4.0
```

For a different license, provide the actual name and absolute HTTP(S) license
URL. An optional note can identify exceptions or attribution:

```yaml
content_license:
  name: CC BY 4.0
  url: https://creativecommons.org/licenses/by/4.0/
  notice: The third-party photograph has separate terms in the image credit.
```

For material that cannot be offered under a page-wide license, display a
specific rights notice instead:

```yaml
content_license:
  notice: Third-party excerpt reproduced with permission. See the source credit for reuse terms.
```

For an administrative or legal document that should have no article notice:

```yaml
content_license: false
```

These examples explain metadata, not permissions for a particular work. Record
real rights information before applying an exception. Do not disable the notice
to hide an unresolved rights question. Invalid metadata fails rendering/build
with a clear error instead of silently assigning CC terms.

## Future videos and tutorials

For an original educational video offered under CC BY-SA 4.0, identify the
license by name and link to
[the CC BY-SA 4.0 license](https://creativecommons.org/licenses/by-sa/4.0/) in
the description or an accompanying page. Include the title, creators, source
URL, retained copyright notices, and any changes or translation credits. Where a
platform's license selector does not support CC BY-SA 4.0, do not select a
different license as a substitute for an accurate description.

List third-party footage, music, images, diagrams, and code separately with
their creators, sources, licenses, and modifications. Identify which parts are
not covered by the video's CC license and verify permission to combine them. Do
not mark the whole video CC BY-SA 4.0 when embedded material's terms prevent
that grant. Supply equivalent credits in accompanying documentation if the
description has limited space. No video hosting or video-specific interface is
introduced by this policy.
