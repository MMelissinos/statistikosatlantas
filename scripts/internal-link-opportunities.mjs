import { writeFile } from "node:fs/promises";

const SITEMAP = "https://statistikosatlantas.com/sitemap.xml";
const MAX_PAGES = 300;
const STOP = new Set(`
και να το η ο οι τα των της του σε για με από που ως στο στη στην στον ένα μια
είναι ήταν έχει έχουν αυτό αυτή αυτά τους τις μας σας δεν αλλά ή πιο ανά μεταξύ
the and for with from that this are was were have has into about your their than
what when where which will can not our its
`.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().split(/\s+/));
const EXCLUDED = /\/(about|en-about|epikoinonia|en-contact|aporrito|en-privacy|piges|en-sources|diorthoseis|en-corrections|pos-douleuoume|en-how-we-work)\/?$/;

const decode = (s = "") => s.replaceAll("&amp;", "&").replaceAll("&quot;", '"')
  .replaceAll("&#039;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const normalizeUrl = (url) => {
  const u = new URL(url);
  u.hash = ""; u.search = "";
  return u.href.replace(/\/$/, "");
};
const tokens = (text) => text
  .normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, " ").split(/\s+/)
  .filter((w) => w.length >= 4 && !STOP.has(w) && !/^\d+$/.test(w));

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "StatistikosAtlantasInternalLinks/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally { clearTimeout(timer); }
}

async function sitemapPages(url, seen = new Set(), pages = new Set()) {
  if (seen.has(url) || pages.size >= MAX_PAGES) return pages;
  seen.add(url);
  const xml = await fetchText(url);
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => decode(m[1].trim()));
  if (/<sitemapindex[\s>]/i.test(xml)) {
    for (const child of locs) await sitemapPages(child, seen, pages);
  } else {
    for (const page of locs) if (pages.size < MAX_PAGES) pages.add(page);
  }
  return pages;
}

function pageFromHtml(url, html) {
  const title = decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
    || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i))?.[1]
    ?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "");
  const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    || html.match(/<article[^>]*>([\s\S]*?)<\/article>/i))?.[1] || html;
  const clean = main.replace(/<(script|style|nav|footer)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  const words = tokens(`${title} ${title} ${clean}`);
  const links = new Set();
  for (const match of main.matchAll(/<a\b[^>]*href=["']([^"'#]+)["']/gi)) {
    try {
      const linked = normalizeUrl(new URL(decode(match[1]), url));
      if (new URL(linked).hostname === "statistikosatlantas.com") links.add(linked);
    } catch { /* ignore malformed links */ }
  }
  return { url: normalizeUrl(url), title, words, links };
}

async function pool(items, worker, concurrency = 6) {
  const queue = [...items];
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (queue.length) await worker(queue.shift());
  }));
}

let urls;
try { urls = [...await sitemapPages(SITEMAP)]; }
catch (error) {
  console.error(`Could not read sitemap: ${error.message}`);
  process.exit(1);
}
urls = urls.filter((url) =>
  new URL(url).hostname === "statistikosatlantas.com"
  && !/\/(category|tag|author)\//.test(url)
  && !EXCLUDED.test(new URL(url).pathname)
);

const pages = [];
const failures = [];
await pool(urls, async (url) => {
  try {
    const page = pageFromHtml(url, await fetchText(url));
    if (page.title && page.words.length >= 120) pages.push(page);
  } catch (error) { failures.push(`${url} — ${error.message}`); }
});

if (pages.length < 2) {
  console.error(`Only ${pages.length} content pages could be read.`);
  process.exit(1);
}

const docFrequency = new Map();
for (const page of pages) {
  for (const word of new Set(page.words)) docFrequency.set(word, (docFrequency.get(word) || 0) + 1);
}
for (const page of pages) {
  const counts = new Map();
  for (const word of page.words) counts.set(word, (counts.get(word) || 0) + 1);
  page.vector = new Map();
  let sum = 0;
  for (const [word, count] of counts) {
    const idf = Math.log((pages.length + 1) / ((docFrequency.get(word) || 0) + 1)) + 1;
    const value = (count / page.words.length) * idf;
    page.vector.set(word, value); sum += value * value;
  }
  page.norm = Math.sqrt(sum);
}

function cosine(a, b) {
  let dot = 0;
  const [small, large] = a.vector.size < b.vector.size ? [a.vector, b.vector] : [b.vector, a.vector];
  for (const [word, value] of small) dot += value * (large.get(word) || 0);
  return a.norm && b.norm ? dot / (a.norm * b.norm) : 0;
}

const incoming = new Map(pages.map((p) => [p.url, 0]));
for (const page of pages) {
  for (const link of page.links) if (incoming.has(link)) incoming.set(link, incoming.get(link) + 1);
}

const suggestions = [];
for (const source of pages) {
  const candidates = pages
    .filter((target) => target.url !== source.url && !source.links.has(target.url))
    .map((target) => ({ target, score: cosine(source, target) }))
    .filter((item) => item.score >= 0.12)
    .sort((a, b) => (b.score + 0.02 / (1 + incoming.get(b.target.url)))
      - (a.score + 0.02 / (1 + incoming.get(a.target.url))));
  for (const item of candidates.slice(0, 2)) suggestions.push({
    source, target: item.target, score: item.score,
  });
}
suggestions.sort((a, b) => b.score - a.score);

const orphans = pages.filter((p) => incoming.get(p.url) === 0)
  .sort((a, b) => a.title.localeCompare(b.title, "el"));
const top = suggestions.slice(0, 30);
const report = [
  "# Προτάσεις εσωτερικών συνδέσμων",
  "",
  `Δημιουργήθηκε: ${new Date().toISOString()}`,
  `Σελίδες περιεχομένου που αναλύθηκαν: ${pages.length}`,
  `Σελίδες που δεν διαβάστηκαν: ${failures.length}`,
  "",
  "## Σελίδες χωρίς εισερχόμενο σύνδεσμο",
  "",
  ...(orphans.length ? orphans.map((p) => `- [${p.title}](${p.url})`) : ["- Καμία"]),
  "",
  "## Ισχυρότερες ευκαιρίες",
  "",
  ...top.flatMap(({ source, target, score }, index) => [
    `### ${index + 1}. ${source.title}`,
    "",
    `- Από: [${source.title}](${source.url})`,
    `- Προς: [${target.title}](${target.url})`,
    `- Προτεινόμενο anchor: **${target.title}**`,
    `- Θεματική ομοιότητα: ${Math.round(score * 100)}%`,
    "",
  ]),
  failures.length ? "## Σελίδες που δεν διαβάστηκαν" : "",
  failures.length ? "" : "",
  ...failures.map((x) => `- ${x}`),
  "",
  "> Οι προτάσεις παράγονται με TF-IDF/cosine similarity, χωρίς AI. Ελέγξτε τες συντακτικά πριν αλλάξετε άρθρο.",
  "",
].join("\n");

await writeFile("internal-link-opportunities.md", report);
console.log(`Wrote ${top.length} suggestions for ${pages.length} pages; ${orphans.length} orphan pages.`);
