#!/usr/bin/env python3
"""Δημοσίευση προγραμματισμένων εργαλείων (ουρά branches) στο tools.statistikosatlantas.com.

Κάθε εργαλείο που φτιάχνεται νωρίτερα περιμένει σε branch με όνομα
    tool/<YYYY-MM-DD>-<slug>
και περιέχει μόνο τον φάκελο <slug>/ (index.html κ.λπ.) και το <slug>/card.json:
    {"title": "...", "description": "...", "category": "perioxi-cat" | "kostos" | "epidomata"}

Όταν φτάσει η ημερομηνία (ώρα Ελλάδας), το script:
  1. φέρνει τον φάκελο <slug>/ στο main (χωρίς το card.json),
  2. προσθέτει την κάρτα στη σωστή κατηγορία της αρχικής index.html,
     στο ItemList του JSON-LD και στο sitemap.xml,
  3. κάνει commit και push στο main,
  4. μετονομάζει το branch σε published/<YYYY-MM-DD>-<slug> (δεν σβήνεται τίποτα).

Χρήση:
    python scripts/publish_scheduled_tools.py --list        # δείχνει την ουρά
    python scripts/publish_scheduled_tools.py --dry-run     # τι θα γινόταν σήμερα
    python scripts/publish_scheduled_tools.py               # δημοσίευση (το τρέχει το GitHub Action)
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://tools.statistikosatlantas.com/"
BRANCH_RE = re.compile(r"^tool/(\d{4}-\d{2}-\d{2})-([a-z0-9][a-z0-9-]*)$")
CATEGORIES = {
    "perioxi-cat": "Περιοχές & περιφέρειες",
    "kostos": "Κόστος ζωής & νοικοκυριό",
    "epidomata": "Επιδόματα: δικαιούμαι;",
}


def git(*args: str, check: bool = True) -> str:
    r = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, encoding="utf-8")
    if check and r.returncode != 0:
        raise SystemExit(f"git {' '.join(args)} απέτυχε:\n{r.stderr.strip()}")
    return r.stdout


def athens_today() -> dt.date:
    return dt.datetime.now(ZoneInfo("Europe/Athens")).date()


def queued_branches() -> list[tuple[dt.date, str, str]]:
    git("fetch", "--quiet", "--prune", "origin", "+refs/heads/tool/*:refs/remotes/origin/tool/*")
    out = git("for-each-ref", "--format=%(refname:short)", "refs/remotes/origin/tool/")
    items = []
    for ref in out.split():
        name = ref.removeprefix("origin/")
        m = BRANCH_RE.match(name)
        if not m:
            print(f"! Αγνοείται branch με λάθος όνομα: {name} (σωστό: tool/YYYY-MM-DD-slug)")
            continue
        items.append((dt.date.fromisoformat(m.group(1)), m.group(2), name))
    return sorted(items)


def read_card(branch: str, slug: str) -> dict:
    raw = git("show", f"origin/{branch}:{slug}/card.json")
    card = json.loads(raw)
    missing = [k for k in ("title", "description", "category") if not card.get(k)]
    if missing:
        raise ValueError(f"λείπουν πεδία στο card.json: {', '.join(missing)}")
    if card["category"] not in CATEGORIES:
        raise ValueError(f"άγνωστη κατηγορία «{card['category']}» (επιτρέπονται: {', '.join(CATEGORIES)})")
    git("cat-file", "-e", f"origin/{branch}:{slug}/index.html")
    return card


def add_to_homepage(slug: str, card: dict) -> None:
    p = ROOT / "index.html"
    s = p.read_text(encoding="utf-8")
    if f'href="{slug}/"' in s:
        print(f"  κάρτα για {slug}/ υπάρχει ήδη στην αρχική")
        return
    cat = card["category"]
    start = s.index(f'id="{cat}"')
    end = s.index("</section>", start)
    a = f'<a class="card" href="{slug}/"><b>{html.escape(card["title"], quote=False)}</b>{html.escape(card["description"], quote=False)}</a>\n'
    s = s[:end] + a + s[end:]

    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
    data = json.loads(m.group(1))
    items = data["mainEntity"]["itemListElement"]
    cat_name = CATEGORIES[cat]
    pos = max((i for i, it in enumerate(items) if it.get("description") == cat_name), default=len(items) - 1) + 1
    items.insert(pos, {"@type": "ListItem", "position": 0, "url": SITE + slug + "/",
                       "name": card.get("name") or card["title"], "description": cat_name})
    for i, it in enumerate(items):
        it["position"] = i + 1
    data["mainEntity"]["numberOfItems"] = len(items)
    s = s[:m.start(1)] + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + s[m.end(1):]
    p.write_text(s, encoding="utf-8", newline="")


def add_to_sitemap(slug: str, day: dt.date) -> None:
    p = ROOT / "sitemap.xml"
    s = p.read_text(encoding="utf-8")
    url = f"{SITE}{slug}/"
    if url in s:
        return
    s = s.replace("</urlset>", f"  <url><loc>{url}</loc><lastmod>{day.isoformat()}</lastmod></url>\n</urlset>")
    p.write_text(s, encoding="utf-8", newline="")


def publish_one(day: dt.date, slug: str, branch: str, today: dt.date) -> bool:
    card = read_card(branch, slug)
    if (ROOT / slug).exists() and git("ls-files", f"{slug}/").strip():
        print(f"! Ο φάκελος {slug}/ υπάρχει ήδη στο main — παραλείπεται το {branch}")
        return False
    git("checkout", f"origin/{branch}", "--", f"{slug}/")
    git("rm", "--quiet", "--cached", f"{slug}/card.json")
    (ROOT / slug / "card.json").unlink()  # το card.json μένει για πάντα στο branch published/
    add_to_homepage(slug, card)
    add_to_sitemap(slug, today)
    git("add", f"{slug}/", "index.html", "sitemap.xml")
    git("commit", "--quiet", "-m",
        f"feat({slug}): publish scheduled tool ({day.isoformat()})\n\n{card['title']}\nQueued on branch {branch}.")
    print(f"✓ Δημοσιεύτηκε: {slug}/ «{card['title']}» (κατηγορία: {CATEGORIES[card['category']]})")
    return True


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--today", help="YYYY-MM-DD (για δοκιμές)")
    a = ap.parse_args()
    today = dt.date.fromisoformat(a.today) if a.today else athens_today()

    queue = queued_branches()
    if a.list or a.dry_run:
        print(f"Ουρά εργαλείων (σήμερα {today.isoformat()}, ώρα Ελλάδας):")
        for day, slug, branch in queue:
            state = "ΣΗΜΕΡΑ/ΕΚΠΡΟΘΕΣΜΟ" if day <= today else "σε αναμονή"
            try:
                card = read_card(branch, slug)
                info = f"«{card['title']}» → {CATEGORIES[card['category']]}"
            except Exception as e:  # noqa: BLE001
                info = f"ΣΦΑΛΜΑ: {e}"
            print(f"  {day.isoformat()}  {slug:<22} {state:<18} {info}")
        if not queue:
            print("  (κενή)")
        return 0

    if not os.environ.get("GITHUB_ACTIONS"):
        print("Η πραγματική δημοσίευση τρέχει μόνο στο GitHub Action (προστασία τοπικών αλλαγών). "
              "Τοπικά χρησιμοποίησε --list ή --dry-run.")
        return 2

    due = [q for q in queue if q[0] <= today]
    if not due:
        print(f"Τίποτα για δημοσίευση σήμερα ({today.isoformat()}).")
        return 0

    done, failed = [], []
    for day, slug, branch in due:
        try:
            if publish_one(day, slug, branch, today):
                done.append(branch)
        except Exception as e:  # noqa: BLE001
            git("reset", "--quiet", "--hard", "HEAD", check=False)
            failed.append(f"{branch}: {e}")
            print(f"✗ {branch}: {e}")

    if done:
        git("push", "--quiet", "origin", "HEAD:main")
        for branch in done:
            new = branch.replace("tool/", "published/", 1)
            git("push", "--quiet", "origin", f"refs/remotes/origin/{branch}:refs/heads/{new}")
            git("push", "--quiet", "origin", f":refs/heads/{branch}")
        repo = os.environ.get("GITHUB_REPOSITORY")
        if repo:  # ζητάμε νέο build του GitHub Pages (τα push του Action δεν το ξεκινούν πάντα)
            subprocess.run(["gh", "api", "-X", "POST", f"repos/{repo}/pages/builds"], cwd=ROOT,
                           capture_output=True, text=True)
    if failed:
        print("Αποτυχίες:\n  " + "\n  ".join(failed))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
