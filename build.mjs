// Radture website build: zero dependencies.
//
//   node build.mjs      → assembles src/pages/*.html into ./dist
//
// Each page starts with a comment block of `key: value` lines (title,
// description, nav). Pages and partials can include partials with
// {{> name}}, print page values with {{key}}, and mark the active nav
// link with {{nav:key}}.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "dist");

const read = (path) => readFileSync(join(SRC, path), "utf8");
const partial = (name) => read(`partials/${name}.html`);

function parsePage(raw) {
  const match = raw.match(/^<!--([\s\S]*?)-->\s*/);
  const meta = {};
  if (match) {
    for (const line of match[1].split("\n")) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return { meta, body: match ? raw.slice(match[0].length) : raw };
}

function render(template, vars) {
  let html = template;
  // Partials may include other partials; three passes covers this site.
  for (let pass = 0; pass < 3; pass++) {
    html = html.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => partial(name));
  }
  html = html.replace(/\{\{nav:([\w-]+)\}\}/g, (_, key) => (key === vars.nav ? ' aria-current="page"' : ""));
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(SRC, "assets"), join(OUT, "assets"), { recursive: true });

const layout = partial("layout");
const pages = readdirSync(join(SRC, "pages")).filter((f) => f.endsWith(".html"));

for (const file of pages) {
  const { meta, body } = parsePage(read(`pages/${file}`));
  const vars = { ...meta, slug: basename(file, ".html"), year: String(new Date().getFullYear()) };
  const html = render(layout.replace("{{content}}", () => body), vars);
  writeFileSync(join(OUT, file), html);
  console.log(`built  dist/${file}`);
}
