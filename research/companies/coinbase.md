# Coinbase

**Category:** crypto
**HQ / founded:** No headquarters ("remote-first company" since May 2020), founded 2012 (coinbase-s1-2021)
**Scale signal:** 43 million Verified Users, 2.8 million Monthly Transacting Users and $193 billion Trading Volume in 2020 (coinbase-s1-2021); ledger migration moved "over 1 billion rows" of transaction and balance data (2020) (coinbase-ledger-migration-repost-2020); reconciliation system handles "more than 30k messages per second" (2022) (coinbase-overseer-reconciliation-2022)
**Last researched:** 2026-11-11

## Summary
Coinbase began as a Ruby on Rails application on MongoDB, and its own open-source connection pooler, written in Go, exists because that "high scale Rails app" overwhelmed MongoDB with connections (coinbase-mongobetween-repo-nd). Around 2019 to 2020 it moved balance tracking out of MongoDB into a new ledger service on AWS RDS PostgreSQL, where "every transaction stores information about the cumulative balances of all accounts involved", using a dual-write, dual-read migration of over 1 billion rows; this is known here only through a third-party repost because Coinbase's own blog blocked automated reading (coinbase-ledger-migration-repost-2020; coinbase-ledger-migration-2020). By 2026 Coinbase was hiring to redesign that ledger again, saying "our scale and complexity of operations has far surpassed the original design of Ledger" (coinbase-ledger-job-2026). Correctness across its many payment services is enforced after the fact by Overseer, a near real-time reconciliation system that tails database write-ahead logs (coinbase-overseer-reconciliation-2022).

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Ruby (original Rails app) and Go (newer services and tooling) | Strong (Ruby, Go in repo and blog code); Medium (Go preference in ledger hiring) | coinbase-mongobetween-repo-nd; coinbase-overseer-reconciliation-2022; coinbase-ledger-job-2026 |
| Main frameworks | Ruby on Rails | Strong | coinbase-mongobetween-repo-nd |
| Primary OLTP store(s) | MongoDB (Rails app); PostgreSQL on AWS RDS for relational workloads and the ledger; DynamoDB for key-value | Strong (MongoDB); Weak (PostgreSQL and DynamoDB, via repost only) | coinbase-mongobetween-repo-nd; coinbase-ledger-migration-repost-2020 |
| Service-layer persistence | An ORM layer over MongoDB in the Rails app (2017); no source on the ledger service's data access | Weak | coinbase-scaling-infoq-2018 |
| Money / ledger model | Central ledger service on PostgreSQL; each transaction stores cumulative balances of all accounts involved; double-entry not stated | Weak (repost); Medium (job listing) | coinbase-ledger-migration-repost-2020; coinbase-ledger-job-2026 |
| Messaging / streaming | No public source found naming a broker; reconciliation tails database WALs and stores updates in S3 | Strong | coinbase-overseer-reconciliation-2022 |
| Infrastructure | AWS (RDS PostgreSQL, DynamoDB, S3) | Weak | coinbase-ledger-migration-repost-2020; coinbase-scaling-infoq-2018 |
| Scaling approach | MongoDB: vertical scaling, indexes, memcached, traffic replay, Go connection-pooling sidecar; ledger: move to a dedicated PostgreSQL service | Strong (pooler); Weak (rest) | coinbase-mongobetween-repo-nd; coinbase-scaling-infoq-2018; coinbase-ledger-migration-repost-2020 |
| Build vs buy (core) | Built ledger, custody (cold storage), blockchain integrations and compliance monitoring in house; relies on third parties for payment processing, banking and cloud | Strong | coinbase-s1-2021 |
| Notable open source | mongobetween (MongoDB connection pooler, Go); Rosetta (blockchain integration standard) | Strong | coinbase-mongobetween-repo-nd; coinbase-s1-2021 |

## Languages and frameworks
- The Rails origin is visible in Coinbase's own repo: mongobetween "was built to address a connection storm issue between a high scale Rails app and MongoDB" (coinbase-mongobetween-repo-nd).
- The reason Ruby needed a pooler: "Due to Ruby MRI's global interpreter lock, multi-threaded web applications don't utilize multiple CPU cores." So the app runs many worker processes, each with its own connection pool (coinbase-mongobetween-repo-nd).
- The pooler itself is Go: "mongobetween is a lightweight MongoDB connection pooler written in Golang." (coinbase-mongobetween-repo-nd)
- The 2022 reconciliation post shows its code samples in Go (coinbase-overseer-reconciliation-2022, 2022).
- A ledger team listing (removed April 2026) asks for "Strong coding skills, preferably in Go, along with solid understanding of relational databases and transactions" (coinbase-ledger-job-2026, 2026).
- Commonly repeated but unverified here: that Go is Coinbase's primary "paved-road" language while the Rails monolith is still maintained. This sentence appears in search snippets of a Coinbase blog post that could not be read (see Open questions).

## The money layer (ledger, balances, payments)
- Coinbase's ledger team describes the service as follows: "Ledger is one of the core services for Coinbase, responsible for processing transactions and managing the funds of our users." (coinbase-ledger-job-2026, 2026)
- Before the 2020 ledger service, "Our products had each devised their own solutions" for balances, and "some legacy systems were also plagued by tech debt and performance issues." (coinbase-ledger-migration-repost-2020, 2020)
- Data model of the new ledger: "every transaction stores information about the cumulative balances of all accounts involved." The post says this makes integrity checks and point-in-time balance lookups easier (coinbase-ledger-migration-repost-2020, 2020).
- The migration moved "over 1 billion rows of corporate and customer transaction and balance information from MongoDB to our new PostgreSQL-based solution." (coinbase-ledger-migration-repost-2020, 2020)
- Result reported after almost a year in production: the new system can "sustain orders of magnitude more transactions per second than with our previous system." (coinbase-ledger-migration-repost-2020, 2020)
- In 2026 the design is again the constraint: "Today, our scale and complexity of operations has far surpassed the original design of Ledger and fund management and ledgering systems." (coinbase-ledger-job-2026, 2026)
- Double-entry, immutability or event sourcing: no public source found that states the ledger model in these terms.

## Service-layer persistence and databases
- The original Rails app uses MongoDB through mongos routers; connection storms sometimes exceeded "MongoDB's upstream connection limit of 128k connections" (coinbase-mongobetween-repo-nd).
- Database choices for new work: Coinbase chose to "adopt AWS RDS PostgreSQL as our database of choice for relational workloads and AWS DynamoDB as our key-value store." (coinbase-ledger-migration-repost-2020, 2020)
- In 2017 the Rails app had an ORM layer over MongoDB, with memcached caching at the ORM and driver layers (coinbase-scaling-infoq-2018, 2018; Weak, InfoQ summary of a Coinbase post).
- ORM vs SQL-first for the PostgreSQL ledger service: no public source found.

## Scale
- 2017 traffic spikes (more than five times the usual peak) caused downtime; fixes included vertical scaling, a MongoDB 3.2 upgrade for the WiredTiger engine, index work, memcached, and tools that capture and replay production traffic (coinbase-scaling-infoq-2018, 2018; Weak).
- mongobetween "has reduced connection counts by an order of magnitude, spikes of up to 30k connections are now reduced to around 2k." (coinbase-mongobetween-repo-nd)
- The S-1 reports "approximately 30 outages, with an average outage duration of 64.6 minutes" in 2020 (coinbase-s1-2021, 2021).
- Overseer handles "more than 30k messages per second" with an average time to detect under one minute (coinbase-overseer-reconciliation-2022, 2022).

## Build vs buy
- Built in house, per the S-1: integrations with "over 15 blockchain protocols", key management using "multi-party computation", "proprietary cold storage technology", and "bespoke transaction monitoring systems" (coinbase-s1-2021, 2021).
- Relied on third parties, per the S-1: "payment processors, banks, and payment gateways to process transactions; cloud computing services and data centers" (coinbase-s1-2021, 2021).
- Open source: Rosetta, "A tool that makes it easier for developers to build applications that work across different blockchains" (coinbase-s1-2021, 2021); mongobetween (coinbase-mongobetween-repo-nd).
- Ledger: built as an internal service rather than bought (coinbase-ledger-migration-repost-2020; coinbase-ledger-job-2026). No public source found that names a ledger vendor considered.

## Correctness (idempotency, reconciliation, audit)
- The problem Overseer solves: many services each hold state about one transaction, and "Despite this effort, the systems occasionally disagree on what happened, preventing the transaction from completing." (coinbase-overseer-reconciliation-2022, 2022)
- The services range from "front-office" product services to "the systems responsible for interacting with our banking partners or executing the transaction on chain." (coinbase-overseer-reconciliation-2022, 2022)
- The previous process "relied on ETL pipelines which meant delays of up to 24 hours" (coinbase-overseer-reconciliation-2022, 2022).
- Design: "Our typical pattern for receiving events from upstream data sources is to tail its database's WAL (write-ahead log)." Each update is stored as "a single, immutable, object in S3", and checks (assertions with an escalation policy, such as paging) run against point-in-time views (coinbase-overseer-reconciliation-2022, 2022).
- Migration safety for the ledger: "a dual-write / dual-read phased approach"; during the comparison phase the system would "log discrepancies and return the result from the legacy system" (coinbase-ledger-migration-repost-2020, 2020).
- After the backfill, a repair script rebuilt cumulative balances, then integrity and completeness checks ran against the legacy store (coinbase-ledger-migration-repost-2020, 2020).
- Idempotency: no public source found.

## Changes over time (migrations and reasons)
- 2012: launched as a Rails app on MongoDB (coinbase-mongobetween-repo-nd; founding year from coinbase-s1-2021).
- 2017: MongoDB scaling crisis during traffic spikes; MongoDB 3.2 and WiredTiger by June 2017 (coinbase-scaling-infoq-2018, 2018; Weak).
- About 2019 to 2020: balances consolidated from per-product solutions into one ledger service on PostgreSQL, migrated from MongoDB with no scheduled maintenance; reasons were per-product duplication, tech debt and performance (coinbase-ledger-migration-repost-2020, 2020).
- 2022: ETL-based reconciliation (up to 24 hours late) replaced by Overseer (under one minute) (coinbase-overseer-reconciliation-2022, 2022).
- 2025 to 2026: hiring to "redesign foundational systems" of the ledger because scale "has far surpassed the original design" (coinbase-ledger-job-2026, 2026).

## Stated reasons (verbatim quotes)
> "mongobetween was built to address a connection storm issue between a high scale Rails app and MongoDB (see blog post)." (coinbase-mongobetween-repo-nd)

> "Despite this effort, the systems occasionally disagree on what happened, preventing the transaction from completing." (coinbase-overseer-reconciliation-2022, 2022-09)

> "Today, our scale and complexity of operations has far surpassed the original design of Ledger and fund management and ledgering systems." (coinbase-ledger-job-2026, 2026)

> "some legacy systems were also plagued by tech debt and performance issues." (coinbase-ledger-migration-repost-2020, 2020-12; Coinbase text read via a third-party repost)

## Open questions
- Coinbase's own blog (coinbase.com/blog and medium.com/the-coinbase-blog) returned HTTP 403 to automated reading. The original ledger post (coinbase-ledger-migration-2020) and "Scaling connections with Ruby and MongoDB" (https://www.coinbase.com/blog/scaling-connections-with-ruby-and-mongodb) need a manual read before the report relies on them. Until then, ledger and PostgreSQL claims rest on a Weak repost.
- Unverified: "the primary paved-road language at Coinbase is Golang, but we continue to run and maintain the original Rails monolith" (search snippet of the connections post, not read).
- Is the ledger double-entry? Does it store immutable entries with derived balances, or mutable balances? Only "cumulative balances" per transaction is stated.
- What did the 2025 to 2026 ledger redesign produce? No public source found.
- Which messaging system (Kafka, Kinesis, SQS) backs services? No public source found in sources read.

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| coinbase-s1-2021 | Coinbase Global, Inc. Form S-1 (Business, Risk Factors) | Coinbase / SEC EDGAR | 2021-02-25 (older than 5 years) | https://www.sec.gov/Archives/edgar/data/1679788/000162828021003168/coinbaseglobalincs-1.htm | filing | Strong | partial |
| coinbase-mongobetween-repo-nd | coinbase/mongobetween: MongoDB connection pooler (README) | GitHub (Coinbase) | undated (accessed 2026-11) | https://github.com/coinbase/mongobetween | repo | Strong | yes |
| coinbase-overseer-reconciliation-2022 | Real-time reconciliation with Overseer (Cedric Cordenier; read in full via the publication's RSS feed) | The Coinbase Blog (Medium) | 2022-09-06 | https://medium.com/the-coinbase-blog/real-time-reconciliation-with-overseer-4d1b75a77f0c | engineering-blog | Strong | yes |
| coinbase-ledger-migration-2020 | The art of a seamless migration of Coinbase's internal ledger (Alex Ghise) | The Coinbase Blog (Medium) | 2020-12 (older than 5 years) | https://medium.com/the-coinbase-blog/the-art-of-a-seamless-migration-of-coinbases-internal-ledger-76c4c0d5f028 | engineering-blog | Strong | no |
| coinbase-ledger-migration-repost-2020 | Seamless MongoDB to PostgreSQL migration (repost of the Coinbase ledger post, credited to The Coinbase Blog) | Cryptohopper | 2020-12-04 (older than 5 years) | https://www.cryptohopper.com/news/seamless-mongodb-to-postgresql-migration-2008 | third-party | Weak | yes |
| coinbase-ledger-job-2026 | Senior Software Engineer, Backend - Platform (FinHub - Ledger) (listing removed 2026-04-07) | Coinbase via Built In | 2026 | https://www.builtinboston.com/job/senior-software-engineer/8363522 | job-listing | Medium | yes |
| coinbase-scaling-infoq-2018 | Coinbase's Scaling Challenges (InfoQ summary of a Coinbase blog post and post-mortems) | InfoQ | 2018-08-12 (older than 5 years) | https://www.infoq.com/news/2018/08/coinbase-scaling-challenges | third-party | Weak | yes |
