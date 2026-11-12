# Shopify

**Category:** platform
**HQ / founded:** Ottawa, Canada (shopify-10k-2025). The Rails codebase was started in 2004 and has never been rewritten (shopify-techstack-2018).
**Scale signal:** BFCM 2024: 57.3 PB of data, 10.5 trillion database queries, 1.17 trillion database writes, peak 284 million requests per minute at the edge (shopify-bfcm-readiness-2025). FY2025: $248.1 billion of GMV processed through Shopify Payments, a 65.6% penetration rate (shopify-10k-2025). Peak of $5.1 million in sales per minute on Black Friday 2025 (shopify-inventory-reservations-2026).
**Last researched:** 2026-11-11

## Summary
Shopify runs one of the largest Ruby on Rails monoliths on MySQL, and chose a modular monolith over microservices in 2019 to avoid the network, deployment and data-access costs of splitting it (shopify-modular-monolith-2019). It scales below the ORM: the core database is sharded by shop into isolated "pods", and newer apps such as Shop app use Vitess, picked because Shopify prefers to run its own primary datastores and wanted to stay SQL compatible (shopify-pods-2018; shopify-shop-vitess-2024). Its payment correctness practice is public and specific: a centralized Payment Service with idempotency keys stored as database rows with named recovery points, ULID keys, and reconciliation against financial partners that records mismatches as "anomalies" (shopify-graphql-idempotency-2019; shopify-resilient-payments-2022). The card processing technology behind Shopify Payments is bought, not built: the 10-K names Stripe and PayPal as the two suppliers (shopify-10k-2025). No first-party engineering source describes Shopify's money ledger model (double-entry, immutability); the only public description of a "Shopify Ledger" comes from an aggregator copy of a job listing.

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Ruby (core); Go for new ledger services per an unverified listing | Strong (Ruby); Weak (Go) | shopify-techstack-2018; shopify-job-payments-ledger-2026 |
| Main frameworks | Ruby on Rails (modular monolith plus hundreds of domain Rails apps) | Strong | shopify-techstack-2018; shopify-modular-monolith-2019 |
| Primary OLTP store(s) | MySQL (Percona Server), sharded by shop; Redis and Memcached per pod | Strong | shopify-mysql-upgrade-2021; shopify-pods-2018 |
| Service-layer persistence | ORM (ActiveRecord), with patches for sharding keys and composite primary keys | Strong | shopify-shop-vitess-2024; shopify-composite-pk-2020 |
| Money / ledger model | No public source found (first party). Money stored as decimals via in-house Money gem | Strong (gem only) | shopify-money-gem-2026 |
| Messaging / streaming | Kafka; Debezium CDC from 100+ MySQL shards | Strong | shopify-cdc-2021; shopify-techstack-2018 |
| Infrastructure | Google Cloud (GCE VMs for MySQL, GKE for app pods) | Strong | shopify-10k-2025; shopify-mysql-upgrade-2021; shopify-techstack-2018 |
| Scaling approach | Shop-keyed sharding into isolated pods; Vitess for Shop app | Strong | shopify-pods-2018; shopify-shop-vitess-2024 |
| Build vs buy (core) | Buy processing (Stripe, PayPal); build Payment Service and platform | Strong | shopify-10k-2025; shopify-graphql-idempotency-2019 |
| Notable open source | Ghostferry, Semian, Toxiproxy, Packwerk, YJIT, shopify-money | Strong | shopify-shard-balancing-2021; shopify-resilient-payments-2022; shopify-yjit-2023; shopify-money-gem-2026 |

## Languages and frameworks
- Shopify started on Ruby on Rails in 2004 and "is now one of the world's largest and oldest Rails apps. It's never been rewritten and still uses the original codebase" (shopify-techstack-2018, 2018).
- Besides the core monolith there are "hundreds of other Rails apps across the organization", described as domain-specific apps rather than microservices (shopify-techstack-2018, 2018).
- Shopify built YJIT, a JIT compiler inside CRuby, and deployed it on its whole Storefront Renderer fleet with Ruby 3.2, measuring 5% to 10% faster end-to-end requests (shopify-yjit-2023). YJIT itself was ported from C99 to Rust in 2021 (shopify-yjit-2023).
- The payments idempotency library is a Ruby internal DSL of "recovery points" (shopify-graphql-idempotency-2019, 2019).
- An aggregator copy of a 2026 payments job listing says the ledger team works "in Ruby on Rails within Shopify's core platform, and in Go for new services" (shopify-job-payments-ledger-2026). This is Weak evidence; the original posting was not found on shopify.com.

## The money layer (ledger, balances, payments)
- **Payment Service.** In 2019 Shopify described a "new Payment Service" that "centralizes payment processing for certain payment methods", owned by the Money Infrastructure team, "responsible for the code that moves money, handles and records the interactions with various payment providers". It exposes a GraphQL API used by Shopify and its Billing system (shopify-graphql-idempotency-2019, 2019).
- **Money representation.** Shopify's open-source Money gem (Ruby, MIT, repo created 2011) represents amounts as BigDecimal, recommends a DECIMAL(21,3) column via `money_column`, and "will not lose pennies during divisions", with selectable rounding strategies for leftover subunits (shopify-money-gem-2026).
- **Ledger model.** No first-party engineering post, talk or doc was found that describes Shopify's money ledger (double-entry, append-only, event-sourced or otherwise). The only public description is an aggregator copy of a job listing: "Ledger records and reconciles money movement such as charges, payouts, refunds, and fee splits" and provides "an auditable source of truth for balances and transaction history" (shopify-job-payments-ledger-2026, Weak). It does not mention double-entry.
- **Inventory ledger, not money.** The 2026 inventory post calls the MySQL inventory ledger the "source of truth" and moved reservations into the same database so reserve and claim share ACID transactions (shopify-inventory-reservations-2026). This is stock, not money, but it shows the same "keep the hold and the ledger in one transaction" reasoning.
- **Shopify Balance.** The merchant account product runs on partners: "Shopify partners with Stripe Payments Company for money transmission services and account services with funds held at Fifth Third Bank N.A." and the cards "are powered by Stripe and issued by Celtic Bank" (shopify-balance-page-2026).

## Service-layer persistence and databases
- **ActiveRecord is the persistence layer.** Shop app's Vitess move required "patches to ActiveRecord" to pass the sharding key through queries and associations; the team "wanted to avoid patches as that makes it really difficult to maintain Rails over the long term" and expected Rails 7.1 composite keys to remove most of them (shopify-shop-vitess-2024).
- **Schema design under the ORM.** The core app switched critical tables such as `orders` to a composite primary key (`shop_id`, `id`) so rows cluster by shop on disk, while forcing ActiveRecord to keep treating `id` as the primary key. Trade-off reported: "roughly 10x performance degradation on inserts" (shopify-composite-pk-2020, 2020). Live schema changes use Large Hadron Migrator (LHM) (shopify-composite-pk-2020, 2020).
- **Core MySQL fleet.** "Shopify's Core database infrastructure is horizontally sharded by shop, spread across hundreds of shards, each consisting of a writer and five or more replicas", on Google Compute Engine VMs running Percona Server, with an internal Percona fork (shopify-mysql-upgrade-2021).
- **Proxy layer.** Applications reach MySQL through ProxySQL (shopify-shop-vitess-2024; shopify-inventory-reservations-2026). A 2026 job listing says the Core MySQL team owns "MySQL itself along with everything around it", including backups, routing, proxies and regional failover (shopify-job-mysql-platform-2026, Medium).
- **Fewer stores, not more.** In 2026 Shopify moved checkout inventory reservations from Redis to MySQL as part of "a unified database strategy", using one row per sellable unit and `SELECT ... FOR UPDATE SKIP LOCKED`, a composite primary key to cut row locks from two to one, and READ COMMITTED for these transactions, its "first use of a non-default isolation level in this codebase" (shopify-inventory-reservations-2026).
- **Change data capture.** Data leaves the monolith through Debezium and Kafka Connect, reading binlogs from the "100+ MySQL shards that back Shopify's core monolith" (shopify-cdc-2021, 2021).

## Scale
- BFCM 2024: 57.3 PB of data, 10.5 trillion database queries, 1.19 trillion edge requests, 1.17 trillion database writes; peaks of 284 million requests per minute at the edge and 80 million on app servers (shopify-bfcm-readiness-2025).
- 2025 load tests reached 146 million requests per minute and 80,000+ checkouts per minute, and the final test hit 200 million requests per minute (shopify-bfcm-readiness-2025).
- Shopify Payments processed $248.1 billion of GMV in 2025 (65.6% penetration), up from $181.0 billion in 2024 (shopify-10k-2025).
- Black Friday 2025 peaked at $5.1 million in sales per minute (shopify-inventory-reservations-2026).
- In 2018 Shopify had "more than a hundred pods" (shopify-techstack-2018, 2018).

## Build vs buy
- **Processing is bought.** "We currently rely on two suppliers to provide the technology we offer through Shopify Payments. At present, we have payment service provider agreements with Stripe, Inc. ("Stripe") and PayPal, Inc. ("PayPal")" (shopify-10k-2025).
- **Banking is partnered.** Shopify Balance uses Stripe Payments Company for money transmission, Fifth Third Bank for funds, and Celtic Bank as card issuer (shopify-balance-page-2026).
- **Cloud is bought, databases are run in-house.** Shopify serves all merchants "through third-party cloud computing services, such as Google Cloud Platform" (shopify-10k-2025), but runs its own MySQL on VMs and chose Vitess over cloud-managed horizontally scaled databases because "we prefer to run our own primary datastores at Shopify" (shopify-shop-vitess-2024; shopify-mysql-upgrade-2021).
- **Built in-house and open-sourced:** Ghostferry (MySQL data mover), Semian (circuit breakers), Toxiproxy (network fault injection), Packwerk (module boundaries), YJIT, and the Money gem (shopify-shard-balancing-2021; shopify-resilient-payments-2022; shopify-yjit-2023; shopify-money-gem-2026).

## Correctness (idempotency, reconciliation, audit)
- **Idempotency as stored state.** The Payment Service requires an idempotency key as a GraphQL argument, locks on client plus key (returning HTTP 409 for a concurrent duplicate), and stores each request in an `IncomingRequest` row that records which named step ("recovery point") completed. Steps are split into no side effects, local side effects (wrapped in a database transaction) and remote side effects (shopify-graphql-idempotency-2019, 2019).
- **Stated cost.** "Storing the progress of a request requires extra database writes, this will add overhead to every API call," and the step structure "forces a specific coding style" (shopify-graphql-idempotency-2019, 2019).
- **Key format.** Keys should be unique for the retry window, "typically 24 hours or less", and Shopify prefers ULIDs over random UUIDv4 because they sort well in B-tree indexes; one system saw "a 50 percent decrease in INSERT statement duration" (shopify-resilient-payments-2022).
- **Reconciliation.** Shopify reconciles individual records (charges, refunds) and aggregates (balance not yet paid out) against financial partners. Mismatches are stored in the database as anomaly records such as `MismatchCaptureStatusAnomaly`, auto-remediated where possible, otherwise investigated (shopify-resilient-payments-2022).
- **Resilience.** For Shopify Payments card transactions, Semian circuit breaker identifiers include the merchant's country code, so a local outage in one country does not open the circuit for others. Suggested starting timeouts: one second to open, five seconds to read, write or query (shopify-resilient-payments-2022).
- **Data moves.** Shop moves between shards use Ghostferry batch copying plus binlog tailing, with each batch in its own MySQL transaction (shopify-shard-balancing-2021, 2021). Vitess resharding was verified with VDiff before cutover (shopify-shop-vitess-2024).
- **Shadow mode for a correctness-critical cutover.** The Redis-to-MySQL reservation move wrote every reservation to both stores, with Redis as source of truth, until MySQL's outcomes were validated on production traffic (shopify-inventory-reservations-2026).
- Audit trail model for money: No public source found.

## Changes over time (migrations and reasons)

| When | Change | Stated reason | Key |
|---|---|---|---|
| 2014 or 2015 (sources differ) | Single MySQL to sharded MySQL | Could no longer grow a single instance "even by buying better hardware"; merchants are isolated, so shop is a natural shard key | shopify-techstack-2018; shopify-pods-2018 |
| 2016 | Shards to isolated pods | Sharding cost resilience: one shard down broke platform-wide actions; a shared Redis outage ("Redismageddon") took down all of Shopify | shopify-pods-2018; shopify-techstack-2018 |
| 2019 | Monolith to modular monolith (not microservices) | Microservices would add pipelines, infra overhead, network latency and harder data access | shopify-modular-monolith-2019 |
| 2019 | Centralized Payment Service with built-in idempotency | Prevent failed or double charges and give clients a way to recover | shopify-graphql-idempotency-2019 |
| 2019 to 2021 | Query-based CDC (Longboat) to log-based CDC (Debezium, Kafka) | Debezium most active OSS CDC project; Kafka already core infrastructure | shopify-cdc-2021 |
| By 2024-01 (post date) | Shop app: single MySQL to Vitess, sharded by user_id | Multi-terabyte disk, schema migrations taking weeks, throttled background jobs | shopify-shop-vitess-2024 |
| By BFCM 2025 | Inventory reservations: Redis to MySQL | Redis and the MySQL ledger could not commit atomically, causing over- or underselling | shopify-inventory-reservations-2026 |

## Stated reasons (verbatim quotes)
> "Yet our own collective experience told us that there is no one size fits all best solution, and microservices would bring their own set of challenges." (shopify-modular-monolith-2019, 2019-02)

> "We wanted a solution that increased modularity without increasing the number of deployment units, allowing us to get the advantages of both monoliths and microservices without so many of the downsides." (shopify-modular-monolith-2019, 2019-02)

> "While there are parts of the framework that sometimes make it harder to scale (e.g. ActiveRecord callbacks and code organization), many of us tend to agree with Tobi that Rails is what allowed Shopify to move from a garage startup to a public company." (shopify-techstack-2018, 2018-08)

> "Sharding played nicely for us because Shopify merchants are isolated from each other and we were able to put a subset of merchants on a single shard." (shopify-techstack-2018, 2018-08)

> "Simply sharding the databases wasn't enough, we needed to fully isolate each shard so a failure couldn't spiral out into a platform outage." (shopify-pods-2018, 2018-03)

> "We opted not to go with this approach, as we prefer to run our own primary datastores at Shopify. Since our use-case was a mature Rails app, It was also important for us to stick to a system that was SQL compatible." (shopify-shop-vitess-2024, 2024-01)

> "Schema migrations take hours instead of weeks." ... "The cost of this is added complexity." (shopify-shop-vitess-2024, 2024-01)

> "A payment API should offer an 'exactly once' model of resiliency." (shopify-graphql-idempotency-2019, 2019-08)

> "At Shopify's scale, a once in a million chance of something unreliable occurring during payment processing means it's happening many times a day." (shopify-resilient-payments-2022, 2022-07)

> "With reconciliation we make sure that our records are consistent with those of our financial partners." (shopify-resilient-payments-2022, 2022-07)

> "We should rely on anomalies to fix things as a last resort, preferring solutions that prevent anomalies from being created in the first place." (shopify-resilient-payments-2022, 2022-07)

> "We observed a roughly 10x performance degradation on inserts by changing to a composite primary key. Most data are queried and updated far more often than inserted, so this tradeoff is correct in most cases." (shopify-composite-pk-2020, 2020-10)

> "Of the open-source options available, Debezium emerged as the clear winner." (shopify-cdc-2021, 2021-03)

> "Moving reservations into the same MySQL database as the ledger meant we could wrap everything in ACID transactions and eliminate these failure modes entirely." (shopify-inventory-reservations-2026, 2026-05)

> "We currently rely on two suppliers to provide the technology we offer through Shopify Payments." (shopify-10k-2025, 2026-02)

## Open questions
- Money ledger design. Is "Shopify Ledger" double-entry, append-only or event-sourced, and what store does it use? Only an aggregator copy of a job listing describes it (shopify-job-payments-ledger-2026, Weak). Unverified.
- Go in payments. The same Weak listing says new ledger services are in Go. Unverified; no first-party post found.
- Sharding start year: the 2018 tech stack post says 2014, the 2018 pods post says 2015. Both are Shopify sources.
- Whether the core monolith (not only Shop app) has moved or will move to Vitess. No public source found.
- Whether the 2019 Payment Service and its idempotency design still run in 2026, and how it relates to the "Shopify Ledger" team. No public source found.
- Commonly said but unverified here: that Shopify Payments has been "powered by Stripe" since its 2013 launch. The 2025 10-K confirms Stripe and PayPal as current suppliers, but the launch history was not checked against a primary source.

## System architecture

Card data takes a small path that is kept out of PCI scope and away from the Rails monolith (iframe fields, then CardSink, then CardServer). The monolith and its background jobs drive checkout, and each shop lives in one isolated pod that is active in one region and replicated to a second (shopify-flash-sale-talk-2022). No first-party source says where a payment becomes a ledger entry or balance, and no source names a workflow engine. Multi-step payment work is coordinated by recording named steps in MySQL (shopify-graphql-idempotency-2019, 2019; shopify-flash-sale-talk-2022).

### Money path

Card payment at checkout, as described in a 2022 talk by a Shopify Payments manager:

1. OpenResty load balancer with Sorting Hat. OpenResty "is an NGINX distribution that supports Lua scripting". The Sorting Hat Lua module looks up the shop's host in a routing table, finds its pod, and sends the request to the region where that pod is active (shopify-flash-sale-talk-2022). The routing table maps domains to pod IDs and "lives in a separate database that isn't sharded" (shopify-shard-balancing-2021, 2021).
2. Card fields in iframes. Card number, cardholder name, CVV and expiry are "iframes hosted on a completely separate domain from the merchant store and their checkout", so the monolith never sees card data (shopify-flash-sale-talk-2022).
3. CardSink. It takes the iframe fields, encrypts the card data, and returns a token to the checkout JavaScript (shopify-flash-sale-talk-2022).
4. Shopify monolith, checkout component. Checkout code submits the token with the rest of the checkout data to the main Shopify Rails application. Checkout works with other monolith components such as line items, discounts, taxes and shipping lines (shopify-flash-sale-talk-2022). Inventory is reserved while payment runs and claimed on payment success, in the same MySQL database as the inventory ledger (shopify-inventory-reservations-2026).
5. Background job in the monolith. It passes the token and payment metadata to CardServer (shopify-flash-sale-talk-2022). In a 2022 example flow, a correlation ID created by the Rails controller is passed to the background job that calls the payment service and is written into API parameters and SQL query comments (shopify-resilient-payments-2022).
6. CardServer. It uses the token to look up and decrypt the card data in CardSink, picks the payment processor, and calls it through an adapter library that "transforms the standardized call into the processor specific API call" (shopify-flash-sale-talk-2022).
7. Processor and card networks. "the authorize request goes through the acquiring bank, the card network, and the issuing bank", and the issuer approves or declines (shopify-flash-sale-talk-2022). Shopify gets the technology behind Shopify Payments from two suppliers, Stripe and PayPal (shopify-10k-2025).
8. Ledger or balance store. No public source found (first party) on where the authorization result is booked as a ledger entry or merchant balance. The only description of "Shopify Ledger" is a Weak aggregator copy of a job listing (shopify-job-payments-ledger-2026).
9. Reconciliation. Charges, refunds and "aggregates such as the current balance not yet paid out to a merchant" are checked against financial partners, and mismatches are stored as anomaly records in the database (shopify-resilient-payments-2022).

A second path serves other payment methods and Shopify's own billing. The Payment Service, owned by the Money Infrastructure team, "centralizes payment processing for certain payment methods", exposes a GraphQL API, and is called by Shopify and by Billing, which charges merchants and pays Partners and app developers (shopify-graphql-idempotency-2019, 2019). In 2022 Shopify described "the payment service at Shopify" as "an API serving as the internal mechanism for products such as Billing to move money around"; for India it calls a local provider's Orders and Payments APIs for cards and UPI (shopify-recurring-payments-india-2022). How the Payment Service relates to CardServer is not stated in any source read.

### Orchestration

- Workflow engine, saga framework or state machine library for payments: No public source found.
- Coordination is in-process and stored in the database. The 2019 Payment Service stores each request as an `IncomingRequest` row keyed by client and idempotency key, runs ordered steps grouped by side effect (none, local inside a database transaction, remote), and saves the name of each completed step (a "recovery point") so a retry resumes after the last finished step (shopify-graphql-idempotency-2019, 2019).
- In 2022 the pattern is a library called Resumption: "We define an action class that contains multiple steps, and each step of progress made is recorded in the database" (shopify-flash-sale-talk-2022).
- Asynchronous execution: the card authorization call runs in a background job in the monolith, and "For the monolith, we're now running a heavily customized fork of Resque." (shopify-flash-sale-talk-2022). Shopify counts "A background job, a Kafka event, and a web request" as units of work processed on queues (shopify-resilient-payments-2022).
- Long-running flows driven by provider callbacks: for Indian e-mandates and UPI, the payment service relies on webhooks from the provider because the customer completes authorization on their phone. A background job refunds the verification charge. Order creation comes before payment creation, and the provider's `receipt` field serves as the idempotency key because the provider's APIs are not idempotent by default (shopify-recurring-payments-india-2022).

### Deployment topology

- Unit of isolation: the pod (not a Kubernetes pod). "A pod consists of a set of shops that live on a fully isolated set of datastores" (shopify-pods-2018, 2018). Each pod has its own MySQL shard plus Redis and Memcached (shopify-shard-balancing-2021, 2021; shopify-techstack-2018, 2018).
- Shared stateless tier: job workers, app servers and load balancers are shared, but "all shared resources can only ever communicate to a single pod at a time" (shopify-pods-2018, 2018). In 2022: "The pods run in a single region, and while the datastores are isolated the stateless workers are shared." (shopify-flash-sale-talk-2022).
- Active and standby per pod. In 2018 each pod had a pair of data centers, and "at any point in time one of the two will be the active data center while the second acts as a recovery site". Pod Mover moves a pod to its recovery data center "in a minute without dropping requests or jobs", and evacuating a data center means moving its active pods one at a time (shopify-pods-2018, 2018).
- In 2022: "a Shopify pod is active in a single region at a time but exists in two with replication set up from the active to the non-active region", and Shopify can fail over an entire pod to another region (shopify-flash-sale-talk-2022).
- Reads go further than writes. Storefront rendering now serves requests "from any region where a MySQL replica is present"; before, "only one region had access to the MySQL writer at any given time" (shopify-storefront-routing-2021, 2021). No source read calls the checkout or payments write path active-active.
- Core MySQL regions: the minimal shard configuration is six instances, three in Google Cloud us-east1 and three in us-central1, with extra replicas elsewhere for some shards (shopify-mysql-upgrade-2021).
- Disaster recovery tests: before BFCM 2025, "We executed regional failovers, evacuating traffic from core US and EU regions to validate disaster recovery". Load tests ran from three GCP regions: us-central, us-east and europe-west4 (shopify-bfcm-readiness-2025).
- Cloud vs own data centers. In 2018 Shopify had spent "12 years of building and running the foundation of our own commerce cloud with our own data centers" and had "Migrated over 50% of our data center workloads, and counting, to Google Cloud" (shopify-google-cloud-2018, 2018). The FY2025 10-K says Shopify serves merchants through third-party cloud services such as Google Cloud Platform (shopify-10k-2025).
- Where CardSink, CardServer and the Payment Service run, and how they fail over: No public source found.

### Platform layer

- Modular monolith. The Rails monolith is one deployment unit whose components have public APIs and own their data (shopify-modular-monolith-2019, 2019). Component boundaries are enforced with Packwerk, and "We deploy this around 40 times a day as hundreds of developers worldwide are working on it" (shopify-flash-sale-talk-2022).
- Separate apps: storefront rendering was rewritten "in a separate Ruby application" and runs apart from the monolith. Features that span shops, such as Shop Pay, are built as separate applications (shopify-flash-sale-talk-2022).
- Service communication. In 2018: "Some services communicate via a message log like Kafka and some use a REST API over HTTP", and Shopify was "looking into options for Shopify-wide RPC and Service Mesh" (shopify-techstack-2018, 2018). The Payment Service exposes GraphQL (shopify-graphql-idempotency-2019, 2019). Semian protects "MySQL, Redis, and gRPC services" as well as Net::HTTP, so gRPC clients exist (shopify-resilient-payments-2022). A production service mesh or company-wide RPC framework: No public source found.
- Deploys. In 2018: Buildkite for CI; "ShipIt is an orchestrator that runs and tracks progress of any deploy script that you provide for a project"; kubernetes-deploy for most projects and Capistrano for legacy ones; "Merge Queue limits deploys to 5-10 commits at a time"; and "We don't practice staging or canary deploys", relying on feature flags and fast rollbacks (shopify-techstack-2018, 2018). kubernetes-deploy is now krane, which Shopify uses inside Shipit (shopify-krane-readme-2026).
- Kubernetes: by 2018 Shopify had "Grown to over 400 production services" and built a platform as a service on Kubernetes (shopify-google-cloud-2018, 2018).
- Load and failure testing: Genghis is Shopify's load test tool. Benchmark stores use "a simple benchmark gateway, also a Go app" that returns successes and failures with production-like latencies, so real processors are not load tested (shopify-flash-sale-talk-2022). Teams document expected behavior per dependency failure in a resiliency matrix and test it in game days (shopify-resiliency-planning-2020, 2020).
- Language and framework of CardSink and CardServer: No public source found.

### Data platform

- Event bus. Kafka was adopted in 2014 "for collecting events and log aggregation across the systems". The first layout was a regional Kafka cluster in each data center plus an aggregate cluster for the data warehouse, fed by MirrorMaker. After the cloud move Shopify runs "multiple regional Kafka clusters and an aggregate one" that feeds the warehouse, with brokers on Kubernetes StatefulSets (shopify-kafka-kubernetes-2018, 2018).
- Change data capture. Debezium on Kafka Connect reads binlogs with one connector per shard across 100+ shards, writes one compacted topic per logical table, registers schemas in Confluent Schema Registry, and reaches Kafka with p99 latency under 10 seconds. The older Longboat batch extractor queries each table at most hourly and writes to Google Cloud Storage (shopify-cdc-2021, 2021).
- Warehouse. Extracted data is denormalized into Hive and Parquet tables, and "Some sinks include BigQuery, Redshift, and custom applications" (shopify-cdc-2021, 2021). In 2020 the platform processed "about 880 billion MySQL records and 1.75 trillion Kafka messages" a month, using Spark and dbt, with serving on Bigtable, GCS and CloudSQL (shopify-data-platform-bfcm-2020, 2020).
- Reporting. Starscream, a PySpark platform, "now runs 76,000 jobs and writes 300 terabytes a day". Shopify maintains "a data warehouse for reporting where accuracy is key", and Seamster, built on dbt and BigQuery, is the SQL modelling workflow on top of it (shopify-seamster-2020, 2020).
- Reconciliation feed. Reconciliation compares Shopify's records with financial partners, and the results also feed tax forms Shopify must produce for merchants in some jurisdictions (shopify-resilient-payments-2022). Whether reconciliation or financial reporting reads from CDC streams, the warehouse or the online database: No public source found.

### Published architecture diagrams

- https://shopify.engineering/a-pods-architecture-to-allow-shopify-to-scale : three diagrams with no captions or alt text, placed after the pod definition and the Sorting Hat section. The text does not describe them (shopify-pods-2018, 2018).
- https://shopify.engineering/e-commerce-at-scale-inside-shopifys-tech-stack : a figure with alt text "Shopify Pods Architecture", a "Ruby on Rails stack" diagram, and Buildkite and ShipIt screenshots (shopify-techstack-2018, 2018).
- https://shopify.engineering/building-resilient-graphql-apis-using-idempotency : "Shopify's New Payment Service" services diagram, and a flow of an initial run failing at step 3 followed by a recover (shopify-graphql-idempotency-2019, 2019).
- https://shopify.engineering/technology-behind-navigating-recurring-payments-india : a sequence diagram of e-mandate registration from user to Shopify to payment provider to bank, an entity-relationship diagram of the payment service's source and charge models, and card and UPI flows through the payment service (shopify-recurring-payments-india-2022).
- https://shopify.engineering/mysql-database-shard-balancing-terabyte-scale : a request passing through the load balancer to its pod, NGINX consulting the routing table, and Ghostferry moving a shop from Pod 1 to Pod 2 (shopify-shard-balancing-2021, 2021).
- https://shopify.engineering/capturing-every-change-shopify-sharded-monolith : "High-level flow of data from a single Shopify shard through Debezium and into Kafka", "Scaling out from a single shard to many shards", and "High-level Overview of Longboat" (shopify-cdc-2021, 2021).
- https://shopify.engineering/running-apache-kafka-on-kubernetes-at-shopify : "Apache Kafka deployment in the data center" and "Apache Kafka deployment during our move to the cloud" (shopify-kafka-kubernetes-2018, 2018).
- https://shopify.engineering/resiliency-planning-for-high-traffic-events : a user-centric resiliency matrix. Its alt text example: a user can browse but cannot check out if MySQL is down (shopify-resiliency-planning-2020, 2020).
- https://shopify.engineering/horizontally-scaling-the-rails-backend-of-shop-app-with-vitess : "Vitessifying", "Safely switching connections" between ProxySQL and VTGate, and "Split into multiple keyspaces" (shopify-shop-vitess-2024).
- https://www.infoq.com/presentations/shopify-architecture-flash-sale/ : the video slides include a list of monolith components and a resilience matrix. The card flow is described in the talk, but no slide image of it was checked (shopify-flash-sale-talk-2022).

### Stated architectural principles (verbatim)

> "we don't allow any actions to reach across pods." (shopify-pods-2018, 2018-03)

> "all shared resources can only ever communicate to a single pod at a time" (shopify-pods-2018, 2018-03)

> "avoid any resources that are shared across all of Shopify" (shopify-techstack-2018, 2018-08)

> "make scale invisible for developers" (shopify-techstack-2018, 2018-08)

> "This is how we keep the Shopify monolith out of scope. We just don't let it see any card data in the first place." (shopify-flash-sale-talk-2022, 2022-10)

> "What also follows from the tenant isolation principle is that things that do need to work across multiple shops need to be either built in a separate application, or use our data warehouse for analysis." (shopify-flash-sale-talk-2022, 2022-10)

> "no architecture is often the best architecture in the early days of a system" (shopify-modular-monolith-2019, 2019-02)

> "The finished CDC platform will provide a single, blessed route for database extraction throughout Shopify." (shopify-cdc-2021, 2021-03)

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| shopify-resilient-payments-2022 | 10 Tips for Building Resilient Payment Systems | Shopify Engineering (Bart de Water) | 2022-07 | https://shopify.engineering/building-resilient-payment-systems | engineering-blog | Strong | yes |
| shopify-graphql-idempotency-2019 | Building Resilient GraphQL APIs Using Idempotency (2019) | Shopify Engineering (Todd Jefferson) | 2019-08 | https://shopify.engineering/building-resilient-graphql-apis-using-idempotency | engineering-blog | Strong | yes |
| shopify-shop-vitess-2024 | Horizontally scaling the Rails backend of Shop app with Vitess | Shopify Engineering (Hammad Khalid et al.) | 2024-01 | https://shopify.engineering/horizontally-scaling-the-rails-backend-of-shop-app-with-vitess | engineering-blog | Strong | yes |
| shopify-modular-monolith-2019 | Deconstructing the Monolith: Designing Software that Maximizes Developer Productivity (2019) | Shopify Engineering (Kirsten Westeinde) | 2019-02 | https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity | engineering-blog | Strong | partial |
| shopify-pods-2018 | A Pods Architecture To Allow Shopify To Scale (2018) | Shopify Engineering (Xavier Denis) | 2018-03 | https://shopify.engineering/a-pods-architecture-to-allow-shopify-to-scale | engineering-blog | Strong | yes |
| shopify-techstack-2018 | E-Commerce at Scale: Inside Shopify's Tech Stack (2018, first published on Stackshare) | Shopify Engineering (Kir Shatrov) | 2018-08 | https://shopify.engineering/e-commerce-at-scale-inside-shopifys-tech-stack | engineering-blog | Strong | yes |
| shopify-shard-balancing-2021 | Shard Balancing: Moving Shops Confidently with Zero-Downtime at Terabyte-scale (2021) | Shopify Engineering (Paarth Madan) | 2021-09 | https://shopify.engineering/mysql-database-shard-balancing-terabyte-scale | engineering-blog | Strong | partial |
| shopify-mysql-upgrade-2021 | Upgrading MySQL at Shopify | Shopify Engineering (Yi Qing Sim) | 2021-12 | https://shopify.engineering/upgrading-mysql-shopify | engineering-blog | Strong | partial |
| shopify-cdc-2021 | Capturing Every Change From Shopify's Sharded Monolith (2021) | Shopify Engineering (John Martin, Adam Bellemare) | 2021-03 | https://shopify.engineering/capturing-every-change-shopify-sharded-monolith | engineering-blog | Strong | partial |
| shopify-composite-pk-2020 | How to Introduce Composite Primary Keys in Rails (2020) | Shopify Engineering (John Arthorne) | 2020-10 | https://shopify.engineering/how-to-introduce-composite-primary-keys-in-rails | engineering-blog | Strong | partial |
| shopify-inventory-reservations-2026 | We replaced Redis with MySQL for inventory reservations - and it scaled | Shopify Engineering (Emilie Noel) | 2026-05 | https://shopify.engineering/scaling-inventory-reservations | engineering-blog | Strong | yes |
| shopify-bfcm-readiness-2025 | How we prepare Shopify for BFCM | Shopify Engineering (Kyle Petroski, Matthew Frail) | 2025-11 | https://shopify.engineering/bfcm-readiness-2025 | engineering-blog | Strong | partial |
| shopify-yjit-2023 | Ruby 3.2's YJIT is Production-Ready | Shopify Engineering (Maxime Chevalier-Boisvert) | 2023-01 | https://shopify.engineering/ruby-yjit-is-production-ready | engineering-blog | Strong | partial |
| shopify-money-gem-2026 | Shopify/money README (repo created 2011, accessed 2026-11) | Shopify (GitHub) | 2026 | https://github.com/Shopify/money | repo | Strong | yes |
| shopify-10k-2025 | Shopify Inc. Form 10-K for fiscal year 2025 | Shopify Inc. (SEC EDGAR) | 2026-02 | https://www.sec.gov/Archives/edgar/data/1594805/000159480526000007/shop-20251231.htm | filing | Strong | partial |
| shopify-balance-page-2026 | Shopify Balance product page, disclosures (accessed 2026-11) | Shopify | 2026 | https://www.shopify.com/balance | docs | Strong | partial |
| shopify-job-mysql-platform-2026 | Senior Engineer - Core MySQL, Database Platform (job listing, accessed 2026-11) | Shopify Careers | 2026 | https://www.shopify.com/careers/senior-engineer-core-mysql-database-platform_741105f5-0820-4dad-9343-48cd80f0e7d2 | job-listing | Medium | yes |
| shopify-job-payments-ledger-2026 | Shopify Senior Software Engineer - Payments, Singapore (aggregator copy; original not found on shopify.com) | Arc.dev | 2026 | https://arc.dev/remote-jobs/j/shopify-senior-software-engineer-payments-singapore-apac-singapore-ppler4mkk1 | job-listing | Weak | yes |
| shopify-flash-sale-talk-2022 | Shopify's Architecture to Handle the World's Biggest Flash Sales (QCon Plus May 2022, transcript) | InfoQ (speaker Bart de Water, Shopify Payments) | 2022-10 | https://www.infoq.com/presentations/shopify-architecture-flash-sale/ | talk | Strong | yes |
| shopify-google-cloud-2018 | Shopify's Infrastructure Collaboration with Google (2018) | Shopify Engineering (Dale Neufeld) | 2018-03 | https://shopify.engineering/shopify-infrastructure-collaboration-with-google | engineering-blog | Strong | yes |
| shopify-kafka-kubernetes-2018 | Running Apache Kafka on Kubernetes at Shopify (2018) | Shopify Engineering (Sam Obeid) | 2018-11 | https://shopify.engineering/running-apache-kafka-on-kubernetes-at-shopify | engineering-blog | Strong | partial |
| shopify-recurring-payments-india-2022 | Navigating Recurring Payments in India: A Backend Perspective | Shopify Engineering (Yash Kapadia) | 2022-06 | https://shopify.engineering/technology-behind-navigating-recurring-payments-india | engineering-blog | Strong | yes |
| shopify-storefront-routing-2021 | How Shopify Dynamically Routes Storefront Traffic (2021) | Shopify Engineering (Derek Stride) | 2021-04 | https://shopify.engineering/dynamically-route-storefront-traffic | engineering-blog | Strong | partial |
| shopify-data-platform-bfcm-2020 | How to Reliably Scale Your Data Platform for High Volumes (2020) | Shopify Engineering (Arbab Ahmed, Bruno Deszczynski) | 2020-12 | https://shopify.engineering/reliably-scale-data-platform | engineering-blog | Strong | partial |
| shopify-seamster-2020 | How to Build a Production Grade Workflow with SQL Modelling (2020) | Shopify Engineering (Michelle Ark, Chris Wu) | 2020-11 | https://shopify.engineering/build-production-grade-workflow-sql-modelling | engineering-blog | Strong | partial |
| shopify-resiliency-planning-2020 | Resiliency Planning for High-Traffic Events (2020) | Shopify Engineering (Ryan McIlmoyl) | 2020-12 | https://shopify.engineering/resiliency-planning-for-high-traffic-events | engineering-blog | Strong | partial |
| shopify-krane-readme-2026 | Shopify/krane README (formerly kubernetes-deploy, accessed 2026-11) | Shopify (GitHub) | 2026 | https://github.com/Shopify/krane | repo | Strong | partial |
