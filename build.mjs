// Builds the static site in docs/ from the Markdown files. Run: npm run build
import { marked } from "marked";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";

const OUT = "docs";
const SITE = "Buddha's Teachings, Step by Step";

// Every .md under a folder (skipping images), in sorted order
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((e) => (e.isDirectory() ? (e.name === "img" ? [] : walk(join(dir, e.name))) : e.name.endsWith(".md") ? [join(dir, e.name)] : []));
}

const pages = [
  ["README.md", "index.html"],
  ["SOURCES.md", "SOURCES.html"],
  ["ROADMAP.md", "ROADMAP.html"],
  ["CONTRIBUTING.md", "CONTRIBUTING.html"],
  ["LICENSE.md", "LICENSE.html"],
  ...walk("lessons").map((f) => [f, f.replace(/\.md$/, ".html")]),
  ...readdirSync("templates").filter((f) => f.endsWith(".md")).map((f) => [`templates/${f}`, `templates/${f.replace(/\.md$/, ".html")}`]),
];

// Ordered lesson list for prev/next links
const lessons = pages
  .map(([, o]) => o)
  .filter((o) => /^0[1-9]-/.test(basename(o)))
  .sort((a, b) => basename(a).localeCompare(basename(b)));

// Old (pre-reorganisation) lesson URLs -> new locations, so existing links keep working
const moved = {
  "lessons/00-how-to-use.html": "lessons/00-start-here/how-to-use.html",
  "lessons/01-four-noble-truths.html": "lessons/1-the-problem/01-four-noble-truths.html",
  "lessons/02-three-characteristics.html": "lessons/3-how-it-works/06-three-characteristics.html",
  "lessons/03-craving.html": "lessons/2-the-cause/02-craving.html",
  "lessons/04-clinging.html": "lessons/2-the-cause/03-clinging.html",
  "lessons/05-rebirth.html": "lessons/4-big-questions/07-rebirth.html",
  "lessons/06-five-aggregates.html": "lessons/2-the-cause/04-five-aggregates.html",
  "lessons/07-dependent-origination.html": "lessons/3-how-it-works/05-dependent-origination.html",
  "lessons/glossary.html": "lessons/reference/glossary.html",
};

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

  body = body.replace(/href="LICENSE"/g, `href="${root}LICENSES/MIT.txt"`);

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

  // Progress: tick boxes on the home page, "mark done" button on lessons (saved in this browser only)
  const lessonNum = /^0([1-9])-/.test(basename(out)) ? Number(basename(out)[1]) : null;
  const script = out === "index.html"
    ? `<script>try{document.querySelectorAll("main li input[type=checkbox]").forEach(function(b){var m=b.parentElement.textContent.match(/Lesson (\\d)/);if(!m)return;var k="lesson-"+m[1];b.disabled=false;b.checked=localStorage.getItem(k)==="1";b.addEventListener("change",function(){localStorage.setItem(k,b.checked?"1":"0")})})}catch(e){}</script>`
    : lessonNum
      ? `<script>try{var k="lesson-${lessonNum}",b=document.getElementById("done-btn");function r(){b.textContent=localStorage.getItem(k)==="1"?"✓ Done (tap to undo)":"Mark this lesson done";b.setAttribute("aria-pressed",localStorage.getItem(k)==="1")}b.hidden=false;r();b.addEventListener("click",function(){localStorage.setItem(k,localStorage.getItem(k)==="1"?"0":"1");r()})}catch(e){}</script>`
      : "";
  const doneBtn = lessonNum ? `<p class="done"><button id="done-btn" type="button" hidden>Mark this lesson done</button></p>` : "";

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
<nav><a href="${root}lessons/reference/glossary.html">Glossary</a> <a href="${root}SOURCES.html">Sources</a></nav></header>
<main>
${body}
${doneBtn}
${pager}
</main>
<footer>Original text © its contributors, <a href="${root}LICENSE.html">CC BY-SA 4.0</a>. A study aid, not an authority: check the sources.</footer>
${script}
</body>
</html>
`;
  mkdirSync(dirname(join(OUT, out)), { recursive: true });
  writeFileSync(join(OUT, out), html);
}

// copy full license texts
mkdirSync(join(OUT, "LICENSES"), { recursive: true });
for (const f of readdirSync("LICENSES")) copyFileSync(join("LICENSES", f), join(OUT, "LICENSES", f));

copyFileSync("LICENSE", join(OUT, "LICENSES", "MIT.txt"));

// copy images
mkdirSync(join(OUT, "lessons/img"), { recursive: true });
for (const f of readdirSync("lessons/img")) copyFileSync(join("lessons/img", f), join(OUT, "lessons/img", f));

// redirect stubs at the old lesson URLs
for (const [oldPath, newPath] of Object.entries(moved)) {
  const to = relative(dirname(oldPath), newPath);
  mkdirSync(dirname(join(OUT, oldPath)), { recursive: true });
  writeFileSync(join(OUT, oldPath), `<!doctype html><meta charset="utf-8"><title>Moved</title><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}"><p>This lesson moved: <a href="${to}">continue here</a>.</p>\n`);
}

writeFileSync(join(OUT, ".nojekyll"), "");
console.log(`Built ${pages.length} pages into ${OUT}/`);
