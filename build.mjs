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

// README.md stays in the list so links to it resolve to index.html, but the home page is built from site/home.html
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
const homeTemplate = readFileSync("site/home.html", "utf8");

// Tracks and lesson one-liners come from the README tables, so the README stays the source of truth
const readme = readFileSync("README.md", "utf8");
const tracks = [...readme.matchAll(/^### Track (\d+): (.+)\n(.+)\n\n((?:\|.*\n)+)/gm)].map(([, n, name, desc, table]) => ({
  n: Number(n),
  name,
  desc,
  lessons: [...table.matchAll(/^\| (\d+) \| \[(.+?)\]\((.+?)\.md\) \| (.+?) \| (.+?) \|$/gm)].map(([, num, title, path, time, one]) => ({
    n: Number(num), title, out: path + ".html", time, one,
  })),
}));
const lessonMeta = Object.fromEntries(tracks.flatMap((t) => t.lessons.map((l) => [l.out, { ...l, track: t }])));
const trackColor = (n) => `var(--t${((n - 1) % 4) + 1})`;

const glossary = [...readFileSync("lessons/reference/glossary.md", "utf8").matchAll(/^\| \*(.+?)\* \| (.+?) \| (.+?) \|$/gm)]
  .map(([, pali, english, meaning]) => ({ pali, english, meaning }));

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

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Put the "Two-minute version" and "Try it now" sections in highlighted boxes
function callouts(body) {
  return body.split(/(?=<h2 )/).map((chunk) => {
    if (/^<h2[^>]*>Two-minute version/.test(chunk)) return `<div class="callout summary"><span class="tag">If you only have two minutes</span>${chunk}</div>\n`;
    if (/^<h2[^>]*>Try it now/.test(chunk)) return `<div class="callout try"><span class="tag">Practice</span>${chunk}</div>\n`;
    return chunk;
  }).join("");
}

const wheel = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="12" r="2.2"/><path d="M12 2.8v6.9M12 14.3v6.9M2.8 12h6.9M14.3 12h6.9M5.5 5.5l4.9 4.9M13.6 13.6l4.9 4.9M18.5 5.5l-4.9 4.9M10.4 13.6l-4.9 4.9"/></svg>`;

// Progress is saved in this browser only, as lesson-N = "1"
function script(root) {
  const links = JSON.stringify(lessons.map((o) => root + o));
  return `<script>(function(){var L=${links},N=L.length;
function get(n){try{return localStorage.getItem("lesson-"+n)==="1"}catch(e){return false}}
function set(n,on){try{localStorage.setItem("lesson-"+n,on?"1":"0")}catch(e){}}
function sync(){var c=0,next=0;for(var i=1;i<=N;i++){if(get(i))c++;else if(!next)next=i}
document.querySelectorAll("input[data-lesson]").forEach(function(b){b.checked=get(b.dataset.lesson)});
document.getElementById("prog").textContent=c+" of "+N+" done";
var d=document.getElementById("done-label");if(d)d.textContent=get(d.dataset.lesson)?"Done":"Mark as done";
var a=document.getElementById("cta");if(a&&c){a.textContent=next?"Continue with Lesson "+next:"Read again from Lesson 1";a.href=L[(next||1)-1]}}
document.addEventListener("change",function(e){var n=e.target.dataset&&e.target.dataset.lesson;if(n){set(n,e.target.checked);sync()}});
var q=document.getElementById("gl-q");if(q)q.addEventListener("input",function(){var v=q.value.trim().toLowerCase(),shown=0;
document.querySelectorAll("#gl .term").forEach(function(t){var on=!v||t.textContent.toLowerCase().indexOf(v)!==-1;t.hidden=!on;if(on)shown++});
document.getElementById("gl").hidden=!shown;document.getElementById("gl-empty").hidden=!!shown});
sync()})();</script>`;
}

function shell({ title, root, main, description }) {
  const home = root === "./" ? "" : `${root}index.html`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${description || "Beginner-friendly, step-by-step guide to the Buddha's core teachings, in the Thai Forest tradition."}">
<style>${css}</style>
</head>
<body>
<nav class="top" aria-label="Main"><div class="wrap">
<a class="brand" href="${root}index.html">${wheel}${SITE}</a>
<a class="nl" href="${home}#paths">Paths</a>
<a class="nl" href="${home}#lessons">Lessons</a>
<a class="nl" href="${home}#glossary">Glossary</a>
<a class="nl" href="${root}SOURCES.html">Sources</a>
<span class="prog" id="prog" aria-live="polite"></span>
</div></nav>
${main}
<footer><div class="wrap">
<p>A study aid written by a learner, not an authority. Each lesson links to the original suttas and to Ṭhānissaro Bhikkhu’s free books, so check the sources. This is not therapy or medical advice. If you’re struggling, please talk to a professional.</p>
<p>Original text © its contributors, <a href="${root}LICENSE.html">CC BY-SA 4.0</a>. Quoted sutta and book material belongs to its authors and translators; see <a href="${root}SOURCES.html">Sources</a>.</p>
</div></footer>
${script(root)}
</body>
</html>
`;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const [src, out] of pages) {
  if (out === "index.html") continue;
  const md = readFileSync(src, "utf8");
  let body = marked.parse(md, { gfm: true });
  body = body.replace(/<h([23])>(.*?)<\/h\1>/g, (_, l, t) => `<h${l} id="${slug(t)}">${t}</h${l}>`);
  body = rewriteLinks(body, src);

  const depth = out.split("/").length - 1;
  const root = depth ? "../".repeat(depth) : "./";

  body = body.replace(/href="LICENSE"/g, `href="${root}LICENSES/MIT.txt"`);

  // Title and "Time:" line move into the page header
  let title = SITE;
  body = body.replace(/<h1>(.*?)<\/h1>\n?/, (_, t) => ((title = t), ""));
  let time = "";
  body = body.replace(/<p><strong>Time: ([^<]+)<\/strong>(?: · )?([\s\S]*?)<\/p>\n?/, (_, t, rest) => ((time = t), rest ? `<p class="src">${rest}</p>\n` : ""));
  body = body.replace(/<table>/g, `<div class="tbl"><table>`).replace(/<\/table>/g, "</table></div>");
  body = callouts(body);

  const meta = lessonMeta[out];
  const lessonNum = /^0([1-9])-/.test(basename(out)) ? Number(basename(out)[1]) : null;
  const heading = title.replace(/^Lesson \d+: /, "");
  const crumbs = meta
    ? `<a href="${root}index.html#lessons">‹ All lessons</a><span class="sep">/</span><span style="color:${trackColor(meta.track.n)}">Track ${meta.track.n} · ${meta.track.name}</span>`
    : `<a href="${root}index.html">‹ Home</a>`;
  const done = lessonNum
    ? `<label class="done-toggle"><input type="checkbox" class="check" data-lesson="${lessonNum}"> <span id="done-label" data-lesson="${lessonNum}">Mark as done</span></label>`
    : "";

  let pager = "";
  const i = lessons.indexOf(out);
  if (i !== -1) {
    const prev = lessons[i - 1], next = lessons[i + 1];
    const href = (p) => relative(dirname(out), p);
    const name = (p) => (lessonMeta[p] ? lessonMeta[p].title : basename(p, ".html"));
    pager = `<nav class="pager" aria-label="Lesson navigation">
      ${prev ? `<a class="prev" href="${href(prev)}"><span class="k">‹ Lesson ${i}</span><span class="v">${name(prev)}</span></a>` : ""}
      ${next
        ? `<a class="next" href="${href(next)}"><span class="k">Lesson ${i + 2} ›</span><span class="v">${name(next)}</span></a>`
        : `<a class="next" href="${root}index.html#lessons"><span class="k">You finished all ${lessons.length} ›</span><span class="v">Back to the lessons</span></a>`}
    </nav>`;
  }

  const main = `<main class="wrap read">
<header class="page-head">
<div class="crumbs">${crumbs}</div>
<h1>${heading}</h1>
<div class="rmeta">${time ? `<span>${time} read</span>` : ""}${done}</div>
</header>
<article class="md">
${body}
</article>
${pager}
</main>`;

  mkdirSync(dirname(join(OUT, out)), { recursive: true });
  writeFileSync(join(OUT, out), shell({ title: `${heading.replace(/<[^>]+>/g, "")} · ${SITE}`, root, main }));
}

// Home page: site/home.html with the tracks and glossary filled in
const trackHtml = tracks.map((t) => `
      <div>
        <div class="track-h"><span class="tn" style="color:${trackColor(t.n)}">Track ${t.n}</span><h3>${t.name}</h3></div>
        <p class="track-d">${t.desc}</p>
        <ul class="lessons">${t.lessons.map((l) => `
          <li class="lesson">
            <span class="num">${l.n}</span>
            <div class="body"><a class="t" href="${l.out}">${esc(l.title)}</a><div class="one">${esc(l.one)}</div></div>
            <div class="meta"><span class="time">${l.time}</span><input type="checkbox" class="check" data-lesson="${l.n}" aria-label="Mark lesson ${l.n} done"></div>
          </li>`).join("")}
        </ul>
      </div>`).join("");
const glossaryHtml = glossary.map((g) => `
      <div class="term"><div class="p">${g.pali}</div><div class="e">${g.english}</div><div class="m">${g.meaning}</div></div>`).join("");
const homeMain = `<main>
${homeTemplate
  .replace("{{FIRST}}", lessons[0])
  .replace("{{COUNT}}", lessons.length)
  .replace("{{TRACK_COUNT}}", tracks.length)
  .replace("{{TRACKS}}", trackHtml)
  .replace("{{GLOSSARY}}", glossaryHtml)}
</main>`;
writeFileSync(join(OUT, "index.html"), shell({
  title: SITE,
  root: "./",
  main: homeMain,
  description: "Seven short, beginner-friendly lessons on the Buddha's core teachings, in the Thai Forest tradition. Built for brains that get overwhelmed easily.",
}));

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
console.log(`Built ${pages.length} pages into ${OUT}/ (${tracks.length} tracks, ${glossary.length} glossary terms)`);
