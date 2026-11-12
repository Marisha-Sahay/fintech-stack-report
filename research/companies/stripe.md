# Stripe

**Category:** payments
**HQ / founded:** HQ not sourced in this note. Launched in 2011 with MongoDB as its online database (stripe-docdb-2024)
**Scale signal:** $1.4 trillion of payments facilitated in 2024; more than 5 million database queries per second over 2,000+ shards (stripe-docdb-qcon-2025). Ledger sees five billion events per day (stripe-ledger-2024, Feb 2024)
**Last researched:** 2026-11-11

## Summary

Stripe keeps its product data in DocDB, an in-house database-as-a-service built on MongoDB Community, fronted by its own Go proxy servers and a routing metadata service, and running on a patched MongoDB fork (stripe-docdb-2024; stripe-docdb-qcon-2025). Money is tracked separately in Ledger, an immutable, append-only event log built on double-entry bookkeeping that Stripe uses as its system of record for financial data and as the basis of its data quality checks (stripe-ledger-2024). Most product code is Ruby, over 15 million lines in 2022, kept manageable with Stripe's own open-source type checker, Sorbet (stripe-sorbet-2022). Stripe repeatedly chooses to build core infrastructure on top of open source and says why: DocDB for security, reliability and scale (stripe-docdb-qcon-2025), and a Go service-mesh proxy that replaced Envoy for reliability and custom features (stripe-mesh-proxy-2026). The trade-off it states for the ledger is that immutable data cannot be fixed with simple updates, so corrections go through revert-and-reprocess migrations with two-phase review (stripe-ledger-2024).

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Ruby (main product codebase); Java, Go, Scala also used | Strong (Ruby, Go); Medium (Java, Scala) | stripe-sorbet-2022; stripe-mesh-proxy-2026; stripe-job-svc-infra-2026 |
| Main frameworks | Sorbet type checking across the Ruby codebase; web framework not stated publicly | Strong | stripe-sorbet-2022 |
| Primary OLTP store(s) | DocDB (in-house DBaaS on MongoDB Community); PostgreSQL also operated | Strong; Medium (PostgreSQL) | stripe-docdb-2024; stripe-job-core-infra-2026 |
| Service-layer persistence | Custom: in-house SDK on MongoDB talking to Go database proxies that expose a minimal set of query functions | Strong | stripe-docdb-qcon-2025 |
| Money / ledger model | Ledger: immutable append-only event log, double-entry, systems modeled as fund flows between accounts | Strong | stripe-ledger-2024 |
| Messaging / streaming | Kafka (DocDB change data capture to Kafka, then S3) | Strong | stripe-docdb-2024 |
| Infrastructure | Cloud (Amazon S3 named; AWS in job listing) | Strong; Medium | stripe-docdb-2024; stripe-job-core-infra-2026 |
| Scaling approach | Horizontal sharding in DocDB: 2,000+ shards, chunk migrations with versioned gating | Strong | stripe-docdb-2024; stripe-docdb-qcon-2025 |
| Build vs buy (core) | Build on open source: DocDB, Ledger, own DB proxy, own service-mesh proxy | Strong | stripe-docdb-qcon-2025; stripe-mesh-proxy-2026 |
| Notable open source | Sorbet (Ruby type checker, released June 2019) | Strong | stripe-sorbet-2022 |

## Languages and frameworks

- Most of Stripe's code was written in Ruby in 2017 and still was in 2022; Sorbet runs over "over 15 million lines of code spread across 150,000 files" as of March 2022 (stripe-sorbet-2022).
- 85% of non-test Ruby files opt into `# typed: strict` after almost four years of Sorbet (stripe-sorbet-2022).
- The internal Ruby codebase is called pay-server, per an engineer quote in the same post (stripe-sorbet-2022).
- Database proxy servers are written in Go (stripe-docdb-2024). The service-mesh proxy that replaced Envoy, mesh-proxy, is also Go; Stripe says "Go is well-supported at Stripe" (stripe-mesh-proxy-2026).
- Stripe's Ruby services "require big, expensive machines to run" (stripe-mesh-proxy-2026).
- Current job listings name Java and Ruby most often: one asks for "static (Java) and dynamically (Ruby) typed programming languages" (stripe-job-svc-infra-2026); another lists "Java, Ruby, Python, TypeScript, Kafka, Flyte, Airflow, and Mongo" (stripe-job-payments-intel-2026). Medium evidence.
- 2017-era data tooling: Hadoop with MapReduce jobs written in Scalding (Scala), and GitHub's Scientist Ruby library for comparing read paths (stripe-online-migrations-2017, older than 5 years).

## The money layer (ledger, balances, payments)

- Ledger is "an immutable and auditable log" and "a trustworthy system of record for all of our financial data" (stripe-ledger-2024).
- It models each producer system as a state machine and its behavior as a fund flow: events move balances between accounts (stripe-ledger-2024).
- "Ledger is based on double-entry bookkeeping" (stripe-ledger-2024). Correctness is checked by "clearing": intermediate accounts should return to zero at steady state, and a nonzero clearing balance flags a missing, late or wrong event (stripe-ledger-2024).
- Scale: five billion events per day; 99.99% of dollar volume ingested and verified within four days; "over 99.9999% explainability of money movement" (stripe-ledger-2024).
- Ledger also models non-money systems (currency conversion, report parsing, billing analysis) with the same bookkeeping ideas (stripe-ledger-2024).
- A separate platform, Money Movement and Storage (MMS), handles real money movement; its "financial account" primitive is backed by a real bank account, and transfers use an Originated Money Transfer (OMT) with a three-phase lifecycle through the ledger: submitted, then prepared, then disbursed (stripe-fee-credits-2026).
- For fee credits, Stripe added "purely logical financial accounts" that carry a ledger balance with no real cash, and blocks transfers between logical and real accounts at the platform level (stripe-fee-credits-2026).
- A 2021 Kafka Summit abstract says Stripe operates "a general ledger modeled as double-entry bookkeeping for all financial transactions" and built a real-time key-value store inside Apache Pinot for analytics over it (stripe-ledger-pinot-2021, older than 5 years; abstract only).
- The Ledger post does not name the storage engine or language behind Ledger. No public source found.

## Service-layer persistence and databases

- DocDB is "an extension of MongoDB Community" plus in-house services; 10,000+ distinct query shapes, petabytes of data, 5,000+ collections, 2,000+ shards (stripe-docdb-2024).
- Applications reach data through Go proxy servers that handle "reliability, scalability, admission control, and access control" and route queries via a chunk metadata service (stripe-docdb-2024).
- Stripe does not use sharded MongoDB (mongos and config servers); the proxy and routing metadata service are in-house, and Stripe does not use MongoDB's aggregation pipeline (stripe-docdb-qcon-2025).
- Product engineers get an SDK on top of MongoDB that talks to the proxies; retries exist in both the SDK and the proxy (stripe-docdb-qcon-2025).
- The talk's example DocDB document is in a `core_payments` database and `payment_intents` collection sharded by merchant (stripe-docdb-qcon-2025).
- Shards are MongoDB replica sets (primary plus secondaries) spread across availability zones and regions (stripe-docdb-qcon-2025).
- Stripe's Core Infrastructure organization operates "databases (MongoDB, PostgreSQL)" and "AWS cloud infrastructure" (stripe-job-core-infra-2026, Medium). What PostgreSQL holds is not stated.
- ORM or SQL-first: not applicable in the usual sense; no public source describes an ORM layer.

## Scale

- $1.4 trillion of payments in 2024, about 1.3% of global GDP; target of "5.5 nines" reliability (stripe-docdb-qcon-2025).
- DocDB: over five million queries per second (stripe-docdb-2024).
- Service mesh: "millions of requests per second between thousands of services"; mesh-proxy cut CPU under high load by about half and latency by roughly 50% versus Envoy (stripe-mesh-proxy-2026).
- Data migration speed: about 1.5 to 2 TB per target shard per day for bulk import (stripe-docdb-qcon-2025).

## Build vs buy

- DocDB: "we could not find an off-the-shelf DBaaS that met our requirements" (stripe-docdb-2024). Requirements listed: availability and durability, a minimal set of database functions, horizontal sharding, multitenancy with quotas, enforced authorization (stripe-docdb-2024).
- Stripe says it explored off-the-shelf DBaaS offerings "at various points" and stayed in-house for security, reliability and performance, and scale (stripe-docdb-qcon-2025).
- Service mesh: Envoy was replaced by an in-house Go proxy in 2026 because of connection cardinality, risky upgrades, and features "far too custom" for Envoy (stripe-mesh-proxy-2026).
- Fee credits reused the existing MMS platform instead of a bespoke balance system (stripe-fee-credits-2026).

## Correctness (idempotency, reconciliation, audit)

- The public API accepts an `Idempotency-Key` header on POST endpoints; a retried request with the same key charges the customer only once (stripe-idempotency-2017, older than 5 years).
- Stripe's Ruby client library retries automatically with an idempotency key, exponential backoff and jitter (stripe-idempotency-2017).
- Ledger checks three things per fund flow: clearing, timeliness and completeness; completeness includes checking "that every ID in a producer database has a matching Ledger event" (stripe-ledger-2024).
- Corrections to Ledger go through a migration tool with an out-of-band data quality impact report and "a two-phase review and commit" (stripe-ledger-2024).
- DocDB migrations end with a correctness check comparing point-in-time snapshots of source and target shards (stripe-docdb-2024).
- Fee credits: "Every state change is logged with an actor, timestamp, and approval link" (stripe-fee-credits-2026).

## Changes over time (migrations and reasons)

- 2011: launched on MongoDB; applications connected directly to a handful of shards (stripe-docdb-qcon-2025).
- 2017: tens of shards and manual maintenance with ad hoc scripts; Stripe built the database proxy layer, first for connection pooling (stripe-docdb-qcon-2025).
- 2017: Subscriptions moved out of Customer records into their own table with a four-step dual-writing migration, verified with Scientist experiments (stripe-online-migrations-2017, older than 5 years).
- November 2017 to June 2019: Sorbet written from scratch, required in CI from May 2018, open-sourced June 2019; reason given: RDL "proved to be powerful, but too slow" and TypedRuby "had bugs that would have required a near-rewrite" (stripe-sorbet-2022).
- 2020 onward: shards were scaled vertically to tens of terabytes, then Stripe built a control plane, routing metadata service and online data movement to scale horizontally (stripe-docdb-qcon-2025).
- 2023: bin-packed thousands of underused databases, migrated 1.5 petabytes, cut the shard count by about three quarters, and upgraded MongoDB versions by moving data instead of in-place upgrades (stripe-docdb-2024).
- 2026: Envoy, used "for almost 10 years", replaced with mesh-proxy (stripe-mesh-proxy-2026).

## Stated reasons (verbatim quotes)

> "When Stripe launched in 2011, we chose MongoDB as our online database because it offered better developer productivity than standard relational databases." (stripe-docdb-2024, 2024-06)

> "We chose to build DocDB on top of MongoDB Community because of the flexibility of its document model and its ability to handle massive volumes of real-time data at scale." (stripe-docdb-2024, 2024-06)

> "The reason why we've invested in building something in-house on top of open-source software really came down to three things: security, reliability and performance, and scale." (stripe-docdb-qcon-2025, talk 2025-11)

> "By exposing only a minimal battle-tested set of functions to our engineers, we ensure that these unintended performance and reliability issues don't materialize." (stripe-docdb-qcon-2025, talk 2025-11)

> "Grounding our analysis in this construct gives us a mathematical proof of correctness." (stripe-ledger-2024, 2024-02, on double-entry bookkeeping)

> "Ledger's immutability ensures we can audit and reproduce any data point at any time." (stripe-ledger-2024, 2024-02)

> "Because Ledger is an immutable log of events, we can't run simple queries to mutate the state; instead, we have to revert and reprocess prior operations." (stripe-ledger-2024, 2024-02)

> "Ruby was becoming a source of friction more than a source of productivity." (stripe-sorbet-2022, 2022-03, on the 2017 situation)

> "It's a little counterintuitive that building something in-house would be more reliable than operating a battle-tested open-source project. But our internal service mesh has become complex and custom enough that we've had great success building our own proxy." (stripe-mesh-proxy-2026, 2026-08)

> "Rather than building a bespoke balance system just for credits, we extended Stripe's existing Money Movement and Storage (MMS) platform, the infrastructure that handles real money movement across all of Stripe." (stripe-fee-credits-2026, 2026-04)

## Open questions

- Ledger's storage engine and implementation language are not stated in Stripe's Ledger post. No public source found.
- How Ledger (the data quality system of record) relates to the MMS ledger and the general ledger named in the credits post is not explained publicly.
- Which workloads use PostgreSQL at Stripe; only a job listing mentions it.
- Whether the 2021 Pinot-based ledger analytics store is still in use; only the conference abstract was read, not the talk.
- Unverified (third-party only): claims that Stripe uses Go mainly for newer services and Scala mainly for data work.
- HQ and founding year (as opposed to launch year) are not sourced in this note.

## System architecture

Stripe has published its architecture in pieces (API edge, service mesh, DocDB, Ledger, MMS, GPTN, Kafka, Temporal) but no single end-to-end diagram of a payment's internal path. The internal services between the API and the card networks are not named in any public source found. What is public shows a Ruby, Java and Go service fleet on AWS, connected by an in-house Go mesh proxy, with Ledger running beside the money path as an after-the-fact verifier rather than inline (stripe-consul-mesh-talk-2021; stripe-mesh-proxy-2026; stripe-ledger-2024).

### Money path

No single Stripe source describes the whole path. The order below is assembled from separate Stripe sources, each cited; the joins between steps are Stripe's own descriptions of each component, not a published end-to-end diagram.

1. **Client and merchant server.** The merchant's server creates a PaymentIntent for the amount and currency and passes its client secret to the browser; the client collects the payment method with Stripe.js and confirms the PaymentIntent (stripe-payments-api-2020, 2020). Stripe's 2026 explainer says the PaymentIntent is created once the amount and currency are known, and names card networks and issuing banks as the next hops (stripe-payments-mental-model-2026).
2. **Tokenization and card vault.** Card details are turned into a single-use token so the merchant's server handles only non-sensitive data, and a Stripe vault stores card numbers (stripe-payments-mental-model-2026). In 2016 the tokenization service was called Apiori: it replaced PCI-sensitive data in a request with a token, and was rewritten from Ruby (EventMachine) to Go (stripe-api-pci-talk-2016, 2016).
3. **API edge.** Requests pass rate limiters and load shedders in the middleware stack, implemented with Redis: a per-user request rate limiter, a concurrent requests limiter, a fleet usage load shedder that reserves capacity for critical methods such as creating charges, and a worker utilization load shedder (stripe-rate-limiters-2017, 2017). POST requests accept an `Idempotency-Key` (stripe-idempotency-2017, 2017). Responses pass through "version change modules" that walk the current response back to the account's pinned API version (stripe-api-versioning-2017, 2017).
4. **Internal services over the service mesh.** One public API request relies on many internal service requests, carried by the service mesh data plane (mesh-proxy since 2026, Envoy before), which does routing, load balancing, authorization and encryption (stripe-mesh-proxy-2026). Service names on the payment path: No public source found.
5. **Product data store.** Payment objects live in DocDB; the published example is a document in the `core_payments` database and `payment_intents` collection, reached through an SDK, Go database proxies and a routing metadata service (stripe-docdb-qcon-2025; stripe-docdb-2024).
6. **Card networks and issuers.** The card network and issuing bank authenticate the cardholder, authorize and place a hold; capture triggers fund movement and creates a Charge; transactions are then batched, cleared and paid out, typically 2 to 3 days later (stripe-payments-mental-model-2026). Stripe's 2024 Ledger post names this layer the Global Payments and Treasury Network (GPTN), which covers accepting payments, storing money and moving it, including interactions with partner banks and financial networks (stripe-ledger-2024). The internal component that sends authorizations to networks: No public source found.
7. **Money Movement and Storage (MMS).** MMS is "the infrastructure that handles real money movement across all of Stripe"; its financial account primitive is backed by a real bank account, and value moves as an Originated Money Transfer (OMT) through three phases: submitted, prepared, disbursed. MMS also runs intercompany cash sweeps from ledger data (stripe-fee-credits-2026).
8. **GPTN payouts and treasury.** A payout enters through the Payouts API; a cash management layer creates requests to move funds between accounts; a net settlement engine batches and nets opposing flows on a planning cycle of a few minutes, with a direct mode that bypasses the cycle for urgent requests; a routing layer builds end-to-end paths across fiat and wallet nodes; a treasury hub does FX (stripe-stablecoins-2026). Behind this, an in-house bank entity provides treasury services to Stripe entities, uses local accounts under receive-on-behalf-of and pay-on-behalf-of frameworks, and "handles the ledgering behind the scenes" (stripe-treasury-sessions-2026).
9. **Ledger and data quality (beside the path).** Producer systems emit events into Ledger, an immutable double-entry log that models each producer as a state machine and fund flow; Ledger measures the delay from data entering Stripe to reaching Ledger, and its Data Quality platform feeds alerting and Accounting Close (stripe-ledger-2024).

### Orchestration

- **Client-facing state machine.** The PaymentIntent moves through `requires_payment_method`, optional `requires_confirmation`, `requires_action`, `processing` and `succeeded`; there is no failed state, and a failed attempt returns to `requires_payment_method` (stripe-payments-api-2020, 2020). Stripe redesigned around it because the older Sources and Charges APIs made users "manage two different state machines that span client and server" (figure caption) (stripe-payments-api-2020, 2020).
- **Asynchronous completion.** For payment methods that finalize later, the one webhook merchants must handle, `payment_intent.succeeded`, is described as "not in the critical path to collecting money" (stripe-payments-api-2020, 2020).
- **Back-office state machines.** Ledger encodes producer systems as state machines; a charge is a creation event and a release event that Ledger links by `business` and `id` even when they arrive out of order or from different sources (stripe-ledger-2024). OMTs in MMS have a three-phase lifecycle, and the fee credits engine models each credit's lifecycle as a finite-state machine with a "credit papertrail" and dual approval (stripe-fee-credits-2026).
- **Batch planning.** GPTN's net settlement engine runs a planning cycle measured in minutes, and upstream logic picks the batched cycle or direct mode by urgency (stripe-stablecoins-2026).
- **Temporal for infrastructure workflows.** Stripe's database fleet auto-remediation runs on Temporal, with a common interface that runs the same logic against Temporal in production or an in-memory simulator (stripe-db-remediation-2026). The Stream Infrastructure team built a Kafka Control Plane on Temporal for broker replacement, rebalancing and topic configuration (stripe-kafka-temporal-2024). A Temporal-hosted case study says Stripe wraps the Temporal SDK and hides it from internal users, and each team runs its own worker service (stripe-temporal-case-2024, Medium). An HA and DR job listing asks for "Designing and building Temporal workflows" (stripe-job-ha-dr-2026, Medium).
- Whether charges, refunds or payouts themselves run as Temporal workflows: No public source found. Sagas or compensating transactions on the payment path: No public source found.

### Deployment topology

- **Cloud, not own data centers.** Stripe runs on AWS. It started in the AWS Northern California region and moved to Oregon for about 10% lower cost and more capacity; the move took about five months with a cutover of about two hours, using a VPN between regions, home-built cross-region security groups and incremental load balancing (stripe-api-pci-talk-2016, 2016). A current job listing names S3, EBS, EC2 and VPCs (stripe-job-ha-dr-2026, Medium).
- **Databases.** DocDB shards are MongoDB replica sets "distributed across availability zones and regions" (stripe-docdb-qcon-2025), each with a primary, secondaries and automated failover (stripe-docdb-2024). The fleet has about 2,000 shards in "over 40 distinct shard layouts", from cost-optimized to "high-availability setups designed for disaster recovery" (stripe-db-remediation-2026).
- **Service discovery footprint.** In 2021 Stripe ran over 30 Consul clusters across separate domains, regions and environments, each with 5 server nodes; datacenters in the same domain and environment are joined by WAN federation, and data is generally not replicated across datacenters (stripe-consul-mesh-talk-2021, 2021).
- **Streaming.** About 50 Kafka clusters across three environments and multiple regions (stripe-kafka-temporal-2024). An in-house proxy lets the clusters work together across the globe, with "a target of 99.9999% availability for our most critical use cases" and global routing for data locality (stripe-kafka-six-nines-2022).
- **High availability and DR.** A Global Operations job listing describes "combining less-available components and data centers into a highly available and resilient whole", "minimizing cross-region TLS handshakes" and building systems "to automate disaster detection and failovers" (stripe-job-ha-dr-2026, Medium).
- **Targets.** Stripe states a 99.9995% reliability target (stripe-mesh-proxy-2026) and API availability above 99.999% (stripe-ledger-2024).
- Active-active versus active-standby for the payment path, cells or units, and the current list of regions: No public source found.

### Platform layer

- **Languages and repo.** Stripe moved from a monolithic Ruby app to services written mostly in Ruby, Java and Go (stripe-consul-mesh-talk-2021, 2021). The Ruby monorepo is about 50 million lines with about 50,000 builds a week (stripe-ste-monorepo-2026).
- **Service discovery.** Consul replaced Puppet-managed catalogs in 2014 (stripe-consul-mesh-talk-2021, 2021). In 2016 Consul Template regenerated DNS records and HAProxy backends every 60 seconds, so DNS kept answering when Consul was down (stripe-service-discovery-2016, 2016).
- **Service mesh.** Envoy was adopted around 2017 behind an internal control plane that compiles Consul data into Envoy configuration, with mutual TLS between services (stripe-consul-mesh-talk-2021, 2021). In 2026 Stripe replaced Envoy with mesh-proxy, its own Go proxy with its own HTTP/1.1 and HTTP/2 implementation, one connection per host, a direct connection to the service registry, retries, hedging, rate limiting and priority-based routing (stripe-mesh-proxy-2026).
- **RPC.** The fee credits engine is "a standalone gRPC service" (stripe-fee-credits-2026). A company-wide RPC framework name: No public source found.
- **Deployment.** Kubernetes started in 2017 with about 500 cron jobs on about 20 hosts, on a cluster built from scratch and configured with Puppet (stripe-kubernetes-2017, 2017). By 2021 Stripe was migrating more services to Kubernetes while keeping Consul for discovery, with one Consul agent per host reached by pods through a host proxy (stripe-consul-mesh-talk-2021, 2021). Share of services on Kubernetes today and the deploy pipeline: No public source found.
- **Database access.** Applications use an in-house SDK that talks to Go database proxies exposing a minimal set of query functions (stripe-docdb-qcon-2025).

### Data platform

- **Change data capture.** DocDB writes flow into a CDC pipeline that carries the MongoDB oplog to Kafka and then archives it to S3 (stripe-docdb-2024). "Data from our CDC pipeline is used to power our offline and analytical systems" (stripe-docdb-qcon-2025).
- **Event bus.** Kafka carries about 700 TB of publish throughput a day (stripe-kafka-temporal-2024).
- **Ledger and reconciliation.** Ledger computes all account balances and checks clearing, timeliness and completeness, including that every producer ID has a matching Ledger event; investigations generate Presto queries, and the metrics feed Accounting Close (stripe-ledger-2024). How producers deliver events to Ledger (Kafka, batch or CDC): No public source found.
- **Warehouse and general ledger.** Fee credit fundings, drawdowns and tax write-offs emit structured ledger events consumed directly by reporting, the data warehouse and the general ledger (stripe-fee-credits-2026).
- **Lakehouse and pipelines.** Stripe runs "thousands of pipelines" over "petabytes of data daily" for financial reporting, fraud detection and merchant analytics, generating Airflow DAGs from YAML and SQL and registering Iceberg tables (stripe-airflow-summit-2026). A Trino community recap says Iceberg is replacing legacy Hive tables and Trino serves ad hoc analytics, dashboards and internal data apps (stripe-trino-fest-2023, Weak). A 2021 abstract describes a real-time store in Apache Pinot over the general ledger (stripe-ledger-pinot-2021, 2021).
- Bank statement and network settlement file reconciliation pipeline: No public source found beyond the "reconciliation" component listed in GPTN (stripe-stablecoins-2026).

### Published architecture diagrams

- https://stripe.dev/blog/ledger-stripe-system-for-tracking-and-validating-money-movement : "A simplified summary view of Stripe's interactions with external entities"; a charge as creation and release events in Ledger; fund flows across systems; DQ and pipeline health views (stripe-ledger-2024).
- https://stripe.dev/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations : "High-level overview of Stripe's database infrastructure" (proxies, chunk metadata service, CDC); "A sharded collection"; "Data Movement Platform within our database infrastructure stack"; "Traffic switch process" (stripe-docdb-2024).
- https://www.infoq.com/presentations/docdb-online-database/ : talk slides of the 2017 proxy layer and the later stack (proxies, routing metadata service, replica sets across AZs and regions, control plane, CDC to Kafka and S3) (stripe-docdb-qcon-2025).
- https://stripe.dev/blog/building-a-data-plane-from-scratch-stripes-own-high-performance-distributed-proxy : uncaptioned diagrams of client-to-server connection counts under Envoy versus mesh-proxy, plus CPU and memory graphs at rollout (stripe-mesh-proxy-2026).
- https://stripe.com/blog/api-versioning : "Requests are processed by version change modules before returning a response." (stripe-api-versioning-2017, 2017).
- https://stripe.com/blog/rate-limiters : four graphs, one per limiter or load shedder type (stripe-rate-limiters-2017, 2017).
- https://stripe.dev/blog/payment-api-design : client and server flows for Charges, Sources and PaymentIntents, including "A PaymentIntents integration" (stripe-payments-api-2020, 2020).
- https://stripe.dev/blog/how-we-built-stripe-credits-a-programmable-auditable-way-to-pay-your-stripe-fees : one uncaptioned figure after the fee settlement flow; its content is not described in the text (stripe-fee-credits-2026).
- The Consul talk transcript refers to two on-screen stack diagrams (Consul agents to servers, control plane to Envoy) that are not on the page (stripe-consul-mesh-talk-2021, 2021).

### Stated architectural principles (verbatim)

> "Ledger is our system of record and must remain an evergreen representation of truth." (stripe-ledger-2024, 2024-02)

> "Decoupling settlement and movement was our key insight." (stripe-stablecoins-2026, 2026-06)

> "User-facing settlement runs at crypto speed, while the underlying cash movement runs at fiat speed." (stripe-stablecoins-2026, 2026-06)

> "Auditability is an engineering requirement." (stripe-fee-credits-2026, 2026-04)

> "Logical accounts are a powerful abstraction." (stripe-fee-credits-2026, 2026-04)

> "reliability is non-negotiable." (stripe-docdb-qcon-2025, talk 2025-11)

> "If you can model your infrastructure's state space and define valid transitions, recovery becomes a search problem." (stripe-db-remediation-2026, 2026-07)

> "Make sure that if there were bugs in the rate limiting code (or if Redis were to go down), requests wouldn't be affected." (stripe-rate-limiters-2017, 2017-03)

> "Once you have written code using the Stripe API you should never have to change it." (stripe-api-pci-talk-2016, 2016-08)

> "One of the main goals going through the PCI compliance process is to make as few things as possible in scope for PCI." (stripe-api-pci-talk-2016, 2016-08)

> "consistency doesn't come for free!" (stripe-service-discovery-2016, 2016-10)

> "don't use Kubernetes just because other companies are using it" (stripe-kubernetes-2017, 2017-12)

Gaps in this section: no public source names the internal payment services between the API and the card networks, says whether payment flows run on Temporal, describes active-active or cell-based deployment for payments, lists current regions, or explains how producer systems feed Ledger. Search snippets of Stripe "Workflow Engine" job listings mention Temporal or Cadence and products such as Capital, Billing and Connect, but the stripe.com listing returned 404 and was not read; do not cite.

## Sources

Freshness: sources dated before 2021-11 are older than 5 years and are labeled with their year in the text above.

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| stripe-ledger-2024 | Ledger: Stripe's system for tracking and validating money movement | Stripe (stripe.dev, Ilya Ganelin) | 2024-02 | https://stripe.dev/blog/ledger-stripe-system-for-tracking-and-validating-money-movement | engineering-blog | Strong | yes |
| stripe-docdb-2024 | How Stripe's document databases supported 99.999% uptime with zero-downtime data migrations | Stripe (stripe.dev, Jimmy Morzaria and Suraj Narkhede) | 2024-06 | https://stripe.dev/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations | engineering-blog | Strong | yes |
| stripe-docdb-qcon-2025 | Stripe's DocDB: How Zero-Downtime Data Movement Powers Trillion-Dollar Payment Processing (QCon San Francisco 2025 talk, transcript published 2026-04) | InfoQ (speaker Jimmy Morzaria, Stripe) | 2025-11 | https://www.infoq.com/presentations/docdb-online-database/ | talk | Strong | yes |
| stripe-docdb-news-2025 | Stripe's Zero-Downtime Data Movement Platform Migrates Petabytes with Millisecond Traffic Switches | InfoQ (Eran Stiller) | 2025-11 | https://www.infoq.com/news/2025/11/stripe-zero-downtime-date-move | third-party | Weak | yes |
| stripe-sorbet-2022 | Sorbet: Stripe's type checker for Ruby | Stripe (stripe.dev, Jake Zimmerman) | 2022-03 | https://stripe.dev/blog/sorbet-stripes-type-checker-for-ruby | engineering-blog | Strong | yes |
| stripe-mesh-proxy-2026 | Building a data plane from scratch: Stripe's own high-performance distributed proxy | Stripe (stripe.dev, Jack Loughran and Cara Mecozzi) | 2026-08 | https://stripe.dev/blog/building-a-data-plane-from-scratch-stripes-own-high-performance-distributed-proxy | engineering-blog | Strong | yes |
| stripe-fee-credits-2026 | How we built Stripe Credits: A programmable, auditable way to pay your Stripe fees | Stripe (stripe.dev, Pratik Gupta and Sai Samant) | 2026-04 | https://stripe.dev/blog/how-we-built-stripe-credits-a-programmable-auditable-way-to-pay-your-stripe-fees | engineering-blog | Strong | yes |
| stripe-idempotency-2017 | Designing robust and predictable APIs with idempotency | Stripe (Brandur Leach) | 2017-02 | https://stripe.com/blog/idempotency | engineering-blog | Strong | yes |
| stripe-online-migrations-2017 | Online migrations at scale | Stripe (Jacqueline Xu) | 2017-02 | https://stripe.com/blog/online-migrations | engineering-blog | Strong | yes |
| stripe-ledger-pinot-2021 | Analyzing Petabyte Scale Financial Data with Apache Pinot and Apache Kafka (Kafka Summit Europe 2021 abstract) | Confluent (speakers Xiaoman Dong and Joey Pereira, Stripe) | 2021 | https://confluent.io/en-gb/events/kafka-summit-europe-2021/analyzing-petabyte-scale-financial-data-with-apache-pinot-and-apache-kafka | talk | Strong | partial |
| stripe-job-core-infra-2026 | Staff Engineer, Core Infrastructure (Bengaluru) job listing | Stripe | 2026-10 | https://stripe.com/jobs/search?gh_jid=8070949 | job-listing | Medium | yes |
| stripe-job-svc-infra-2026 | Engineering Manager of Managers, Service Infrastructure job listing | Stripe | 2026-10 | https://stripe.com/jobs/search?gh_jid=8155381 | job-listing | Medium | yes |
| stripe-job-payments-intel-2026 | Staff Software Engineer, Payments Intelligence job listing | Stripe | 2026-10 | https://stripe.com/jobs/search?gh_jid=7986004 | job-listing | Medium | yes |
| stripe-stablecoins-2026 | Extending Stripe's network with stablecoins | Stripe (stripe.dev, Sai Samant and Maciej Makowski) | 2026-06 | https://stripe.dev/blog/extending-stripes-network-with-stablecoins | engineering-blog | Strong | yes |
| stripe-db-remediation-2026 | How Stripe uses graph search and state machines to auto-remediate a global database fleet | Stripe (stripe.dev, Pragya Mehta and Sai Samant) | 2026-07 | https://stripe.dev/blog/how-stripe-uses-graph-search-and-state-machines-to-auto-remediate-a-global-database-fleet | engineering-blog | Strong | yes |
| stripe-payments-api-2020 | Stripe's payments APIs: The first 10 years (2020, older than 5 years) | Stripe (stripe.dev, Michelle Bu) | 2020-12 | https://stripe.dev/blog/payment-api-design | engineering-blog | Strong | yes |
| stripe-payments-mental-model-2026 | Building a mental model for Stripe payments | Stripe (stripe.dev, Allison Farris) | 2026-02 | https://stripe.dev/blog/building-a-mental-model-for-stripe-payments | engineering-blog | Strong | partial |
| stripe-rate-limiters-2017 | Scaling your API with rate limiters (2017, older than 5 years) | Stripe (Paul Tarjan) | 2017-03 | https://stripe.com/blog/rate-limiters | engineering-blog | Strong | yes |
| stripe-api-versioning-2017 | APIs as infrastructure: future-proofing Stripe with versioning (2017, older than 5 years) | Stripe (Brandur Leach) | 2017-08 | https://stripe.com/blog/api-versioning | engineering-blog | Strong | yes |
| stripe-api-pci-talk-2016 | The Architecture that Helps Stripe Move Faster (QCon New York 2016; InfoQ show notes, no full transcript) | InfoQ (speaker Evan Broder, Stripe) | 2016-08 | https://www.infoq.com/presentations/stripe-api-pci | talk | Strong | partial |
| stripe-consul-mesh-talk-2021 | How Stripe Uses Consul to Build Service Mesh (2021, older than 5 years; HashiCorp-hosted talk by Stripe engineers, transcript) | HashiCorp (speakers Ruoran Wang and Mark Guan, Stripe) | 2021-11 | https://hashicorp.com/en/resources/how-stripe-uses-consul-to-build-service-mesh | talk | Strong | partial |
| stripe-service-discovery-2016 | Service discovery at Stripe (2016, older than 5 years) | Stripe (Julia Evans) | 2016-10 | https://stripe.com/blog/service-discovery-at-stripe | engineering-blog | Strong | yes |
| stripe-kubernetes-2017 | Learning to operate Kubernetes reliably (2017, older than 5 years) | Stripe (Julia Evans) | 2017-12 | https://stripe.com/blog/operating-kubernetes | engineering-blog | Strong | partial |
| stripe-kafka-six-nines-2022 | 6 Nines: How Stripe keeps Kafka highly-available across the globe (Kafka Summit London 2022 abstract) | Confluent (speaker Donny Nadolny, Stripe) | 2022 | https://www.confluent.io/events/kafka-summit-london-2022/6-nines-how-stripe-keeps-kafka-highly-available-across-the-globe/ | talk | Strong | partial |
| stripe-kafka-temporal-2024 | Mastering Kafka at Scale: Unleashing the Power of Temporal at Stripe (Current 2024 abstract) | Confluent (speaker Pat Stefanou, Stripe) | 2024-09 | https://current.confluent.io/2024-sessions/mastering-kafka-at-scale-unleashing-the-power-of-temporal-at-stripe | talk | Strong | partial |
| stripe-temporal-case-2024 | How Stripe uses Temporal (video summary page, no transcript, no named speakers) | Temporal Technologies | 2024-06 | https://temporal.io/in-use/stripe | vendor case study | Medium | partial |
| stripe-job-ha-dr-2026 | Software Engineer, High Availability and Disaster Recovery job listing (Global Operations, Seattle; no posting date shown, accessed 2026-11) | Stripe | 2026 | https://stripe.com/careers/listing/software-engineer-high-availability-and-disaster-recovery/8197135 | job-listing | Medium | yes |
| stripe-treasury-sessions-2026 | Managing money at scale: Treasury as a feature, not a department (Stripe Sessions 2026) | Stripe (speakers Leland Rodger and Bart Heideman, Stripe, with guests) | 2026 | https://stripe.com/sessions/2026/managing-money-at-scale | talk | Strong | partial |
| stripe-airflow-summit-2026 | Streamlining Data Pipelines Creation at Stripe with Airflow (Airflow Summit 2026 abstract) | Airflow Summit (speaker Jiayu Yi, Stripe) | 2026 | https://airflowsummit.org/sessions/2026/streamlining-data-pipelines-creation-at-stripe-with-airflow/ | talk | Strong | partial |
| stripe-trino-fest-2023 | Trino Fest 2023: Inspecting Trino on Ice (recap of talk by Kevin Liu, Stripe) | Trino project blog (Ryan Duan) | 2023-07 | https://trino.io/blog/2023/07/19/trino-fest-2023-stripe | third-party | Weak | partial |
| stripe-ste-monorepo-2026 | Selective Test Execution at Stripe: Fast CI for a 50M-line Ruby monorepo | Stripe (stripe.dev, Aditya Anchuri) | 2026-04 | https://stripe.dev/blog/selective-test-execution-at-stripe-fast-ci-for-a-50m-line-ruby-monorepo | engineering-blog | Strong | partial |
