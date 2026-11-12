# Adyen

**Category:** payments
**HQ / founded:** Amsterdam (adyen-h2-results-2026). Founding year not sourced in this note
**Scale signal:** Processed volume of EUR 1,394.3 billion in full-year 2025 (adyen-h2-results-2026). PostgreSQL databases of 100TB, 200TB and 300TB described by an Adyen database engineer in October 2025 (adyen-pgconf-100tb-2025)
**Last researched:** 2026-11-11

## Summary

Adyen runs one platform from a single Java monorepo and stores almost everything in PostgreSQL, accessed through MyBatis with hand-written SQL and PL/pgSQL stored procedures (adyen-design-duty-architecture-2021; adyen-sql-comments-2023; adyen-job-java-madrid-2026). Its accounting system is built in-house on double-entry bookkeeping, and new journals can only be written through templates that are automatically proven to sum to zero (adyen-design-duty-accounting-2021, 2021). Adyen states a clear build-vs-buy rule: never a proprietary product for core flows, buy only for peripheral needs, and prefer a small set of open-source tools; the one notable addition at the edge is CockroachDB, adopted for API idempotency (adyen-design-duty-architecture-2021, 2021). It runs its own data centers on bare metal and is moving to an on-premises Kubernetes private cloud, partly for legal reasons (adyen-design-duty-architecture-2021; adyen-job-platform-2026). The trade-off it describes is that sharding the accounting database broke code that assumed one database, and cross-cluster payouts and reconciliation had to be rebuilt (adyen-design-duty-accounting-2021).

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Java ("almost exclusively"), Java 17 in a 2026 listing | Strong; Medium | adyen-design-duty-architecture-2021; adyen-job-java-madrid-2026 |
| Main frameworks | MyBatis, Tomcat, Gradle | Medium | adyen-job-java-madrid-2026 |
| Primary OLTP store(s) | PostgreSQL (self-managed, single databases over 100TB); CockroachDB at the edge for idempotency | Strong | adyen-design-duty-accounting-2021; adyen-pgconf-100tb-2025; adyen-design-duty-architecture-2021 |
| Service-layer persistence | SQL-first: MyBatis with custom SQL and PL/pgSQL stored procedures | Strong | adyen-sql-comments-2023; adyen-graph-db-2021 |
| Money / ledger model | In-house double-entry accounting; journals only via templates mathematically verified to net to zero; about 50 rows per payment | Strong (2021) | adyen-design-duty-accounting-2021 |
| Messaging / streaming | In-house PostgreSQL-backed queues and streaming (2021); Kafka with MirrorMaker 2 for cross-region replication (2025) | Strong | adyen-design-duty-accounting-2021; adyen-globalstream-2025 |
| Infrastructure | Own data centers, bare metal; on-premises Kubernetes private cloud | Strong; Medium | adyen-design-duty-architecture-2021; adyen-job-platform-2026 |
| Scaling approach | Stateless edge scaled linearly; accounting database sharded into clusters by round-robin; PostgreSQL table partitioning above about 100GB | Strong | adyen-design-duty-architecture-2021; adyen-design-duty-accounting-2021; adyen-partitioning-2023 |
| Build vs buy (core) | Build core in-house on open source; never proprietary for core flows | Strong | adyen-design-duty-architecture-2021; adyen-annual-report-2024 |
| Notable open source | adyen-postgres-partitioning (PL/pgSQL functions for partition maintenance, MIT) | Strong | adyen-partitioning-repo-2023 |

## Languages and frameworks

- "We do all of this on a single platform, in a single repository (monorepo), almost exclusively written in Java." (adyen-design-duty-architecture-2021, 2021)
- A November 2026 job listing gives the stack as "Java 17, Web Services (RESTful) and SQL/PostgreSQL using MyBatis (ORM), Tomcat, Gradle, CockroachDB and Elasticsearch" (adyen-job-java-madrid-2026, Medium).
- Adyen's graph engine for fraud and onboarding checks is written in Java on PostgreSQL and MyBatis (adyen-graph-db-2021, 2021).
- Engineers also design and run what they build ("Design to Duty"), which Adyen says sometimes "leads to counterintuitive results" in design choices (adyen-design-duty-architecture-2021, 2021).

## The money layer (ledger, balances, payments)

- "For every payment that enters the system, we do double-entry bookkeeping." (adyen-design-duty-accounting-2021, 2021)
- Records can only be added through templates: a template takes amounts and accounts and produces journals for the ledger (adyen-design-duty-accounting-2021).
- Templates are verified automatically on every change by representing input amounts as logical entities and proving every combination nets to 0 (adyen-design-duty-accounting-2021).
- Result claimed: summing all records in the accounting system always gives 0, so "for every euro that ever went through Adyen, we know exactly where it came from and where it went" (adyen-design-duty-accounting-2021).
- The same accounting system is used for Adyen's banking platform (adyen-design-duty-accounting-2021).
- Cost: about 50 rows are inserted into the accounting database over the lifetime of one payment, an order of magnitude more inserts than payments per second (adyen-design-duty-accounting-2021).
- In 2026 Adyen describes "Core Accounting & Configuration (CAC)" as its "central ledger and entity structure" (adyen-job-cac-2026, Medium).
- Immutability or event sourcing of the ledger is not described. No public source found.

## Service-layer persistence and databases

- "Our current stack includes the well-known open-source relational database PostgreSQL, together with MyBatis" (adyen-sql-comments-2023, 2023-02).
- Adyen runs "thousands of queries" and executes "billions of them per day" through MyBatis and the PostgreSQL JDBC driver (adyen-sql-comments-2023).
- A 2023 incident: injecting a per-request traceId as a SQL comment made every query text unique, so pgJDBC never reached its prepared-statement threshold and database CPU spiked; static metadata only is now injected (adyen-sql-comments-2023).
- The graph database uses MyBatis XML query files and plpgsql stored procedures that handle locking, encryption of PII identifiers and entity merges (adyen-graph-db-2021, 2021).
- The Payment Acceptance Layer (PAL) saves each payment in a local PostgreSQL database that acts as a queue; a separate process moves it to accounting (adyen-design-duty-accounting-2021).
- PostgreSQL clusters in 2018: one primary and at least three replicas across data centers, 768 GB RAM servers, SAN storage (adyen-postgres-upgrade-2018, older than 5 years).
- 2025: databases of "100TB, 200TB, 300TB" (adyen-pgconf-100tb-2025). The slides cover cascade replication, manual vacuum of the largest and most bloated tables, and backups from storage snapshots plus WAL (adyen-pgconf-100tb-2025).
- Some tables are over 20TB; tables that might exceed 100GB are partitioned (adyen-partitioning-2023).
- Payments engineers "will work with one of the biggest PostgreSQL databases out there" (adyen-job-payments-2026, Medium).

## Scale

- Processed volume: EUR 1,394.3 billion in 2025, of which EUR 311 billion point-of-sale (adyen-h2-results-2026).
- Payments arrive "hundreds of times a second, 24/7" (adyen-design-duty-architecture-2021, 2021).
- Kafka cross-continent replication runs at "several hundred thousand messages per second" (adyen-globalstream-2025).
- 2018: 5,000+ PostgreSQL transactions per second across clusters; database under 10 TB in 2015 and 50 TB at the 2018 upgrade (adyen-postgres-upgrade-2018, older than 5 years).
- Observability scope in 2026: "over 1,500 servers across both bare-metal and Kubernetes environments" (adyen-job-observability-2026, Medium).

## Build vs buy

- Core flows: "we never choose a proprietary solution because we want to have full control" (adyen-design-duty-architecture-2021, 2021).
- Buy when "the use case is peripheral, it does not have to be real-time, we do not have to embed it, or if it is a good value proposition", for example some KYC background checks (adyen-design-duty-architecture-2021).
- Accounting framework built in-house because "it is as core as can be to our business, and nothing in the open-source landscape came close" (adyen-design-duty-accounting-2021).
- CockroachDB adopted at the edge instead of building on PostgreSQL, because idempotency storage "is really not our core business" (adyen-design-duty-architecture-2021).
- Data analysis uses industry standards: Spark on Hadoop with Airflow, on Adyen's own servers (adyen-design-duty-accounting-2021).
- 2024 annual report: "By building our platform entirely in-house, Adyen's tech stack was designed to capture a cohesive view of payments data." (adyen-annual-report-2024)

## Correctness (idempotency, reconciliation, audit)

- Payments API idempotency: the same payment sent twice is processed once and returns the same response; implemented by integrating CockroachDB with the PAL so the data is available locally without pinning merchants to machines (adyen-design-duty-architecture-2021, 2021).
- Edge services are stateless and are "prohibited from writing to central databases", which Adyen presents as both a scaling and a security property (adyen-design-duty-architecture-2021).
- Accounting favors consistency over uptime: the process feeding accounting "will run behind if we have doubt about whether we can guarantee consistency", without stopping payment acceptance (adyen-design-duty-accounting-2021).
- Reconciliation after sharding: partner settlement files are parsed, split per accounting cluster, then matched within each cluster (adyen-design-duty-accounting-2021).
- The in-house streaming system is still used to verify that data consumed by the Spark/Hadoop analysis setup is complete and correct (adyen-design-duty-accounting-2021).

## Changes over time (migrations and reasons)

- 2015 to 2018: PostgreSQL upgrades moved from Slony logical replication (days at 10 TB) to pg_upgrade plus storage snapshots for a 50 TB database (adyen-postgres-upgrade-2018, older than 5 years).
- By 2021: a reporting database was split from accounting to reduce reads, then accounting was sharded into several clusters when inserts no longer scaled; routing is round-robin, not by merchant or payment method (adyen-design-duty-accounting-2021).
- By 2021: reporting moved to streaming from the accounting clusters on a PostgreSQL-based framework built in-house, after Kafka was ruled out because exactly-once delivery was not yet supported (adyen-design-duty-accounting-2021). Adyen said there was "an ongoing discussion" about swapping it for Kafka (adyen-design-duty-accounting-2021).
- 2021: CockroachDB added at the edge for idempotency, described as "more recently" (adyen-design-duty-architecture-2021).
- 2021: moving from tightly coupled bare metal toward an internal cloud for dynamic scaling (adyen-design-duty-architecture-2021). In 2026 Adyen hires for Kubernetes "across our global private cloud" (adyen-job-platform-2026, Medium).
- 2023: tables were partitioned only "when we really had to"; existing large tables were partitioned by catalog changes instead of copying data, and the functions were open-sourced (adyen-partitioning-2023; adyen-partitioning-repo-2023).
- 2025: Kafka runs Adyen's streaming platform with MirrorMaker 2 between regions (adyen-globalstream-2025).

## Stated reasons (verbatim quotes)

> "However, we want to focus on the core flows in our system, and for those, we never choose a proprietary solution because we want to have full control." (adyen-design-duty-architecture-2021, 2021-07)

> "We could have built something ourselves here (probably on top of PostgreSQL) but this is really not our core business and there were several open-source options that satisfied our criteria." (adyen-design-duty-architecture-2021, 2021-07, on CockroachDB for idempotency)

> "The reasons we are not deploying to the cloud are part historical, part legal, and part technical." (adyen-design-duty-architecture-2021, 2021-07)

> "Here the choice was evident, it is as core as can be to our business, and nothing in the open-source landscape came close to what we wanted." (adyen-design-duty-accounting-2021, 2021-08, on the accounting framework)

> "In the end, we decided the benefits domain knowledge routing would offer were not worth the loss of flexibility and increased complexity." (adyen-design-duty-accounting-2021, 2021-08, on round-robin sharding)

> "In the beginning, the requirements on the system were not that high, so we went for a one-size-fits-all solution for databases." (adyen-design-duty-accounting-2021, 2021-08)

> "We scoped a lot of open source technologies but none offered the feature set we were looking for. For example, exactly-once delivery was not yet supported by Kafka." (adyen-design-duty-accounting-2021, 2021-08)

> "We built our database stack with PostgreSQL, as it provides consistency, isolation, and reliability we need." (adyen-postgres-upgrade-2018, 2018-03)

> "Combining all the powerful features of PostgreSQL such as handling high amounts of transactional data with features of MyBatis, such as being simple, explicit, and close to Java POJO objects allowed us to write our tailor-made SQL queries and stored procedures that are very high-performant." (adyen-graph-db-2021, 2021-01)

> "As a rule of thumb, we partition tables that might exceed the size of 100GB." (adyen-partitioning-2023, 2023-10)

## Open questions

- Why MyBatis rather than JPA/Hibernate: the posts praise MyBatis as "simple, explicit, and close to Java POJO objects" but never compare it with an ORM. No public comparison found.
- Whether Kafka has replaced the in-house PostgreSQL streaming framework for accounting and reporting. Unverified.
- Whether accounting clusters can now be rebalanced; in 2021 this "has not been implemented yet".
- Where CockroachDB is used today beyond the 2021 idempotency case; a 2026 job listing still names it.
- The PGConf.EU 2025 slides list managed PostgreSQL storage caps (for example AWS RDS 64TB) under a "Why?" heading. Reading this as a reason Adyen self-hosts PostgreSQL is an inference, not a stated reason.
- Whether ledger rows are immutable (append-only) is not stated in any source read.
- Founding year not sourced in this note.

## System architecture

### Money path
1. Entry. "The payment can come either from a payment terminal, from a mobile application, via a direct API call, or from a payment page hosted by us", and "Every API call to our systems goes through our edge services first" (adyen-design-duty-architecture-2021, 2021).
2. Payments Acceptance Layer (PAL). "The Payments Acceptance Layer (PAL) is a crucial service in our edge layer. All payments pass through it." The PAL abstracts all payments "so the system can treat them as equal" (adyen-design-duty-architecture-2021). The accounting post calls the same service the "Payment Processing Layer (or PAL, see part one)" (adyen-design-duty-accounting-2021).
3. Internal edge services. The PAL calls "a risk engine, a service for saving or generating recurring payment tokens, or a service for computing which connection will lead to the highest authorization rate" (adyen-design-duty-architecture-2021).
4. External networks. The PAL contacts "(through an intermediary service) the partner payment method or scheme that processes the payment" and returns the result to the merchant synchronously (adyen-design-duty-architecture-2021).
5. Local queue. "The Payment Processing Layer (or PAL, see part one) saves the payment in a local database and a separate process picks it up when possible"; the queue is a PostgreSQL database (adyen-design-duty-accounting-2021).
6. Accounting clusters. Double-entry journals are written through verified templates into several accounting databases chosen by "a simple round-robin strategy" (adyen-design-duty-accounting-2021).
7. Reporting and data processing. Data is streamed from the accounting clusters to reporting tables, then to Spark on Hadoop with Airflow for analysis (adyen-design-duty-accounting-2021).
8. Settlement and payout. Partner reports are parsed, split per accounting cluster and matched inside each cluster; a merchant payout that draws on several clusters uses "several jobs and processes that use back and forth messages between the clusters" (adyen-design-duty-accounting-2021).

### Orchestration
- No workflow engine, saga framework or TCC is named in any Adyen source read. Coordination is by database-backed queues and background processes: the PAL-to-accounting queue "will run behind if we have doubt about whether we can guarantee consistency" without affecting the PAL (adyen-design-duty-accounting-2021).
- Modifications such as refunds are processed asynchronously so the edge stays stateless (adyen-design-duty-architecture-2021).
- Adyen for Platforms API (2020): external systems validate a request, add it "to a local queue and return a response to the merchant" (HTTP 202); the internal system queues it again to keep order, and a main thread "acts as an orchestrator" that groups requests by a key such as the account so they run sequentially on one thread (adyen-design-20x-2020).
- Idempotency at the edge uses CockroachDB integrated with the PAL (adyen-design-duty-architecture-2021).

### Deployment topology
- Own data centers: "Adyen currently hosts its main systems in separate data centers in Europe, the United States, India, Singapore, Japan and Australia. We administer and manage all our own servers." (adyen-infrastructure-2026).
- Data residency: "All payments processed are stored in Europe and our isolated India environment." (adyen-infrastructure-2026).
- Active-active acceptance: the platform is "a redundant and stateless service-oriented architecture (SOA) that simultaneously accepts payments on multiple physical hosting locations" (adyen-infrastructure-2026).
- No public cloud for payments: "nor do we use any public cloud services for payment processing" (adyen-infrastructure-2026). In 2021 Adyen said it was "moving towards running our system on an internal cloud" for dynamic scaling (adyen-design-duty-architecture-2021); a 2026 listing hires for Kubernetes "across our global private cloud" (adyen-job-platform-2026, Medium).
- Cross-region streaming: Kafka data is kept "close to producers" for latency and compliance and mirrored with MirrorMaker 2 into centralized clusters for analytics (adyen-globalstream-2025).
- Database replication: in 2018, PostgreSQL clusters had one primary and at least three replicas across data centers (adyen-postgres-upgrade-2018, 2018).
- Disaster recovery targets (RTO, RPO) and whether the accounting databases run active-active across sites: No public source found.

### Platform layer
- One codebase: "a single platform, in a single repository (monorepo), almost exclusively written in Java", split into parts "along business domains" that are "tied together" in the data layer (adyen-design-duty-architecture-2021).
- Branching and release (2018): "everybody develops on the main line"; release branches are cut and stabilized, fixes are ported by commit hook, and features are toggled "one-by-one on production, and then canary them" (adyen-scaling-workflow-2018, 2018).
- Release cadence: Adyen says it publishes new releases of its core system every week, without downtime and without the active involvement of customers (adyen-infrastructure-2026).
- Runtime stack: Tomcat, Gradle and MyBatis per a job listing (adyen-job-java-madrid-2026, Medium).
- RPC framework or service mesh: No public source found.

### Data platform
- Stream from accounting: "We decided to stream the data from the clusters and to have specialized processes consume and preprocess the data for specific use cases", on an in-house PostgreSQL-based streaming framework written in Java (adyen-design-duty-accounting-2021).
- Warehouse and analysis: "We run a Spark Hadoop cluster combined with Airflow" on Adyen's own servers, and the custom streaming system is still used "to verify all the information is actually consumed and correct" (adyen-design-duty-accounting-2021).
- Feedback to online systems: Spark results are fed back into synchronous systems, first for monitoring and then as "a generic framework that can also score the machine learning models in real-time" (adyen-design-duty-accounting-2021).
- Kafka (2025): Adyen runs a Kafka streaming platform replicating "several hundred thousand messages per second" across continents (adyen-globalstream-2025).
- Reconciliation: the two-step parse-then-split framework matches partner reports per accounting cluster (adyen-design-duty-accounting-2021).
- Change data capture from PostgreSQL: No public source found.

### Published architecture diagrams
- https://www.adyen.com/knowledge-hub/design-to-duty-adyen-architecture : layer diagram (Merchant, Edge services, Backend accounting, Data processing), and an edge diagram showing Checkout, Hosted Pages, POS and API clients feeding the PAL, which calls Risk, Recurring and Partner Connections and reaches Payment methods and Internal services. (adyen-design-duty-architecture-2021)
- https://www.adyen.com/knowledge-hub/design-to-duty-adyen-architecture-part2 : three diagrams: the move from one accounting DB to a reporting DB to N accounting DBs; PAL to Queue to Queue processor to Accounting DB 1..N; and per-cluster streams feeding reporting tables and reports. (adyen-design-duty-accounting-2021)
- https://www.adyen.com/knowledge-hub/building-a-global-stream : "Diagram illustrating an example data replication flow across different regions and Kafka clusters." (adyen-globalstream-2025)

### Stated architectural principles (verbatim)
> "Instead of keeping the state in our edge layer, we decided to process modifications asynchronously, which keeps the edge layer stateless." (adyen-design-duty-architecture-2021, 2021-07)

> "All our externally exposed systems are prohibited from writing to central databases, reducing the risk of attackers compromising or stealing valuable data." (adyen-design-duty-architecture-2021, 2021-07)

> "In all our choices we are highly pragmatic, adhering to the KISS (keep it simple, stupid) principle almost to a fault." (adyen-design-duty-architecture-2021, 2021-07)

> "Whereas for the latter the priority was uptime, for the accounting systems we don't mind if they are down for a little bit as long as we can guarantee their reliability and consistency." (adyen-design-duty-accounting-2021, 2021-08)

> "The 20x scaling factor is a rule of thumb we often use internally when designing a solution or determining whether we are still satisfied with it." (adyen-design-duty-accounting-2021, 2021-08)

> "We do not outsource any administration to third parties, nor do we use any public cloud services for payment processing." (adyen-infrastructure-2026)

> "Like Pinterest, we make an effort to stay in the green zone when we add to our stack." (adyen-scaling-workflow-2018, 2018-01)

## Sources

Freshness: sources dated before 2021-11 are older than 5 years and are labeled with their year in the text above. Both Design to Duty posts (2021) were read in full; part two was read on dev.to and on adyen.com.

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| adyen-design-duty-architecture-2021 | Design to Duty: How we make architecture decisions at Adyen | Adyen | 2021-07 | https://www.adyen.com/knowledge-hub/design-to-duty-adyen-architecture | engineering-blog | Strong | yes |
| adyen-design-duty-accounting-2021 | Design to Duty: The Accounting and Reporting Systems at Adyen | Adyen (Willem Pino) | 2021-08 | https://www.adyen.com/knowledge-hub/design-to-duty-adyen-architecture-part2 | engineering-blog | Strong | yes |
| adyen-graph-db-2021 | The Adyen way of engineering: Our tech stack is open source or built in-house | Adyen (Burak Yildirim) | 2021-01 | https://www.adyen.com/knowledge-hub/the-adyen-way-of-engineering-oss-or-built-in-house | engineering-blog | Strong | yes |
| adyen-postgres-upgrade-2018 | Updating a 50 terabyte PostgreSQL database | Adyen (Reinier Haasjes) | 2018-03 | https://www.adyen.com/knowledge-hub/updating-a-50-terabyte-postgresql-database | engineering-blog | Strong | yes |
| adyen-sql-comments-2023 | Injecting metadata as comments in SQL queries | Adyen (Cosmin Octavian Pene) | 2023-02 | https://www.adyen.com/knowledge-hub/injecting-metadata-as-comments | engineering-blog | Strong | yes |
| adyen-partitioning-2023 | A Deep Dive into Table partitioning Part 2: Partitioning at Adyen | Adyen (Derk van Veen and Cosmin Octavian Pene) | 2023-10 | https://www.adyen.com/knowledge-hub/partitioning-at-adyen | engineering-blog | Strong | yes |
| adyen-partitioning-repo-2023 | Adyen/adyen-postgres-partitioning | Adyen (GitHub) | 2023-05 | https://github.com/Adyen/adyen-postgres-partitioning | repo | Strong | partial |
| adyen-pgconf-100tb-2025 | Operational hazards of managing PostgreSQL DBs over 100TB (PGConf.EU 2025 abstract and slides) | PostgreSQL Europe (speaker Teresa Lopes, Adyen) | 2025-10 | https://www.postgresql.eu/events/pgconfeu2025/schedule/session/6817-operational-hazards-of-managing-postgresql-dbs-over-100tb/ | talk | Strong | partial |
| adyen-globalstream-2025 | Building a GlobalStream: Replication Challenges and Optimizations | Adyen (Gaurav Singh and Luciano Sabença) | 2025-10 | https://www.adyen.com/knowledge-hub/building-a-global-stream | engineering-blog | Strong | yes |
| adyen-annual-report-2024 | Annual Report 2024 (letter to readers, web version) | Adyen | 2025 | https://investors.adyen.com/financials/2024 | filing | Strong | partial |
| adyen-h2-results-2026 | Adyen publishes H2 2025 financial results | Adyen | 2026-02 | https://www.adyen.com/press-and-media/adyen-publishes-h2-2025-financial-results-3pgu2 | filing | Strong | yes |
| adyen-job-java-madrid-2026 | Senior Software Engineer (Java), Madrid, job listing | Adyen | 2026-11 | https://job-boards.greenhouse.io/adyen/jobs/6924441 | job-listing | Medium | yes |
| adyen-job-payments-2026 | Senior Java Software Engineer, Payments, job listing | Adyen | 2026-11 | https://job-boards.greenhouse.io/adyen/jobs/7369512 | job-listing | Medium | yes |
| adyen-job-platform-2026 | Senior Platform Engineer, Container Services, job listing | Adyen | 2026-11 | https://job-boards.greenhouse.io/adyen/jobs/8255695 | job-listing | Medium | yes |
| adyen-job-observability-2026 | Senior Platform Engineer, Observability, job listing | Adyen | 2026-10 | https://job-boards.greenhouse.io/adyen/jobs/7607691 | job-listing | Medium | yes |
| adyen-job-cac-2026 | Manager, Product Experience Design, job listing (describes Core Accounting and Configuration) | Adyen | 2026-11 | https://job-boards.greenhouse.io/adyen/jobs/8227082 | job-listing | Medium | yes |
| adyen-infrastructure-2026 | Payments platform infrastructure | Adyen | 2026-11 (accessed; undated page) | https://www.adyen.com/infrastructure | docs | Strong | yes |
| adyen-design-20x-2020 | The Adyen way of engineering: we design for 20x (Miguel Gonzalez; older than 5 years) | Adyen | 2020-10 | https://www.adyen.com/knowledge-hub/the-adyen-way-of-engineering--we-design-for-20x | engineering-blog | Strong | yes |
| adyen-scaling-workflow-2018 | From 0 to $100 billion: Scaling infrastructure and workflow at Adyen (Michiel Toneman; older than 5 years) | Adyen | 2018-01 | https://www.adyen.com/knowledge-hub/from-0-100-billion-scaling-infrastructure-and-workflow-at-adyen | engineering-blog | Strong | yes |
