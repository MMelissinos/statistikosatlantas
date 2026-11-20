#!/usr/bin/env python3
"""Independent statistical reproduction for the monthly article.

Inputs are the ELSTAT-derived integer counts stored in the Atlas repository.
No rounded percentages or previously reported correlations are used.
"""
import csv
import json
import math
from pathlib import Path

import numpy as np
from scipy import stats


ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent

NAMES = {
    "EL30": "Αττική", "EL41": "Βόρειο Αιγαίο", "EL42": "Νότιο Αιγαίο",
    "EL43": "Κρήτη", "EL51": "Ανατολική Μακεδονία και Θράκη",
    "EL52": "Κεντρική Μακεδονία", "EL53": "Δυτική Μακεδονία",
    "EL54": "Ήπειρος", "EL61": "Θεσσαλία", "EL62": "Ιόνια Νησιά",
    "EL63": "Δυτική Ελλάδα", "EL64": "Στερεά Ελλάδα", "EL65": "Πελοπόννησος",
}


def load():
    ageing = json.loads((ROOT / "xartis/data/indicators/ageing.json").read_text())
    census = json.loads((ROOT / "xartis/data/indicators/census.json").read_text())
    old = ageing["levels"]["nuts2"]["2011"]
    p11 = census["levels"]["nuts2"]["2011"]
    p21 = census["levels"]["nuts2"]["2021"]
    assert set(old) == set(p11) == set(p21) == set(NAMES)
    rows = []
    for code in sorted(NAMES):
        rows.append({
            "code": code, "region": NAMES[code], "age65_count_2011": old[code],
            "population_2011": p11[code], "population_2021": p21[code],
            "age65_pct_2011": 100 * old[code] / p11[code],
            "population_change_pct": 100 * (p21[code] / p11[code] - 1),
        })
    return rows, ageing, census


def fisher_ci(r, n, alpha=.05):
    z = np.arctanh(r)
    half = stats.norm.ppf(1-alpha/2) / math.sqrt(n-3)
    return tuple(np.tanh([z-half, z+half]))


def influence(x, y):
    X = np.column_stack([np.ones(len(x)), x])
    inv = np.linalg.inv(X.T @ X)
    beta = inv @ X.T @ y
    resid = y - X @ beta
    h = np.diag(X @ inv @ X.T)
    p = X.shape[1]
    mse = (resid @ resid) / (len(x)-p)
    cook = resid**2/(p*mse) * h/(1-h)**2
    rstudent_internal = resid / np.sqrt(mse*(1-h))
    return beta, h, cook, rstudent_internal, resid, mse


def main():
    rows, ageing, census = load()
    x = np.array([r["age65_pct_2011"] for r in rows])
    y = np.array([r["population_change_pct"] for r in rows])
    pearson = stats.pearsonr(x, y)
    spearman = stats.spearmanr(x, y)
    beta, leverage, cook, rstudent, residual, mse = influence(x, y)

    loo = []
    for i, row in enumerate(rows):
        keep = np.arange(len(rows)) != i
        rr = stats.pearsonr(x[keep], y[keep]).statistic
        loo.append((row["code"], row["region"], rr))

    # Deterministic nonparametric bootstrap for descriptive uncertainty.
    rng = np.random.default_rng(20261120)
    boots = []
    for _ in range(200_000):
        idx = rng.integers(0, len(x), len(x))
        if np.std(x[idx]) and np.std(y[idx]):
            boots.append(np.corrcoef(x[idx], y[idx])[0, 1])
    boot_ci = np.quantile(boots, [.025, .975])

    for i, row in enumerate(rows):
        row.update(leverage=float(leverage[i]), cooks_d=float(cook[i]),
                   internal_studentized_residual=float(rstudent[i]), residual=float(residual[i]))
    with (OUT / "regional_values_and_diagnostics.csv").open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader(); w.writerows(rows)
    with (OUT / "leave_one_out.csv").open("w", newline="") as f:
        w = csv.writer(f); w.writerow(["omitted_code", "omitted_region", "pearson_r"]); w.writerows(loo)

    result = {
        "n": len(rows),
        "national_population_2011_sum": sum(r["population_2011"] for r in rows),
        "national_population_2021_sum": sum(r["population_2021"] for r in rows),
        "national_age65_2011_sum": sum(r["age65_count_2011"] for r in rows),
        "pearson_r": pearson.statistic, "pearson_p_two_sided": pearson.pvalue,
        "pearson_fisher_95_ci": fisher_ci(pearson.statistic, len(rows)),
        "pearson_bootstrap_percentile_95_ci": boot_ci.tolist(),
        "spearman_rho": spearman.statistic, "spearman_p_two_sided": spearman.pvalue,
        "ols_intercept": beta[0], "ols_slope": beta[1], "ols_residual_mse": mse,
        "leave_one_out_min": min(loo, key=lambda z:z[2]),
        "leave_one_out_max": max(loo, key=lambda z:z[2]),
        "largest_cooks_d": sorted([(rows[i]["code"], rows[i]["region"], float(cook[i])) for i in range(len(rows))], key=lambda z:z[2], reverse=True)[:5],
        "largest_leverage": sorted([(rows[i]["code"], rows[i]["region"], float(leverage[i])) for i in range(len(rows))], key=lambda z:z[2], reverse=True)[:5],
        "input_sources": {"ageing": ageing["source"], "census": census["source"]},
    }
    (OUT / "results.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
