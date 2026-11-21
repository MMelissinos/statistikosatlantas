import { writeFile } from "node:fs/promises";

const ROOT_SITEMAPS = [
  "https://statistikosatlantas.com/sitemap.xml",
  "https://tools.statistikosatlantas.com/sitemap.xml",
];
const MAX_PAGES = 300;
const TIMEOUT_MS = 15_000;
const errors = [];
const warnings = [];
const checked = [];

const decode = (s = "") => s
  .replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">")
  .replaceAll("&quot;", '"').replaceAll("&#039;", "'");
const clean = (url) => {
  const u = new URL(url);
  u.hash = "";
  return u.href;
};
const own = (url) => {
  try {
    return ["statistikosatlantas.com", "tools.statistikosatlantas.com"].includes(new URL(url).hostname);
  } catch { return false; }
};
const ignored = (url) => /\/wp-(admin|json)|\/feed\/?$|[?&](replytocom|share)=|\/author\//.test(url);

async function get(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "StatistikosAtlantasSiteAudit/1.0" },
      signal: controller.signal,
      ...options,
    });
  } finally { clearTimeout(timer); }
}

async function sitemapUrls(seed) {
  const pages = new Set();
  const seenMaps = new Set();
  async function visit(url) {
    if (seenMaps.has(url)) return;
    seenMaps.add(url);
    let response;
    try { response = await get(url); }
    catch (e) { errors.push(`Sitemap unreachable: ${url} — ${e.message}`); return; }
    if (!response.ok) { errors.push(`Sitemap HTTP ${response.status}: ${url}`); return; }
    const xml = await response.text();
    const locations = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => decode(m[1].trim()));
    if (/<sitemapindex[\s>]/i.test(xml)) {
      for (const child of locations) await visit(child);
    } else {
      for (const page of locations) if (pages.size < MAX_PAGES) pages.add(clean(page));
    }
  }
  await visit(seed);
  return pages;
}

function textTag(html, re) {
  const match = html.match(re);
  return match ? decode(match[1].replace(/<[^>]+>/g, "").trim()) : "";
}

function inspect(url, html, finalUrl) {
  const title = textTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = (html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)/i)
    || html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i))?.[1]?.trim() || "";
  const canonical = (html.match(/<link\s+[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*href=["']([^"']+)/i)
    || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["'][^"']*canonical/i))?.[1] || "";
  const robots = [...html.matchAll(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)/gi)].map((m) => m[1]).join(" ");
  const missingAlt = [...html.matchAll(/<img\b(?![^>]*\balt\s*=)[^>]*>/gi)].length;
  if (!title) errors.push(`Missing title: ${url}`);
  if (!description) errors.push(`Missing meta description: ${url}`);
  if (!canonical) errors.push(`Missing canonical: ${url}`);
  else {
    try {
      if (clean(canonical) !== clean(finalUrl)) warnings.push(`Canonical differs: ${url} → ${canonical}`);
    } catch { errors.push(`Invalid canonical: ${url} → ${canonical}`); }
  }
  if (/noindex/i.test(robots)) errors.push(`Unexpected noindex: ${url}`);
  if (missingAlt) warnings.push(`${missingAlt} image(s) without alt: ${url}`);

  const links = new Set();
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["']/gi)) {
    try {
      const href = clean(new URL(decode(match[1]), finalUrl));
      if (own(href) && !ignored(href)) links.add(href);
    } catch { /* malformed non-HTTP link */ }
  }
  return { title, description, links };
}

async function pool(items, worker, concurrency = 6) {
  const queue = [...items];
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (queue.length) await worker(queue.shift());
  }));
}

const sitemapPages = new Set();
for (const root of ROOT_SITEMAPS) {
  for (const url of await sitemapUrls(root)) sitemapPages.add(url);
}
const discovered = new Set();
const titles = new Map();
const descriptions = new Map();

await pool([...sitemapPages], async (url) => {
  let response;
  try { response = await get(url); }
  catch (e) { errors.push(`Page unreachable: ${url} — ${e.message}`); return; }
  if (!response.ok) { errors.push(`Page HTTP ${response.status}: ${url}`); return; }
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return;
  const finalUrl = clean(response.url);
  const html = await response.text();
  const data = inspect(url, html, finalUrl);
  checked.push(url);
  for (const link of data.links) discovered.add(link);
  if (data.title) (titles.get(data.title) || titles.set(data.title, []).get(data.title)).push(url);
  if (data.description) (descriptions.get(data.description) || descriptions.set(data.description, []).get(data.description)).push(url);
});

for (const [title, urls] of titles) if (urls.length > 1) warnings.push(`Duplicate title “${title}”: ${urls.join(", ")}`);
for (const [description, urls] of descriptions) if (urls.length > 1) warnings.push(`Duplicate description on: ${urls.join(", ")}`);

const linksToCheck = [...discovered].filter((url) => !sitemapPages.has(url)).slice(0, 500);
await pool(linksToCheck, async (url) => {
  try {
    const response = await get(url);
    if (response.status >= 400) errors.push(`Broken internal link HTTP ${response.status}: ${url}`);
  } catch (e) { errors.push(`Broken internal link: ${url} — ${e.message}`); }
});

const now = new Date().toISOString();
const report = [
  "# Weekly site audit",
  "",
  `Generated: ${now}`,
  `Sitemap pages checked: ${checked.length}`,
  `Additional internal links checked: ${linksToCheck.length}`,
  "",
  `## Errors (${errors.length})`,
  "",
  ...(errors.length ? errors.map((x) => `- ${x}`) : ["- None"]),
  "",
  `## Warnings (${warnings.length})`,
  "",
  ...(warnings.length ? warnings.map((x) => `- ${x}`) : ["- None"]),
  "",
].join("\n");

await writeFile("site-audit-report.md", report);
console.log(report);
if (errors.length) process.exitCode = 1;
