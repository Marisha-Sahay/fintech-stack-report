# fintech-stack-report

A public research report (5 to 10 page PDF plus a GitHub Pages site) comparing how banks and fintechs build their systems, and the reasons they give. Quality bar: the best-sourced public report on this topic.

## Layout
- `report/NN-*.md`: report sections in order. `report/meta.json` holds the title, author, version and PDF name.
- `research/companies/<slug>.md`: one research note per company, from `research/companies/_template.md`.
- `research/sources-general.md`: non-company sources.
- `research/README.md`: research questions, company assignments, evidence rules, citation key format.
- `scripts/build.mjs`: builds `docs/index.html`, `docs/sources.html`, `docs/fintech-stack-report.pdf`.
- `docs/`: GitHub Pages output. Generated, but committed so Pages can serve it from `/docs`.

## Build
```
npm install          # once
npm run build        # HTML + PDF (headless Chrome)
npm run build:html   # HTML only
```
Fix every build warning before publishing: unknown citation keys, duplicate keys, and cited sources not marked as read.

## Sourcing rules (non-negotiable)
- Every factual claim in `report/` carries a citation: `[@key]` or `[@key1; @key2]`.
- Keys live in the `## Sources` table of a research note: `key | title | publisher | date | url | type | evidence | read`.
- Evidence: Strong (the company's own engineering post, talk, docs, repo or filing), Medium (its job listings or indirect company material), Weak (third-party). The report may not rest a claim on Weak sources alone.
- Only cite sources with `read` = `yes` or `partial`. Search snippets do not count as reading.
- Never invent numbers, quotes, dates or tech choices. Write "No public source found" instead.
- Put the year on anything older than 5 years.

## Writing rules
- Payoff first: each section opens with its finding, then the evidence.
- Plain words, specific nouns. No buzzwords (leverage, robust, game-changer, delve, landscape, unlock, seamless).
- No em-dashes or en-dashes. Straight quotes only. No emojis.
- Paragraphs of 2 to 4 sentences. Tables for comparisons.
- Every theme section includes the trade-off or counter-example, not only the pattern.
