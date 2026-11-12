# Monzo

**Category:** neobank
**HQ / founded:** UK. HQ city and founding year not verified from a source read for this note (monzo-cto-build-2023 describes Monzo as a UK digital bank).
**Scale signal:** 12m+ customers and £16.6bn customer deposits in FY2025, 2.4m new customers in the year (monzo-annual-report-2025). About 2,800 microservices in August 2024 (monzo-migrations-2800-services-2024).
**Last researched:** 2026-11-11

## Summary
Monzo builds almost all of its banking stack in-house as Go microservices (about 2,800 in August 2024, "All of our services are written in Go") on AWS and Kubernetes, with Cassandra as the shared database and one keyspace per service (monzo-migrations-2800-services-2024; monzo-thousands-microservices-2023). It chose Cassandra for horizontal scale and says openly that it "traded off the ability to have transactional consistency", which it compensates for with etcd locks, a coherence service, coherence checks and daily reconciliation against bank statements (monzo-1500-microservices-2020; monzo-payments-safely-2022). The ledger is an in-house double-entry service whose balances are computed by summing entries; as entry counts grew, P99 balance reads reached 400 to 500ms, and Monzo reindexed entries into time-bucketed tables and pre-computed balance blocks to bring them to about 200ms (monzo-balances-2022; monzo-balance-read-time-2023). Over time it has replaced vendor pieces with its own (card processor, Faster Payments gateway) and in 2025 added a separate GCP-hosted "Stand-in" backup bank of 18 services (monzo-faster-payments-gateway-2020; monzo-stand-in-2025).

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Go (all services, 2024); Java, Python, Scala also present in 2016 | Strong | monzo-migrations-2800-services-2024; monzo-modern-bank-backend-2016 |
| Main frameworks | In-house Go libraries with Cassandra and etcd built in; Typhon (own Go RPC wrapper); protobuf APIs | Strong | monzo-1500-microservices-2020; monzo-typhon-2026 |
| Primary OLTP store(s) | Apache Cassandra, one keyspace per service | Strong | monzo-thousands-microservices-2023; monzo-vault-cassandra-2019 |
| Service-layer persistence | Custom: shared in-house Go data library over Cassandra, no joins, no ORM named | Strong | monzo-1500-microservices-2020; monzo-thousands-microservices-2023 |
| Money / ledger model | In-house double-entry ledger service; balances = sum of entries per ledger address | Strong | monzo-balances-2022; monzo-balance-read-time-2023 |
| Messaging / streaming | Kafka | Strong | monzo-modern-bank-backend-2016; monzo-thousands-microservices-2023 |
| Infrastructure | AWS + Kubernetes (since 2016); own data centres for payment scheme gateways; Stand-in on GCP | Strong | monzo-thousands-microservices-2023; monzo-faster-payments-gateway-2020; monzo-stand-in-2025 |
| Scaling approach | Horizontal: more services and Cassandra nodes; reduce data read per balance (time buckets, pre-computed blocks) | Strong | monzo-1500-microservices-2020; monzo-balance-read-time-2023 |
| Build vs buy (core) | Build (own ledger, card processing, Faster Payments gateway) | Strong | monzo-modern-bank-backend-2016; monzo-1500-microservices-2020; monzo-faster-payments-gateway-2020 |
| Notable open source | Typhon (Go RPC), response (incident tool), egress-operator, etcd3-terraform | Strong | monzo-typhon-2026 |

## Languages and frameworks
- 2016: Go expected to stay dominant because it "makes it easy to build low-latency, high-concurrency servers"; Java, Python and Scala services also existed (monzo-modern-bank-backend-2016, 2016, older than 5 years).
- 2020: "We use Go as our primary programming language." Reason given: static typing and easy onboarding (monzo-1500-microservices-2020, 2020, older than 5 years).
- 2024: "All of our services are written in Go" and all service code lives in a single monorepo (monzo-migrations-2800-services-2024).
- Shared library layer: "We've baked in Cassandra integration and etcd integration right into the library." (monzo-1500-microservices-2020).
- RPC: HTTP chosen in 2016 because "every language out there has an implementation in its standard library", with Linkerd (Finagle) for load balancing and retries (monzo-modern-bank-backend-2016). Typhon, Monzo's open-source wrapper around Go's net/http, is what Monzo uses "to build RPC servers and clients" in its microservices platform (monzo-typhon-2026).
- APIs defined in protocol buffers with generated marshalling code (monzo-1500-microservices-2020; monzo-thousands-microservices-2023).

## The money layer (ledger, balances, payments)
- An in-house ledger service (`service.ledger`) is "the source of truth of all the money moving around the bank on behalf of all of our customers" (monzo-balances-2022).
- Double-entry: "every movement of money has an equal and opposite movement", stored as `EntrySet`s (monzo-balances-2022).
- Entries are grouped under a ledger address, a 5-tuple of legal entity, namespace, name, currency and account ID. Monzo avoids the word "account" for this because it already has a meaning internally (monzo-balance-read-time-2023).
- Balances are computed, not stored as a mutable field: look up a named balance definition, fetch the relevant entries in parallel and sum them within a time window. Two time axes exist, `committed` and `reporting` (monzo-balances-2022).
- 2021-2022 redesign: each team used to call `/balances` with its own time axis, which "brought inconsistency between our data warehouse and our backend". Hard-coded named balance definitions replaced that (monzo-balances-2022).
- 2023 read-path redesign: the Cassandra schema had no time component so partitions "kept getting larger". Monzo reindexed entries into a time-series table bucketed on `committed_timestamp` and pre-computed sums of consecutive entries ("blocks") for the most-used balances. P99 balance reads fell from 400 to 500ms (Aug 2022 to Feb 2023) to about 200ms after the March 2023 migration (monzo-balance-read-time-2023).
- Trade-off stated: adding read throughput was rejected because "it is fundamentally unscalable because the number of ledger entries to read is always increasing" (monzo-balance-read-time-2023).
- Immutable or append-only: No public source found among the sources read that states this explicitly.

## Service-layer persistence and databases
- Cassandra is the general-purpose store: "Cassandra is what we use for persistence across the Monzo stack" (monzo-vault-cassandra-2019, 2019, older than 5 years). Data models avoid secondary indexes for performance (monzo-vault-cassandra-2019).
- Each service has its own keyspace; cross-keyspace reads are forbidden and services are "not doing database level joins between entities" (monzo-thousands-microservices-2023).
- Reads use LOCAL_QUORUM and there are no transactions; writes go to index tables before the canonical table, and a separate coherence service detects and fixes inconsistencies (monzo-thousands-microservices-2023).
- Why Cassandra: it "provides a masterless, horizontally scalable database", and Monzo has "traded off the ability to have transactional consistency" (monzo-1500-microservices-2020). In 2023 the stated benefit was growing and shrinking the cluster without large migrations (monzo-thousands-microservices-2023). Chris Evans, Monzo's Technical Director for Platform and Reliability, told AWS: "We knew that a traditional database would have to be scaled vertically" (monzo-aws-2020).
- No ORM is named in any source read; data access goes through the shared in-house Go library (monzo-1500-microservices-2020).
- etcd is used for distributed locking (monzo-1500-microservices-2020).
- Messaging: Kafka since 2016 (monzo-modern-bank-backend-2016); Kafka clusters still run in 2023 (monzo-thousands-microservices-2023).
- Analytics: sanitised payment messages from the Faster Payments gateway go to Google BigQuery (monzo-faster-payments-gateway-2020); coherence and reconciliation models run in the data warehouse (monzo-payments-safely-2022).
- 2024: the post on migrations says most services use a "core database system" that was migrated centrally, without naming it (monzo-migrations-2800-services-2024).

## Scale
- Customers and deposits: 12m+ customers, £16.6bn deposits, FY2025 (monzo-annual-report-2025).
- Service count over time: nearly 100 at beta, then about 150 (2016, monzo-modern-bank-backend-2016); about 1,600 (2020, monzo-1500-microservices-2020); over 2,500 (2023 talk, monzo-thousands-microservices-2023); about 2,800 (Aug 2024, monzo-migrations-2800-services-2024); about 3,000 on the primary platform (Feb 2025 diagram, monzo-stand-in-2025).
- The CTO describes horizontal scaling (adding servers rather than enlarging them) and more than 100 changes to core systems per day (monzo-cto-build-2023).

## Build vs buy
- 2016: "we're building a banking system from scratch" (monzo-modern-bank-backend-2016).
- 2023, CTO: "We have deliberately chosen to build most of our technology ourselves", while using off-the-shelf and open source "where appropriate" (monzo-cto-build-2023).
- Card processing: "We used to have an external card processor, and now we've brought that inside." (monzo-1500-microservices-2020).
- Faster Payments: a third-party gateway let Monzo launch transfers quickly, but "we started to push up against the operational limits of our provider", so Monzo built its own Go gateway in its own data centres, live at the end of 2019 (monzo-faster-payments-gateway-2020).
- International payments: "built our new modular International Payment Processing system from scratch" (monzo-intl-payments-2024).
- No source read names a vendor core banking platform (Thought Machine, Mambu, 10x or other) at Monzo.

## Correctness (idempotency, reconciliation, audit)
- Detective controls beyond alerting: coherence checks (rules that flag objects in invalid states) and reconciliation (comparing the internal ledger with the settlement account). Coherence checks run both as data warehouse models ("fancy SQL statements") and as event-driven backend services. Reconciliation runs daily, comparing a ledger-entries table with bank statement lines; engineers must acknowledge and document every break, which creates an audit log (monzo-payments-safely-2022).
- Idempotency: international payments aim to "ensure the result of a payment happens once and exactly once" through "extensive use of idempotency in our decision making and when applying the payment to an account" (monzo-intl-payments-2024).
- Locking: "we won't allow transactions to happen unless we can achieve a lock" (etcd) for some operations; other flows are applied later from a queue (monzo-1500-microservices-2020).
- Stand-in reconciliation: Stand-in records its decisions as "Monzo Advices" on GCP Pub/Sub, which the primary platform applies verbatim when it returns; correlation IDs prevent double counting. Monzo accepts that this can, rarely, push a customer into an unapproved overdraft (monzo-stand-in-2025).
- Audit: the Faster Payments gateway stores all sent and received messages and "valued durability over performance" (monzo-faster-payments-gateway-2020).

## Changes over time (migrations and reasons)
- By 2016: Mesos and Marathon (used for about a year) replaced by Kubernetes on AWS. Reason: Kubernetes is "the product of Google's long experience running containers in production at global scale"; result: infrastructure costs fell to "about a quarter" (monzo-modern-bank-backend-2016).
- 2019: Vault secrets storage moved from Cassandra to S3 with no downtime (monzo-vault-cassandra-2019).
- End of 2019: third-party Faster Payments gateway replaced by an in-house active-active gateway; reasons were provider limits and control over incidents (monzo-faster-payments-gateway-2020).
- By 2020: external card processor brought in-house, for resilience and product control (monzo-1500-microservices-2020).
- 2021-2022: named balance definitions to fix inconsistency between backend and data warehouse (monzo-balances-2022).
- March 2023: ledger entries reindexed into time-bucketed tables to cut balance read latency (monzo-balance-read-time-2023).
- 2023: move to AWS EKS described as in progress (monzo-thousands-microservices-2023).
- 2024: OpenTracing and Jaeger SDKs replaced by OpenTelemetry across about 2,800 services, driven by one central team (monzo-migrations-2800-services-2024).
- 2025: Monzo Stand-in, an independent backup platform on GCP with 18 services, costing about 1% of the primary platform (monzo-stand-in-2025).

## Stated reasons (verbatim quotes)
> "no one language ecosystem has everything we need to build a bank" (monzo-modern-bank-backend-2016, 2016-09)

> "Kafka seemed like a natural fit for these requirements." (monzo-modern-bank-backend-2016, 2016-09)

> "Our production infrastructure costs about a quarter of what it did before we switched to Kubernetes." (monzo-modern-bank-backend-2016, 2016-09)

> "provides a masterless, horizontally scalable database" ... "We've traded off the ability to have transactional consistency." (monzo-1500-microservices-2020, 2020)

> "It's statically typed. It makes it quite easy for us to get people on board." (monzo-1500-microservices-2020, 2020)

> "we started to push up against the operational limits of our provider" (monzo-faster-payments-gateway-2020, 2020-05)

> "If we were just using error reporting and alerting, we could miss some issues that coherence checking catches." (monzo-payments-safely-2022, 2022-02)

> "Reconciliation is a great catch-all." ... "The downside is that it's not the fastest way to find out about issues" (monzo-payments-safely-2022, 2022-02)

> "it is fundamentally unscalable because the number of ledger entries to read is always increasing" (monzo-balance-read-time-2023, 2023-04)

> "We have deliberately chosen to build most of our technology ourselves" (monzo-cto-build-2023, 2023-10)

> "Today it doesn't matter how many data centres you have if you run the same software in them all." (monzo-stand-in-2025, 2025-02)

## Open questions
- Is Cassandra still the primary store in 2026? The 2024 migrations post mentions only an unnamed "core database system" (monzo-migrations-2800-services-2024).
- Are ledger entries immutable or append-only, and how are corrections posted? Not stated in any source read.
- Unverified: Monzo used NSQ for messaging in its early years. Commonly said, not found in any source read.
- How does Monzo handle right-to-erasure requests against ledger history? No public source found.
- Did the 2023 EKS migration complete? No public source found.
- Founding year and HQ city: not verified from a source read for this note.

## System architecture

Monzo splits the bank into two layers: a few of its own data centres that terminate payment scheme connections with "the absolute minimum compute possible", and a cloud Primary Platform on AWS that does all of the decisioning (monzo-thousands-microservices-2023). Behind both sits Monzo Stand-in, a separately written backup bank of 18 services on GCP (monzo-stand-in-2025). No public source names a workflow engine. Multi-step work is coordinated by a Kafka queue library with retries and deadletters, store-and-forward logs at the scheme edge, and per-processor patterns such as deciders and effectors (monzo-kafka-queue-2024; monzo-faster-payments-gateway-2020; monzo-intl-payments-2024).

### Money path: card payment (Mastercard)
1. Mastercard to Monzo's data centres. "We connect directly to payment schemes through software and hardware hosted in our data centres." (monzo-stand-in-payments-2025)
2. Edge services (Primary Platform, AWS). Stateless services "whose only responsibility is to connect to the software in the data centres", with very few dependencies on shared platform components. They forward each request to scheme-specific processing logic, and they are where payments can be diverted to Stand-in (monzo-stand-in-payments-2025).
3. Card processor. Monzo runs its own "MasterCard processor written in Go" and keeps scheme complexity (for example EBCDIC encoding) inside that part of the platform (monzo-1500-microservices-2020, 2020). The Stand-in post names `service.mastercard` as the Primary Platform service that moves money in the Ledger (monzo-stand-in-2025).
4. Decisioning across shared services. Separate services handle chip-and-PIN, contactless and magstripe, and "A service will only get called if it needs to get involved with a particular type of transaction." (monzo-1500-microservices-2020, 2020). The processor calls the account service, which treats "accounts as a whole, as a singular abstraction at Monzo" (monzo-1500-microservices-2020, 2020), "services within our financial crime domain to assert whether the payment is legitimate", and "services within our ledger teams to record the transaction in our books" (monzo-thousands-microservices-2023).
5. Ledger and balance. `service.ledger` "is the source of truth for our customers' balances, and all money movements" (monzo-network-isolation-2019, 2019). Balances are computed from ledger entries (monzo-balances-2022).
6. Response to the network. Monzo aims to "respond to payment networks within tens of milliseconds" even though end-to-end processing takes under a second (monzo-modern-bank-backend-2016, 2016).
7. Asynchronous follow-up. Merchant enrichment, push notifications and inserting the transaction into the feed run asynchronously from a message queue (monzo-modern-bank-backend-2016, 2016). Processing outcomes and state transitions are published to the event system, where consumers such as the Stand-in Data Syncer read them (monzo-stand-in-2025).
8. Settlement and reconciliation. A daily job compares a ledger-entries table with settlement account bank statement lines (monzo-payments-safely-2022).

### Money path: Faster Payments bank transfer
1. FPS hub to Monzo data centres. Two data centres, each with two physical connections, one to each of the two FPS hubs, so three of four links can fail (monzo-faster-payments-gateway-2020, 2020).
2. Gateway (in-house since November 2019). One replicated Go monolith per FPS payment type. It handles the hub connection, "durably writes messages to disk, and performs authentication", and forwards payments to and from AWS. Messages are written to six SSDs across three servers per data centre (DRBD), and HSMs (two per data centre) authenticate messages (monzo-faster-payments-gateway-2020, 2020).
3. Per-message stand-in. If the processor in AWS has not answered by a deadline, the gateway sends the hub a stand-in response and forwards the message when the connection returns (monzo-faster-payments-gateway-2020, 2020).
4. Edge services and payment processor (AWS). The processor "will either debit or credit an account, or reject a payment" after its checks (monzo-faster-payments-gateway-2020, 2020; monzo-stand-in-payments-2025).
5. Effects. "Examples of effects are updating an account balance, showing a transaction in the app, and sending a response message back to the payment scheme." (monzo-stand-in-payments-2025)
6. Analytics copy. Sanitised payment messages are stored in BigQuery for near-real-time analysis (monzo-faster-payments-gateway-2020, 2020).

### Other money paths
- Monzo-to-Monzo: the app calls `POST /p2p-payments/create_transfer` on the `p2p-payments` service. Between current accounts, the transfer is a debit and a credit inside the ledger and no money leaves Monzo (monzo-p2p-payments-2018, 2018).
- International: a correspondent partner sends a SWIFT message. An adaptor microservice converts it, then the International Payment Processor runs four stages: Payment Creation (Adaptor), Decisioning (Deciders), Effect Generation (Effectors) and Effect Application (monzo-intl-payments-2024).

### Orchestration
- No public source found naming a workflow engine, saga framework or central orchestrator at Monzo. Coordination lives in each payment processor and in shared libraries.
- The 2016 requirement for async work: steps "must never be skipped", and "it must be possible for us to fix the issue and resume the process". Kafka was picked for persistence, replay and at-least-once delivery (monzo-modern-bank-backend-2016, 2016).
- Queue library (2024): Monzo started on NSQ and moved to Kafka for durability. Its client library adds deadlettering after `maxAttempts`, a retry topic per consumer group, a CLI to replay or drain deadlettered messages, and unordered concurrent consumption within a partition. Over 400 services use it on more than 2,500 topics (monzo-kafka-queue-2024).
- International Payment Processor: deciders return Accept, Reject or Hold. Hold stops processing until "an external system re-triggering processing after making a decision". Each effector returns metadata, giving "a full log of everything that has happened to a payment" (monzo-intl-payments-2024).
- Locks or queues by case: some operations need an etcd lock, while for others "We have a queue of things to apply to people's accounts." (monzo-1500-microservices-2020, 2020)
- Edge store-and-forward: the FPS gateway logs every message durably and forwards later if AWS is unreachable (monzo-faster-payments-gateway-2020, 2020).
- Recovery after failover: Stand-in writes its effects as Monzo Advices to a durable GCP Pub/Sub queue. "The Primary Platform does not re-run any decisioning for the payments that we've processed in Monzo Stand-in." The advice syncer accepts advices in any order and computes the final state when a payment's lifecycle (for example an authorization, then a reversal) was split across both platforms (monzo-stand-in-2025; monzo-stand-in-payments-2025).
- Progress checks: coherence checks run as event-driven services that track each payment's state from payment-system events (monzo-payments-safely-2022).

### Deployment topology
- Primary Platform: AWS. "Our Primary Platform operates across AWS availability zones and it runs multiple replicas of all our services." (monzo-stand-in-2025)
- etcd (locks) runs as nine nodes, three in each of three zones, to survive a zone plus one node (monzo-etcd-2017, 2017).
- Region: no Strong source names the AWS region. A 2018 forum reply from an anonymised account says "the vast majority of our platform is hosted in AWS' eu-west-1 region" and that multi-region "isn't something we've done yet" (monzo-forum-region-2018, Weak, author not verifiable).
- Own data centres: "a few data centers to integrate with some of the payment schemes" (monzo-thousands-microservices-2023). Before the 2019 gateway project they held only routing and switching hardware. The FPS gateway added three servers per data centre running VMs with Docker Compose, and moved from a third-party active-standby setup that needed "around 15 minutes' downtime" to flip to an active-active one (monzo-faster-payments-gateway-2020, 2020).
- Kubernetes: self-run since 2016; a move to EKS was in progress in 2023 (monzo-thousands-microservices-2023).
- Disaster recovery, Monzo Stand-in: an independent platform on GCP that covers card spending, cash withdrawals, bank transfers, balances and card freezing. It runs its own separately written services and holds only the minimal state needed, synced from the Primary Platform and treated as immutable there. It costs about 1% of the Primary Platform (monzo-stand-in-2025). AWS's case study gives 18 services against "over 3,000" and about 500 users routed to Stand-in each day for testing (monzo-aws-stand-in-nd).
- Not active-active: "The Primary Platform is our system of record" and Stand-in is authoritative only while enabled. Engineers switch it on per component and per user through a Stand-in Configuration service and CLI. It was enabled for all customers during an outage of about an hour in August 2024 (monzo-stand-in-2025).
- Two failover routes for payments: through the Primary Platform's edge services (finer control, per direction), or directly from the data centres if AWS is down (monzo-stand-in-payments-2025).
- Cells or customer shards of infrastructure: no public source found. Cassandra spreads data across nodes by partition key (monzo-thousands-microservices-2023).

### Platform layer
- Service chassis: Go services built on a shared core library that wraps business logic with HTTP servers, data marshalling, metrics, tracing, and Cassandra and etcd clients. "Our goal is to reduce variance as much as we can of each additional microservice we add." (monzo-1500-microservices-2020, 2020; monzo-thousands-microservices-2023)
- RPC: RPC over RabbitMQ (AMQP) in 2015, then HTTP from mid-2016 with Linkerd (built on Finagle) as a per-host Kubernetes daemon set for load balancing and retrying idempotent requests (monzo-thousands-microservices-2023; monzo-modern-bank-backend-2016, 2016). In 2023: "Nowadays, we just use plain old HTTP for our RPC framework." (monzo-thousands-microservices-2023). Typhon is the open-source RPC library (monzo-typhon-2026). Which service mesh or proxy runs today: no public source found.
- APIs: protobuf definitions with generated code, and no database joins across services (monzo-thousands-microservices-2023).
- Monorepo: "our single repository for all of our services". CI runs tests for the changed services and their dependents (monzo-1500-microservices-2020, 2020).
- Deployment: "We've built a bespoke deployment tool called Shipper, which handles all of the complexities like rolling deployments in Kubernetes and running migrations in Cassandra." (monzo-1500-microservices-2020, 2020). The 2023 pipeline builds Docker images and generates Kubernetes manifests so engineers do not write YAML (monzo-thousands-microservices-2023).
- Service boundaries: bounded contexts, each service with its own keyspace. "We actually encoded this as a core security control so that cross keyspaces reads were completely forbidden." (monzo-thousands-microservices-2023)
- Network boundaries: Kubernetes NetworkPolicy enforced with Calico. A tool, `rpcmap`, scans Go code and generates one egress rule file per called service, and the owners of critical services such as the ledger review new callers. In 2019 "there are over 9,300 unique connections" among more than 1,500 services (monzo-network-isolation-2019, 2019).
- Shared infrastructure offered as services: Kubernetes, Cassandra, etcd and Prometheus (monzo-1500-microservices-2020, 2020).

### Data platform
- Event bus: "These events are streamed via 'the firehose' (using Kafka and NSQ) to specific append-only projects in BigQuery." (monzo-data-stack-2021)
- Loaders: the Analytics Event Processor consumes the NSQ topics `firehose` and `client_analytics`, enriches payloads and strips personal data. The Analytics Event Shipper writes sanitised and raw events to BigQuery (monzo-data-stack-2021).
- Warehouse: BigQuery on GCP, with dbt (over 4,700 models in 2021), Airflow (mostly nightly, some tables every 15 minutes) and Looker. Fivetran loads accounting and web analytics data. The backend runs on AWS and analytics on GCP (monzo-data-stack-2021).
- Feature Store: moves ML features between BigQuery and Cassandra (monzo-data-stack-2021).
- Reconciliation and controls: coherence checks run as warehouse models ("In essence they're just fancy SQL statements that filter payments based on our defined rules.") or as event-driven services. Reconciliation compares ledger entries with bank statement lines daily (monzo-payments-safely-2022).
- Change data capture from Cassandra: no public source found. The sources read describe services publishing events, not log-based CDC.

### Published architecture diagrams
- https://monzo.com/blog/tolerating-full-cloud-outages-with-monzo-stand-in : Primary Platform (3,000 services) beside Stand-in (18 services), with payment and app traffic routed to both (monzo-stand-in-2025).
- Same page: Stand-in Data Syncer consuming Primary events into the Stand-in Datastore, plus tokenised data exchange (monzo-stand-in-2025).
- Same page: Stand-in publishing Monzo Advices to GCP Pub/Sub, applied by an Advice Consumer through `service.mastercard` to the Ledger (monzo-stand-in-2025).
- Same page: Mastercard traffic through Monzo's data centres into the Primary Platform, which proxies to `service.standin.mastercard` (monzo-stand-in-2025).
- https://monzo.com/blog/processing-payments-in-monzo-stand-in : three diagrams of Mastercard and FPS flow (data centres, edge services, processing services) in normal, diverted and Primary-down modes (monzo-stand-in-payments-2025).
- https://monzo.com/blog/how-we-moved-our-faster-payments-connection-in-house : Fig 1 FPS infrastructure; Fig 3 and 4 old active-standby and new active-active gateway; Fig 5 DRBD replication; Fig 6 replicated gateways; Fig 8 normal vs stand-in operation (monzo-faster-payments-gateway-2020, 2020).
- https://monzo.com/blog/building-a-processing-system-for-international-payments : processing stages (Adaptor, Decisioning, Effectors, Effect Application) and adaptor connectivity (webhooks, APIs, SWIFT) (monzo-intl-payments-2024).
- https://monzo.com/blog/2021/10/14/an-introduction-to-monzos-data-stack : data architecture from backend events to BigQuery, dbt and Looker (monzo-data-stack-2021).
- https://monzo.com/blog/2022/02/08/processing-payments-safely-at-scale : payment lifecycle flow and a ledger vs settlement account reconciliation break (monzo-payments-safely-2022).
- https://monzo.com/blog/we-built-network-isolation-for-1-500-services : the service graph with every enforced network rule, plain and coloured by team (monzo-network-isolation-2019, 2019).
- https://monzo.com/blog/how-we-built-a-queue-on-top-of-kafka : deadletter and retry topic flow for a consumer group (monzo-kafka-queue-2024).
- https://www.infoq.com/presentations/monzo-microservices : the talk shows all services involved when a card is tapped, and a call graph of every service. These are in the video slides; only the transcript was read (monzo-1500-microservices-2020, 2020).

### Stated architectural principles (verbatim quotes)
> "Daily batch processes, single points of failure, and maintenance windows are not acceptable in a world where customers expect 24x7, always-on access to their money" (monzo-modern-bank-backend-2016, 2016-09)

> "By making RPC the one common component, we can still get the benefits of code reuse without the drawbacks of tight coupling from code sharing." (monzo-modern-bank-backend-2016, 2016-09)

> "Despite this asynchronicity, these steps are very important and must never be skipped. Even if an error happens which can't be automatically recovered, it must be possible for us to fix the issue and resume the process." (monzo-modern-bank-backend-2016, 2016-09)

> "With a monolithic architecture, we avoided having to orchestrate service discovery and network calls which are more prone to failures than in-process communication." (monzo-faster-payments-gateway-2020, 2020-05)

> "we run the absolute minimum compute possible to interface messages with our core platform that does all of the decisioning on top of services that we build on top of AWS" (monzo-thousands-microservices-2023, 2023)

> "In practice, Monzo has very few use cases where ordering actually matters." (monzo-kafka-queue-2024, 2024-01)

> "Monzo's engineering philosophy has always been to be opinionated so we can make the road-most-travelled easy and delightful." (monzo-kafka-queue-2024, 2024-01)

> "The Primary Platform is our system of record, maintaining our records of truth, and at no point while Monzo Stand-in is enabled does it assume the role of our system of record." (monzo-stand-in-2025, 2025-02)

> "Building new logic ensures that we don't share any common points of failure between Monzo Stand-in and the Primary Platform." (monzo-stand-in-payments-2025, 2025-04)

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| monzo-modern-bank-backend-2016 | Building a Modern Bank Backend (Oliver Beattie) | Monzo | 2016-09 | https://monzo.com/blog/2016/09/19/building-a-modern-bank-backend | engineering-blog | Strong | yes |
| monzo-vault-cassandra-2019 | Migrating Vault's storage with no downtime (Jack Kleeman) | Monzo | 2019-12 | https://monzo.com/blog/migrating-vaults-storage-with-no-downtime | engineering-blog | Strong | partial |
| monzo-1500-microservices-2020 | Modern Banking in 1500 Microservices, QCon London 2020 (Matt Heath, Suhail Patel) | InfoQ | 2020 | https://www.infoq.com/presentations/monzo-microservices | talk | Strong | yes |
| monzo-faster-payments-gateway-2020 | How we moved our Faster Payments connection in-house (Wayne Tsai) | Monzo | 2020-05 | https://monzo.com/blog/how-we-moved-our-faster-payments-connection-in-house | engineering-blog | Strong | yes |
| monzo-aws-2020 | How Monzo built a bank of the future on AWS | Amazon UK | 2020-09 | https://www.aboutamazon.co.uk/news/aws/how-monzo-built-a-bank-of-the-future-on-aws | vendor case study | Medium | yes |
| monzo-payments-safely-2022 | Processing payments safely at scale (Joost van Oorschot) | Monzo | 2022-02 | https://monzo.com/blog/2022/02/08/processing-payments-safely-at-scale | engineering-blog | Strong | yes |
| monzo-balances-2022 | How we calculate balances (Basma Taha) | Monzo | 2022-02 | https://monzo.com/blog/2022/02/18/how-we-calculate-balances | engineering-blog | Strong | yes |
| monzo-balance-read-time-2023 | Speeding up our balance read time: the planning phase (Basma Taha, Nick Ng) | Monzo | 2023-04 | https://monzo.com/blog/2023/04/28/speeding-up-our-balance-read-time-the-planning-phase | engineering-blog | Strong | yes |
| monzo-thousands-microservices-2023 | Banking on Thousands of Microservices, QCon London 2023 (Suhail Patel; InfoQ published 2024-01) | InfoQ | 2023 | https://www.infoq.com/presentations/banking-thousands-microservices-2023 | talk | Strong | yes |
| monzo-cto-build-2023 | Tech stack: why going native sets you up for success (guest article by Monzo CTO Matej Pfajfar) | Tech.eu | 2023-10 | https://tech.eu/2023/10/29/tech-stack-why-going-native-sets-you-up-for-success/ | press | Medium | yes |
| monzo-intl-payments-2024 | Building a processing system for international payments (Ryan Kilburn) | Monzo | 2024-07 | https://monzo.com/blog/building-a-processing-system-for-international-payments | engineering-blog | Strong | yes |
| monzo-migrations-2800-services-2024 | How we run migrations across 2,800 microservices (Will Sewell) | Monzo | 2024-08 | https://monzo.com/blog/how-we-run-migrations-across-2800-microservices | engineering-blog | Strong | yes |
| monzo-stand-in-2025 | Tolerating full cloud outages with Monzo Stand-in (Daniel Chatfield, Andrew Lawson) | Monzo | 2025-02 | https://monzo.com/blog/tolerating-full-cloud-outages-with-monzo-stand-in | engineering-blog | Strong | yes |
| monzo-annual-report-2025 | Year in review 2025 (FY2025 annual report summary page) | Monzo | 2025 | https://monzo.com/annual-report/2025 | filing | Strong | partial |
| monzo-typhon-2026 | monzo/typhon GitHub repository and README (created 2015-02, active 2026-11) | Monzo (GitHub) | 2026-11 | https://github.com/monzo/typhon | repo | Strong | partial |
| monzo-stand-in-payments-2025 | Processing payments in Monzo Stand-in (Emma Espinosa, Sharan Moore) | Monzo | 2025-04 | https://monzo.com/blog/processing-payments-in-monzo-stand-in | engineering-blog | Strong | yes |
| monzo-p2p-payments-2018 | A technical look at how Monzo-to-Monzo payments work (James Routley) | Monzo | 2018-04 | https://monzo.com/blog/2018/04/05/how-monzo-to-monzo-payments-work/ | engineering-blog | Strong | yes |
| monzo-data-stack-2021 | An introduction to Monzo's data stack (Luke Singham) | Monzo | 2021-10 | https://monzo.com/blog/2021/10/14/an-introduction-to-monzos-data-stack | engineering-blog | Strong | yes |
| monzo-network-isolation-2019 | We built network isolation for 1,500 services to make Monzo more secure | Monzo | 2019-11 | https://monzo.com/blog/we-built-network-isolation-for-1-500-services | engineering-blog | Strong | partial |
| monzo-kafka-queue-2024 | How we built a queue on top of Kafka (Constantijn Schepens) | Monzo | 2024-01 | https://monzo.com/blog/how-we-built-a-queue-on-top-of-kafka | engineering-blog | Strong | yes |
| monzo-etcd-2017 | Very Robust etcd | Monzo | 2017-11 | https://monzo.com/blog/2017/11/29/very-robust-etcd/ | engineering-blog | Strong | partial |
| monzo-aws-stand-in-nd | Boosting resilience using a multicloud strategy with Monzo (AWS customer story on Monzo Stand-in) | Amazon Web Services | undated (accessed 2026-11) | https://aws.amazon.com/solutions/case-studies/monzo-case-study/ | vendor case study | Medium | yes |
| monzo-forum-region-2018 | Monzo Community forum thread 33994, reply from an anonymised account on AWS region and zones | Monzo Community forum | 2018-03 | https://community.monzo.com/t/this-posted-has-been-removed/33994 | third-party | Weak | yes |
