# Final QA gate — draft 1605

**Article:** «Γήρανση και πληθυσμιακή μεταβολή στις 13 περιφέρειες»  
**WordPress draft:** 1605  
**QA role:** independent publication gate; this file is not an approval to publish.  
**Current verdict:** **BLOCKED** until the primary-source audit and two genuinely independent calculations meet every blocking criterion below.

## Status vocabulary

- **PASS:** objective evidence is attached, reproducible and matches the acceptance rule.
- **FAIL:** evidence exists and contradicts the article or the acceptance rule.
- **BLOCKED:** evidence is absent, incomplete, inaccessible or not independent enough to decide.
- No blocking row may be waived by editorial judgment. Any **FAIL** or **BLOCKED** blocking row means: keep WordPress status `draft`, do not send a newsletter and do not publicize.

## Required evidence package

The release candidate must point to immutable artifacts for all of the following:

1. Source-audit report, exact original ΕΛΣΤΑΤ filenames/URLs, retrieval timestamps and SHA-256 hashes.
2. Raw source files or a documented, reproducible download command. A page URL alone is not sufficient.
3. Stat A code, environment/dependency record, machine-readable input and full output.
4. Stat B code, environment/dependency record, machine-readable input and full output. Stat B must not reuse Stat A's derived table or code.
5. A reconciliation table covering every region and every published statistic.
6. Final Gutenberg markup, rendered preview screenshots (desktop and mobile), link check and WordPress read-back.
7. A dated final QA result with one row per publishable claim and number.

## Gate A — provenance and definitions (blocking)

| ID | Check | PASS criterion | Initial status |
|---|---|---|---|
| A1 | Official provenance | Both census years are traced to primary ΕΛΣΤΑΤ tables, not only `ageing.json`, `census.json`, the manifest or a prior article. | BLOCKED |
| A2 | Raw-file identity | Exact official filename/document ID (where available), direct download URL, retrieval date and SHA-256 are recorded separately for every raw input. | BLOCKED |
| A3 | 2011 numerator | The 65+ count is independently aggregated from the relevant 2011 age groups in table B05 (or an equally authoritative primary table). The inclusion rule is exactly age 65 and over. | BLOCKED |
| A4 | 2011 denominator | Denominator is 2011 **μόνιμος πληθυσμός**, with the same geography and population universe as the numerator. | BLOCKED |
| A5 | 2021 population | 2021 value is **μόνιμος πληθυσμός**, not de facto/usual estimate, registered population or 1 January estimate. | BLOCKED |
| A6 | Geography | Exactly 13 NUTS2/administrative regions are included. The mapping EL30, EL41–EL43, EL51–EL54, EL61–EL65 is explicit and stable across years. | BLOCKED |
| A7 | Aggregation | If source tables are at regional-unit level, aggregation to region is by counts before division; percentages are never averaged. | BLOCKED |
| A8 | Coverage exceptions | Treatment of Mount Athos/Halkidiki, unknown age, suppressed/perturbed cells and any boundary changes is documented and quantified. | BLOCKED |
| A9 | Comparability | Evidence confirms that 2011–2021 is comparable for this use. Any methodological break or disclosure-control perturbation is described in the article at proportionate prominence. | BLOCKED |
| A10 | Missing values | No missing, duplicated, non-numeric or silently coerced regional values. There are 13 unique keys in each input and 13 matched pairs. | BLOCKED |
| A11 | National totals | Raw regional totals reconcile to official national totals or every difference is explained. Repo baselines are 10,816,286 (2011) and 10,482,487 (2021); these are checks, not substitutes for source verification. | BLOCKED |
| A12 | Repo lineage | The hashes in `manifest.json` are identified as raw-file or transformed-artifact hashes. They must not be described as raw-source hashes without proof. | BLOCKED |

## Gate B — row-level numerical reconciliation (blocking)

For each of the 13 regions, the reconciliation sheet must contain: code, Greek name, raw 65+ count 2011, raw permanent population 2011, raw permanent population 2021, unrounded 65+ share, unrounded population change, Stat A result, Stat B result, source-audit result, displayed result and status.

| Quantity | Formula | Required agreement |
|---|---|---|
| 65+ share 2011 | `100 × count_65plus_2011 / permanent_population_2011` | Stat A = Stat B = source audit to ≤ 1e-10 before display rounding; displayed percentage equals round-half rule explicitly chosen to 2 decimals. |
| Population change | `100 × (population_2021 / population_2011 − 1)` | Same agreement and rounding rule as above. |
| Counts | Integer source counts | Exact equality, not tolerance. |

Blocking checks:

- [ ] **B1 PASS** — all 13 codes occur exactly once in all three evidence streams.
- [ ] **B2 PASS** — all raw counts match exactly between Stat A, Stat B and source audit.
- [ ] **B3 PASS** — all 26 unrounded derived regional values meet the tolerance above.
- [ ] **B4 PASS** — every displayed table value in the release candidate is generated from the reconciled values, not copied manually.
- [ ] **B5 PASS** — plus/minus signs, Greek decimal commas and percent symbols are correct; no Unicode minus/sign inconsistency changes parsing or meaning.
- [ ] **B6 PASS** — region names are canonical and code mapping is preserved; `Ανατολική Μακεδονία και Θράκη` versus `&` is only a style difference.
- [ ] **B7 PASS** — sorted order, if used, is deterministic and does not omit a region.

Any single mismatch is **FAIL**, even if it does not change rounded display values; it must be reconciled in writing before release.

## Gate C — statistical results (blocking)

### C1 Pearson

- Same 13 pairs and no weights unless the article explicitly changes the estimand.
- Pearson is calculated from unrounded regional values.
- Stat A and Stat B must agree to at least `1e-10`; article display must follow the declared rounding rule.
- Draft baseline `r = −0.7850` is a hypothesis to verify, not ground truth.
- Record two-sided p-value, 95% confidence interval (preferably Fisher z with small-sample caveat) and degrees of freedom (`n−2 = 11`). Whether or not they appear in the prose, QA needs them to judge uncertainty.

### C2 Spearman

- Ranks are generated from unrounded values; tie method is declared.
- Stat A and Stat B agree to `1e-10` or document a justified software/tie-handling difference.
- Draft baseline `ρ = −0.6758` is a hypothesis to verify.
- Record exact/permutation or asymptotic p-value and method; do not mix methods silently.

### C3 Leave-one-out

- Exactly 13 recomputations, each identified by omitted region.
- All 13 coefficients agree between A and B to `1e-10`.
- Verify both extrema and their omitted regions. Draft claims: minimum `−0.8337` without Βόρειο Αιγαίο; maximum/least negative `−0.6449` without Νότιο Αιγαίο.
- Language must say the magnitude is sensitive to composition; persistence of a negative sign is not proof of robustness or causality.

### C4 Diagnostics required before publication

- [ ] Scatterplot inspected for non-linearity, leverage and data-entry errors; each point is labelled or identifiable.
- [ ] Influence diagnostics recorded (at minimum leverage, studentized residuals and Cook's distance).
- [ ] Residual/robustness review supports use of Pearson, or article foregrounds rank/robust alternatives.
- [ ] A permutation or bootstrap sensitivity analysis is documented if inferential language is retained.
- [ ] Spatial dependence is considered; absence of a spatial test must be stated as a limitation, not silently ignored.
- [ ] Multiple-analysis history is inventoried. If this relationship was selected after testing many indicators, no unqualified confirmatory p-value language is allowed.

### C5 Secondary 2021-ageing comparison

The draft's `r = −0.7798` using 2021 age composition is **BLOCKED by default** unless independently verified. If retained, it must be labelled contemporaneous/end-of-period and not a predictive robustness test. It may be removed without weakening the central descriptive analysis.

## Gate D — claim-by-claim editorial QA (blocking)

Create a ledger with columns: claim ID, exact final sentence, evidence artifact/line, numerical dependencies, reviewer status and approved wording. At minimum include:

| Claim | Allowed only if | Prohibited wording |
|---|---|---|
| Regions with higher 2011 65+ shares tended to have larger population declines | A–C all PASS and final scatterplot supports the description. | “Η γήρανση προκάλεσε…”, “αποδεικνύει”, “οδηγεί σε”. |
| Pearson/Spearman values | Both implementations and source audit reconcile; unrounded computation retained. | “ισχυρή” without a defined convention and uncertainty context. |
| Direction remains negative in leave-one-out | All 13 runs reconcile. | “robust” or “ανθεκτικό” without also reporting the wide magnitude range. |
| National totals and regional table | Primary totals reconcile and every row passes B. | Implying annual population evolution from two census snapshots. |
| 2011 exposure precedes 2011–2021 outcome | Dates are correct. | Calling this causal, experimental or a validated forecast. |

Mandatory limitations in plain Greek:

- 13 aggregate observations only.
- Ecological relationship; no inference about individuals.
- Census snapshots, not annual tracking.
- Births, deaths and migration mechanically shape both age composition and population change; plausible confounding/endogeneity remains.
- Region size differs greatly; the unweighted analysis gives each region equal weight.
- Results may be influenced by specific island regions/outliers.
- Relationship was exploratory; multiple comparisons/selection history must be disclosed if applicable.

Editorial acceptance checks:

- [ ] Title states association/descriptive pattern, not causation.
- [ ] Lead gives the time window, unit of analysis (`13 περιφέρειες`) and non-causal caveat.
- [ ] Every number in prose also appears in the QA ledger.
- [ ] Methods distinguish counts, percentages and percentage-point changes.
- [ ] “NUTS2” is explained or omitted for a general audience; administrative naming remains accurate.
- [ ] Source links point to official ΕΛΣΤΑΤ pages/files first; GitHub transformed JSON may be offered only as reproducibility material.
- [ ] Retrieval dates and table names are visible in methodology/source notes.
- [ ] No statement claims external peer review or “independent verification” beyond what the actual separate agents/artifacts demonstrate.

## Gate E — chart/table QA (blocking if included)

- [ ] Scatterplot uses unrounded data and clearly labels x: `% κατοίκων 65+ το 2011`; y: `% μεταβολή μόνιμου πληθυσμού 2011–2021`.
- [ ] Axes include zero only when editorially helpful; truncation must not exaggerate the association.
- [ ] Trend line is identified as descriptive; confidence band method is documented if shown.
- [ ] Every region is present exactly once and labels do not misidentify points.
- [ ] Alt text states the main pattern and notable exceptions without asserting causality.
- [ ] Colour contrast, mobile legibility and 200% zoom are acceptable.
- [ ] Table headers repeat/read correctly on mobile and do not imply that 65+ share is a count.
- [ ] Chart/table values are generated from the final reconciled dataset and hashes are recorded.

## Gate F — WordPress release controls (blocking)

Before any write:

- [ ] Take a WordPress revision/export of draft 1605 and record current title, slug, content hash, status, author, categories/tags, excerpt, SEO fields, featured media and newsletter/publicize settings.
- [ ] Confirm 1605 is the intended canonical draft; do not accidentally publish or duplicate 1587.
- [ ] Keep status `draft` throughout QA. Newsletter and social/publicize remain disabled during edits and preview.
- [ ] Confirm whether a Greek/English paired post is required; do not set `atlas_pair` until both are real and checked.

Release-candidate content:

- [ ] Valid Gutenberg block markup; no malformed or orphaned block comments.
- [ ] Title, slug, excerpt, SEO title/description, canonical and Open Graph values reviewed.
- [ ] Featured image has correct rights/provenance, dimensions and meaningful alt text; no fabricated chart/data in decorative imagery.
- [ ] Every official-source and reproducibility link returns successfully and points to the claimed resource.
- [ ] Preview desktop and mobile; inspect table overflow, chart labels, captions, footnotes and dark/light contrast.
- [ ] No placeholder, `[Ελεγμένη αναθεώρηση]`, “draft”, internal agent language or unsupported “verified” badge remains.

Immediately before publication:

- [ ] Human owner explicitly approves the exact final revision.
- [ ] Re-read via WordPress API and compare content hash with the approved candidate.
- [ ] Final QA ledger contains only PASS, signed/dated by QA; no FAIL/BLOCKED.
- [ ] Publication date/time and timezone are explicit; newsletter/social choices are deliberate, not inherited defaults.
- [ ] Publish once, then API read-back confirms `status=publish`, title, slug, featured media and final content hash.
- [ ] Live page is checked signed-out on desktop and mobile; canonical, OG metadata, chart/table, source links and structured data render correctly.
- [ ] If any post-publication check fails, revert to draft or prior revision and document the rollback.

## Agreement matrix required from Source Audit / Stat A / Stat B

| Item | Source audit | Stat A | Stat B | Release rule |
|---|---|---|---|---|
| Official files and hashes | Establishes authority and identity | Records exact files consumed | Independently records exact files consumed | All hashes must refer to the same authoritative editions, or differences reconciled. |
| Geographic mapping | Validates codes/boundaries | Produces mapping used | Independently produces mapping | Exact 13-code agreement. |
| Raw regional counts | Extracts/audits from tables | Extracts from raw source | Independently extracts from raw source | Exact integer agreement for every cell. |
| Derived regional values | Confirms definitions/formulas | Computes full precision | Independently computes full precision | Agreement ≤ 1e-10. |
| Pearson/Spearman/LOO | Confirms input validity | First implementation | Different independent implementation | Agreement ≤ 1e-10 plus matching omitted-region labels. |
| Limitations | Confirms source caveats | Reports computational caveats | Reports independent caveats | Final article includes union of material limitations. |

“Independent” means Stat B must start from primary source tables and its own extraction/code. Re-running Stat A's CSV, notebook, JSON or function is replication of execution, not an independent verification.

## Current preliminary assessment

- The repo supplies coherent transformed baselines and explicit definitions, but it does not by itself satisfy primary-source verification.
- Draft 1605 appropriately contains non-causal caveats, yet its title prefix, lack of excerpt/featured media and reliance on GitHub JSON links show it is not publication-ready.
- The manifest points to ΕΛΣΤΑΤ census publication SAM03/2021 and names relevant tables, but it does not expose exact raw filenames/document IDs for the census inputs in the inspected metadata. This keeps A2 **BLOCKED**.
- The repo notes small 2021 age-cell perturbations for privacy. Their effect must be quantified in the source audit even if they do not affect two-decimal percentages.
- Until all gates above pass, the correct outcome is **BLOCKED — no publication**.

