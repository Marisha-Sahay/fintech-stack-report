# Block (Square and Cash App)

**Category:** payments (Square seller payments; Cash App consumer payments and banking)
**HQ / founded:** HQ not sourced in this note. Square had launched "almost 10 years ago" as of October 2019 (block-books-ledger-2019); Cash App started as a hack-week experiment on a single MySQL database (block-sharding-cash-2018)
**Scale signal:** Cash App had 59 million monthly transacting actives in Q4 2025; Square GPV grew 10% year over year in Q4 2025 (block-q4-2025-letter-2026). Cash App's database: about 400 shards, 3 to 4 million queries per second at peak, about 400TiB (block-planetscale-case-2024, vendor case study)
**Last researched:** 2026-11-11

## Summary

Cash App keeps its core data in MySQL, sharded with Vitess since its first shard split in November 2017; it scaled below the ORM, keeping Hibernate in the application while it re-modeled payments into per-customer "movements" and made the customer the unit that never spans shards (block-sharding-cash-2018; block-remodeling-payments-2018). It refuses cross-shard transactions in money code, saying it "will never compromise data consistency in exchange for availability" (block-sharding-cash-2018, 2018). Square built Books in 2019, an immutable, append-only double-entry accounting database on Google Cloud Spanner, after its SQL settlement ledger stopped scaling and could drift into inconsistent states (block-books-ledger-2019, 2019). Cash App later left its own data centers for PlanetScale's managed Vitess and then PlanetScale Metal, giving the stated reason that database operations are not its core competency (block-planetscale-case-2024; block-planetscale-metal-2025). 2026 job listings show a mix of persistence styles: Hibernate in Cash App Banking, jOOQ in the unified Ledgering team, iBatis in Cash App Taxes (block-job-cash-banking-2026; block-job-ledgering-2026; block-job-cash-taxes-2026).

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Kotlin and Java (Cash App, Misk); Go and Ruby also used | Strong; Medium | block-misk-repo-2026; block-job-cash-banking-2026; block-job-product-platform-2026 |
| Main frameworks | Misk (Kotlin microservice container on Jetty; gRPC clients via Wire) | Strong | block-misk-repo-2026 |
| Primary OLTP store(s) | MySQL sharded with Vitess (Cash App); Aurora and DynamoDB; Spanner for Books (2019) | Strong; Medium | block-sharding-cash-2018; block-planetscale-metal-2025; block-books-ledger-2019; block-job-cash-banking-2026 |
| Service-layer persistence | ORM at Cash App: Hibernate (2018, still listed 2026); jOOQ and iBatis in some 2026 teams | Strong (2018); Medium (2026) | block-remodeling-payments-2018; block-job-cash-banking-2026; block-job-ledgering-2026 |
| Money / ledger model | Books: immutable, append-only double-entry (2019); 2026 Ledgering team holds authoritative balances for Square and Cash App | Strong (2019); Medium (2026) | block-books-ledger-2019; block-job-ledgering-2026 |
| Messaging / streaming | Kafka | Medium | block-job-cash-banking-2026 |
| Infrastructure | Moved from own data centers to cloud (AWS) and managed Vitess; Kubernetes | Strong; Medium | block-planetscale-metal-2025; block-planetscale-case-2024; block-job-ledgering-2026 |
| Scaling approach | Horizontal sharding below the ORM with Vitess; customer as entity group | Strong | block-sharding-cash-2018 |
| Build vs buy (core) | Built ledger (Books) and service framework (Misk); bought managed database operations (PlanetScale) | Strong | block-books-ledger-2019; block-misk-repo-2026; block-planetscale-metal-2025 |
| Notable open source | Misk; Spirit (MySQL online schema change); Vitess contributions | Strong | block-misk-repo-2026 |

## Languages and frameworks

- Misk ("Microservice Container in Kotlin") lets teams build services "in Kotlin or Java" and has powered "hundreds of microservices within Cash App since 2018" (block-misk-repo-2026).
- Misk's server is built on Jetty, with HTTP clients on OkHttp and Retrofit and gRPC clients on Wire (block-misk-repo-2026). Guice appears in Cash App job stacks (block-job-cash-banking-2026, Medium).
- Misk lists persistence options "ORM: SqlDelight, JOOQ, Hibernate" and JDBC connection pooling through Hikari, as separate modules (misk-hibernate, misk-jooq, misk-sqldelight, misk-jdbc) (block-misk-repo-2026).
- Cash App Banking's 2026 stack: "Java, Kotlin", "OkHttp, Jetty, JUnit, Guice", "Hibernate, Aurora, MySQL, DynamoDB, Redis", "Kafka" (block-job-cash-banking-2026, Medium).
- A Product Platform team lists "Go, Java, Ruby" with MySQL, Aurora, Vitess and DynamoDB (block-job-product-platform-2026, Medium).
- The 2018 Cash App codebase had grown to "over half a million lines of code" (block-sharding-cash-2018, 2018).

## The money layer (ledger, balances, payments)

- Books (Square, 2019): "an immutable double-entry accounting database service", built on "Google Cloud Spanner and Google Kubernetes Engine" (block-books-ledger-2019, 2019).
- Schema: `books` (one row per book, holding a balance), `journal_entries` (one row per accounting transaction), `book_entries` (debit or credit amount linked to a journal entry and a book, with a per-book version counter) (block-books-ledger-2019).
- Journal and book entries are append-only; only the `books` table, which caches the current balance, is updated (block-books-ledger-2019).
- Square departed from standard debit-normal and credit-normal accounts and treats debits as positive and credits as negative "for the ease of modeling" (block-books-ledger-2019).
- Books is multitenant: each internal client is a "shelf", and user-influenced secondary indexes are namespaced by shelf (block-books-ledger-2019).
- At publication, Books held about 20TB and was run by a team of three (block-books-ledger-2019).
- Cash App payments: each payment is split into two "movements", one for the sender (withdraw to Square) and one for the recipient (deposit from Square), so each can live on its customer's shard (block-remodeling-payments-2018, 2018).
- 2026: the Ledgering team keeps "the authoritative records of balances for Square and Cash App, along with the transactions and settlement that move that money"; its listed stack is Java, Kotlin, Python, Temporal, jOOQ, MySQL, Aurora, Vitess (block-job-ledgering-2026, Medium).
- PlanetScale's case study says Cash App's two largest systems, customer and payment history and "its main financial ledger", run on large Vitess clusters (block-planetscale-case-2024, Medium).

## Service-layer persistence and databases

- "The Cash App uses Hibernate for most of our interaction with MySQL." Entity classes use a `Db` prefix (DbCustomer, DbCard, DbPayment) (block-remodeling-payments-2018, 2018).
- The payments-to-movements migration ran behind an abstraction (DaPayment) in four phases with dual writes, backfills and tests run under both models (block-remodeling-payments-2018).
- Vitess sits between the app and MySQL; VtGate routes queries and VtTablet fronts each MySQL instance (block-operating-vitess-2018, 2018).
- Vitess let Cash App "shard our database without rewriting thousands of transactions in our application" (block-vitess-deadlocks-2018, 2018).
- Misk ships VitessTestDb, used by Block "to run over 100,000 tests in CI" against a local Vitess cluster (block-misk-repo-2026).
- Before Vitess, Cash App relied on two large MySQL clusters, per the vendor case study (block-planetscale-case-2024, Medium). Cash App's own 2018 post describes a single MySQL database that it then split (block-sharding-cash-2018).
- Square's pre-Books settlement ledger was a SQL database with an added sharding scheme and cross-shard transactions (block-books-ledger-2019, 2019).

## Scale

- Q4 2025: 59 million Cash App monthly transacting actives; 9.3 million primary banking actives in December 2025 (block-q4-2025-letter-2026).
- Cash App database: about 400 shards, 3 to 4 million QPS at peak, about 400TiB (block-planetscale-case-2024, vendor figures).
- Moving to PlanetScale Metal cut p99 latency on the main workload by 50% (block-planetscale-metal-2025).
- 2018: the first shard split took "less than a second of downtime" (block-sharding-cash-2018).

## Build vs buy

- Sharding: Cash App started designing its own solution, then adopted Vitess, which was "built at YouTube to accomplish exactly this" (block-sharding-cash-2018, 2018).
- Ledger: Square built Books itself and used Spanner so it would not have to handle sharding or run the database (block-books-ledger-2019, 2019).
- Database operations: Cash App moved from self-hosted Vitess in its data centers to PlanetScale's managed Vitess as part of a larger cloud migration (block-planetscale-metal-2025).
- Before the move, Cash App had to maintain "a forked version of Vitess" (block-planetscale-case-2024, Medium).
- Block open-sources Misk and Spirit, a MySQL 8 online schema change tool wrapped by misk-spirit (block-misk-repo-2026).
- Block "historically managed its own Vitess infrastructure and makes open source contributions" to Vitess (block-misk-repo-2026).

## Correctness (idempotency, reconciliation, audit)

- Entity groups: the customer is the main entity group; transactions within one customer are fully ACID, while multi-customer "cowrites" are not, and money code avoids cross-shard transactions (block-sharding-cash-2018, 2018).
- Twinlock keeps the two movements of a payment in sync across shards using lock columns and three sequential transactions; the twin is updated asynchronously and is eventually consistent, in practice within a second (block-remodeling-payments-2018, 2018).
- Concurrent edits are detected with Hibernate's `@Version` optimistic locking, and the loser rolls back and retries (block-remodeling-payments-2018).
- Distributed deadlocks: Vitess holds per-shard transactions open until all shards commit, with no deadlock detection across shards; Cash App fixed outages by splitting app transactions into one per shard (block-vitess-deadlocks-2018, 2018).
- Books corrections are new entries, never updates (block-books-ledger-2019).
- Square's public API requires idempotency keys: a repeated CreatePayment with the same key returns the first response without charging again (block-idempotency-docs-2026).
- A 2026 Reconciliation and Reporting team reconciles card-network and partner settlement files against internal payment data (block-job-recon-2026, Medium).

## Changes over time (migrations and reasons)

- Late 2016: Cash App "struggled to stay up during peak traffic" and ran through caching, archiving, replica reads and bigger hardware first (block-sharding-cash-2018, 2018).
- Spring 2017: payments table re-modeled into movements so data could be partitioned (block-remodeling-payments-2018, 2018).
- November 2017: first Vitess shard split (block-sharding-cash-2018, 2018).
- 2018: Vitess components moved from separate hosts into sidecars to cut TLS and network cost (block-operating-vitess-2018, 2018).
- 2018 to 2019: Square replaced its SQL settlement ledger with Books on Spanner (block-books-ledger-2019, 2019).
- Around 2024: Cash App moved from its own data centers to PlanetScale's managed Vitess on AWS (block-planetscale-case-2024, Medium; block-planetscale-metal-2025).
- 2025: moved to PlanetScale Metal (local NVMe storage) after volume degradation and IOPS limits on network storage (block-planetscale-metal-2025).
- 2026: a single Ledgering team covers balances for both Square and Cash App, listing MySQL, Aurora and Vitess rather than Spanner (block-job-ledgering-2026, Medium).

## Stated reasons (verbatim quotes)

> "At Cash App, as with Square, customers are trusting us with their money. We will never compromise data consistency in exchange for availability." (block-sharding-cash-2018, 2018-11)

> "Cross shard transactions can fail partially, and that's unacceptable to us." (block-sharding-cash-2018, 2018-11)

> "We were blinded by the abstraction that Vitess provides and missed that there is no deadlock detection for locks held between shards." (block-vitess-deadlocks-2018, 2018-11)

> "We still think the tradeoff was worth it: the deadlocks were a small price to pay to shard months earlier and avoid much bigger outages." (block-vitess-deadlocks-2018, 2018-11)

> "To meet the scalability requirements we picked Google Cloud Spanner. It is a fully managed, globally distributed SQL database which let us not worry about sharding and the maintenance burden of running a database." (block-books-ledger-2019, 2019-10)

> "Since this is just a SQL database, there's nothing preventing the payouts from becoming inconsistent." (block-books-ledger-2019, 2019-10, on the old settlement ledger)

> "This means that if you make a mistake what you want to do instead of updating is to write a new entry that corrects the previous one." (block-books-ledger-2019, 2019-10)

> "Since database operations are not our core competency we explored the managed option" (block-planetscale-case-2024, 2024-11, Cash App quote in a vendor case study)

> "This, of course, comes with the tradeoff of your machine and data being tied to each other." (block-planetscale-metal-2025, 2025-03, on local-disk databases)

## Open questions

- Is Books still on Spanner? The 2026 Ledgering listing names MySQL, Aurora and Vitess, not Spanner. Unverified.
- Which persistence library new Cash App services default to in 2026 (Hibernate, jOOQ or SQLDelight). No public statement found.
- How Cash App's own ledger is modeled (double-entry, immutability). The vendor case study names a "main financial ledger" on Vitess, but no Cash App engineering post describes it. No public source found.
- Cloud provider: the PlanetScale case study names AWS; Cash App's own post says only "our cloud provider".
- The PlanetScale page carries a later update saying "Block saved 64%" with Metal; this is a vendor claim not repeated in Cash App's post, and the update date is not shown.
- Square seller-side OLTP design beyond job listings: No public source found.
- HQ not sourced in this note.

## System architecture

Scope: Square and Cash App run separately. Square's sources describe seller payments and settlement; Cash App's describe peer payments and its own infrastructure (block-resilience-2025).

### Money path
Cash App:
1. Orchestration entry. Temporal "is in the path of all user interactions with Cash App, all inbound and outbound transfers of money, third-party partnerships with Cash App Pay, and many of the systems that power risk and safety decisions" (block-temporal-cashapp-2024, talk abstract).
2. Payment model. Each payment is split into a sender "movement" and a recipient "movement" so each can live on its own customer's shard (block-remodeling-payments-2018, 2018).
3. Data routing. "You speak SQL to Vitess, and Vitess routes that SQL to the correct MySQL shard"; the customer is the main entity group, so single-customer transactions stay fully ACID (block-sharding-cash-2018, 2018).
4. Balances and settlement. In 2026 a single Ledgering team keeps "the authoritative records of balances for Square and Cash App, along with the transactions and settlement that move that money" (block-job-ledgering-2026, Medium).
5. External networks (card networks, ACH, partner banks) for Cash App. No public source found.

Square:
1. Front door. Square runs its most critical workloads, which it lists as Payments, Point of Sale, Login and Authentication, across multiple AWS regions (block-resilience-2025).
2. Settlement services. They are "the part of the tech stack responsible for determining how much to pay to our merchants each night or via Instant Deposit" (block-books-ledger-2019, 2019).
3. Books ledger. Journal entries move value between books named "Payments", "Refunds", "Pending Balance" and "Payouts" (block-books-ledger-2019).
4. Payout. A bank settlement means calculating the merchant balance and "executing the ACH transfer in a timely fashion"; with Books the payout amount is the Pending Balance book (block-books-ledger-2019).
5. Reconciliation. A Reconciliation and Reporting team matches card-network and partner settlement files against internal payment data (block-job-recon-2026, Medium).
- Refunds are pinned to a region: "Square Refund processing was delayed because those workflows must execute in the same region as the original payment" (block-resilience-2025).

### Orchestration
- Temporal first came to Cash App to unblock the launch of monthly customer statements, a deadline the speakers call a "code red" situation, and engineers were at first "hesitant to use Temporal for anything other than trivial background jobs and maintenance work"; it later moved into the money path (block-temporal-cashapp-2024).
- Block and Afterpay engineers describe "the transformation of our checkout process using Workflow Update", child workflow patterns including "async compensation", and using "WF Replayer" to check "workflow version compatibility during CI/CD deployments" (block-temporal-payments-2024, talk abstract).
- The 2026 Ledgering team lists Temporal in its stack (block-job-ledgering-2026, Medium).
- Cross-shard payments in 2018 used Twinlock: lock columns and three sequential transactions, with the twin movement updated asynchronously (block-remodeling-payments-2018, 2018).
- Books treats books as states: "Think of these as states in a state machine and we're moving pennies between these states in bulk." (block-books-ledger-2019).
- Misk ships job queue modules (misk-jobqueue, misk-transactional-jobqueue); their semantics were not read (block-misk-repo-2026).

### Deployment topology
- Square: multi-region on AWS; "We regularly shift traffic between our active regions", and failed requests "can often be retried, automatically, in the other" (block-resilience-2025).
- Cash App: "multiple Availability Zones in the us-west region", chosen "for its stability and low failure correlation"; during the October 2025 us-east-1 outage it was "operating independently in us-west-2" (block-resilience-2025).
- Regional blast radius: European sellers, "whose transactions are primarily routed through us-east-1", saw up to 30% of transactions fail at peak (block-resilience-2025).
- Cloud move: Cash App ran Vitess "in our own datacenters for many years" and moved to PlanetScale's managed product "alongside a larger cloud migration effort", then to PlanetScale Metal on local NVMe (block-planetscale-metal-2025).
- Books (2019) ran on "Google Cloud Spanner and Google Kubernetes Engine" (block-books-ledger-2019).
- Drills: "Regular Gamedays and failover drills gave our teams the confidence to act quickly when a real event occurred." (block-resilience-2025).
- Cell-based or unit-based partitioning of Square or Cash App above the database: No public source found.

### Platform layer
- Misk: "It has been powering hundreds of microservices within Cash App since 2018." It is "Built on top of Jetty" with "HTTP/2 and gRPC support", "gRPC clients built on top of Wire", "Service management through Guava", and integrations for "AWS: SQS, S3, DynamoDB" and "Google Cloud: Spanner" (block-misk-repo-2026).
- Vitess layer: VTTablet and MySQL share one Kubernetes pod in PlanetScale's setup (block-planetscale-metal-2025).
- Centralized reliability: "Our centralized reliability and incident-response teams coordinate major events across brands." (block-resilience-2025).
- Service mesh, monorepo and deployment tooling: No public source found.

### Data platform
- Cash App has a team building its "workflows platform and data lake" (block-temporal-cashapp-2024); no Block source read describes the lake's design.
- Kafka is in the Cash App Banking stack (block-job-cash-banking-2026, Medium).
- Change data capture from Vitess, the event bus feeding the lake, and the warehouse: No public source found (a Databricks customer page about Block's Kafka-to-Delta pipeline appeared in search but was not read).

### Published architecture diagrams
- https://developer.squareup.com/blog/books-an-immutable-double-entry-accounting-database-service/ : diagrams of the old settlement tables and of the Books model, with journal entries moving money between the Payments, Refunds, Pending Balance and Payouts books. (block-books-ledger-2019)
- https://code.cash.app/sharding-cash : illustrations next to the Vitess and entity-group explanations (alt text empty; content not verified). (block-sharding-cash-2018)

### Stated architectural principles (verbatim)
> "We will never compromise data consistency in exchange for availability." (block-sharding-cash-2018, 2018-11)

> "But we design our systems with the assumption that outages like this will happen." (block-resilience-2025, 2025-10)

> "Each Block brand builds for resilience in a way that fits its product and risk model." (block-resilience-2025, 2025-10)

> "Support systems need equal redundancy." (block-resilience-2025, 2025-10)

> "Reaching broad adoption from our first use case relied on meeting our engineers where they were" (block-temporal-cashapp-2024, 2024-10)

## Sources

Freshness: sources dated before 2021-11 are older than 5 years and are labeled with their year in the text above.

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| block-sharding-cash-2018 | Sharding Cash | Cash App Code Blog (Jon Tirsén) | 2018-11 | https://code.cash.app/sharding-cash | engineering-blog | Strong | yes |
| block-remodeling-payments-2018 | Remodeling Cash App Payments | Cash App Code Blog (Jesse Wilson) | 2018-11 | https://code.cash.app/remodeling-cash-app-payments | engineering-blog | Strong | yes |
| block-vitess-deadlocks-2018 | Abstracting Sharding with Vitess and Distributed Deadlocks | Square Developer Blog (The Corner) | 2018-11 | https://developer.squareup.com/blog/abstracting-sharding-with-vitess-and-distributed-deadlocks/ | engineering-blog | Strong | yes |
| block-operating-vitess-2018 | Operating Vitess | Cash App Code Blog (Michael Pawliszyn) | 2018-12 | https://code.cash.app/operating-vitess | engineering-blog | Strong | yes |
| block-books-ledger-2019 | Books, an immutable double-entry accounting database service | Square Developer Blog (The Corner) | 2019-10 | https://developer.squareup.com/blog/books-an-immutable-double-entry-accounting-database-service/ | engineering-blog | Strong | yes |
| block-planetscale-metal-2025 | Cash App on PlanetScale Metal | Cash App Code Blog (Aaron Young) | 2025-03 | https://code.cash.app/planetscale-metal | engineering-blog | Strong | yes |
| block-planetscale-case-2024 | Cash App: Scaling to 400TiB and 4 million QPS on PlanetScale | PlanetScale (vendor case study with Cash App quotes) | 2024-11 | https://planetscale.com/case-studies/cash-app | third-party | Medium | yes |
| block-misk-repo-2026 | cashapp/misk (README, module list, misk-jooq, misk-vitess and misk-spirit READMEs) | Cash App (GitHub) | 2026-11 | https://github.com/cashapp/misk | repo | Strong | partial |
| block-idempotency-docs-2026 | Idempotency (Square API docs, accessed 2026-11) | Square | 2026-11 | https://developer.squareup.com/docs/build-basics/common-api-patterns/idempotency | docs | Strong | yes |
| block-q4-2025-letter-2026 | Q4 2025 Shareholder Letter | Block | 2026-02 | https://s29.q4cdn.com/628966176/files/doc_financials/2025/q4/Q4-2025-Shareholder-Letter_Block.pdf | filing | Strong | partial |
| block-job-ledgering-2026 | Senior Software Engineer, Ledgering, job listing via Built In NYC (removed 2026-09-01) | Block | 2026 | https://www.builtinnyc.com/job/senior-software-engineer-ledgering/10299757 | job-listing | Medium | yes |
| block-job-cash-banking-2026 | Staff Software Engineer, Cash App Banking, job listing | Block | 2026-11 | http://block.xyz/careers/jobs/5196196008?gh_jid=5196196008 | job-listing | Medium | yes |
| block-job-product-platform-2026 | Senior Software Engineer, Product Platform, job listing | Block | 2026-10 | http://block.xyz/careers/jobs/5440325008?gh_jid=5440325008 | job-listing | Medium | yes |
| block-job-cash-taxes-2026 | Senior Software Engineer, Cash App Taxes, job listing | Block | 2026-11 | http://block.xyz/careers/jobs/5207134008?gh_jid=5207134008 | job-listing | Medium | yes |
| block-job-recon-2026 | Software Engineer, Reconciliation and Reporting, job listing | Block | 2026-10 | http://block.xyz/careers/jobs/5369941008?gh_jid=5369941008 | job-listing | Medium | yes |
| block-resilience-2025 | Building for Resilience: How Block's Engineering Teams Kept Systems Running During the AWS Outage (Randy Wigginton) | Block Engineering Blog | 2025-10 | https://engineering.block.xyz/blog/building-for-resilience | engineering-blog | Strong | yes |
| block-temporal-cashapp-2024 | Great tech is not enough: building trust to get the most out of Temporal at Cash App (Replay 2024 session page, abstract and bios only; Nick Esposito, Riley Pruitt) | Temporal | 2024-10 | https://temporal.io/resources/on-demand/great-tech-is-not-enough | talk | Strong | partial |
| block-temporal-payments-2024 | Block: Using new Temporal features in real-world payments applications (Replay 2024 session page, abstract only; Mark Feldman, Maxim Chuvilyaev) | Temporal | 2024 | https://temporal.io/resources/on-demand/block-real-world-payments | talk | Strong | partial |
