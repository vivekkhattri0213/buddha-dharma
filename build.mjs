// Builds the static site in docs/ from the Markdown files. Run: npm run build
import { marked } from "marked";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const OUT = "docs";
const SITE = "Buddha's Teachings, Step by Step";

const pages = [
  ["README.md", "index.html"],
  ["SOURCES.md", "SOURCES.html"],
  ["ROADMAP.md", "ROADMAP.html"],
  ["CONTRIBUTING.md", "CONTRIBUTING.html"],
  ["LICENSE.md", "LICENSE.html"],
  ...readdirSync("lessons").filter((f) => f.endsWith(".md")).sort().map((f) => [`lessons/${f}`, `lessons/${f.replace(/\.md$/, ".html")}`]),
  ...readdirSync("templates").filter((f) => f.endsWith(".md")).map((f) => [`templates/${f}`, `templates/${f.replace(/\.md$/, ".html")}`]),
];

// Ordered lesson list for prev/next links
const lessons = pages.map(([, o]) => o).filter((o) => /^lessons\/0[1-9]/.test(o));

const css = readFileSync("site/style.css", "utf8");

function rewriteLinks(html, src) {
  return html.replace(/href="([^"#:]+?)\.md(#[^"]*)?"/g, (_, path, hash = "") => {
    // resolve relative to the source file, then map to its output path
    const abs = join(dirname(src), path + ".md");
    const hit = pages.find(([s]) => s === abs);
    const target = hit ? hit[1] : abs.replace(/\.md$/, ".html");
    const from = dirname(pages.find(([s]) => s === src)[1]);
    return `href="${relative(from, target) || "."}${hash}"`;
  });
}

function slug(text) {
  return text.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const [src, out] of pages) {
  const md = readFileSync(src, "utf8");
  const title = (md.match(/^# (.+)$/m) || [null, SITE])[1];
  let body = marked.parse(md, { gfm: true });
  body = body.replace(/<h([23])>(.*?)<\/h\1>/g, (_, l, t) => `<h${l} id="${slug(t)}">${t}</h${l}>`);
  body = rewriteLinks(body, src);

  const depth = out.split("/").length - 1;
  const root = depth ? "../".repeat(depth) : "./";

  let pager = "";
  const i = lessons.indexOf(out);
  if (i !== -1) {
    const prev = lessons[i - 1], next = lessons[i + 1];
    const href = (p) => relative(dirname(out), p);
    pager = `<nav class="pager" aria-label="Lesson navigation">
      ${prev ? `<a href="${href(prev)}">&larr; Previous lesson</a>` : "<span></span>"}
      ${next ? `<a href="${href(next)}">Next lesson &rarr;</a>` : "<span></span>"}
    </nav>`;
  }

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title.replace(/<[^>]+>/g, "")} · ${SITE}</title>
<meta name="description" content="Beginner-friendly, step-by-step guide to the Buddha's core teachings, in the Thai Forest tradition.">
<style>${css}</style>
</head>
<body>
<header class="top"><a class="brand" href="${root}index.html">☸ ${SITE}</a>
<nav><a href="${root}lessons/glossary.html">Glossary</a> <a href="${root}SOURCES.html">Sources</a></nav></header>
<main>
${body}
${pager}
</main>
<footer>Original text © its contributors, <a href="${root}LICENSE.html">CC BY-SA 4.0</a>. A study aid, not an authority: check the sources.</footer>
</body>
</html>
`;
  mkdirSync(dirname(join(OUT, out)), { recursive: true });
  writeFileSync(join(OUT, out), html);
}

// copy images
mkdirSync(join(OUT, "lessons/img"), { recursive: true });
for (const f of readdirSync("lessons/img")) copyFileSync(join("lessons/img", f), join(OUT, "lessons/img", f));

writeFileSync(join(OUT, ".nojekyll"), "");
console.log(`Built ${pages.length} pages into ${OUT}/`);
