# Uber

**Category:** platform
**HQ / founded:** No source read for this note.
**Scale signal:** Ledger balances for "more than 1.2 billion entities"; the platform "moves hundreds of billions of dollars annually"; annualized gross bookings grew from $50 billion to $217 billion over the platform's ten years (2026-08) (uber-zero-sum-2026)
**Last researched:** 2026-11-11

## Summary

Uber's payments platform, Gulfstream, started in 2016 and launched in 2017. It models every payment as an immutable "money order" of debits and credits that must sum to zero before it is written (uber-zero-sum-2026; uber-payments-platform-2018; uber-ledgerstore-migration-2024). Gulfstream launched on Amazon DynamoDB because Uber's in-house sharded MySQL could not then guarantee strong consistency for balances. Uber later built LedgerStore, its own append-only ledger database, on top of Docstore (Uber's MySQL-based, Raft-replicated database). Uber says the reasons were deeper audit needs and DynamoDB's cost at its scale (uber-zero-sum-2026; uber-docstore-ledger-migration-2021; uber-ledgerstore-indexes-2024). Correctness rests on unique order IDs for exactly-once processing, a per-entity changelog with version numbers, reconciliation events, and a separate audit framework that recomputes over 1 billion accounting transactions a day (uber-gulfstream-2020; uber-audit-framework-2023). No public source names the programming language of Gulfstream or LedgerStore. Company-wide, Uber is mostly Go, then Java (uber-arm-2025).

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Go (60% of CPU) and Java (20%) company-wide; no public source names the language of Gulfstream or LedgerStore | Strong (company-wide only) | uber-arm-2025 |
| Main frameworks | Cadence workflow engine for synchronous payment flows; no public source on application frameworks | Strong | uber-zero-sum-2026 |
| Primary OLTP store(s) | LedgerStore (append-only ledger DB) on Docstore (MySQL plus Raft); DynamoDB for ledger and balances from 2017 | Strong | uber-zero-sum-2026; uber-ledgerstore-indexes-2024; uber-docstore-2021 |
| Service-layer persistence | Custom storage layers (LedgerStore over Docstore); no public source on ORM or SQL library use | Strong | uber-zero-sum-2026; uber-ledgerstore-indexes-2024 |
| Money / ledger model | Double-entry, immutable money orders that must sum to zero; adjustments are new orders; entity changelog as audit trail | Strong | uber-zero-sum-2026; uber-gulfstream-2020 |
| Messaging / streaming | Apache Kafka as the async payments bus; Redis for hot-account batching | Strong | uber-zero-sum-2026; uber-high-throughput-2026 |
| Infrastructure | Started on AWS DynamoDB; ledger moved to on-premises LedgerStore in Uber data centers | Strong | uber-ledgerstore-migration-2024 |
| Scaling approach | Hot data in DynamoDB plus cold data in TerraBlob, then one LedgerStore tier; serialized batch writes for hot accounts | Strong | uber-ledgerstore-migration-2024; uber-high-throughput-2026 |
| Build vs buy (core) | Build: own payments platform, own ledger database, own Docstore | Strong | uber-zero-sum-2026; uber-docstore-2021 |
| Notable open source | Cadence (open-sourced 2017); no ledger or payments code found open-sourced | Strong (2019 source) | uber-cadence-2019 |

## Languages and frameworks

- Company-wide (2025): "Uber's services are mostly built from three language-specific monorepos with the following CPU allocation distribution: 60% Go, 20% Java, and 10% Web." (uber-arm-2025)
- In 2020 Uber said it "writes most of its back-end services and libraries in Go" (uber-go-monorepo-2020, 2020).
- In 2016 Uber said its engineers "primarily write in Python, Node.js, Go, and Java" (uber-tech-stack-2016, 2016).
- Payments-specific: No public source found that names the language of Gulfstream or LedgerStore. The Gulfstream posts (2018, 2020, 2026), the LedgerStore posts (2021, 2024) and the 2026 hot-account post name no language (uber-zero-sum-2026; uber-gulfstream-2020; uber-payments-platform-2018; uber-ledgerstore-indexes-2024; uber-docstore-ledger-migration-2021; uber-high-throughput-2026).
- Adjacent finance system: the audit framework's recompute logic is "implemented ... in Java as a Hive User-Defined-Function", and the post also refers to "the actual library used by the Go service" (uber-audit-framework-2023).
- The DynamoDB-to-LedgerStore backfill and validation ran on Uber's internal Apache Spark (uber-ledgerstore-migration-2024).
- Synchronous, user-in-session payment flows use Cadence, Uber's workflow engine (uber-zero-sum-2026). Uber open-sourced Cadence in 2017, and the 2019 post describes its workflows as Go-based (uber-cadence-2019, 2019).
- Job listings: an Uber Senior Staff Engineer listing (Bengaluru, August 2026, closed) that works "across Payments" asks for "Java, Go, C/C++" (uber-job-senior-staff-2026). A search snippet for an Earner Payments backend role mentioned Java, Golang or Python plus MySQL or Cassandra, but the page returned 404 and was not read (uber-job-earner-payments-2025).

## The money layer (ledger, balances, payments)

- Gulfstream is a double-entry platform. The 2020 post calls it "Uber's fifth generation collection and disbursement payment platform" and a "SOX-compliant system built on the principles of double-entry accounting" (uber-gulfstream-2020, 2020).
- Core unit: the money order, "a series of debits and credits between the entities involved in the real-world commerce transaction." Orders are immutable: "an order once written can't be changed in any shape or form." (uber-zero-sum-2026)
- Zero-sum rule: pre-commit validations check that a money order's entries sum to zero, so "no money can ever be created or destroyed." (uber-zero-sum-2026) The 2020 post states the same rule: "The sum of all the entries is zero" (uber-gulfstream-2020).
- Corrections are append-only: "We write additional money orders to capture the adjustment." (uber-zero-sum-2026)
- Ledger structure: a ledger is an entity with one or more accounts and balances. "Each entity (such as a Spender, Earner, or Business) can have multiple sub-ledger accounts, all stored as a single row in DynamoDB." (uber-zero-sum-2026)
- The entity changelog "Captures balance updates on the ledger, providing a complete audit trail" and gives "the ability to recreate an entity's ledger since inception" (uber-zero-sum-2026).
- In 2020 Gulfstream processed money movement through "order processing that atomically alters user's payment accounts", and persisted balances "in a storage system with multiple zone quorum" (uber-gulfstream-2020, 2020).
- Ledger-as-a-Service: Uber generalized the ledger primitives into a multi-tenant service used for Uber Cash, Uber Money and Uber for Business invoice settlement (uber-zero-sum-2026).
- The 2026 hot-account post describes User Account Changelogs (UACs) as the immutable audit trail kept "for SOX compliance" (uber-high-throughput-2026).

## Service-layer persistence and databases

- Original choice (2016): "Back in 2016, Uber was just coming off its monolith architecture, and while we had a homegrown sharded MySQL offering, there was no perfect solution to guarantee strong consistency for ledger balances. We ended up building this specific data store on Amazon DynamoDB." (uber-zero-sum-2026)
- "We initially launched with a simpler data architecture backed by Amazon DynamoDB for orders and changelogs." (uber-zero-sum-2026)
- Tiering: Uber later kept "only 12 weeks of data (i.e., hot data) in DynamoDB" and moved older data to TerraBlob, its internal blob store. By then Gulfstream used three stores: DynamoDB, TerraBlob and LedgerStore (uber-ledgerstore-migration-2024).
- LedgerStore (LSG) is "Uber's append-only, ledger-style database". It is "verifiably immutable (i.e., you can check that records have not been altered using cryptographic signatures)" (uber-ledgerstore-migration-2024). The 2026 post calls it "a custom storage layer purpose-built for auditability and tamper-evident record-keeping", built with Uber's Storage Platform team (uber-zero-sum-2026).
- LedgerStore's backend moved from DynamoDB to Docstore, "Uber's general-purpose multi-model database" (uber-docstore-ledger-migration-2021, 2021). The 2021 phase covered the core record read/write path. Indexes followed later (uber-ledgerstore-indexes-2024).
- Docstore: "Docstore uses MySQL as the underlying database engine." "Docstore provides a strict serializability consistency model on a partition level." "To ensure consistency, each partition runs the raft consensus protocol." It enforces "schema-on-write" by default (uber-docstore-2021, 2021). The 2024 index post repeats that "Docstore is a distributed database built on top of MySQL" (uber-ledgerstore-indexes-2024).
- LedgerStore index types (2024): strongly consistent indexes built with a two-phase commit (an index intent written before the record), eventually consistent indexes built from Docstore materialized views, and time-range indexes used to offload old ledgers to cold storage. Strongly consistent indexes are used only where needed, because the serial write path adds latency and lowers availability (uber-ledgerstore-indexes-2024).
- Balances today: the 2026 hot-account post names a "User Account Store" as "the authoritative data store for account balances" but not its database. It rejected "Using multiple Amazon DynamoDB rows for a single account", which implies but does not state that balances still sit in DynamoDB. Audit durability uses "a combination of Redis for speed and Docstore for durability" (uber-high-throughput-2026).
- Accounting transactions (a finance system next to Gulfstream): "We use our in-house NoSQL datastore Schemaless as our transaction store." (uber-audit-framework-2023)
- ORM vs SQL-first: No public source found on whether Uber's payments services use an ORM, a SQL library, or only the LedgerStore and Docstore client APIs.

## Scale

- Over ten years, annualized gross bookings grew from $50 billion to $217 billion. Total money movement is "nearly 2x gross bookings". Ledger balances cover "more than 1.2 billion entities". Uber Pay handles "50+ payment methods globally" (uber-zero-sum-2026).
- LedgerStore migration: "more than a trillion entries (making up a few petabytes of data)". Immutable records were 1.2 PB compressed and secondary indexes 0.5 PB uncompressed (uber-ledgerstore-migration-2024).
- LedgerStore indexes: over 2 trillion unique indexes, petabyte-scale index storage, hundreds of billions of ledgers (uber-ledgerstore-indexes-2024).
- 2021 Docstore phase: more than 250 billion unique records (about 300 TB) of historical data, backfilled at up to 1 million messages per second (uber-docstore-ledger-migration-2021, 2021).
- Hot accounts (2026): some accounts needed over 30 operations per second when the system handled about 3 to 4. A batching service with 250 ms windows fixed this (uber-high-throughput-2026). The 2026 overview says a serialized batch-write mechanism raised throughput 10x for hot entities (uber-zero-sum-2026).
- Audit framework: "over 1 billion accounting transactions per day" (uber-audit-framework-2023).
- 2020: "more than 18 million requests per day, in 10,000+ cities" (uber-gulfstream-2020, 2020).

## Build vs buy

- Build at every layer: Gulfstream (own payments platform), LedgerStore (own ledger database), Docstore (own MySQL-based distributed database), Cadence (own workflow engine, open-sourced) (uber-zero-sum-2026; uber-docstore-2021; uber-cadence-2019).
- The one bought component in the money layer was Amazon DynamoDB (2017 launch). Uber replaced it with in-house storage for cost, consolidation and latency reasons (uber-ledgerstore-migration-2024; uber-docstore-ledger-migration-2021).
- No core banking vendor is mentioned in any source read. No public source found on external ledger products.

## Correctness (idempotency, reconciliation, audit)

- Idempotency was a design goal from the start. The 2018 post lists "exactly-once payment processing by the means of idempotency and strong consistency" among the platform's goals, and describes "storing request metadata for idempotent multiplexing and retries" (uber-payments-platform-2018, 2018).
- "The processed order unique identifiers are used to guarantee exactly once order processing." Orders are processed only after they are persisted (uber-gulfstream-2020, 2020).
- Ordering: each changelog entry carries a per-user version number, so "our system serializes writebacks by the entity change log's version number per user" (uber-gulfstream-2020, 2020).
- Reconciliation: "If it still fails, we publish a reconciliation event to another Messaging Queueing System topic." The 2020 post calls Gulfstream a system that "can reconcile itself" (uber-gulfstream-2020, 2020).
- Hot-account batching (2026): "an atomic update with optimistic locking ensures exactly-once processing and consistency", and a compact audit format (MicroUAC) gives idempotency guarantees (uber-high-throughput-2026).
- Audit framework (2023): every transaction emits "a compressed audit event to a secure and lossless Kafka topic". Daily batch jobs recompute transactions and check whether "the transactions written in Schemaless are in sync with the data generated by recompute" (uber-audit-framework-2023).
- Migration correctness: shadow validation targeted at least 99.99% completeness and correctness, with offline validation against a DynamoDB dump. Backfill jobs had to be idempotent (uber-ledgerstore-migration-2024). The 2021 phase closed sealing windows only when checksums from two regions matched, and used Kafka offsets and sequence numbers for exactly-once stream processing (uber-docstore-ledger-migration-2021, 2021).
- LedgerStore records can be checked for alteration with cryptographic signatures (uber-ledgerstore-migration-2024).

## Changes over time (migrations and reasons)

| When | From | To | Stated reason | Key |
|---|---|---|---|---|
| 2016 to 2017 (built over about 2 years) | Two legacy systems, one for collections and one for disbursements | Gulfstream, one double-entry platform | "no holistic view of end-to-end money movements"; wanted a "role-agnostic system" | uber-gulfstream-2020; uber-ledgerstore-migration-2024 |
| 2017 | In-house sharded MySQL (not used for the ledger) | Amazon DynamoDB for ledger, orders, changelogs | MySQL offering could not guarantee strong consistency for ledger balances | uber-zero-sum-2026 |
| After launch, date not stated | All data in DynamoDB | 12 weeks hot in DynamoDB, older data in TerraBlob | DynamoDB cost at scale | uber-ledgerstore-migration-2024 |
| By 2021 | DynamoDB as LedgerStore backend | Docstore as LedgerStore backend (records) | "becoming expensive"; consolidation | uber-docstore-ledger-migration-2021 |
| About 2022 to 2024 (two years) | DynamoDB plus TerraBlob plus LedgerStore | LedgerStore only (over a trillion entries) | Cost; three stores to one; on-premises latency; index lag | uber-ledgerstore-migration-2024 |
| By 2024 | LedgerStore indexes on DynamoDB | Indexes on Docstore | Cost; DynamoDB hot partitions on time-range indexes | uber-ledgerstore-indexes-2024 |
| By 2026 | Single-row balance updates | Serialized batch writes for hot accounts | Hot accounts needed 30+ ops per second vs about 3 to 4 | uber-high-throughput-2026 |

Note on the Gulfstream start year: the 2026 overview says work "began in 2016 in a single conference room" (uber-zero-sum-2026). The 2024 migration post says Gulfstream "was launched in 2017 using DynamoDB for storage" (uber-ledgerstore-migration-2024), and the December 2018 post says "Last year, we launched our next-generation payments platform" (uber-payments-platform-2018). Read together: design started in 2016, launch was in 2017. InfoQ's 2017 figure (uber-infoq-ledgerstore-2024) matches the launch date.

## Stated reasons (verbatim quotes)

> "Back in 2016, Uber was just coming off its monolith architecture, and while we had a homegrown sharded MySQL offering, there was no perfect solution to guarantee strong consistency for ledger balances." (uber-zero-sum-2026, 2026-08; trademark symbols omitted)

> "As audit requirements deepened, we moved beyond off-the-shelf databases to build infrastructure tailored to our unique requirements." (uber-zero-sum-2026, 2026-08)

> "an order once written can't be changed in any shape or form." (uber-zero-sum-2026, 2026-08)

> "At Uber's scale, DynamoDB became expensive." (uber-ledgerstore-migration-2024, 2024-04)

> "Going from three to a single storage would simplify the code and design of the Gulfstream services responsible for interacting with storage and creating indexes." (uber-ledgerstore-migration-2024, 2024-04)

> "Additionally, it would give us faster network latency because it was running on-premises within Uber's data centers." (uber-ledgerstore-migration-2024, 2024-04)

> "Over this period of time we realized that operating LedgerStore with DynamoDB as a backend was becoming expensive." (uber-docstore-ledger-migration-2021, 2021-11)

> "Ledgers, due to their immutable nature, keep growing in size over time, thereby increasing their cost of storage." (uber-ledgerstore-indexes-2024, 2024-04)

> "Transaction-based systems are hard to extend for running balances and accounting for user entities." (uber-gulfstream-2020, 2020-10)

> "We found Cassandra to be lacking operational maturity at Uber's scale and at the same time it did not provide the desired level of efficiency." (uber-docstore-2021, 2021-02; general database reason, not payments-specific)

## Open questions

- Which language Gulfstream and LedgerStore services are written in. Go is the likely default given company-wide numbers, but this is unverified for payments.
- Whether the entity balance store (User Account Store) is still on DynamoDB in 2026. The 2026 hot-account post implies it but does not say so (uber-high-throughput-2026).
- Whether payments services use an ORM or SQL library on top of Docstore, or only the LedgerStore and Docstore client APIs. No public source found.
- The $6 million per year saving appears in both the 2021 Docstore post ("$6 million per year") and the 2024 index post ("over $6 million per year"). It is unclear whether these are two separate savings or the same figure restated. InfoQ attributes it to the whole LedgerStore move (uber-infoq-ledgerstore-2024).
- How Uber handles personal-data deletion (for example GDPR erasure) in an immutable, cryptographically verifiable ledger. No public source found.
- Unverified (third-party commentary seen only in search results): a newsletter post argues the original DynamoDB ledger design was a costly mistake. Not read; do not cite.
- Relationship between Gulfstream's ledger and the Schemaless-backed accounting transaction store audited in 2023 (uber-audit-framework-2023). Not explained in any source read.

## System architecture

Gulfstream is a set of stateless microservices joined by Kafka, with two shared stores: the money order store and the entity balance store (uber-zero-sum-2026). Most money moves through an asynchronous order pipeline, and only user-in-session payments run synchronously on Cadence (uber-zero-sum-2026). The public record covers the order pipeline, the balance and ledger stores and the multi-region messaging layer well. It says little about service frameworks, disaster recovery targets or how payments data reaches the general ledger.

### Money path

The 2020 and 2026 posts name the components below. Neither gives the exact order of the balance update and the external provider call, so steps 4 to 6 may overlap.

1. **Product line or client request.** Trips, Uber Eats orders, freight and Uber Cash top-ups all become money orders, "a series of debits and credits between the entities involved" (uber-zero-sum-2026). Fares are recorded for every participating entity, and zero-sum is enforced at the point of computation ("Entity Fares") (uber-zero-sum-2026).
2. **Order insertion service.** "The order insertion service handles the request to create a Payment order." It publishes the order to messaging topics and persists it to OrderStore (uber-gulfstream-2020, 2020). Pre-commit validations check that the order's entries sum to zero before it is written (uber-zero-sum-2026).
3. **OrderStore and the messaging bus.** Orders are immutable once stored (uber-gulfstream-2020, 2020). In 2020 services exchanged orders on "lossless Messaging Queueing System clusters that are available in multiple regions" (uber-gulfstream-2020, 2020). The 2026 post names Apache Kafka as "the underlying messaging bus" (uber-zero-sum-2026).
4. **Order processing service.** "The order processing service consumes and processes payment orders." It "produces successive orders when it processes the initial payment orders" and "routes collection and disbursement requests to the corresponding payment service providers" (uber-gulfstream-2020, 2020). In 2026 the stages are split across microservices for money order creation, processing, collection and disbursement (uber-zero-sum-2026).
5. **Entity balance store (User Account Store).** Order processing atomically alters users' payment accounts, kept "in a storage system with multiple zone quorum" (uber-gulfstream-2020, 2020). The 2026 hot-account post calls the User Account Store "The authoritative data store for user account balances and state" (uber-high-throughput-2026). For hot accounts, a Batch Creator receives operations over RPC and groups them into 250 millisecond batches in Redis. A Batch Process service then reads the account once, applies the batch in memory and writes it back with optimistic locking (uber-high-throughput-2026).
6. **Entity changelog, UACs and LedgerStore.** Each balance change is recorded in the entity changelog with a per-user version number (uber-gulfstream-2020, 2020). A Batch Post-Processing service writes User Account Changelogs (UACs) to a Transaction DB that "Stores the immutable audit trail (UACs) required for SOX compliance and regulatory requirements", and publishes them downstream off the critical path (uber-high-throughput-2026). Ledger records live in LedgerStore, which runs "on-premises within Uber's data centers" (uber-ledgerstore-migration-2024).
7. **Payment integration interface.** The core platform calls a generic instrument interface with APIs "such as charge, disburse, refund", and "The core platform itself had no instrument-specific logic" (uber-zero-sum-2026). Instruments include cards, PayPal, UPI, Alipay, Apple Pay, Google Pay, PIX and Uber Cash (uber-zero-sum-2026).
8. **External providers and networks.** Uber Pay, "our reverse-integration platform for local and alternative payment methods", manages 50+ payment methods (uber-zero-sum-2026). In 2018 Uber described integrating PSPs and banks on top of its collection and disbursement instruments (uber-payments-platform-2018, 2018). No public source found that names Uber's card processors or acquiring banks.

During the migration from the legacy systems, a writeback service also copied changelog events to the legacy collection and disbursement systems in version order, with a reconciliation topic for failed writebacks (uber-gulfstream-2020, 2020).

### Orchestration

- **Asynchronous by default.** The 2026 post says the async pipeline "processes the majority of Uber's money traffic today" (uber-zero-sum-2026). In 2018 Uber described "asynchronous stream processing of immutable orders" in a loosely coupled system (uber-payments-platform-2018, 2018).
- **Successive orders.** The order processing service produces successive orders from an initial payment order and then payment result orders; the 2020 post names no separate coordinator for these steps (uber-gulfstream-2020, 2020). "We process orders after we persist them." (uber-gulfstream-2020, 2020)
- **Cadence for synchronous flows.** "For user-in-session flows, we used Uber's internal workflow engine - Cadence" (uber-zero-sum-2026). The 2019 Cadence post says Cadence provides its own persistence, queue and timers and runs on a Cassandra back end; it gives no payments examples (uber-cadence-2019, 2019). No public source found on which payment flows run on Cadence or how they are modeled.
- **Retries and replay.** Gulfstream relies on "exponential retries of temporarily failing payments over a long period of time", plus retry queues and replay APIs (uber-gulfstream-2020, 2020). Batch processing uses deterministic batching and reliable scheduling to stay idempotent (uber-payments-platform-2018, 2018).
- **Hot-account coordination.** Batches are serialized per account through atomic Redis Lua scripts, and the Redis instance holding a batch is its clock (uber-high-throughput-2026).
- **Sagas and compensation.** No public source found. Corrections are new money orders, not reversals of a workflow (uber-zero-sum-2026).

### Deployment topology

- **Active-active as a goal.** The 2018 goals list "high reliability through an active-active architecture" (uber-payments-platform-2018, 2018). The 2020 post has a section titled "Highly available and active in all regions" (uber-gulfstream-2020, 2020).
- **Regions and zones.** "We have standby cross-region consumer instances in our deployment pools." Balance data sits in storage "with multiple zone quorum" (uber-gulfstream-2020, 2020). The 2026 architecture figure shows "West and East regions, async replication, and global table replication" (alt text) (uber-zero-sum-2026). Hot-account batch processors run in multiple availability zones and keep working through a single-zone outage (uber-high-throughput-2026).
- **Kafka disaster recovery.** Producers write to regional clusters, which replicate to aggregate clusters in each region (uber-kafka-dr-2020, 2020). Uber says the active/passive consumer mode is "commonly used by services that favor stronger consistency such as payment processing and auditing": one consumer reads from the primary region, offsets are synced to the other region, and on failure the consumer resumes there (uber-kafka-dr-2020, 2020). The post does not name Gulfstream.
- **Cross-region checks.** In the 2021 LedgerStore migration, a 30-minute sealing window closed only when four checksums across two regions matched (uber-docstore-ledger-migration-2021, 2021).
- **Own data centers and cloud.** Gulfstream launched on Amazon DynamoDB, and LedgerStore now runs on-premises in Uber's data centers (uber-ledgerstore-migration-2024). Company-wide, Uber's infrastructure "operates in multiple zones in multiple regions" across "on-prem data centers and public cloud providers" (uber-load-balancing-2022). In February 2023 Uber began "migrating from on-premise data centers to the cloud with Oracle Cloud Infrastructure and Google Cloud Platform" (uber-arm-bootstrap-2025; trademark symbols omitted). No public source found on whether payments services or LedgerStore have moved to the cloud.
- **Cells, RPO and RTO.** No public source found on cell-based isolation for payments or on recovery point and recovery time targets.

### Platform layer

- **Services.** Gulfstream is built as independent, stateless microservices, each owning one stage of the money movement lifecycle (uber-zero-sum-2026).
- **Service mesh and RPC.** Uber's mesh is "centered around an on-host L7 reverse proxy" that has carried RPC between thousands of microservices since 2016. A caller sends its RPC to a local proxy port, and the proxy routes it to a callee task using a mostly zonal control plane (uber-load-balancing-2022). The post mentions a TChannel-to-HTTP2 migration but does not name the RPC framework (uber-load-balancing-2022). No Uber engineering source read names the RPC framework used by payments services.
- **Deployment.** Stateless services deploy through Up, which places them on Peloton and Kubernetes clusters and rolls changes out "gradually, in small increments" with canaries and automatic revert (uber-up-2023). "Uber's infrastructure follows a model where a group of zones form a region", and each zone is backed by a single provider, either Uber hardware or public cloud (uber-up-2023). Stateful workloads run on Odin, Uber's stateful platform (uber-arm-bootstrap-2025).
- **Payments rollout.** Gulfstream's migration was controlled "by dynamic configurations so that we did not need to deploy code during the rollout" (uber-gulfstream-2020, 2020).

### Data platform

- **Event bus.** Kafka at Uber streams database changelogs to downstream subscribers and ingests data into the Hadoop data lake (uber-kafka-dr-2020, 2020). Gulfstream publishes UACs downstream through messaging after each batch (uber-high-throughput-2026).
- **Change capture for LedgerStore.** Kafka tails the Docstore changelog, and Flux plus Spark jobs compute sealing checksums over 30-minute windows (uber-docstore-ledger-migration-2021, 2021). Spark also ran the LedgerStore backfill and offline validation against a DynamoDB dump (uber-ledgerstore-migration-2024).
- **Validation and debugging.** In 2020 Gulfstream logged per-order debugging data in Hive and ran validation jobs every 24 hours, split by country and city (uber-gulfstream-2020, 2020).
- **Audit and reconciliation (Tesseract).** The Financial Computation Service consumes Kafka events (trip completion, charge failed, promotions, redemptions), writes transactions to Schemaless, and sends a compressed audit event per transaction to "a secure and lossless Kafka topic" (uber-audit-framework-2023). Audit events land in HDFS with Hive tables on top, and daily batch jobs recompute transactions and reconcile them with Schemaless (uber-audit-framework-2023). The post does not say whether these transactions come from Gulfstream (uber-audit-framework-2023).
- **Reporting.** The audit framework supports financial reports published to regulators (uber-audit-framework-2023). No public source found on how Gulfstream data reaches the general ledger, ERP or data warehouse.

### Published architecture diagrams

| Page | What the diagram shows | Key |
|---|---|---|
| https://www.uber.com/blog/ubers-payments-platform/ | "Current Architecture" figure: payment platform across West and East regions with async replication and global table replication | uber-zero-sum-2026 |
| https://www.uber.com/blog/money-scale-strong-data/ | Five pipelines: order creation, order processing, entity change log in order processing, writeback to legacy, and validation (2020) | uber-gulfstream-2020 |
| https://www.uber.com/blog/high-throughput-processing/ | Figure 3: Batch Creator, Batch Process and Batch Post-Processing services around Redis and the User Account Store; Figure 4: multi-zone fault tolerance | uber-high-throughput-2026 |
| https://www.uber.com/blog/migrating-from-dynamodb-to-ledgerstore/ | Figure 1: Gulfstream data flow before (DynamoDB plus TerraBlob plus LedgerStore) and after (LedgerStore only); Figure 2: LedgerStore rollout | uber-ledgerstore-migration-2024 |
| https://www.uber.com/blog/dynamodb-to-docstore-migration/ | Figure 2: Flux and Kafka sealing process; Figures 4 and 5: migration phases from shadow writes to DynamoDB decommission (2021) | uber-docstore-ledger-migration-2021 |
| https://www.uber.com/blog/automated-audit-framework-for-internet-scale-financial-transactions/ | Figure 1: workflow of a transaction at Uber; Figure 9: audit event recompute and reconciliation flow | uber-audit-framework-2023 |
| https://www.uber.com/blog/kafka/ | Figure 2: Kafka regional and aggregate clusters in two regions; Figure 6: active/passive consumer failover between regions (2020) | uber-kafka-dr-2020 |
| https://www.uber.com/en-IN/blog/better-load-balancing-real-time-dynamic-subsetting/ | Service A calling Service B through on-host proxies, and proxy connection subsetting | uber-load-balancing-2022 |
| https://www.uber.com/us/en/blog/up-portable-microservices-ready-for-the-cloud/ | Up's three layers (Experience, Platform, Federation) over Peloton and Kubernetes clusters (no caption) | uber-up-2023 |

### Stated architectural principles (verbatim)

> "To make our system self-auditable, we made our money order immutable." (uber-zero-sum-2026, 2026-08)

> "The two shared sources of truth across all services are the money order store and the entity balance store." (uber-zero-sum-2026, 2026-08)

> "The core platform itself had no instrument-specific logic" (uber-zero-sum-2026, 2026-08)

> "Strong consistency gave us a ledger we could trust." (uber-zero-sum-2026, 2026-08)

> "high reliability through an active-active architecture" (uber-payments-platform-2018, 2018-12, listed as a platform goal)

> "We process orders after we persist them." (uber-gulfstream-2020, 2020-10)

> "Versioning is essential to promote consistency across two asynchronous systems." (uber-gulfstream-2020, 2020-10)

> "Continuous validation is essential for migration and rollout." (uber-gulfstream-2020, 2020-10)

> "Only one read and one write per batch, regardless of the number of operations, drastically reduces total latency." (uber-high-throughput-2026, 2026-03)

> "Active/passive mode is commonly used by services that favor stronger consistency such as payment processing and auditing." (uber-kafka-dr-2020, 2020-12)

> "A portable service is one that can run in any zone within a region." (uber-up-2023, 2023-09; company-wide, not payments-specific)

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| uber-zero-sum-2026 | Zero Sum by Design: 10 Years of Uber's Payments Platform | Uber Engineering Blog | 2026-08 | https://www.uber.com/blog/ubers-payments-platform/ | engineering-blog | Strong | yes |
| uber-high-throughput-2026 | Building High Throughput Payment Account Processing | Uber Engineering Blog | 2026-03 | https://www.uber.com/blog/high-throughput-processing/ | engineering-blog | Strong | yes |
| uber-ledgerstore-migration-2024 | Migrating a Trillion Entries of Uber's Ledger Data from DynamoDB to LedgerStore | Uber Engineering Blog | 2024-04 | https://www.uber.com/blog/migrating-from-dynamodb-to-ledgerstore/ | engineering-blog | Strong | yes |
| uber-ledgerstore-indexes-2024 | How LedgerStore Supports Trillions of Indexes at Uber | Uber Engineering Blog | 2024-04 | https://www.uber.com/blog/how-ledgerstore-supports-trillions-of-indexes/ | engineering-blog | Strong | yes |
| uber-audit-framework-2023 | Automated Audit Framework For Internet Scale Financial Transactions | Uber Engineering Blog | 2023-06 | https://www.uber.com/blog/automated-audit-framework-for-internet-scale-financial-transactions/ | engineering-blog | Strong | yes |
| uber-docstore-ledger-migration-2021 | How Uber Migrated Financial Data from DynamoDB to Docstore (2021, older than 5 years) | Uber Engineering Blog | 2021-11 | https://www.uber.com/blog/dynamodb-to-docstore-migration/ | engineering-blog | Strong | yes |
| uber-docstore-2021 | Evolving Schemaless into a Distributed SQL Database (2021, older than 5 years) | Uber Engineering Blog | 2021-02 | https://www.uber.com/blog/schemaless-sql-database/ | engineering-blog | Strong | yes |
| uber-gulfstream-2020 | Revolutionizing Money Movements at Scale with Strong Data Consistency (2020, older than 5 years) | Uber Engineering Blog | 2020-10 | https://www.uber.com/blog/money-scale-strong-data/ | engineering-blog | Strong | yes |
| uber-payments-platform-2018 | Engineering Uber's Next-Gen Payments Platform (2018, older than 5 years) | Uber Engineering Blog | 2018-12 | https://www.uber.com/us/en/blog/payments-platform/ | engineering-blog | Strong | yes |
| uber-arm-2025 | Adopting Arm at Scale: Transitioning to a Multi-Architecture Environment | Uber Engineering Blog | 2025-02 | https://www.uber.com/blog/adopting-arm-at-scale-transitioning-to-a-multi-architecture-environment/ | engineering-blog | Strong | partial |
| uber-go-monorepo-2020 | Building Uber's Go Monorepo with Bazel (2020, older than 5 years) | Uber Engineering Blog | 2020-05 | https://www.uber.com/blog/go-monorepo-bazel/ | engineering-blog | Strong | partial |
| uber-cadence-2019 | Conducting Better Business with Uber's Open Source Orchestration Tool, Cadence (2019, older than 5 years) | Uber Engineering Blog | 2019-11 | https://www.uber.com/blog/open-source-orchestration-tool-cadence-overview/ | engineering-blog | Strong | partial |
| uber-tech-stack-2016 | The Uber Engineering Tech Stack, Part I: The Foundation (2016, older than 5 years) | Uber Engineering Blog | 2016-07 | https://www.uber.com/blog/tech-stack-part-one-foundation/ | engineering-blog | Strong | partial |
| uber-job-senior-staff-2026 | Senior Staff Engineer, Bengaluru (Uber listing mirrored on AnitaB.org job board, closed) | Uber via AnitaB.org | 2026-08 | https://jobs.anitab.org/companies/uber/jobs/90965602-senior-staff-engineer | job-listing | Medium | yes |
| uber-job-earner-payments-2025 | Backend Software Engineer, Earner Payments, Amsterdam (page returned 404) | Uber Careers | 2025-12 | https://www.uber.com/global/en/careers/list/151682/ | job-listing | Medium | no |
| uber-infoq-ledgerstore-2024 | Uber Migrates 1 Trillion Records from DynamoDB to LedgerStore to Save $6 Million Annually | InfoQ | 2024-05 | https://www.infoq.com/news/2024/05/uber-dynamodb-ledgerstore | press | Weak | yes |
| uber-kafka-dr-2020 | Disaster Recovery for Multi-Region Kafka at Uber (2020, older than 5 years) | Uber Engineering Blog (Yupeng Fu, Mingmin Chen) | 2020-12 | https://www.uber.com/blog/kafka/ | engineering-blog | Strong | yes |
| uber-load-balancing-2022 | Better Load Balancing: Real-Time Dynamic Subsetting | Uber Engineering Blog (Chien-Chih Liao, Pawel Krolikowski, Sangeeta Kundu) | 2022-05 | https://www.uber.com/en-IN/blog/better-load-balancing-real-time-dynamic-subsetting/ | engineering-blog | Strong | partial |
| uber-up-2023 | Up: Portable Microservices Ready for the Cloud | Uber Engineering Blog (Mathias Schwarz, Andrew Neverov) | 2023-09 | https://www.uber.com/us/en/blog/up-portable-microservices-ready-for-the-cloud/ | engineering-blog | Strong | partial |
| uber-arm-bootstrap-2025 | Adopting Arm at Scale: Bootstrapping Infrastructure | Uber Engineering Blog (Andreas Lykke, Jesper Borlum) | 2025-02 | https://www.uber.com/blog/adopting-arm-at-scale-bootstrapping-infrastructure/ | engineering-blog | Strong | partial |
