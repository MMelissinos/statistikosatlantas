# Independent verification B

## Verdict

PASS for the numerical results of monthly draft 1605. The calculation was
repeated from the official ELSTAT 2011 and 2021 Excel workbooks, independently
of the repository JSON and Statistician A.

## Results

- Pearson r: -0.7850337378 (two-sided p = 0.0014776855)
- Spearman rho: -0.6758241758 (two-sided p = 0.0112252456)
- Leave-one-out Pearson range: -0.8337152794 to -0.6448722775
- 2011 population sum: 10,816,286
- 2021 population sum: 10,482,487
- 2011 population aged 65+ sum: 2,108,852

These agree with Statistician A and the values shown in draft 1605 at the
published precision.

## Important extraction detail

The 2021 workbook lists Mount Athos separately as
`ΑΓΙΟ ΟΡΟΣ (ΑΥΤΟΔΙΟΙΚΗΤΟ)` (code 11299), rather than as a row whose label
starts with `ΠΕΡΙΦΕΡΕΙΑΚΗ ΕΝΟΤΗΤΑ`. Its 1,744 residents must be included in
Central Macedonia. Omitting that row produces an incorrect national sum and
slightly different correlations. The verification script handles it
explicitly.

## Artifacts

- `stat_b/verify.py`: complete extraction and calculation
- `stat_b/raw/elstat_2011_B05.xlsx`: official 2011 workbook
- `stat_b/raw/elstat_2021_A01.xlsx`: official 2021 workbook
- `stat_b/regional_values.csv`: extracted regional dataset
- `stat_b/results.json`: machine-readable results

