// Lint one post before it is previewed or published.
// Usage: node scripts/check-post.mjs <post.md> <site-repo>
// Exit 1 on errors; warnings are printed for a human (or Claude) to judge.
import fs from "node:fs";
import path from "node:path";

const [postPath, siteRoot] = process.argv.slice(2);
if (!postPath || !siteRoot) {
  console.error("usage: check-post.mjs <post.md> <site-repo>");
  process.exit(2);
}

const errors = [];
const warnings = [];
const source = fs.readFileSync(postPath, "utf8");

// Same front-matter rules as scripts/generate-content.mjs: one `key: value` per line.
const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
if (!match) {
  console.error(`ERROR  no front matter between --- lines in ${postPath}`);
  process.exit(1);
}
const fm = {};
for (const line of match[1].split(/\r?\n/)) {
  if (!line.trim() || line.trim().startsWith("#")) continue;
  const i = line.indexOf(":");
  if (i < 1) {
    errors.push(`front matter line has no "key:": ${line}`);
    continue;
  }
  fm[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
}
const body = match[2];
const lines = body.split(/\r?\n/);

// Required fields.
for (const key of ["title", "slug", "summary", "type", "project", "tags"]) {
  if (!fm[key]) errors.push(`front matter is missing "${key}"`);
}
if (fm.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.slug)) {
  errors.push(`slug "${fm.slug}" must be lowercase words joined by hyphens`);
}
if (fm.published_at && Number.isNaN(Date.parse(fm.published_at))) {
  errors.push(`published_at "${fm.published_at}" is not a date`);
}
if (fm.series && !/^\d+$/.test(fm.series_order ?? "")) {
  errors.push(`series "${fm.series}" needs a whole-number series_order`);
}
for (const key of ["tags", "links", "media"]) {
  if (fm[key] && !fm[key].startsWith("[")) errors.push(`${key} must be a [list]`);
  if (fm[key] && (key === "links" || key === "media") && fm[key] !== "[]") {
    try {
      JSON.parse(fm[key]);
    } catch {
      errors.push(`${key} must be JSON, e.g. [{"label":"...","url":"/..."}]`);
    }
  }
}

// Project and tags must exist on the site.
const projectsDir = path.join(siteRoot, "content", "projects");
const projectSlugs = fs
  .readdirSync(projectsDir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const m = fs.readFileSync(path.join(projectsDir, f), "utf8").match(/^slug:\s*(.+)$/m);
    return m ? m[1].trim() : f.slice(0, -3);
  });
if (fm.project && !projectSlugs.includes(fm.project)) {
  errors.push(`project "${fm.project}" is not one of: ${projectSlugs.join(", ")}`);
}
const knownTags = JSON.parse(fs.readFileSync(path.join(siteRoot, "content", "tags.json"), "utf8")).map(
  (t) => t.slug,
);
const tags = (fm.tags ?? "").replace(/^\[|\]$/g, "").split(",").map((t) => t.trim()).filter(Boolean);
for (const tag of tags) {
  if (!knownTags.includes(tag)) warnings.push(`tag "${tag}" is not in content/tags.json (it shows, but has no filter)`);
}

// New post or update?
const existing = path.join(siteRoot, "content", "log", `${fm.slug}.md`);
const isUpdate = fs.existsSync(existing);

// Maths: display blocks open and close on their own lines.
let fence = false;
let display = 0;
lines.forEach((line, n) => {
  if (/^\s*(```|~~~)/.test(line)) fence = !fence;
  if (fence) return;
  if (line.trim() === "$$") display++;
  else if (line.includes("$$")) warnings.push(`line ${n + 1}: put $$ on its own line for display maths`);
});
if (display % 2) errors.push("an odd number of $$ lines: a display equation is not closed");

// Links and media that point into the site must exist.
const publicDir = path.join(siteRoot, "public");
const logSlugs = fs.readdirSync(path.join(siteRoot, "content", "log")).map((f) => f.replace(/\.md$/, ""));
const urlsInBody = [...body.matchAll(/\]\(([^)\s]+)/g)].map((m) => m[1]);
const urlsInFm = [...(fm.links ?? "").matchAll(/"url"\s*:\s*"([^"]+)"/g), ...(fm.media ?? "").matchAll(/"path"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
for (const url of [...urlsInBody, ...urlsInFm]) {
  if (/^(https?:|mailto:|#)/.test(url)) continue;
  if (!url.startsWith("/")) {
    errors.push(`relative link "${url}" will break on the site; use a full URL or a site path like /log/<slug>/`);
    continue;
  }
  const clean = url.split(/[?#]/)[0];
  const logMatch = clean.match(/^\/log\/([^/]+)\/?$/);
  if (logMatch) {
    if (!logSlugs.includes(logMatch[1]) && logMatch[1] !== fm.slug) errors.push(`link to unknown post ${url}`);
    continue;
  }
  if (/^\/(projects|about|contact|log)\/?/.test(clean)) continue;
  const file = path.join(publicDir, clean.endsWith("/") ? clean + "index.html" : clean);
  if (!fs.existsSync(file)) errors.push(`site path ${url} does not exist under public/`);
}

// Privacy patterns: never auto-fixed, always shown.
const privacy = [
  ["email address", /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/],
  ["local path", /([A-Za-z]:\\|\/home\/|\/mnt\/[a-z]\/|~\/projects)/],
  ["local host", /\b(localhost|127\.0\.0\.1)\b/],
  ["secret-like word", /\b(api[_-]?key|password|secret|bearer|token)\b/i],
];
lines.forEach((line, n) => {
  for (const [label, re] of privacy) {
    if (re.test(line)) warnings.push(`line ${n + 1}: ${label}: ${line.trim().slice(0, 100)}`);
  }
});

console.log(`== check ${path.basename(postPath)}: ${isUpdate ? "UPDATE of existing post" : "NEW post"} "${fm.title ?? "?"}" -> /log/${fm.slug ?? "?"}/`);
for (const w of warnings) console.log(`WARN   ${w}`);
for (const e of errors) console.log(`ERROR  ${e}`);
console.log(`== ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
