#!/usr/bin/env python3
"""Independent verification B from official ELSTAT workbooks."""
import json
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

ROOT = Path(__file__).resolve().parent
F11 = ROOT / "raw/elstat_2011_B05.xlsx"
F21 = ROOT / "raw/elstat_2021_A01.xlsx"

names = {
    "111": "Ανατολική Μακεδονία και Θράκη",
    "112": "Κεντρική Μακεδονία",
    "121": "Δυτική Μακεδονία",
    "122": "Ήπειρος",
    "231": "Θεσσαλία",
    "232": "Στερεά Ελλάδα",
    "241": "Ιόνια Νησιά",
    "242": "Δυτική Ελλάδα",
    "243": "Πελοπόννησος",
    "351": "Αττική",
    "461": "Βόρειο Αιγαίο",
    "462": "Νότιο Αιγαίο",
    "471": "Κρήτη",
}

# 2011 workbook: sum the official regional-unit rows, independently of repo JSON.
d11 = pd.read_excel(F11, header=None)
d11[1] = d11[1].astype(str).str.replace(r"\.0$", "", regex=True)
pe = d11[d11[0].eq(4)].copy()
pe["region"] = pe[1].str[:3]
total11 = pe[pe[2].astype(str).str.startswith("ΠΕΡΙΦΕΡΕΙΑΚΗ ΕΝΟΤΗΤΑ")].groupby("region")[3].sum()
age65 = pe[pe[2].astype(str).str.strip().eq("65+")].groupby("region")[3].sum()

# 2021 workbook: aggregate official regional-unit rows to NUTS2. ELSTAT's
# confidentiality perturbation means these sums can differ by a few persons
# from the separately printed regional/national totals.
d21 = pd.read_excel(F21, header=None)
# Include the self-governed Mount Athos row (code 11299) in Central
# Macedonia. It is not labelled as a regional unit in the workbook, but it
# belongs to the NUTS2 total and accounts for 1,744 residents in 2021.
is_unit = d21[3].astype(str).str.startswith("ΠΕΡΙΦΕΡΕΙΑΚΗ ΕΝΟΤΗΤΑ")
is_athos = d21[3].astype(str).str.strip().eq("ΑΓΙΟ ΟΡΟΣ (ΑΥΤΟΔΙΟΙΚΗΤΟ)")
pe21 = d21[(d21[1].eq(4)) & (is_unit | is_athos)].copy()
pe21[2] = pe21[2].astype(str).str.replace(r"\.0$", "", regex=True)
pe21["region"] = pe21[2].str[:3]
total21 = pe21.groupby("region")[4].sum()

rows = []
for code, name in names.items():
    p11 = int(total11.loc[code])
    a65 = int(age65.loc[code])
    p21 = int(total21.loc[code])
    rows.append({
        "code": code, "region": name, "pop_2011": p11, "age65_2011": a65,
        "share65_2011": a65 / p11 * 100,
        "pop_2021": p21, "pop_change_pct": (p21 / p11 - 1) * 100,
    })
df = pd.DataFrame(rows).sort_values("code")
x = df.share65_2011.to_numpy(); y = df.pop_change_pct.to_numpy()
pearson = stats.pearsonr(x, y)
spearman = stats.spearmanr(x, y)
loo = []
for i, row in df.reset_index(drop=True).iterrows():
    keep = np.arange(len(df)) != i
    loo.append({"omitted": row.region, "r": float(stats.pearsonr(x[keep], y[keep]).statistic)})

result = {
    "national_sums": {"2011": int(df.pop_2011.sum()), "2021": int(df.pop_2021.sum()), "age65_2011": int(df.age65_2011.sum())},
    "pearson_r": float(pearson.statistic), "pearson_p_two_sided": float(pearson.pvalue),
    "pearson_ci_95": [float(pearson.confidence_interval().low), float(pearson.confidence_interval().high)],
    "spearman_rho": float(spearman.statistic), "spearman_p_two_sided": float(spearman.pvalue),
    "leave_one_out": loo,
}
df.to_csv(ROOT / "regional_values.csv", index=False, float_format="%.10f")
(ROOT / "results.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(df.to_string(index=False))
print(json.dumps(result, ensure_ascii=False, indent=2))
