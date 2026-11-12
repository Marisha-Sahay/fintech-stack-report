# Research plan

Goal: the most complete, best-sourced public comparison of how banks and fintechs build their systems and why. Breadth comes from the comparison matrix (about 24 companies). Depth comes from the themes, where the strongest evidence gets used.

## Research questions

1. **Languages and frameworks.** What do they write services in, and did the language follow from another decision (Nubank: Datomic led to Clojure)?
2. **The money layer.** How do they record money: double-entry ledgers, immutable or append-only stores, event sourcing, bitemporal models? What do they give up for it?
3. **Service-layer persistence.** ORM (Hibernate/JPA, ActiveRecord), SQL-first (MyBatis, jOOQ, JDBC), stored procedures, or custom? Does schema ownership predict the choice?
4. **Databases and scale.** Which OLTP stores (PostgreSQL, MySQL, Oracle, Cassandra, DynamoDB, Spanner, CockroachDB, OceanBase), and how do they scale them (sharding, partitioning, Vitess)?
5. **Build vs buy.** Own core banking or a vendor (Thought Machine, Mambu, 10x, Temenos, FIS)? What did they open-source?
6. **Correctness.** Idempotency, reconciliation, consistency checks, audit.
7. **Change over time.** What did they migrate away from, and why?

## Companies (assignments)

| Cluster | Companies (file slug) | Status |
|---|---|---|
| A. Payments and processors | stripe, adyen, paypal, block (Square and Cash App) | done |
| B. Neobanks and transfers (Europe) | monzo, revolut, wise, starling, n26 | done |
| C. Consumer fintech and brokerage | nubank, robinhood, coinbase, chime, klarna | done |
| D. Banks | goldman-sachs, jpmorgan-chase, capital-one, ing, bbva | done |
| E. Platforms with payment systems | uber, airbnb, shopify, ant-group, zalando (SQL-first reference case) | done |

Starting point: `seed-findings-2026-11-11.md` (first pass from the LinkedIn post research).

## Evidence rules

| Level | Meaning | Can it carry a claim in the report? |
|---|---|---|
| **Strong** | The company's own engineering blog, conference talk, official docs, open-source repo, or filings | Yes |
| **Medium** | The company's job listings, or indirect company material (a vendor case study the company took part in) | Yes, labeled as such |
| **Weak** | Third-party directories, StackShare-style lists, secondary summaries | No. Use only to find a stronger source |

`read` column: `yes` (read in full), `partial` (read the relevant section), `no` (seen in search results only). The report may cite only `yes` or `partial` sources. The build script warns about anything else.

Freshness: always record the source date. Anything older than 5 years is labeled with its year in the report.

## Citation keys

Format: `<company-slug>-<short-topic>-<year>`, for example `stripe-ledger-2024` or `cashapp-remodeling-payments-2018`. Keys must be unique across all files. The report cites them as `[@stripe-ledger-2024]`.

## Files

- `companies/<slug>.md`: one note per company, following `companies/_template.md`.
- `sources-general.md`: industry-wide and background sources (surveys, books, standards).
- `seed-findings-2026-11-11.md`: the first-pass notes. Kept for history and not edited.
