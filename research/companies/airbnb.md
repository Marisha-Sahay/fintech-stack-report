# Airbnb

**Category:** platform
**HQ / founded:** San Francisco, 2007 ("Airbnb was born in 2007 when two hosts welcomed three guests to their San Francisco home") (airbnb-about-2026)
**Scale signal:** The Payments Funds Ledger team describes "moving over $140 billion in funds annually across 190+ countries and more than 70 currencies" (job listing, 2025) (airbnb-funds-ledger-job-2025). Company fact sheet: 5.5M+ hosts, 2.5B+ guest arrivals all-time, 220+ countries and regions, as of May 2026 (airbnb-about-2026).
**Last researched:** 2026-11-11

## Summary
Airbnb builds its own payments platform (gateway, orchestration, ledger, idempotency, reconciliation) and buys processing from outside gateways and processors (airbnb-transactional-integrity-2018; airbnb-pay-as-a-local-2026). The money layer has been rebuilt in three steps: mutable ActiveRecord models in a Rails monolith with MySQL audit triggers (2015 to 2016), then an append-only payment gateway plus a double-entry subledger built in Spark and Scala (2016 to 2017), then a redesigned SOA orchestration built on immutable events, versioned plans and the Orpheus idempotency library (2019 to 2022) (airbnb-rails-payments-2015; airbnb-payments-platform-2016; airbnb-financial-reporting-2017; airbnb-payment-orchestration-2022). Correctness rests on idempotency records that are read and written only on a sharded MySQL primary, plus a separate Hive pipeline that compares every transaction across internal and external systems; Airbnb reports five nines (99.999%) of payment consistency (airbnb-orpheus-2019; airbnb-transactional-integrity-2018; airbnb-payment-orchestration-2022). The reason given for the redesign is that immutable data "is easier to understand, audit, and reconcile" (airbnb-payment-orchestration-2022). How the Java payment services talk to the database (ORM or SQL-first) is not described in any public source found.

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Java (payment services); Scala (financial reporting); Ruby on Rails (legacy); Kotlin in Skipper workflows | Strong | airbnb-transactional-integrity-2018; airbnb-financial-reporting-2017; airbnb-rails-payments-2015; airbnb-skipper-2026 |
| Main frameworks | Dropwizard with Thrift IDL for Java services (2017); Rails and ActiveRecord (legacy); Apache Spark for reporting | Strong | airbnb-services-java-2017; airbnb-rails-payments-2015; airbnb-financial-reporting-2017 |
| Primary OLTP store(s) | MySQL (idempotency tables on a sharded primary); AWS RDS in 2016; MySQL-compatible fleet in 2026 | Strong | airbnb-orpheus-2019; airbnb-web-tier-mysql-2016; airbnb-mysql-replay-2026 |
| Service-layer persistence | Legacy Rails: ActiveRecord behind in-house ProtectedAccess layer that writes new versions. Java SOA: No public source found | Strong (legacy only) | airbnb-rails-payments-2015 |
| Money / ledger model | Append-only gateway records; double-entry subledger in reporting pipeline; immutable events plus versioned payment plans; Funds Ledger service | Strong (Medium for Funds Ledger) | airbnb-payments-platform-2016; airbnb-financial-reporting-2017; airbnb-payment-orchestration-2022; airbnb-funds-ledger-job-2025 |
| Messaging / streaming | Kafka message bus between payment services; Kafka-based CDC for read stores | Strong | airbnb-payment-orchestration-2022; airbnb-riverbed-2023 |
| Infrastructure | AWS (RDS for MySQL in 2016, S3 for processor reports in 2018); Hadoop, Hive, HDFS, Airflow for integrity checks | Strong | airbnb-web-tier-mysql-2016; airbnb-transactional-integrity-2018 |
| Scaling approach | Split payments into domain services; shard idempotency data by key; denormalized Elasticsearch read store; Spark for reporting | Strong | airbnb-orpheus-2019; airbnb-payments-read-layer-2022; airbnb-financial-reporting-2017; airbnb-pay-as-a-local-2026 |
| Build vs buy (core) | Build: gateway, orchestration, ledger, idempotency, workflows. Buy: gateways, processors and PSPs | Strong | airbnb-transactional-integrity-2018; airbnb-pay-as-a-local-2026 |
| Notable open source | Skipper workflow engine (2026, Apache 2.0); Airflow. Orpheus: no public release found | Strong | airbnb-skipper-oss-2026; airbnb-transactional-integrity-2018 |

## Languages and frameworks
- In the Rails era, payments ran in the Rails monolith; a 2015 post by a payments engineer argued that payments "might seem more suited for a strongly typed language where the database access model is more restrictive" but that Airbnb kept Rails and worked around its issues (2015) (airbnb-rails-payments-2015).
- By 2016 Airbnb's web application was "powered by Ruby on Rails and Java", with the Rails monolith calling several Java services (2016) (airbnb-web-tier-mysql-2016).
- In 2017, "backend services are mostly written in Java using the Dropwizard web service framework", with Thrift used as the service IDL and generated Java and Ruby clients (2017) (airbnb-services-java-2017).
- The new payment gateway was "a Java Service with a dedicated datastore" (2018) (airbnb-transactional-integrity-2018).
- Orpheus, the idempotency library, uses Java lambdas to combine database work into one transaction (2019) (airbnb-orpheus-2019).
- The financial reporting pipeline is "powered by Apache Spark, stored on our HDFS cluster, and written in Scala" (2017) (airbnb-financial-reporting-2017).
- In 2026, payment method configs generate "Java classes, DTOs, enums, schema, and integration scaffolding" (airbnb-pay-as-a-local-2026).
- Skipper, the embedded workflow engine used by payments and wallet teams, exposes workflows as Java or Kotlin classes; its published example is a Kotlin charge-and-accept reservation workflow (airbnb-skipper-2026; airbnb-skipper-oss-2026).
- The 2018 SOA talk gave a performance reason for Java: the Ruby monolith was single-threaded, and Java services could parallelize requests (2018) (airbnb-soa-migration-talk-2018).

## The money layer (ledger, balances, payments)
- Rails era: "our core payment objects were mutable by default", and Airbnb relied on database triggers on core payment tables to copy every create, update and delete into audit tables, then reverse-engineered those rows with SQL to build financial reports (2016) (airbnb-payments-platform-2016).
- The financial reporting system from early 2012 to late 2016 was a nightly MySQL ETL fed by those triggers; Airbnb called the triggers "a temporary solution to deal with the inherent mutability of the production data" (2017) (airbnb-financial-reporting-2017).
- Payments V2 (2016) added three systems: a Billing Interface API, a Payments Gateway and a Financial Data Pipeline (2016) (airbnb-payments-platform-2016).
- In the gateway, "All payment transactions pass through this API layer and are recorded using an append-only data model", and payment events are distributed via Kafka (2016) (airbnb-payments-platform-2016).
- The financial pipeline converts platform events and payment events into accounting events, then into a subledger. Each subledger entry records time, amount, currency, direction (credit or debit) and account, and "The subledger is generated using double entry accounting" (2017) (airbnb-financial-reporting-2017).
- Alterations are handled by unbooking and rebooking the whole reservation rather than booking a delta, because "when alterations add up, it's much easier to just unbook and rebook" (2017) (airbnb-financial-reporting-2017).
- The 2022 orchestration redesign is built on immutability in two forms: append-only "persistent events" and "versioning", where a change to a product (such as adding a night) becomes a new version in a sequence of payment plans (airbnb-payment-orchestration-2022).
- The new orchestration uses a data model "based around the concept of a bill" that is not tied to any one product (airbnb-payment-orchestration-2022).
- In 2026 the core payment domain lists subdomains including Pay-in, Payout, Transaction Fulfillment, Processing, Wallet and instruments, Ledger, Incentives and Stored Value, Issuing, and Settlement and Reconciliation (airbnb-pay-as-a-local-2026).
- A 2025 job listing describes the Payments Funds Ledger as the "single source of truth for all types of value on the Airbnb marketplace", covering guest pay-ins, host payouts, incentives and stored value, with freeze controls and reconciliation (Medium evidence) (airbnb-funds-ledger-job-2025).
- The storage engine and data model of the current Funds Ledger: No public source found.

## Service-layer persistence and databases
- Rails era: ActiveRecord directly. Airbnb added an in-house layer, ProtectedAccess, that replaces ActiveRecord::Base, hides most mutation methods, and on save "creates and saves a new version of the record instead of overwriting the existing version" (2015) (airbnb-rails-payments-2015).
- The stated problem with plain ActiveRecord: with mass updates such as update_all "there is no way to enforce that every database change creates an audit trail", so the only way to capture all mutations was database triggers (2015) (airbnb-rails-payments-2015).
- Business logic moved into service objects so models stay "lean and focused only on data retrieval and storage" (2015) (airbnb-rails-payments-2015).
- MySQL is the payments OLTP store in the public record: "our systems are backed by MySQL" (2019) (airbnb-orpheus-2019). In 2016 Airbnb ran MySQL on AWS RDS and partitioned databases by application (2016) (airbnb-web-tier-mysql-2016).
- Idempotency tables are "always read and written from a sharded master database (for consistency)", sharded by idempotency key (2019) (airbnb-orpheus-2019).
- Replica reads are avoided for payments: "we mostly disable replica reads, trading off load on the main database for data integrity" (2015) (airbnb-rails-payments-2015; airbnb-orpheus-2019).
- After the SOA split, payments data sat across 100+ data models; Airbnb built a read layer that denormalizes 10+ tables into Elasticsearch indices via a read-optimized store framework fed by database change capture and daily Hive dumps (2022) (airbnb-payments-read-layer-2022). That framework (Riverbed) consumes CDC events "via a Kafka-based system" and lists payments among its users (2023) (airbnb-riverbed-2023).
- Skipper stores workflow state "in the same database the host service already uses: either MySQL or Airbnb's internal Unified Data Store" (2026) (airbnb-skipper-2026).
- Company-wide in 2026, "MySQL-compatible databases are a critical backbone of our online database infrastructure", a fleet of hundreds of clusters, upgraded from MySQL 5.7 to 8.0 using production traffic replay (airbnb-mysql-replay-2026).
- Which Java data-access library the payment services use (JPA/Hibernate, JDBI, jOOQ, MyBatis or plain JDBC): No public source found.

## Scale
- 2016: 191 countries, over 70 currencies, over two dozen payment routes (2016) (airbnb-payments-platform-2016).
- 2017: 191 countries, 70+ currencies, 20+ processors (2017) (airbnb-financial-reporting-2017).
- The old MySQL ETL ran over 24 hours and could only run every other day; the Spark replacement ran in 4 to 5 hours as of March 2017 (2017) (airbnb-financial-reporting-2017).
- After Orpheus launched, annual payment volume doubled while consistency held at five nines (2019) (airbnb-orpheus-2019).
- The unified read layer gave up to 150x latency improvements on Transaction History and raised reliability from about 96% to 99.9+%; Guest Payment History saved close to $1.5M in support costs in 2021 (airbnb-payments-read-layer-2022).
- Riverbed processes 2.4B events and writes 350M documents a day across 50+ materialized views (2023) (airbnb-riverbed-2023).
- Funds Ledger: over $140B a year (2025 job listing, Medium) (airbnb-funds-ledger-job-2025).

## Build vs buy
- Airbnb chose early to own payments: the 2016 post says the decision "to own payments and keep it as a core part of the platform experience continues to be the right one" (2016) (airbnb-payments-platform-2016).
- Processing is bought: "Airbnb integrates with a handful of gateways and dozens of processors to achieve global coverage and payments redundancy" (2018) (airbnb-transactional-integrity-2018). In 2026 the platform works "with regulated payment service providers and financial partners" through a connector and plugin architecture (airbnb-pay-as-a-local-2026).
- Built in-house: payment gateway, billing interface, financial data pipeline (2016) (airbnb-payments-platform-2016); Orpheus idempotency library (2019) (airbnb-orpheus-2019); a PSP Emulator for testing (2026) (airbnb-pay-as-a-local-2026); Skipper workflow engine (2026) (airbnb-skipper-2026).
- Reconciliation: Airbnb evaluated third-party tools and found that they "focused on accounting aspects and provided process management toolkits, but these features don't contribute to transactional integrity directly", so it built its own pipeline (2018) (airbnb-transactional-integrity-2018).
- Orpheus was built as a library, not a service, because a separate idempotency service would add latency and "would suffer from the same problems it was originally intended to solve" (2019) (airbnb-orpheus-2019).
- Skipper was built because external orchestration engines need dedicated infrastructure and Tier 0 services could not add new critical dependencies; it was open-sourced under Apache 2.0 on 2026-11-10 (airbnb-skipper-2026; airbnb-skipper-oss-2026).
- Core banking vendor: not applicable; No public source found of a third-party ledger product.

## Correctness (idempotency, reconciliation, audit)
- Goal stated for idempotency: "if a single operation to move money is called multiple times, the underlying system should move money at most once" (2019) (airbnb-orpheus-2019).
- Orpheus splits each request into Pre-RPC, RPC and Post-RPC phases, with two rules: no network calls in the Pre and Post-RPC phases, and no database work in the RPC phase. Pre and Post-RPC database commits are each wrapped in a single transaction (2019) (airbnb-orpheus-2019).
- Errors are classified as retryable (5XX, transient) or non-retryable (4XX, validation), with a custom exception class that defaults to non-retryable (2019) (airbnb-orpheus-2019).
- Each request takes a row-level lock on its idempotency key as an expiring lease; responses are recorded so retries get the stored result (2019) (airbnb-orpheus-2019).
- Clients must persist idempotency keys before calling, reuse them on retry, and never mutate the payload between retries (2019) (airbnb-orpheus-2019).
- The 2022 orchestration splits each major workflow into a directed acyclic graph of retryable idempotent steps, and "Event processors use the idempotency framework to enhance the at-least-once guarantee of Kafka into an exactly-once guarantee" (airbnb-payment-orchestration-2022).
- Transactional integrity pipeline: processor settlement reports are imported via SFTP to S3, database snapshots land in HDFS, and Hive pipelines compare every transaction from "day zero" across payments, refunds, payouts and returns, producing a single integrity number; anomalies feed Druid and Superset dashboards and alerts (2018) (airbnb-transactional-integrity-2018).
- Airbnb separates this from reconciliation: integrity compares every transaction at every stage, including voided authorizations where no money moves, while reconciliation usually matches only platform and processor records (2018) (airbnb-transactional-integrity-2018).
- During the SOA migration, asynchronous "matchup" jobs compared the new and old data models to check both code paths produced the same results (airbnb-payment-orchestration-2022).
- The financial pipeline has unit tests per event handler plus smoke tests ("rules we expect our data to follow") and a suite of real transactions (2017) (airbnb-financial-reporting-2017).
- Riverbed runs a Spark batch job that reconciles events missed by the streaming path (2023) (airbnb-riverbed-2023).
- Audit trail in the Rails era came from ProtectedAccess versioned writes and MySQL triggers (2015 to 2017) (airbnb-rails-payments-2015; airbnb-financial-reporting-2017).

## Changes over time (migrations and reasons)
- 2008: payments were offline cash between guest and host; then guests paid via PayPal and hosts got paper checks (airbnb-payments-platform-2016).
- 2015: Airbnb kept Rails for payments but added ProtectedAccess, service objects, parameter validation and primary-only reads to fix audit, testability and failure behavior (airbnb-rails-payments-2015).
- Early 2012 to late 2016: MySQL ETL financial reporting, replaced by an event-based Spark and Scala pipeline because SQL "is not designed to handle complicated business data flow" and nightly runs passed 24 hours (airbnb-financial-reporting-2017).
- 2016: Payments V2 introduced the billing interface, payment gateway and financial pipeline because processor integrations were slow, interfaces were missing, and reporting from audit trails "limited our ability to change the schema of our core DB tables" (airbnb-payments-platform-2016).
- By 2018: a Java payment gateway with its own datastore was ramping up next to the legacy transaction store, which created two stores that could drift (airbnb-transactional-integrity-2018). The 2018 post says Airbnb was "in the middle of redesigning our framework to achieve near perfect idempotency" (airbnb-transactional-integrity-2018); Orpheus followed in 2019 (airbnb-orpheus-2019).
- Monolith to SOA (company-wide): reasons given were tight coupling, a codebase that was hard to debug and deploy, and about 15 hours on average when Monorail deploys were blocked, around 2015 (2018) (airbnb-soa-migration-talk-2018).
- Payments SOA (post published 2022-02): payments chose a full redesign instead of a one-to-one port, in four phases (Pricing, Payouts, Bookings, Data Migration), running two orchestration systems in parallel for almost the whole migration; Airbnb notes the redesign "took longer to complete" than a straight port (airbnb-payment-orchestration-2022).
- 2022: the SOA split made reads hard (clients had to call many services), so Airbnb added a unified, denormalized read layer (airbnb-payments-read-layer-2022).
- 2026: "Payments LTA (long-term architecture)", a multi-year replatforming from a monolithic system to "a capability-oriented services system structured by domains" (airbnb-pay-as-a-local-2026).

## Stated reasons (verbatim quotes)
> "payments applications typically require strong transactional integrity, a robust audit trail and very predictable failure behavior." (airbnb-rails-payments-2015, 2015)

> "ActiveRecord makes it trivially easy to make database changes, making it hard to ensure that every part of the code that mutates data actually records an audit trail." (airbnb-rails-payments-2015, 2015)

> "For payments, we mostly disable replica reads, trading off load on the main database for data integrity." (airbnb-rails-payments-2015, 2015)

> "Because we were using Rails, we relied on simple ActiveRecord models to access the database and its data; thus our core payment objects were mutable by default." (airbnb-payments-platform-2016, 2016)

> "The financial data pipeline is also constructed around the principle of double-entry bookkeeping, which means money must be added somewhere and removed from somewhere else. In other words, money can't be created out of thin air." (airbnb-payments-platform-2016, 2016)

> "We chose Scala as the language because we wanted the latest features of Spark, as well as the other benefits of the language, like types, closures, immutability, lazy evaluation, etc." (airbnb-financial-reporting-2017, 2017)

> "This was meant to be a temporary solution to deal with the inherent mutability of the production data. We acknowledge that it wasn't a great pattern, but it was necessary at the time." (airbnb-financial-reporting-2017, 2017)

> "We chose a library as a solution because it offers low latency while still providing clean separation between high-velocity product code and low-velocity system management code." (airbnb-orpheus-2019, 2019)

> "If a database system is not configured for strong read-consistency (our systems are backed by MySQL), using replicas for these operations could actually create adverse effects from an idempotency perspective." (airbnb-orpheus-2019, 2019)

> "Since the launch of the framework, we have achieved five nines in consistency for our payments, while our annual payment volume has simultaneously doubled" (airbnb-orpheus-2019, 2019)

> "Immutable data is easier to understand, audit, and reconcile." (airbnb-payment-orchestration-2022, 2022)

> "While many teams at Airbnb chose to create a one-to-one replacement when migrating to SOA, the payments organization instead decided to use it as an opportunity to fundamentally redesign our services to provide a sound technical foundation for future growth." (airbnb-payment-orchestration-2022, 2022)

> "SOA itself is not a reason to do for performance gains, but because we were in a Ruby monolith, it was single-threaded. We moved a lot of our services into Java, which is multithreaded, giving us the ability to benefit from parallelization of requests." (airbnb-soa-migration-talk-2018, 2018)

## Open questions
- Which Java data-access approach the payment services use (JPA/Hibernate, JDBI, jOOQ, MyBatis, plain JDBC). No public source found.
- Whether the current Funds Ledger is itself a double-entry store at the OLTP level, or whether double-entry lives only in the reporting subledger described in 2017. Unverified.
- Whether payment services moved to the "MySQL-compatible engine", the distributed database on Kubernetes, or the Unified Data Store mentioned in 2025 to 2026 posts. Unverified.
- Exact start and end years of the payments SOA migration. The 2022 post gives no years; secondary sources say 2017 to 2020 or start in 2018. Unverified.
- Whether the Kafka-based CDC that feeds payments read stores is SpinalTap. Unverified; the posts read do not name it.
- How immutable payment events and versioned plans handle personal-data deletion requests. No public source found.
- Method note: medium.com returned HTTP 403 to direct fetches. The Medium posts in the table were read in full through the Airbnb Tech Blog's official Medium RSS feeds (feed/airbnb-engineering/tagged/payments, fintech, microservices, mysql, infrastructure), which carry the full post text.

## System architecture

Airbnb describes its money path as product-agnostic billing and pricing APIs, a payment orchestration layer that runs each workflow as a DAG of idempotent steps over a Kafka bus, and a gateway or Processing layer that routes to outside PSPs through connectors and plugins; the ledger and reconciliation run beside this path, fed by events (airbnb-payments-platform-2016; airbnb-payment-orchestration-2022; airbnb-pay-as-a-local-2026). The public record on regions and disaster recovery for payments is empty: the only topology Airbnb describes is AWS availability zones for a general-purpose database and Kubernetes clusters for services (airbnb-ha-database-2025; airbnb-istio-upgrades-2025).

### Money path

No Airbnb source gives one end-to-end sequence for today's system. The order below joins the 2016 and 2022 descriptions with the 2026 subdomain list, and each step names the source it comes from.

1. Client checkout. The backend sends clients "configuration payloads" that define which payment fields to collect, and eligibility checks are centralized in the backend, driven by a YAML Payment Method Config (airbnb-pay-as-a-local-2026).
2. Billing Interface, later the billing and pricing APIs. In 2016 the Billing Interface turned each product into abstract items with fees and taxes, made that checkout model "the source of truth for any subsequent changes to the purchase", and emitted platform events to the Kafka message bus (2016) (airbnb-payments-platform-2016). The 2022 redesign replaced stay-specific logic with "generic billing and pricing APIs" and a data model "based around the concept of a bill" (airbnb-payment-orchestration-2022).
3. Payment orchestration. Coordinates each payment workflow and keeps "eventual consistency" with the payment gateway layer and product fulfillment services, using the Orpheus idempotency framework (airbnb-payment-orchestration-2022). In 2026 the asynchronous orchestration was rebuilt on top of Multi-Step Transactions (MST) (airbnb-pay-as-a-local-2026).
4. Payments Gateway, now the Processing subdomain. The 2016 gateway offered "a unified API that supports bi-directional transactions" (pay-ins and payouts), recorded every transaction in an append-only model, and emitted payment events to Kafka (2016) (airbnb-payments-platform-2016). By 2018 it was "a Java Service with a dedicated datastore" (airbnb-transactional-integrity-2018). In 2026 the Processing subdomain "enables integration with third-party payment service providers (PSPs)", covers API and file-based vendor integration and "switching and routing", and uses a connector and plugin architecture in which a vendor plugin normalizes the PSP's response into an ActionPayload (airbnb-pay-as-a-local-2026).
5. External gateways, processors and acquirers. Airbnb chooses among combinations of "gateway, processor, and acquirer" (2016) (airbnb-payments-platform-2016) and integrates "a handful of gateways and dozens of processors" for coverage and redundancy (2018) (airbnb-transactional-integrity-2018). Redirect methods return a result token that the platform uses to confirm with the processor; asynchronous methods (for example QR code wallets) report success by webhook (airbnb-pay-as-a-local-2026). The FY2025 10-K says Airbnb relies on third-party payment service providers to process guest payments and host payouts (airbnb-10k-2025).
6. Ledger. The 2026 domain map lists a Ledger subdomain next to Pay-in, Payout, Transaction Fulfillment and Processing (airbnb-pay-as-a-local-2026), and a 2025 job listing calls the Payments Funds Ledger the "single source of truth" for value on the marketplace (Medium evidence) (airbnb-funds-ledger-job-2025). Whether the ledger write is inside the synchronous payment call or fed by events: No public source found. The 2016 design fed a double-entry subledger offline from platform and payment events (2016) (airbnb-payments-platform-2016; airbnb-financial-reporting-2017).
7. Settlement and Reconciliation. Listed as its own subdomain in 2026 (airbnb-pay-as-a-local-2026). The only detailed public design is the 2018 offline transactional integrity pipeline, described under Data platform below (airbnb-transactional-integrity-2018).

### Orchestration

- Payments orchestration (post published 2022-02): "Every major workflow is divided into a directed acyclic graph (DAG) of retryable idempotent steps, each with well-defined behavior." Services exchange events over "a Kafka-based message bus", and event processors use Orpheus to turn Kafka's at-least-once delivery into exactly-once processing (airbnb-payment-orchestration-2022).
- Changes to a booking are not updates in place: a change such as adding a night is "modeled as a new version in a sequence of plans for that product", and the event consumer decides whether a new event modifies an existing one (airbnb-payment-orchestration-2022).
- The 2022 post does not describe sagas or a state machine; coordination is the step DAG plus idempotent event processing (airbnb-payment-orchestration-2022).
- Migration control: a transformation layer read from old or new storage transparently, and teams ran "two parallel payment orchestration systems" for nearly the whole migration because historical bookings were not moved (airbnb-payment-orchestration-2022).
- Multi-step PSP flows (2026): MST is "a processor-agnostic framework that supports payment flows completed across multiple stages" and defines "a PSP-agnostic transaction language"; a step that needs the user (redirect, QR scan) returns a transaction intent status of ACTION_REQUIRED, and the flow resumes on a redirect token or a PSP webhook (airbnb-pay-as-a-local-2026).
- Skipper, the embedded workflow engine (2026): runs "15+ use cases across insurance, payments, media, infrastructure, incentives, and wallet teams"; stores workflow state "in the same database the host service already uses", MySQL or the internal Unified Data Store; checkpoints each action and replays the workflow method after a crash, with a persistent scheduler that picks up work "after a lease period expires" (airbnb-skipper-2026).
- Skipper's compensation model: an @Compensate method undoes an action, compensations run in reverse order, and Airbnb calls the result "eventual consistency without distributed transactions" (airbnb-skipper-2026). The open-source release describes this as "Saga-style compensation" and ships MySQL and SQLite adapters (airbnb-skipper-oss-2026).
- Why embedded and not a central engine: external engines need dedicated infrastructure, and for Tier 0 services ("services which directly impact user-facing transactions") a new critical dependency was "problematic" (airbnb-skipper-2026). Peak load reported: 10,000 workflows per second on Amazon DynamoDB (airbnb-skipper-2026).
- Which payment flows run on Skipper rather than the 2022 orchestration layer: No public source found.
- Source note: the Skipper facts above were read from the airbnb.tech copy of the same post (https://airbnb.tech/infrastructure/skipper-building-airbnbs-embedded-workflow-engine/), because medium.com rate-limited the feed.

### Deployment topology

- Cloud, not own data centers: Airbnb ran MySQL on AWS RDS in 2016 (2016) (airbnb-web-tier-mysql-2016), kept processor settlement files in Amazon S3 in 2018 (airbnb-transactional-integrity-2018), and in 2025 ran a distributed SQL database on Kubernetes on AWS (airbnb-ha-database-2025).
- Availability zones (2025, general database, not stated as payments): each database is deployed "across three independent Kubernetes clusters, each within a different AWS availability zone", clusters are overprovisioned to survive the loss of a whole zone, and there is "a replica in each AZ"; new configs and versions roll out to one zone's cluster first (airbnb-ha-database-2025).
- Airbnb runs self-managed Kubernetes for these databases because "Cloud managed Kubernetes might not offer rollbacks once the control plane is upgraded", which it calls a disaster recovery risk (airbnb-ha-database-2025).
- Service fleet: "tens of thousands of pods, dozens of Kubernetes clusters, and thousands of VMs" behind the mesh (airbnb-istio-upgrades-2025); in 2022, "thousands of nodes across nearly a hundred clusters" (airbnb-k8s-scaling-2022).
- Redundancy at the edge of the money path comes from multiple processors: Airbnb integrates several gateways and processors "to achieve global coverage and payments redundancy" (2018) (airbnb-transactional-integrity-2018).
- Number of AWS regions, active-active versus active-standby for payments, cells or units, and payments disaster recovery targets: No public source found.

### Platform layer

- Service framework: Java services on Dropwizard, extended with a customized Thrift IDL, with transport switched "from JSON-over-Http to Thrift-over-Http" (2017) (airbnb-services-java-2017).
- Code generation and RPC: the service API is defined in .thrift files, and "the service resource method boilerplate code and the entire client code are generated from the service's Thrift IDL", producing Ruby and Java RPC clients (2018) (airbnb-services-part2-2018).
- Resilience in the client: "Our standard inter-service client implements timeout, retry, and circuit breaker patterns", and "We added Envoy to our service discovery stack, which supports outlier detection." The same post says "Most of our core booking flow services are Java services." (2018) (airbnb-services-part3-2018).
- By 2020 Airbnb had "a standardized service platform centered around Thrift service IDL", and the deploy pipeline locks a provider service from deploying if an unexpected live response is caught (2020) (airbnb-services-part4-2020).
- Service mesh: Istio since 2019, "Sidecar mode exclusively", with "one management cluster, which runs Istiod" and multiple workload clusters; VMs join the mesh and workloads send "tens of millions of QPS at peak" through it (airbnb-istio-upgrades-2025).
- Deployment: Kubernetes workloads are defined through an internal API, and the in-house Krispr mutation framework injects configuration at CI time and pod admission (airbnb-istio-upgrades-2025). In 2020 Krispr ran "hundreds of workloads in Kubernetes across tens of clusters and thousands of nodes", with logging, metrics and service discovery in sidecars (2020) (airbnb-krispr-2020).
- Payments-specific: the gateway is a Java service (2018) (airbnb-transactional-integrity-2018) and payment method configs generate Java classes and DTOs (airbnb-pay-as-a-local-2026). Whether payment services run on Kubernetes, VMs or both, and whether they use the Thrift IDL platform: No public source found.

### Data platform

- 2016 to 2017: the Billing Interface sent platform events and the Payments Gateway sent payment events over Kafka to the Financial Data Pipeline, "a Spark + Scala based financial reporting application" that builds a double-entry subledger (2016) (airbnb-payments-platform-2016); it runs on Airbnb's HDFS cluster (2017) (airbnb-financial-reporting-2017).
- Reconciliation and integrity (2018): database snapshots land in HDFS "at regular intervals", processor settlement files go to Amazon S3, Hive jobs compare transaction models across systems, Airflow schedules the jobs, and results feed Druid and Superset dashboards (airbnb-transactional-integrity-2018).
- Read path (2022): a read layer denormalizes "10+ tables into a couple of Elasticsearch indices", fed by "near real-time data via database change capture mechanisms" and "daily database dumps stored in Hive" (airbnb-payments-read-layer-2022).
- Riverbed (2023), the framework behind that read layer, consumes CDC events through a Kafka-based system and runs a Spark batch job to reconcile anything the streaming path missed; payments is a named user (airbnb-riverbed-2023).
- SpinalTap is Airbnb's open-source CDC service; its README configures MySQL binlog as the source and Kafka as the destination (airbnb-spinaltap-repo-2026). No source read ties payments CDC to SpinalTap.
- Operational metrics (2026): "a centralized monitoring framework that unifies metrics across all layers, from client to PSP", split into client, payment backend, PSP and webhook metrics (airbnb-pay-as-a-local-2026).
- Which warehouse holds the current Funds Ledger output, and whether the 2017 Spark subledger still produces the books: No public source found.

### Published architecture diagrams

| page | what the diagram shows | key |
|---|---|---|
| https://medium.com/airbnb-engineering/scaling-airbnbs-payment-platform-43ebfc99b324 | Uncaptioned figure placed right after the text introducing the Billing Interface, Payments Gateway and Financial Data Pipeline; content inferred from placement only | airbnb-payments-platform-2016 |
| https://medium.com/airbnb-engineering/measuring-transactional-integrity-in-airbnbs-distributed-payment-ecosystem-a670d6926d22 | Caption "Diagram depicting various entities payment must be passed through during the payment process", plus a diagram of the integrity pipeline | airbnb-transactional-integrity-2018 |
| https://medium.com/airbnb-engineering/avoiding-double-payments-in-a-distributed-payments-system-2981f6b070bb | Network calls kept apart from database transactions; retry reading a stored response from the replica versus the primary | airbnb-orpheus-2019 |
| https://medium.com/airbnb-engineering/rebuilding-payment-orchestration-at-airbnb-341d194a781b | Caption "The payments SOA migration decoupled product fulfillment, payment orchestration, and pricing." | airbnb-payment-orchestration-2022 |
| https://medium.com/airbnb-engineering/unified-payments-data-read-at-airbnb-e613e7af1a39 | Old monolith with payments databases; per-subdomain services and tables after SOA; presentation services calling one read layer; the read-optimized store ingestion flows | airbnb-payments-read-layer-2022 |
| https://medium.com/airbnb-engineering/riverbed-optimizing-data-access-at-airbnbs-scale-c37ecf6456d9 | Caption "Figure 1. Airbnb SOA dependency graph" | airbnb-riverbed-2023 |
| https://airbnb.tech/payments/pay-as-a-local/ | How payment method configs flow from backend to frontend; an uncaptioned Payments LTA diagram whose content the text does not describe | airbnb-pay-as-a-local-2026 |
| https://airbnb.tech/infrastructure/skipper-building-airbnbs-embedded-workflow-engine/ | A host service in which a workflow links a scheduler, action executor and Skipper Engine, with signals in and actions out to external services | airbnb-skipper-2026 |
| https://airbnb.tech/open-source/skipper-airbnbs-embedded-workflow-engine-is-now-open-source/ | External workflow service with its own state store, next to Skipper embedded in the service sharing one data store | airbnb-skipper-oss-2026 |
| https://airbnb.tech/uncategorized/seamless-istio-upgrades-at-scale/ | Istio deployment: one config cluster running Istiod, workload clusters and VMs; a second figure shows two Istiod revisions side by side | airbnb-istio-upgrades-2025 |
| https://medium.com/airbnb-engineering/building-services-at-airbnb-part-2-142be1c5d506 | Request and response context propagation; standard server and client dashboards generated from the IDL (2018) | airbnb-services-part2-2018 |

### Stated architectural principles (verbatim)

> "All payment transactions pass through this API layer and are recorded using an append-only data model." (airbnb-payments-platform-2016, 2016)

> "Every major workflow is divided into a directed acyclic graph (DAG) of retryable idempotent steps, each with well-defined behavior." (airbnb-payment-orchestration-2022, 2022)

> "All of the new payment services were built around the idea of data immutability." (airbnb-payment-orchestration-2022, 2022)

> "This architecture ensures consistent handling of complex, multi-step payment experiences across diverse PSPs and markets." (airbnb-pay-as-a-local-2026, 2026)

> "An orchestration cluster outage would mean every dependent service would lose the ability to start or advance workflows." (airbnb-skipper-2026, 2026)

> "If one service's workflow processing fails, other services continue independently." (airbnb-skipper-2026, 2026)

> "Our standard inter-service client implements timeout, retry, and circuit breaker patterns." (airbnb-services-part3-2018, 2018)

> "We must be able to roll back an upgrade across all workloads, without coordinating every workload team." (airbnb-istio-upgrades-2025, 2025)

> "Our Kubernetes cluster alignment with AWS AZ also means that any underlying infrastructure issues or bad deployments have a limited blast radius" (airbnb-ha-database-2025, 2025; sentence continues)

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| airbnb-rails-payments-2015 | Large Scale Payments Systems and Ruby on Rails | Airbnb Tech Blog (Michel Weksler; first published on nerds.airbnb.com 2015-02-26, reposted on Medium 2016-03-04) | 2015-02 | https://medium.com/airbnb-engineering/large-scale-payments-systems-and-ruby-on-rails-bfe5b89f6f4 | engineering-blog | Strong | yes |
| airbnb-payments-platform-2016 | Scaling Airbnb's Payment Platform | Airbnb Tech Blog (Angela Zhu, Karen Kim) | 2016-09 | https://medium.com/airbnb-engineering/scaling-airbnbs-payment-platform-43ebfc99b324 | engineering-blog | Strong | yes |
| airbnb-web-tier-mysql-2016 | Unlocking Horizontal Scalability in Our Web Serving Tier | Airbnb Tech Blog (Liang Guo) | 2016-10 | https://medium.com/airbnb-engineering/unlocking-horizontal-scalability-in-our-web-serving-tier-d907449cdbcf | engineering-blog | Strong | partial |
| airbnb-financial-reporting-2017 | Tracking the money: Scaling financial reporting at Airbnb | Airbnb Tech Blog (Alice Liang) | 2017-03 | https://medium.com/airbnb-engineering/tracking-the-money-scaling-financial-reporting-at-airbnb-6d742b80f040 | engineering-blog | Strong | yes |
| airbnb-services-java-2017 | Building Services at Airbnb, Part 1 | Airbnb Tech Blog (Liang Guo, Frank Lin, Junjie Guan) | 2017-12 | https://medium.com/airbnb-engineering/building-services-at-airbnb-part-1-c4c1d8fa811b | engineering-blog | Strong | partial |
| airbnb-transactional-integrity-2018 | Measuring transactional integrity in Airbnb's distributed payment ecosystem | Airbnb Tech Blog (Ninad Khisti, William Betz) | 2018-01 | https://medium.com/airbnb-engineering/measuring-transactional-integrity-in-airbnbs-distributed-payment-ecosystem-a670d6926d22 | engineering-blog | Strong | yes |
| airbnb-soa-migration-talk-2018 | The Great Migration: from Monolith to Service-Oriented (QCon San Francisco 2018, transcript) | InfoQ (speaker Jessica Tai, Airbnb) | 2018-12 | https://www.infoq.com/presentations/airbnb-soa-migration/ | talk | Strong | partial |
| airbnb-orpheus-2019 | Avoiding double payments in a distributed payments system | Airbnb Tech Blog (Jon Chew, Ninad Khisti) | 2019-04 | https://medium.com/airbnb-engineering/avoiding-double-payments-in-a-distributed-payments-system-2981f6b070bb | engineering-blog | Strong | yes |
| airbnb-payment-orchestration-2022 | Rebuilding Payment Orchestration at Airbnb | Airbnb Tech Blog (Bryon Ross and others) | 2022-02 | https://medium.com/airbnb-engineering/rebuilding-payment-orchestration-at-airbnb-341d194a781b | engineering-blog | Strong | yes |
| airbnb-payments-read-layer-2022 | Unified Payments data read at Airbnb | Airbnb Tech Blog (Ali Goksel, Linglong Zhu, Yixia Mao) | 2022-06 | https://medium.com/airbnb-engineering/unified-payments-data-read-at-airbnb-e613e7af1a39 | engineering-blog | Strong | yes |
| airbnb-riverbed-2023 | Riverbed: Optimizing data access at Airbnb's scale | Airbnb Tech Blog (Amre Shakim) | 2023-07 | https://medium.com/airbnb-engineering/riverbed-optimizing-data-access-at-airbnbs-scale-c37ecf6456d9 | engineering-blog | Strong | partial |
| airbnb-funds-ledger-job-2025 | Staff Software Engineer, Payments Funds Ledger (copy of Airbnb listing, removed 2025-08-20) | Airbnb via Built In Austin | 2025 | https://www.builtinaustin.com/job/staff-software-engineer-payments-funds-ledger/4789884 | job-listing | Medium | yes |
| airbnb-pay-as-a-local-2026 | Pay as a Local: How Airbnb rolled out 20+ locally relevant payment methods worldwide in just 14 months | Airbnb Tech Blog (Gerum Haile and others; Medium original 2026-01-12) | 2026-01 | https://airbnb.tech/payments/pay-as-a-local/ | engineering-blog | Strong | yes |
| airbnb-skipper-2026 | Skipper: Building Airbnb's embedded workflow engine | Airbnb Tech Blog (Ricardo Gamba) | 2026-04 | https://medium.com/airbnb-engineering/skipper-building-airbnbs-embedded-workflow-engine-f6c34552146f | engineering-blog | Strong | partial |
| airbnb-mysql-replay-2026 | Beyond synthetic testing: Capturing and replaying real database workloads at Airbnb | Airbnb Tech Blog (Zuofei Wang, Erluo Li) | 2026-10 | https://medium.com/airbnb-engineering/beyond-synthetic-testing-capturing-and-replaying-real-database-workloads-at-airbnb-cea7ee9b1ab2 | engineering-blog | Strong | partial |
| airbnb-skipper-oss-2026 | Skipper, Airbnb's embedded workflow engine, is now open source | Airbnb Tech Blog (Ricardo Gamba, Andriy Sergiyenko) | 2026-11 | https://airbnb.tech/open-source/skipper-airbnbs-embedded-workflow-engine-is-now-open-source/ | engineering-blog | Strong | partial |
| airbnb-about-2026 | About us (fast facts, last updated May 2026) | Airbnb Newsroom | 2026-05 | https://news.airbnb.com/about-us/ | press | Strong | partial |
| airbnb-services-part2-2018 | Building Services at Airbnb, Part 2 (read via the tagged/soa RSS feed) | Airbnb Tech Blog | 2018-05 | https://medium.com/airbnb-engineering/building-services-at-airbnb-part-2-142be1c5d506 | engineering-blog | Strong | partial |
| airbnb-services-part3-2018 | Building Services at Airbnb, Part 3 (read via the tagged/soa and microservices RSS feeds) | Airbnb Tech Blog | 2018-12 | https://medium.com/airbnb-engineering/building-services-at-airbnb-part-3-ac6d4972fc2d | engineering-blog | Strong | partial |
| airbnb-services-part4-2020 | Building Services at Airbnb, Part 4 (read via the tagged/microservices RSS feed) | Airbnb Tech Blog | 2020-09 | https://medium.com/airbnb-engineering/building-services-at-airbnb-part-4-23c95e428064 | engineering-blog | Strong | partial |
| airbnb-krispr-2020 | A Krispr Approach to Kubernetes Infrastructure (read via the tagged/microservices RSS feed) | Airbnb Tech Blog | 2020-11 | https://medium.com/airbnb-engineering/a-krispr-approach-to-kubernetes-infrastructure-a0741cff4e0c | engineering-blog | Strong | partial |
| airbnb-k8s-scaling-2022 | Dynamic Kubernetes cluster scaling at Airbnb (read via the tagged/kubernetes RSS feed) | Airbnb Tech Blog | 2022-05 | https://medium.com/airbnb-engineering/dynamic-kubernetes-cluster-scaling-at-airbnb-d79ae3afa132 | engineering-blog | Strong | partial |
| airbnb-ha-database-2025 | Achieving High Availability with distributed database on Kubernetes at Airbnb | Airbnb Tech Blog (Artem Danilov; Medium original 2025-07-28) | 2025-07 | https://airbnb.tech/infrastructure/achieving-high-availability-with-distributed-database-on-kubernetes-at-airbnb/ | engineering-blog | Strong | partial |
| airbnb-istio-upgrades-2025 | Seamless Istio Upgrades at Scale | Airbnb Tech Blog (Rushy R. Panchal; Medium original 2025-08-07) | 2025-08 | https://airbnb.tech/uncategorized/seamless-istio-upgrades-at-scale/ | engineering-blog | Strong | partial |
| airbnb-spinaltap-repo-2026 | airbnb/SpinalTap README (accessed 2026-11) | Airbnb (GitHub) | 2026 | https://github.com/airbnb/SpinalTap | repo | Strong | partial |
| airbnb-10k-2025 | Airbnb, Inc. Form 10-K for fiscal year 2025 | Airbnb, Inc. (SEC EDGAR) | 2026-02 | https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm | filing | Strong | partial |
