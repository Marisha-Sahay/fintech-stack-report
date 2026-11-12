#!/usr/bin/env node
// Builds the report.
//   report/*.md + report/meta.json + research sources tables
//   -> docs/index.html, docs/sources.html, docs/report.css, docs/<meta.pdf>
//
// Citations: write [@key] or [@key1; @key2] in report markdown. Keys come from the
// "## Sources" table in research/companies/*.md and research/sources-general.md.
//
// Usage: node scripts/build.mjs [--no-pdf]     (CHROME=/path/to/chrome to override)

import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { marked } from 'marked';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const meta = JSON.parse(readFileSync(join(root, 'report/meta.json'), 'utf8'));
const out = join(root, 'docs');
mkdirSync(out, { recursive: true });

const warnings = [];
const warn = (m) => warnings.push(m);
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) =>
  s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- sources registry ----------

const SOURCE_COLS = ['key', 'title', 'publisher', 'date', 'url', 'type', 'evidence', 'read'];

function parseSourcesTable(md, file) {
  const idx = md.search(/^## Sources\s*$/m);
  if (idx < 0) return [];
  const rows = [];
  for (const line of md.slice(idx).split('\n').slice(1)) {
    const t = line.trim();
    if (t.startsWith('## ')) break;
    if (!t.startsWith('|')) continue;
    const cells = t.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    if (cells[0].toLowerCase() === 'key' || /^:?-{2,}:?$/.test(cells[0])) continue;
    if (cells.length < SOURCE_COLS.length) {
      warn(`${file}: source row has ${cells.length} columns, expected ${SOURCE_COLS.length}: ${t.slice(0, 90)}`);
      continue;
    }
    const rec = Object.fromEntries(SOURCE_COLS.map((c, i) => [c, cells[i].replace(/^`|`$/g, '')]));
    if (!rec.key || rec.key.startsWith('<')) continue; // template placeholder row
    rec.file = file;
    rows.push(rec);
  }
  return rows;
}

function loadSources() {
  const files = readdirSync(join(root, 'research/companies'))
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .sort()
    .map((f) => `research/companies/${f}`);
  if (existsSync(join(root, 'research/sources-general.md'))) files.push('research/sources-general.md');

  const byKey = new Map();
  const groups = [];
  for (const rel of files) {
    const md = readFileSync(join(root, rel), 'utf8');
    const name = (md.match(/^# (.+)$/m) || [null, rel])[1].trim();
    const rows = parseSourcesTable(md, rel).filter((r) => {
      if (byKey.has(r.key)) {
        warn(`duplicate source key "${r.key}" in ${rel} (first defined in ${byKey.get(r.key).file})`);
        return false;
      }
      byKey.set(r.key, r);
      return true;
    });
    if (rows.length) groups.push({ name, file: rel, rows });
  }
  return { byKey, groups };
}

// ---------- markdown ----------

marked.use({
  gfm: true,
  renderer: {
    heading(token) {
      const html = this.parser.parseInline(token.tokens);
      return `<h${token.depth} id="${slug(token.text)}">${html}</h${token.depth}>\n`;
    },
  },
});

const CITE = /\[(@[\w.-]+(?:\s*;\s*@[\w.-]+)*)\]/g;

function applyCitations(md, sources, order) {
  return md.replace(CITE, (_, inner) => {
    const keys = inner.split(';').map((s) => s.trim().slice(1));
    const links = keys.map((k) => {
      const s = sources.byKey.get(k);
      if (!s) {
        warn(`unknown citation key: ${k}`);
        return `<span class="cite-missing">?${esc(k)}</span>`;
      }
      if (!['yes', 'partial'].includes(s.read.toLowerCase())) warn(`cited source not marked as read: ${k}`);
      if (!order.includes(k)) order.push(k);
      return `<a href="#ref-${k}">${order.indexOf(k) + 1}</a>`;
    });
    return `<sup class="cite">[${links.join(', ')}]</sup>`;
  });
}

function sourceLine(s) {
  const hasUrl = s.url && s.url !== '-';
  const title = hasUrl ? `<a href="${esc(s.url)}">${esc(s.title)}</a>` : esc(s.title);
  const date = s.date && s.date !== '-' ? `, ${esc(s.date.replace(/\.+$/, ''))}` : '';
  const url = hasUrl ? ` <span class="print-url">${esc(s.url)}</span>` : '';
  return `${title}. ${esc(s.publisher)}${date}. <span class="ev ev-${slug(s.evidence)}">${esc(s.evidence)}</span>${url}`;
}

// ---------- pages ----------

function page({ title, description, body }) {
  return readFileSync(join(root, 'templates/report.html'), 'utf8')
    .replace('{{page_title}}', esc(title))
    .replace('{{description}}', esc(description))
    .replace('{{body}}', body);
}

function buildReport(sources) {
  const files = readdirSync(join(root, 'report')).filter((f) => /^\d+.*\.md$/.test(f)).sort();
  const order = [];
  let words = 0;
  const sections = files.map((f) => {
    const md = readFileSync(join(root, 'report', f), 'utf8');
    words += md.replace(/<!--[\s\S]*?-->/g, '').replace(/[#*|`>\-]/g, ' ').split(/\s+/).filter(Boolean).length;
    return `<section class="report-section" data-source="${f}">\n${marked.parse(applyCitations(md, sources, order))}\n</section>`;
  });
  const content = sections.join('\n');

  const toc = [...content.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)]
    .map(([, id, html]) => `<li><a href="#${id}">${html.replace(/<sup[\s\S]*?<\/sup>/g, '')}</a></li>`)
    .join('\n');

  const refs = order.length
    ? `<section class="references"><h2 id="references">References</h2>\n<ol>\n${order
        .map((k) => `<li id="ref-${k}">${sourceLine(sources.byKey.get(k))}</li>`)
        .join('\n')}\n</ol>\n<p class="note">Every source consulted, including those not cited above, is listed on the <a href="${esc(meta.site_url)}sources.html">sources page</a>.</p></section>`
    : '';

  const total = [...sources.byKey.values()].length;
  const body = `
<header class="cover">
  <p class="kicker">${esc(meta.kicker || 'Research report')}</p>
  <h1>${esc(meta.title)}</h1>
  <p class="subtitle">${esc(meta.subtitle)}</p>
  <p class="byline">${esc(meta.author)} · ${esc(meta.date)} · v${esc(meta.version)}</p>
  <p class="links screen-only"><a href="${esc(meta.pdf)}">Download PDF</a> · <a href="sources.html">All ${total} sources</a></p>
  <nav class="toc" aria-label="Contents"><h2 class="toc-title">Contents</h2><ol>${toc}<li><a href="#references">References</a></li></ol></nav>
</header>
${content}
${refs}`;

  writeFileSync(join(out, 'index.html'), page({ title: meta.title, description: meta.description, body }));
  return { files: files.length, words, cited: order.length };
}

function buildSourcesPage(sources, cited) {
  const total = [...sources.byKey.values()].length;
  const groups = sources.groups
    .map(
      (g) => `<h2 id="${slug(g.name)}">${esc(g.name)}</h2>
<div class="table-wrap"><table class="sources">
<thead><tr><th>Source</th><th>Publisher</th><th>Date</th><th>Type</th><th>Evidence</th><th>Read</th><th>Cited</th></tr></thead>
<tbody>
${g.rows
  .map(
    (s) => `<tr><td>${s.url && s.url !== '-' ? `<a href="${esc(s.url)}">${esc(s.title)}</a>` : esc(s.title)}</td><td>${esc(s.publisher)}</td><td>${esc(s.date)}</td><td>${esc(s.type)}</td><td><span class="ev ev-${slug(s.evidence)}">${esc(s.evidence)}</span></td><td>${esc(s.read)}</td><td>${cited.has(s.key) ? 'yes' : ''}</td></tr>`
  )
  .join('\n')}
</tbody></table></div>`
    )
    .join('\n');

  const body = `
<header class="cover compact">
  <p class="kicker"><a href="index.html">${esc(meta.title)}</a></p>
  <h1>Sources consulted</h1>
  <p class="subtitle">${total} sources across ${sources.groups.length} groups. Evidence levels: Strong is the company's own engineering post, talk, docs or code. Medium is the company's job listings or indirect company material. Weak is third-party reporting or directories.</p>
</header>
${groups || '<p>No sources recorded yet.</p>'}`;
  writeFileSync(join(out, 'sources.html'), page({ title: `Sources · ${meta.title}`, description: meta.description, body }));
}

function buildPdf() {
  const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (!existsSync(chrome)) {
    warn(`Chrome not found at ${chrome}; PDF skipped (set CHROME=/path/to/chrome)`);
    return null;
  }
  const pdf = join(out, meta.pdf);
  execFileSync(
    chrome,
    ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, pathToFileURL(join(out, 'index.html')).href],
    { stdio: 'ignore' }
  );
  const pages = (readFileSync(pdf, 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  return { pages, kb: Math.round(statSync(pdf).size / 1024) };
}

// ---------- main ----------

const sources = loadSources();
const stats = buildReport(sources);
const citedKeys = new Set();
for (const f of readdirSync(join(root, 'report')).filter((f) => f.endsWith('.md'))) {
  for (const m of readFileSync(join(root, 'report', f), 'utf8').matchAll(CITE)) {
    m[1].split(';').forEach((k) => citedKeys.add(k.trim().slice(1)));
  }
}
buildSourcesPage(sources, citedKeys);
copyFileSync(join(root, 'templates/report.css'), join(out, 'report.css'));
const pdf = args.has('--no-pdf') ? null : buildPdf();

console.log(`sections: ${stats.files}  words: ${stats.words}  sources: ${sources.byKey.size}  cited: ${stats.cited}`);
if (pdf) console.log(`pdf: docs/${meta.pdf}  pages: ${pdf.pages}  size: ${pdf.kb} KB`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log(`  - ${w}`));
}
