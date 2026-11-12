# Robinhood

**Category:** brokerage
**HQ / founded:** Menlo Park, California (principal offices as of the 2021 S-1), 2013 (robinhood-s1-2021)
**Scale signal:** "over 5 million queries per second (QPS)" inbound, "more than 16 petabytes of data in our data lake", about 550 engineers (as of the 2021 S-1) (robinhood-s1-2021); brokerage peak load rose from 100k to 750k requests per second between December 2019 and June 2020 (robinhood-brokerage-sharding-2021)
**Last researched:** 2026-11-11

## Summary
Robinhood started as a Python/Django and PostgreSQL shop, moved latency-sensitive trading and market data services to Go, and its newest systems are Go on PostgreSQL (Aurora) with Kafka on AWS (robinhood-sed-podcast-2020; robinhood-ceres-derivatives-2026). It kept PostgreSQL rather than move to a distributed database: in 2020 it evaluated Spanner, DynamoDB, CitusDB and CockroachDB and rejected them because they "would probably require a more invasive rewrite of our core business logic, and data access layers", and instead sharded the whole application stack by customer (robinhood-brokerage-sharding-2021). It built its own clearing system (live since 2018) so it no longer relies "on third parties to reconcile and settle our customers' trades" (robinhood-clearing-launch-2018; robinhood-clearing-accounting-2022). The clearing ledger runs on PostgreSQL fed by Kafka; to scale it the team relaxed atomicity so ledger entries only need to be "eventually consistent with account balances at the end of the day", and made processing idempotent with a deduplication table (robinhood-clearing-accounting-2022).

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Python and Go (Go for latency-sensitive and newer services) | Strong | robinhood-sed-podcast-2020; robinhood-ceres-derivatives-2026 |
| Main frameworks | Django (brokerage and crypto backends) | Strong | robinhood-crypto-scaling-2022; robinhood-sed-podcast-2020 |
| Primary OLTP store(s) | PostgreSQL (AWS RDS, RDS Aurora in 2026) | Strong | robinhood-brokerage-sharding-2021; robinhood-sed-podcast-2020; robinhood-ceres-derivatives-2026 |
| Service-layer persistence | Django ORM implied by Django on PostgreSQL; no explicit statement found | Strong (stack), no source on ORM use | robinhood-crypto-scaling-2022 |
| Money / ledger model | Clearing ledger in PostgreSQL fed by Kafka; ledger entries eventually consistent with balances at end of day; newest ledger records immutable adjustments | Strong | robinhood-clearing-accounting-2022; robinhood-ceres-derivatives-2026 |
| Messaging / streaming | Kafka (self-hosted on EC2 in 2020); earlier RabbitMQ and Celery; Faust (Python stream processing) | Strong | robinhood-sed-podcast-2020; robinhood-faust-repo-nd |
| Infrastructure | AWS; migrating EC2 to self-hosted Kubernetes (2020); Kubernetes on AWS (2026) | Strong | robinhood-s1-2021; robinhood-sed-podcast-2020; robinhood-ceres-derivatives-2026 |
| Scaling approach | Application-level sharding: each shard has its own app servers, database and deploy pipeline; routing and aggregation layers | Strong | robinhood-brokerage-sharding-2021; robinhood-crypto-scaling-2022 |
| Build vs buy (core) | Built self-clearing (2018); relies on AWS as primary cloud | Strong | robinhood-clearing-launch-2018; robinhood-s1-2021 |
| Notable open source | Faust, Python stream processing on Kafka (now deprecated, community fork exists) | Strong | robinhood-faust-repo-nd |

## Languages and frameworks
- In 2020 an infrastructure engineer said: "we originally wrote some of the original trading services in Python, and then we rewrote it in Go lang. We did the same thing with our market data services." The stated aim was low latency (robinhood-sed-podcast-2020, 2020).
- Same interview: "we're historically been known as a Django and Postgres shop" and "we've eventually kind of went into a Go lang and Postgres shop", with "most APIs are written in Python and Go" (robinhood-sed-podcast-2020, 2020). Quotes are from an unedited podcast transcript.
- The crypto backend (2022): "Our crypto backend is built on the Django framework with PostgreSQL databases." (robinhood-crypto-scaling-2022, 2022)
- The 2026 derivatives platform Ceres is "built on top of technologies such as Golang, PostgreSQL, Kafka, and Kubernetes" (robinhood-ceres-derivatives-2026, 2026).
- A former engineer's firsthand account describes the brokerage backend "brokeback" as Python/Django on Postgres with memcached, and the order system "main street" as Go, sharded by order ID (robinhood-linford-sharding-2025, 2025; Weak, not company material).

## The money layer (ledger, balances, payments)
- The accounting system is the center of clearing, though not on the customer order path. Its original design was a set of tables in one PostgreSQL database updated synchronously by Kafka consumers, and "It was done as a gigantic transaction with heavy locking to prevent race conditions between multiple consumers." (robinhood-clearing-accounting-2022, 2022)
- Stale ledgers block downstream work: "If accounting ledgers are stale, downstream operations like trade reconciliation or settlement will be blocked" (robinhood-clearing-accounting-2022, 2022).
- The redesign relaxed atomicity across executions, ledger entries and balances. Ledger entries "only need to be eventually consistent with account balances at the end of the day." (robinhood-clearing-accounting-2022, 2022)
- The reason for going asynchronous: it "allows us to write the aggregated updates to the database without locks" (robinhood-clearing-accounting-2022, 2022).
- Reported result: average production time for a regular message fell from about 20 ms to under 0.1 ms, and message throughput capacity rose more than 10x (robinhood-clearing-accounting-2022, 2022).
- Storage remained the bottleneck after this; a Part II on horizontally scaling the accounting system was announced, but no public copy was found (robinhood-clearing-accounting-2022, 2022).
- In the 2026 derivatives platform, the ledger stays product-neutral: "From the ledger's perspective, an execution remained just another immutable adjustment record." Event contract settlements "flowed through the same downstream accounting systems already trusted for futures trading" (robinhood-ceres-derivatives-2026, 2026).
- Double-entry: no public source found that says whether Robinhood's ledgers are double-entry.

## Service-layer persistence and databases
- PostgreSQL on AWS RDS: "We use the Postgres version of the RDS there." (robinhood-sed-podcast-2020, 2020)
- Before sharding, the brokerage ran on a single database server; "We love native PostgreSQL, but unfortunately, it just doesn't scale horizontally beyond a single server." (robinhood-brokerage-sharding-2021, 2021)
- Crypto tuning before sharding: query audits, moving reads to replicas, precomputing values at write time, indexes, and memcached for reads that tolerate staleness; "To ensure correctness, we never used caching on the write paths." (robinhood-crypto-scaling-2022, 2022)
- Tools named: pganalyze, Jaeger, EXPLAIN ANALYZE, pgbouncer connection pools (robinhood-crypto-scaling-2022, 2022).
- ORM vs SQL-first: no public source found that states how services access PostgreSQL (Django ORM, raw SQL, or Go libraries).

## Scale
- Brokerage load grew from 100k requests per second (Dec 2019) to 750k (Jun 2020) (robinhood-brokerage-sharding-2021, 2021).
- Alternatives evaluated and rejected: "looking at solutions like Google's Cloud Spanner, AWS's DynamoDB, CitusDB, and CockroachDB", rejected because they "would probably require a more invasive rewrite of our core business logic, and data access layers" (robinhood-brokerage-sharding-2021, 2021).
- Chosen design: "We decided to shard the system at the application level because it enabled us to increase reliability through service isolation, decreasing the blast radius of any future incidents." (robinhood-brokerage-sharding-2021, 2021)
- Customers are assigned to shards "using durable and cacheable mapping records"; a routing layer maps requests to shards and a stateless aggregation layer fans out internal requests (robinhood-brokerage-sharding-2021, 2021).
- Kafka with shards: every shard consumes all messages and processes only its own users; high-throughput cases get per-shard topics (robinhood-brokerage-sharding-2021, 2021).
- Shard count: one at the start of 2020, three at the end of 2020, ten in June 2021, each "capable of handling many hundreds of thousands of requests per second" (robinhood-brokerage-sharding-2021, 2021).
- Crypto (2022) reused the same whole-stack sharding; settlement was extracted into "a standalone component and database" shared across shards (robinhood-crypto-scaling-2022, 2022).
- Crypto results: write throughput up to 50% higher for critical flows, about 4x read throughput, 7x lower database CPU, and queries per request down "to 1 from >30" on some endpoints (robinhood-crypto-scaling-2022, 2022).
- The 2026 Ceres platform is also sharded: "Each shard functions as an independent functional unit" (robinhood-ceres-derivatives-2026, 2026).

## Build vs buy
- Clearing was built in house in 2018: the launch post says Robinhood built its own clearing system rather than rely on a third party, to cut fees, improve support data and ship features faster, and describes it as built from scratch on modern technology. It names no languages or databases (robinhood-clearing-launch-2018, 2018).
- The S-1 says self-clearing lets it clear and settle "without relying on a third-party clearing firm", and calls the build "highly onerous", "taking over two years and requiring regulatory approvals from FINRA, the DTC and the OCC" (robinhood-s1-2021, 2021).
- Cloud: "We currently host our platform and support our operations on datacenters provided by Amazon Web Services" (robinhood-s1-2021, 2021).
- Robinhood built Faust, a Python port of Kafka Streams ideas, and open-sourced it; the repo now says "This library has been deprecated and no longer managed or supported." (robinhood-faust-repo-nd; robinhood-sed-podcast-2020)
- Kafka was self-hosted on EC2 in 2020; teams were steered away from a managed offering because "we just built up a ton of domain expertise on the EC2" (robinhood-sed-podcast-2020, 2020).

## Correctness (idempotency, reconciliation, audit)
- Idempotency in clearing accounting: "Deduplication is done via a lookup table in our Postgres DB", updated in the same transaction as other side effects, so reprocessing after a failure is a no-op (robinhood-clearing-accounting-2022, 2022).
- Message ordering of commit: consume from Kafka, commit the database transaction, produce downstream messages, then commit offsets. This replaced a scan-and-send outbox table that became a bottleneck (robinhood-clearing-accounting-2022, 2022).
- Reconciliation: self-clearing means Robinhood does its own trade reconciliation and settlement, and reports to the DTCC (robinhood-clearing-accounting-2022, 2022). No public source found on how reconciliation is implemented.
- Outages and their cost: the March 2020 outage was "stress on our infrastructure" leading to "a 'thundering herd' effect" and "a failure of our DNS system" (robinhood-founders-outage-2020, 2020). The S-1 reports about $3.6 million in customer goodwill remediation for the March 2020 outages, and an agreement-in-principle with FINRA covering investigations that include systems outages, expected to involve a $57.0 million fine across all the matters covered (robinhood-s1-2021, 2021).

## Changes over time (migrations and reasons)
- Messaging: RabbitMQ and Celery were the first streaming platform; then Kafka and Faust (robinhood-sed-podcast-2020, 2020).
- Languages: trading and market data services rewritten from Python to Go for latency (robinhood-sed-podcast-2020, 2020).
- 2018: clearing moved in house (robinhood-clearing-launch-2018, 2018).
- 2020: compute moving from EC2 to a self-hosted Kubernetes cluster (robinhood-sed-podcast-2020, 2020).
- 2020 to 2021: single PostgreSQL brokerage database replaced by application-level shards after the March 2020 outages and 7x load growth (robinhood-brokerage-sharding-2021, 2021; robinhood-founders-outage-2020, 2020).
- 2022: clearing accounting rebuilt from synchronous locking transactions to an asynchronous pipeline; "it was time to rebuild the system with scalability as a design principle" (robinhood-clearing-accounting-2022, 2022).
- 2022: crypto stack sharded after primary and replica database bottlenecks (robinhood-crypto-scaling-2022, 2022).

## Stated reasons (verbatim quotes)
> "We love native PostgreSQL, but unfortunately, it just doesn't scale horizontally beyond a single server." (robinhood-brokerage-sharding-2021, 2021-06)

> "We decided to shard the system at the application level because it enabled us to increase reliability through service isolation, decreasing the blast radius of any future incidents." (robinhood-brokerage-sharding-2021, 2021-06)

> "Infrastructure failures might still rear their head in the future, but they're now limited to one shard." (robinhood-brokerage-sharding-2021, 2021-06)

> "we no longer rely on third parties to reconcile and settle our customers' trades." (robinhood-clearing-accounting-2022, 2022-04)

> "it was time to rebuild the system with scalability as a design principle" (robinhood-clearing-accounting-2022, 2022-04)

> "To ensure correctness, we never used caching on the write paths." (robinhood-crypto-scaling-2022, 2022-09)

> "We now understand the cause of the outage was stress on our infrastructure" (robinhood-founders-outage-2020, 2020-03)

> "From the ledger's perspective, an execution remained just another immutable adjustment record." (robinhood-ceres-derivatives-2026, 2026-06)

## Open questions
- Is the clearing ledger double-entry? Is it append-only? No public source found.
- Part II of "Scaling Robinhood Clearing Accounting" (horizontal scaling of the ledger storage) was announced in April 2022 but not found.
- How do Python/Django and Go services access PostgreSQL (Django ORM, SQL-first, sqlc, etc.)? No public source found.
- The Medium post "Under the Hood of Clearing by Robinhood" (Python 3, Django/DRF, Kafka, Airflow per search snippets) returned HTTP 403 and was not read; its stack claims are unverified here.
- Current share of Python vs Go across services is unverified; job listings suggest both are still in use (not read).

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| robinhood-brokerage-sharding-2021 | How we scaled Robinhood's brokerage system for greater reliability (Edmond Wong, Nathan Ziebart) | Robinhood Newsroom | 2021-06-25 (older than 5 years) | https://robinhood.com/us/en/newsroom/how-we-scaled-robinhoods-brokerage-system-for-greater-reliability/ | engineering-blog | Strong | yes |
| robinhood-clearing-accounting-2022 | Part I: Scaling Robinhood Clearing Accounting | Robinhood Newsroom | 2022-04-11 | https://robinhood.com/us/en/newsroom/part-i-scaling-robinhood-clearing-accounting | engineering-blog | Strong | yes |
| robinhood-crypto-scaling-2022 | Scaling Robinhood Crypto Systems (Chirantan Mahipal, Hefu Chai, Xuan Zhang) | Robinhood Newsroom | 2022-09-09 | https://robinhood.com/us/en/newsroom/scaling-robinhood-crypto-systems/ | engineering-blog | Strong | yes |
| robinhood-ceres-derivatives-2026 | How we evolved Robinhood's derivatives platform for a new market in under three weeks (Edmond Wong) | Robinhood Careers Blog | 2026-06-09 | https://robinhood.com/us/en/careers/blog/how-we-evolved-robinhoods-derivatives-platform-for-a-new-market-in-under-three-weeks/ | engineering-blog | Strong | yes |
| robinhood-clearing-launch-2018 | Introducing Clearing by Robinhood | Robinhood Newsroom | 2018-10-10 (older than 5 years) | https://robinhood.com/us/en/newsroom/introducing-clearing-by-robinhood | press | Strong | yes |
| robinhood-founders-outage-2020 | An Update from Robinhood's Founders | Robinhood Newsroom | 2020-03-03 (older than 5 years) | https://robinhood.com/us/en/newsroom/an-update-from-robinhoods-founders/ | press | Strong | yes |
| robinhood-s1-2021 | Robinhood Markets, Inc. Form S-1 (Business, Risk Factors, Legal Proceedings) | Robinhood / SEC EDGAR | 2021-07-01 (older than 5 years) | https://www.sec.gov/Archives/edgar/data/1783879/000162828021013318/robinhoods-1.htm | filing | Strong | partial |
| robinhood-sed-podcast-2020 | SED 1136: Robinhood Engineering with Jaren Glover (transcript) | Software Engineering Daily | 2020 (older than 5 years) | https://softwareengineeringdaily.com/wp-content/uploads/2020/09/SED1136-Robinhood-Engineering.pdf | talk | Strong | yes |
| robinhood-faust-repo-nd | robinhood/faust: Python Stream Processing (README) | GitHub (Robinhood) | undated (accessed 2026-11) | https://github.com/robinhood/faust | repo | Strong | yes |
| robinhood-linford-sharding-2025 | While Postgres Redlined, Robinhood Sharded to Scale (Tom Linford, former Robinhood engineer) | tomlinford.com | 2025-02-21 | https://tomlinford.com/posts/robinhood-sharding-to-scale/ | third-party | Weak | yes |
