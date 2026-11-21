# SEO triage — 2026-11-21

## Search Console snapshot

- 45 impressions
- 3 clicks
- 6.7% CTR
- Average position 11.1
- Period selected in the supplied screenshot: 3 months; the site itself is new.

Interpretation: CTR is not the immediate problem. The early average position is
close to page one, but the sample is far too small for article-level decisions.

## Coverage export

Source: `Coverage-Drilldown-2026-11-20.xlsx`, issue `Discovered – currently
not indexed`.

The export contains 461 URLs:

- 334 media attachment-like URLs (`hero`, `fig`, `cover`, `glafka`, `recap`,
  logos and similar assets).
- 71 dated attachment/generated slugs.
- 7 date archive URLs.
- 49 normal post permalinks.

The large headline count therefore does **not** mean that Google rejected 461
articles. Most entries are low-value attachment or archive surfaces, and every
row in the export had the placeholder crawl date 1970-01-01.

## Live technical verification

- `robots.txt`: HTTP 200, Google crawling is not blocked, sitemap locations
  are advertised.
- `sitemap.xml`: HTTP 200, Jetpack sitemap index is valid and points to the
  page and image sitemaps.
- All 49 normal post URLs from the export are in the current main sitemap.
- All 49 return HTTP 200.
- All 49 have a self-referencing canonical.
- None has an explicit `noindex` directive.
- Google Search Console verification is configured in WordPress.

Conclusion: no evidence of a technical indexing block was found.

## Change applied

The WordPress homepage SEO description was empty. It is now:

> Επίσημα στοιχεία για την Ελλάδα και τις περιφέρειες: πληθυσμός, εργασία,
> εισόδημα, στέγαση, ενέργεια, υγεία και εκπαίδευση, με πηγές και μεθοδολογία.

Live read-back confirmed the description in both the standard description and
Open Graph description, with a self-referencing homepage canonical.

## Main strategic risk

The site has hundreds of tightly scheduled, structurally similar regional
findings in Greek and English. They are factually distinct, but Google may
choose only a subset when many near-identical URLs are published quickly. This
can disperse internal authority and create query overlap.

Do not delete or mass-noindex them on the basis of eight days of data. Preserve
the agreed schedule for now, then make the decision from page/query Search
Console data after enough URLs have been crawled.

## Next decision rule

After 28 days of usable Search Console data:

1. Export Pages and Queries, including clicks, impressions, CTR and position.
2. Prioritise URLs with at least 10 impressions and average position 5–20.
3. Improve their title and opening answer, and add contextual links from the
   strongest relevant article or category page.
4. Identify findings that compete for the same query. Keep the strongest as the
   indexable target and consider consolidating the weaker set into a thematic
   hub only after evidence of cannibalisation.
5. Build six durable hubs: Population, Work, Income/Cost of living, Housing,
   Health/Education and Regional development. Findings should support a hub;
   they should not all compete as isolated landing pages.

## Do not do yet

- Do not request manual indexing for hundreds of URLs.
- Do not rewrite successful titles from a 45-impression sample.
- Do not remove the English versions.
- Do not mass-delete attachment pages without a tested redirect/noindex policy.
- Do not publish more standalone articles merely to increase volume.
