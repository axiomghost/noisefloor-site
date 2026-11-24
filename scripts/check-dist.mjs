// Check built pages: KaTeX errors, and internal links or assets that do not exist.
// Usage: node scripts/check-dist.mjs <dist> [post-slug]
// With a slug only that post's page is checked; without one, every page.
import fs from "node:fs";
import path from "node:path";

const [dist, slug] = process.argv.slice(2);
const base = "/noisefloor-site";

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? htmlFiles(p) : e.name.endsWith(".html") ? [p] : [];
  });
}

const pages = slug ? [path.join(dist, "log", slug, "index.html")] : htmlFiles(dist);
let errors = 0;
for (const page of pages) {
  const rel = path.relative(dist, page);
  if (!fs.existsSync(page)) {
    console.log(`ERROR  ${rel}: page was not built (is the post published, and is the slug right?)`);
    errors++;
    continue;
  }
  const html = fs.readFileSync(page, "utf8");
  const katexErrors = [...html.matchAll(/class="katex-error"[^>]*title="([^"]*)"/g)];
  for (const m of katexErrors) {
    console.log(`ERROR  ${rel}: KaTeX could not typeset: ${m[1].slice(0, 120)}`);
    errors++;
  }
  // Unknown commands do not raise an error: KaTeX prints them in red (#cc0000) inside the formula.
  for (const m of html.matchAll(/<math[^>]*>(?:(?!<\/math>)[\s\S])*?mathcolor="#cc0000"[\s\S]*?<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)) {
    console.log(`ERROR  ${rel}: unknown command in maths: ${m[1].slice(0, 120)}`);
    errors++;
  }
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const url = m[1];
    if (!url.startsWith(base + "/") && url !== base) {
      console.log(`ERROR  ${rel}: ${url} is missing the ${base} base path`);
      errors++;
      continue;
    }
    let target = path.join(dist, url.slice(base.length));
    if (url.endsWith("/") || fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      target = path.join(target, "index.html");
    }
    if (!fs.existsSync(target)) {
      console.log(`ERROR  ${rel}: broken internal link or asset ${url}`);
      errors++;
    }
  }
}
console.log(`== dist check: ${pages.length} page(s), ${errors} error(s)`);
process.exit(errors ? 1 : 0);
