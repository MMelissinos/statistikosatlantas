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

## Batch 3: paired translations and healthy-life-years image (2026-11-15)

| Post ID | Subject | Old featured media | New featured media | API verified |
| ---: | --- | ---: | ---: | --- |
| 305 | Heating hardship (EN) | 652 | 1636 | yes |
| 1347 | Self-employment (EN) | 1321 | 1637 | yes |
| 1345 | Fertility (EN) | 1315 | 1638 | yes |
| 1320 | Healthy life years (EL) | 1318 | 1645 | yes |
| 1346 | Healthy life years (EN) | 1318 | 1645 | yes |

- New featured image media **1645**, `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-healthy-years-1600x900-1.webp`.
- Output independently resized and compressed to **1600 × 900 WebP**, **164,404 bytes**, meeting v1 production spec.
- Visual: AI-generated editorial illustration of older adults walking in a sunny park; **not** documentary photography or evidence of a specific Greek location.
- No article bodies or statistics edited. Actual live-browser appearance still unverified.

## Batch 4: Food prices (2026-11-15)

| Post ID | Subject | Old featured media | New featured media | API verified |
| ---: | --- | ---: | ---: | --- |
| 1254 | Food prices (EL) | 1253 | 1651 | yes |
| 1255 | Food prices (EN) | 1253 | 1651 | yes |

- Media **1651**: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-food-prices-1600x900-1.webp`.
- Output **1600 × 900 WebP**, **142,548 bytes**; editorial AI-generated scene of shopping at a Greek market, not documentary evidence.
- Attempted imagery for municipal waste did not match the topic and **was not uploaded or published**. Municipal waste posts **1244/1245** remain unchanged (featured media **1243**).
- No article body/data changes; live browser visual verification pending.

## Batch 5: Municipal waste (2026-11-16)

| Post ID | Subject | Old featured media | New featured media | API verified |
| ---: | --- | ---: | ---: | --- |
| 1244 | Municipal waste (EL) | 1243 | 1654 | yes |
| 1245 | Municipal waste (EN) | 1243 | 1654 | yes |

- Media **1654**: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-municipal-waste-1600x900-1.webp`.
- Output **1600 × 900 WebP**, **173,094 bytes**.
- AI-generated illustrative waste-sorting facility with disposal area in the background. **Not** an authentic photo of any Greek facility or evidence of waste treatment statistics.
- Original featured image **1243** retained for rollback. No article content/data changed; live browser/mobile rendering not independently verified.

## Batch 6: Youth unemployment and parental home (2026-11-16)

| Post ID | Subject | Old featured media | New featured media | API verified |
| ---: | --- | ---: | ---: | --- |
| 1232 | Youth unemployment / parental home (EL) | 1231 | 1657 | yes |
| 1233 | Youth unemployment / parental home (EN) | 1231 | 1657 | yes |

- Media **1657**: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-youth-parental-home-1600x900-1.webp`.
- Output **1600 × 900 WebP**, **97,612 bytes**.
- AI-generated editorial scene of a young adult using a laptop at the family home; illustrative, not an authentic photo of any person or a depiction of a particular statistic.
- Original media **1231** retained for rollback. Article text/data unchanged; browser/mobile rendering not independently verified.

## Batch 7: Net migration (2026-11-16)

| Post ID | Subject | Old featured media | New featured media | API verified |
| ---: | --- | ---: | ---: | --- |
| 1192 | Net migration (EL) | 1444 | 1660 | yes |
| 1193 | Net migration (EN) | 1444 | 1660 | yes |

- Media **1660**: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-net-migration-1600x900-1.webp`.
- Output **1600 × 900 WebP**, **116,156 bytes**.
- AI-generated editorial scene of travelers at a ferry port; symbolic illustration, not an authentic depiction of migration statistics or a real event.
- Original media **1444** retained for rollback. No article text/data edited. Live browser/mobile rendering not independently verified.

## Batch 8: Road safety (2026-11-16)

| Post ID | Subject | Old featured media | New featured media | API verified |
| ---: | --- | ---: | ---: | --- |
| 1184 | Road safety (EL) | 1447 | 1663 | yes |
| 1185 | Road safety (EN) | 1447 | 1663 | yes |

- Media **1663**: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-road-safety-1600x900-1.webp`.
- Output **1600 × 900 WebP**, **235,192 bytes**.
- AI-generated editorial image of a winding mountain road and a car at sunset; not a photo of a real location, collision, or statistical evidence.
- Original media **1447** retained for rollback. No article text/data edited; live browser/mobile appearance not independently verified.

## Batch 8: Road safety, electric heating, digital skills (2026-11-16)

| Post ID | Subject | Previous featured media | New media | API verified |
| ---: | --- | ---: | ---: | --- |
| 1184 | Road safety (EL) | 1447 | 1663 | yes |
| 1185 | Road safety (EN) | 1447 | 1663 | yes |
| 1174 | Electric heating (EL) | 1450 | 1666 | yes |
| 1177 | Electric heating (EN) | 1450 | 1666 | yes |
| 1163 | Digital skills (EL) | 1456 | 1667 | yes |
| 1164 | Digital skills (EN) | 1456 | 1667 | yes |

- Road safety image: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-road-safety-1600x900-1.webp`, 1600 × 900 WebP, 235,192 bytes; AI-generated winding road scene, not a real crash or identified location.
- Electric heating image: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-electric-heating-1600x900-1.webp`, 1600 × 900 WebP, 122,366 bytes; AI-generated domestic electric heater scene.
- Digital skills image: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-digital-skills-1600x900-1.webp`, 1600 × 900 WebP, 70,542 bytes; AI-generated classroom scene with laptops, illustrative only.
- Original media retained for rollback. No post text or statistics changed. WordPress API state verified, live browser visual inspection pending.

## Batch 9: Gas heating, women's employment, housing burden (2026-11-16)

| Post ID | Subject | Previous featured media | New media | API verified |
| ---: | --- | ---: | ---: | --- |
| 1170 | Gas heating (EL) | 1453 | 1672 | yes |
| 1175 | Gas heating (EN) | 1453 | 1672 | yes |
| 1127 | Women's employment (EL) | 1459 | 1673 | yes |
| 1128 | Women's employment (EN) | 1459 | 1673 | yes |
| 1058 | Housing cost burden among owners (EL) | 1462 | 1674 | yes |
| 1059 | Housing cost burden among owners (EN) | 1462 | 1674 | yes |

- Gas heating: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-gas-1600x900-1.webp`, **1600 × 900 WebP**, **81,332 bytes**. AI-generated radiator and gas piping in apartment, illustrative only.
- Women's employment: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-women-1600x900-1.webp`, **1600 × 900 WebP**, **75,500 bytes**. AI-generated women at computers in an office.
- Housing cost burden: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-housing-1600x900-1.webp`, **1600 × 900 WebP**, **69,772 bytes**. AI-generated homeowner studying household bills.
- Originals retained for rollback; no article text or statistics edited. Images were cropped from AI-generated composites and resized, not documentary photographs. WordPress featured_media IDs verified; actual browser/mobile visual QA pending.

## Batch 10: Heating oil consumption (2026-11-16)

| Post ID | Subject | Previous featured media | New media | API verified |
| ---: | --- | ---: | ---: | --- |
| 238 | Heating oil consumption (EL) | 1497 | 1681 | yes |
| 309 | Heating oil consumption (EN) | 1497 | 1681 | yes |

- Media **1681**: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-heating-oil-1600x900-1.webp`.
- Output **1600 × 900 WebP**, **118,222 bytes**; AI-generated heating-oil tank in basement, not a real documented facility.
- Planned electricity-disconnections and rent/mortgage illustrations were **not applied**: generated alternatives were off-topic. No unsuitable images were uploaded for these subjects.
- Original media **1497** retained for rollback. Article content and data unchanged; WordPress featured_media re-read verified. Live browser rendering not checked.

## Batch 11: Electricity disconnections and housing-cost calculator (2026-11-16)

| Post ID | Subject | Previous featured media | New media | API verified |
| ---: | --- | ---: | ---: | --- |
| 13 | Electricity disconnections (EL) | 1500 | 1684 | yes |
| 301 | Electricity disconnections (EN) | 1500 | 1684 | yes |
| 1051 | Rent/mortgage burden tool (EL) | 1465 | 1685 | yes |
| 1052 | Rent/mortgage burden tool (EN) | 1465 | 1685 | yes |

- Electricity: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-electricity-disconnection-1600x900-1.webp`, **1600 × 900 WebP**, **95,120 bytes**. AI-generated household electricity meter/panel, symbolic rather than an authentic disconnection incident.
- Housing calculator: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-rent-mortgage-tool-1600x900-1.webp`, **1600 × 900 WebP**, **51,488 bytes**. AI-generated miniature house, keys, calculator and paperwork, symbolic illustration.
- Original media retained for rollback; no article text/data modified. Featured-media API re-read confirmed all four changes. Live browser/mobile visual verification still pending.

## Batch 12: Regional indicators tool (2026-11-16)

| Post ID | Subject | Previous featured media | New media | API verified |
| ---: | --- | ---: | ---: | --- |
| 939 | Regional indicators tool (EL) | 1477 | 1693 | yes |
| 940 | Regional indicators tool (EN) | 1477 | 1693 | yes |

- Media **1693**: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-regional-indicators-1600x900-1.webp`.
- **1600 × 900 WebP**, **138,458 bytes**. AI-generated scene of a person studying a map; geographic shapes are decorative and must not be interpreted as cartographically accurate.
- Original media **1477** retained for rollback. No article content/data changed. Featured media IDs re-read from WordPress; live browser/mobile appearance not independently checked.

## Inline hero-image synchronization, partial batch (2026-11-16)

User noticed featured image on article cards differed from imagery visible after opening articles. WordPress single template did not include a featured-image block. For the following **20** posts, inserted at the start of the existing post content a Gutenberg image block (`atlas-featured-inline`) using each post's already-assigned featured media URL, after checking the media ID and ensuring that URL was not already present:

| Featured media | Post IDs |
| ---: | --- |
| 1636 | 17, 305 |
| 1637 | 1323, 1347 |
| 1638 | 1317, 1345 |
| 1642 | 15, 303 |
| 1645 | 1320, 1346 |
| 1651 | 1254, 1255 |
| 1654 | 1244, 1245 |
| 1657 | 1232, 1233 |
| 1660 | 1192, 1193 |
| 1663 | 1184, 1185 |

**Important:** This operation **prepended** a new image; it did NOT delete existing in-body images, since many are actual statistical figures and must be preserved. In particular, older in-body owl-branded image blocks may still remain farther down in some articles. Inspect before deciding to remove any. WordPress post revisions support rollback. Remaining previously changed featured-image posts are still pending this inline sync. Live browser/mobile visual inspection pending.

## Batch 12: Heating-allowance tools and regional comparisons (2026-11-16)

| Post ID | Subject | Old featured media | New featured media | Featured and inline image verified |
| ---: | --- | ---: | ---: | --- |
| 825 | Heating allowance and social tariff tools (EL) | 1486 | 1717 | yes |
| 826 | Heating allowance and social tariff tools (EN) | 1486 | 1717 | yes |
| 866 | Five areas rank poorly on four indicators (EL) | 1480 | 1718 | yes |
| 867 | Five areas rank poorly on four indicators (EN) | 1480 | 1718 | yes |

- Media 1717: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-heating-allowance-1600x900-1.webp`, 1600×900 WebP, 149,894 bytes; AI-generated household bills and radiator, symbolic illustration.
- Media 1718: `https://statistikosatlantas.com/wp-content/uploads/2026/11/atlas-regional-comparison-1600x900-1.webp`, 1600×900 WebP, 126,048 bytes; AI-generated woman studying regional charts on laptop, symbolic illustration, charts not real data.
- For post 825, replaced its first decorative `atlas-card` image block with the new image. For 826, 866, 867, prepended the same image used as featured media, retaining existing body figures. No statistical charts or prose edited. Previous featured media retained for rollback; WordPress revisions available for body changes. API verified; browser/mobile rendering pending.
