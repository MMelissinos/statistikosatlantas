# Editorial images: standard and site change log (2026-11-15)

> Handoff to Claude / maintainers. This is a visual-production workflow only. It does **not** authorize changes to article text, datasets, statistical verification, or agent workflows. WordPress visual changes should be reversible.

## Image production standard (v1)

- Featured-image output: **1600 × 900 px (16:9)**, optimized **WebP**. Aim for <250 KB when image quality permits; do not sacrifice legibility to hit this target.
- Brand palette: deep navy #102A46, medium blue #2165A4, muted ice blue #B8D5EA, soft white and restrained warm accents.
- Two related editorial treatments: (A) contextual, realistic editorial photography for human/social topics; (B) restrained abstract data illustration for statistical findings. Prefer A when a meaningful subject-specific photograph can be depicted.
- One strong focal point; clear at small thumbnail size; composition with safe cropping margins; consistent photographic light, color grade and contrast.
- No words, logos, owl mascot, invented numbers, misleading charts, watermarks, gratuitous dashboards or misleading maps. Any illustrative graph is explicitly decorative and must not be mistaken for article data.
- Each image requires a topic-specific visual concept; do not reuse one generic Greece infographic for unrelated subjects.
- Record the post IDs (Greek and English), original media IDs, new media ID, topic, prompt variant, upload URL, date, and verification status **before** changing featured_media. Change in batches of 3–5, verify saved IDs and inspect actual page rendering before expanding.
- Greek/English paired posts should use the same appropriate featured image unless editorially justified. Do not alter existing in-body charts, text, captions or datasets.
- Keep original media in library for rollback. A successful WordPress API update is **not** proof of browser/mobile visual correctness.

### Master image prompt

Create a premium editorial cover image for a Greek data journalism publication called "Statistikos Atlas".

**Topic:** [SPECIFIC ARTICLE TOPIC]
**Visual concept:** [ONE CONCRETE SCENE OR VISUAL METAPHOR]

**Style:** Sophisticated European editorial photography or carefully designed abstract data illustration, depending on the topic. Realistic lighting, thoughtful composition, understated elegance, subtle cinematic depth, credible and contemporary journalistic aesthetics.

**Brand palette:** Deep navy (#102A46), medium blue (#2165A4), muted ice blue (#B8D5EA), soft neutral whites, with restrained warm accents where appropriate.

**Composition:** Horizontal 16:9, designed for a website featured image. One clear focal point, balanced negative space, strong readability at thumbnail size, natural depth and uncluttered visual hierarchy.

**Strict requirements:**
- No text, titles, letters, numbers, logos, watermarks or owl mascot.
- No fabricated statistical claims or charts presented as real data.
- No generic corporate stock-photo aesthetics.
- No excessive icons, decorative dashboards or irrelevant symbols.
- No distorted faces, hands, buildings or geographical shapes.
- Visually distinctive and directly relevant to the specific article.
- Maintain a consistent premium editorial identity across the entire publication.

**Output:** 1600 × 900 pixels, high visual quality, suitable for conversion to optimized WebP.

## WordPress work performed in ChatGPT session (reported and API-verified where noted)

- Header/mobile branding underwent iterations and was restored after an unsuccessful version. The Data Lab flask header link was removed; owl branding retained.
- Data Lab landing page 1585 and five posts (1587, 1590, 1591, 1592, 1603) moved to draft; its scheduled task disabled. GitHub issue #1 documents an unimplemented multi-agent QA *proposal*, not actual independent agents. Data verification and article editing remain Claude's remit.
- Podcast episodes 1–5 (posts 1263, 1285, 1289, 1300, 1313) had native audio blocks replaced by custom owl-eye-themed HTML/CSS/JS audio players. Stored markup was checked, but independent live browser playback was **not** confirmed.
- Home and index templates: owl-inspired reading/book and podcast/play icons introduced in monthly-feature bar. Home map callout layout adjusted, owl icon removed, Greece map image background added, white overlay opacity lowered slightly to make map more visible.
- Home template: editorial article cards introduced in two post-query sections (rounded corners, image, excerpt, read-more, spacing). Live mobile rendering **not** independently verified.
- Three pilot featured-image changes verified in WordPress:
  - Greek post **17** (heating hardship), old media **652** → new **1636** (editorial photo).
  - Greek post **1323** (self-employment), old **1321** → new **1637** (navy statistical illustration).
  - Greek post **1317** (fertility), old **1315** → new **1638** (light statistical illustration).
  - English counterparts were **not** changed during pilot; beware shared original media.
- Site's published post list was queried and contained **97** posts at the time, including English counterparts and podcast posts. This is a snapshot, not a permanent inventory.
- User approved systematic gradual replacement of featured images with consistent dimensions and prompt. Preserve rollback mapping; do not automatically modify all posts in one bulk operation.

## Important limitations / QA

Past changes were made via WordPress API; no reliable claim of browser screenshot testing. Some early generated Greece-map illustrations may have stylized geographic outlines; they should not be presented as factual maps. Do not infer article claims from generated imagery. Avoid overclaiming independent QA.

## Rollback log for first pilot

| Greek post ID | Previous featured media ID | New featured media ID |
| --- | ---: | ---: |
| 17 | 652 | 1636 |
| 1323 | 1321 | 1637 |
| 1317 | 1315 | 1638 |

Further batches should append records here or in a dedicated image migration ledger.

## Batch 2: Kozani district heating (2026-11-15)

- Editorial image uploaded as WordPress media **1642**: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-kozani-district-heating-editorial.png`.
- Greek post **15** and English post **303**: previous featured media **1422** → new **1642**. WordPress API re-read confirmed both new featured media IDs.
- Illustration is **not** an authentic photo of the Kozani plant; media alt text explicitly states this.
- **Deviation from target production spec:** source PNG is 1672 × 941 px, not yet resized to 1600 × 900 WebP. Before scaling the workflow, optimize subsequent uploads to the approved output spec. Browser/mobile rendering not independently tested.
