# Designing Systems That Move Money

Design trade-offs from 24 fintechs, banks and platforms, for principal engineers and architects.

A source-graded review in two parts. Part I covers system architecture: a reference architecture, profiles of 13 well-documented systems, topology and resilience, and languages. Part II covers six design decisions: how money is recorded, where atomicity lives, partitioning and scale, the data access layer, service and event boundaries, and correctness, plus how companies migrated live systems. Every claim traces to a public source, and every source consulted is listed.

- **Read online:** https://marisha-sahay.github.io/fintech-stack-report/ (after the first publish)
- **PDF:** [`docs/fintech-stack-report.pdf`](docs/fintech-stack-report.pdf)
- **All sources:** [`docs/sources.html`](docs/sources.html)

**Status:** draft v0.3 (November 2026), in review.

## How it is built

```
report/                 report sections in Markdown, with [@key] citations
research/companies/     one research note per company, each with a Sources table
research/sources-general.md
scripts/build.mjs       Markdown + sources -> docs/index.html, docs/sources.html, PDF
templates/              HTML shell and CSS (screen and print)
docs/                   GitHub Pages output
```

```
npm install
npm run build
```

The PDF is printed by headless Chrome from the same HTML the site serves, so the two always match.

## Evidence levels

| Level | Source type |
|---|---|
| Strong | The company's own engineering blog, conference talk, docs, open-source code or filings |
| Medium | The company's job listings, or indirect company material |
| Weak | Third-party reporting and directories. Used only to find stronger sources |

## Author

Marisha Sahay
