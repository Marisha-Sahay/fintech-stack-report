# Revolut

**Category:** neobank
**HQ / founded:** UK-registered group (Revolut Group Holdings Ltd, registered number 12743269) (revolut-annual-report-2024). Founding year not verified from a source read for this note.
**Scale signal:** 52.5m retail customers at end of 2024, up from 38.0m; £1T transaction volume in 2024 (revolut-annual-report-2024).
**Last researched:** 2026-11-11

## Summary
Revolut describes its backend as "really vanilla Java services with our own internal DDD framework" on Kubernetes, and uses PostgreSQL for nearly everything: "Postgres is used as the database, as the event store and event stream" (revolut-qcon-architecture-2025). It built its own PostgreSQL-based event store instead of adopting Kafka or Pub/Sub, giving the reason "Because we know exactly how to deal with databases" (revolut-qcon-architecture-2025). The jOOQ claim from third-party directories is confirmed by Revolut's own sources: its open-source Gradle plugin generates jOOQ classes after running Flyway migrations against a Dockerised PostgreSQL, and Revolut engineers were still maintaining it in 2026 (revolut-jooq-plugin-2026), and its job listings name jOOQ and Flyway (revolut-core-banking-job-2026; revolut-eventstore-job-2026). On build vs buy, the 2024 annual report says "From the beginning, Revolut has prided itself on building products, systems, and tools in-house", and its EU bank runs on "Revolut Group's proprietary, mobile digital platform" (revolut-annual-report-2024; revolut-bank-uab-report-2024). No public source found describes the ledger model.

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Java (17/21 in listings); Kotlin listed in some roles | Strong (Java); Medium (versions, Kotlin) | revolut-qcon-architecture-2025; revolut-core-banking-job-2026 |
| Main frameworks | Own internal DDD framework; lightweight libraries (SparkJava, Javalin, RSocket); "minimalist approach" to external frameworks | Strong (DDD framework); Medium (libraries) | revolut-qcon-architecture-2025; revolut-core-banking-job-2026 |
| Primary OLTP store(s) | PostgreSQL; Redis also listed | Strong (PostgreSQL); Medium (Redis) | revolut-qcon-architecture-2025; revolut-core-banking-job-2026 |
| Service-layer persistence | SQL-first: jOOQ code generation from Flyway migrations | Strong (repo); Medium (listings) | revolut-jooq-plugin-2026; revolut-core-banking-job-2026 |
| Money / ledger model | No public source found. Event-driven, CQRS, state changes aligned with persisted events (job listing) | Medium | revolut-eventstore-job-2026 |
| Messaging / streaming | In-house event store and event stream on PostgreSQL; no Kafka or Pub/Sub | Strong | revolut-qcon-architecture-2025 |
| Infrastructure | GCP and Kubernetes (listings); Kubernetes (talk) | Strong (Kubernetes); Medium (GCP) | revolut-qcon-architecture-2025; revolut-eventstore-job-2026 |
| Scaling approach | Standard service types and mandated tech set; read/write separation, stateless flows, autoscaling (third-party talk write-up) | Strong (standardisation); Weak (levers) | revolut-qcon-architecture-2025; revolut-xt25-talk-2025 |
| Build vs buy (core) | Build: proprietary group platform used by its banks | Strong | revolut-annual-report-2024; revolut-bank-uab-report-2024 |
| Notable open source | jooq-plugin (Gradle jOOQ code generation); PgExposed (Kotlin PostgreSQL library, 2019) | Strong | revolut-jooq-plugin-2026; revolut-pgexposed-2019 |

## Languages and frameworks
- "It's to the level where it's really vanilla Java services with our own internal DDD framework, and deployed on Kubernetes." (Wojtek Ptak, Head of Engineering, revolut-qcon-architecture-2025).
- Services are predefined types: frontend services (resource definitions), flow services (business logic orchestration) and state services (domain model) (revolut-qcon-architecture-2025).
- A set of technologies is mandated and enforced through tooling; new services come with CI/CD and monitoring preset (revolut-qcon-architecture-2025).
- Job listings: "Java 17/21" (revolut-eventstore-job-2026); "Java 17, Kotlin", "SparkJava, Javalin", "RSocket" for the Core Banking team (revolut-core-banking-job-2026).
- Framework stance in listings: "We have a minimalist approach to using external frameworks, with an emphasis on maintainability" (revolut-core-banking-job-2026). No Spring framework appears in the Core Banking stack list.
- Testing: Spock (revolut-eventstore-job-2026).

## The money layer (ledger, balances, payments)
- No public source found that describes Revolut's ledger: whether it is double-entry, how balances are stored, or how the ledger relates to the event store.
- Event store platform (job listing): "build a custom event-streaming platform, capable of processing billions of events monthly", with "guaranteed consistency by aligning state changes with persisted events", "using Domain-Driven Design, CQRS, and event-driven principles" (revolut-eventstore-job-2026).
- The 2024 auditor's report describes testing IT controls over "the core operating platforms and general ledger", automated controls and "reconciliations relevant to revenue recognition and customer liabilities", and recalculating "total customer liabilities at an individual user level by direct interrogation of the entity's IT environment" (revolut-annual-report-2024, page 79). This is the auditor's procedure, not a design description.

## Service-layer persistence and databases
- PostgreSQL everywhere: "Postgres is used as the database, as the event store and event stream." (revolut-qcon-architecture-2025).
- jOOQ confirmed from Revolut's own code: the `revolut-engineering/jooq-plugin` repository (Apache-2.0, created 2019-05) registers a `generateJooqClasses` task that pulls a database Docker image, "runs migrations using Flyway" and "generates jOOQ classes"; it is "configured to work with PostgreSQL" by default. Recent commits (Sept 2025 to Feb 2026) by Revolut engineers carry internal ticket prefixes, which suggests internal use, though the repo does not say how widely it is used (revolut-jooq-plugin-2026).
- Job listings name "PostgreSQL, Redis" and "JOOQ, Flyway" (revolut-eventstore-job-2026; revolut-core-banking-job-2026). Some listings mention a "JOOQ and TDD approach" in search snippets, not verified by a page read.
- Earlier Kotlin option: `PgExposed`, a fork of JetBrains Exposed described as "a lightweight PostgreSQL library written over Postgres JDBC driver for Kotlin" with "typesafe SQL wrapping DSL and lightweight data access objects" (revolut-pgexposed-2019, 2019, older than 5 years; last push 2023-04).
- No source read mentions Hibernate or JPA at Revolut.
- Operations: the database reliability team runs "highly available PostgreSQL clusters on bare metal or cloud outside of managed services" and builds self-service database tooling used by "over 1k engineers" (revolut-db-reliability-job-2026). A third-party write-up of a 2025 talk by Revolut's Head of Technology reports "hundreds of database clusters" (revolut-xt25-talk-2025, Weak).

## Scale
- 52.5m retail customers at end of 2024 (38.0m in 2023); 14.5m new customers in 2024; £1T transaction volume (revolut-annual-report-2024).
- R&D spend on "the development and enhancement of its technology platform" was £169m in 2024 (2023: £122.3m) (revolut-annual-report-2024, page 73).
- Event store: "billions of events monthly" (revolut-eventstore-job-2026).
- Revolut Business alone has over 2,000 endpoints and nearly 500 consumers; a modularisation cut build time by 75% (revolut-qcon-architecture-2025).
- Third-party write-up: "thousands of services", 55m+ customers in 2025, 1,400+ engineering staff (revolut-xt25-talk-2025, Weak).

## Build vs buy
- "From the beginning, Revolut has prided itself on building products, systems, and tools in-house. Our internally built systems, such as our customer acquisition and onboarding solutions, global payments infrastructure, fraud prevention engine, and risk management and regulatory platforms, are what we believe to be our critical differentiator." (revolut-annual-report-2024, page 28).
- "We continue to reduce our dependencies on third parties via diversification and building products and processes in-house where practical." (revolut-annual-report-2024, page 56).
- Revolut Bank UAB (the EU bank) "utilise[s] an outsourcing model, mainly through outsourcing arrangements to other Revolut Group entities. This includes using Revolut Group's proprietary, mobile digital platform" (revolut-bank-uab-report-2024, page 7).
- Infrastructure tools are also built: Revolut built its own service catalogue "Tower" rather than adopting Backstage, its own event store and its own DDD framework (revolut-qcon-architecture-2025).
- No source read names a vendor core banking platform at Revolut.

## Correctness (idempotency, reconciliation, audit)
- Event store listing: "guaranteed consistency by aligning state changes with persisted events" (revolut-eventstore-job-2026).
- Tower makes every service, database and component "trackable, auditable, and shareable", with owners, SLOs and dependency graphs (revolut-qcon-architecture-2025).
- Idempotency and reconciliation design: No public source found from Revolut engineering. The auditor's report mentions reconciliations and automated controls over customer transactions (revolut-annual-report-2024, page 79).

## Changes over time (migrations and reasons)
- 2019: PgExposed (Kotlin) and the jOOQ Gradle plugin both open-sourced in 2019; only the jOOQ plugin is still maintained in 2026 (revolut-pgexposed-2019; revolut-jooq-plugin-2026). Whether Revolut moved from Exposed to jOOQ internally is not stated anywhere read.
- Java versions in listings moved to 17/21 (revolut-eventstore-job-2026). Older listings said Java 11 (search snippet only, not read).
- No public source found describing a database or ledger migration and its reasons.

## Stated reasons (verbatim quotes)
> "Postgres is used as the database, as the event store and event stream." (revolut-qcon-architecture-2025, 2025-02)

> "Why? Why not use Kafka and so on, Pub/Sub? Because we know exactly how to deal with databases." ... "We know exactly how to monitor them, how to scale them." (revolut-qcon-architecture-2025, 2025-02)

> "It's to the level where it's really vanilla Java services with our own internal DDD framework, and deployed on Kubernetes." (revolut-qcon-architecture-2025, 2025-02)

> "We have a minimalist approach to using external frameworks, with an emphasis on maintainability" (revolut-core-banking-job-2026, undated listing)

> "From the beginning, Revolut has prided itself on building products, systems, and tools in-house." (revolut-annual-report-2024, 2024)

## Open questions
- Ledger model: double-entry or not, how balances are derived, and whether the ledger is itself event-sourced on the in-house event store. No public source found.
- Revolut's own Medium posts on the event store ("Event Streaming: The Revolut way", 2020 (revolut-event-streaming-2020), and "Recording more events... But where will we store them?", publication year not confirmed, https://medium.com/revolut/recording-more-events-but-where-will-we-store-them-4b1dad457cf5) returned HTTP 403 and were not read. Search snippets say the store is a stateless Kotlin/Ktor service writing to a PostgreSQL primary with replicas for streaming, and cite more than 37 billion streamed events a month in 2020. Unverified until those pages are read.
- Unverified: third-party directories describe the event store as a "deliberate in-house (non-Kafka)" choice made because of Kafka's maintenance cost and learning curve. The talk confirms the non-Kafka choice but gives a different reason (familiarity with databases).
- Cloud: listings name GCP; the annual report refers only to a "cloud data services provider". Which provider hosts the core platform is not stated in a strong source.
- How widely jOOQ is used across services versus other SQL access is not stated.

## System architecture

The best map is Revolut's own: two architecture diagrams in a 2025 conference deck by its Head of Technology, Donato Lucia (revolut-xt25-slides-2025). The deck shows components and links, not call order, so the ordered lists below follow the diagram's arrows. Most runtime detail (sagas, event outbox, fraud call) comes from 2019 to 2020 engineering posts, older than 5 years.

### Money path

Card payment (Revolut as card issuer):
1. Card network: a Revolut Card transaction arrives from Mastercard or VISA at the Card Processing Platform, drawn as an integration gateway service in a "Payments" group (revolut-xt25-slides-2025). The deck's domain map names it "RevP (Card Processing Platform)" (revolut-xt25-slides-2025).
2. Card Payments Processor: a workflow service in the same Payments group receives the transaction from the Card Processing Platform and is linked to the Core services and to the EventStore event stream (revolut-xt25-slides-2025).
3. Card Payment Engine: the domain map groups Authorisation, Clearing, Fraud detection and Chargebacks as domain backend services under this name (revolut-xt25-slides-2025).
4. Fraud scoring: in 2019 "the Revolut's processing backend" sent each card transaction by HTTP POST to Sherlock, a Python Flask app on Google Cloud App Engine, which loaded user and merchant profiles from Couchbase and returned a score "all within 50 ms"; above a threshold the backend declines the payment and sends a push notification (revolut-sherlock-fraud-2019, 2019).
5. Core services: Core Identity (including Revolut entities), Core Auth, Core Ledger and Core Pricing form a "Core" group that the processors connect to (revolut-xt25-slides-2025). How Core Ledger posts entries and computes the balance: No public source found.
6. Events: state components publish change events to EventStore, and the diagram draws event-stream links from EventStore to the processors and to FinCrime services (KYC Screening, and Transaction Monitoring for fraud and AML) (revolut-xt25-slides-2025).
7. Notification: processors call a Notification gateway that reaches APNs/FCM, SMS and email gateways (revolut-xt25-slides-2025).
8. Back to the customer: Retail/Business APIs (product frontend APIs) serve the Mobile App; Backoffice APIs serve the Revolut Backoffice (revolut-xt25-slides-2025).

Bank transfer (outbound):
1. App to API: the Mobile App calls the Retail/Business APIs; only frontend API services may be exposed on a public endpoint (revolut-xt25-slides-2025).
2. Orchestration: the Bank Payments Processor (workflow service) runs the transfer, linked to the Core services and the event stream (revolut-xt25-slides-2025).
3. Scheme connection: the Bank Payments Gateway (integration gateway) connects to SWIFT, SEPA, FPS/BACS and ACH; the domain map lists Account Numbers, SEPA Gateway, FPS Gateway, ACH Gateway, SWIFT Gateway and Other gateways under a "Bank Payments Platform" (revolut-xt25-slides-2025).
4. Treasury: an ALM/Treasury platform also feeds the Bank Payments Gateway and connects to Liquidity Providers; FX rates come from Market Data Providers (revolut-xt25-slides-2025).

Other flows on the same diagram: a Topup Processor uses an Acquiring Gateway to Mastercard, VISA and APM (revolut-xt25-slides-2025).

### Orchestration
- Flow services do orchestration: "Flow service, it's the business logic orchestration. State service, which is a domain model." (revolut-qcon-architecture-2025). The deck defines Flow as "Orchestrates a business flow/process", depending on state and gateway services "below in the stack" (revolut-xt25-slides-2025).
- Framework rules on the call graph: integration direction is predefined, "No cyclic dependencies", and "Maximum 3 layers of delegation down the service stack" (revolut-xt25-slides-2025).
- Sagas (2020): business transactions are modelled as Actions, and "we solve it using a Saga pattern": a saga chain of related Actions lets Revolut observe processing state, retry on failure, or recover through event consumers (revolut-recording-events-2020, 2020).
- Idempotency is required for that recovery: "This requires that every Action we write is idempotent as it will be invoked a few times" (revolut-recording-events-2020, 2020).
- Transactional outbox (Revolut does not use that term): a service saves the model change and the event in the same database transaction, then publishes asynchronously with retries; an EventLog table holds events for 24 hours (configurable) (revolut-recording-events-2020, 2020).
- Resume after failure: one publisher instance acts as "event reconciler", "reading events older than 30 s from the EventLog that are not marked as published and re-sending them" (revolut-recording-events-2020, 2020). The July 2020 post describes the same reconciler for publishers that fail or die (revolut-event-streaming-2020, 2020).
- Why not event sourcing: "But we want the end-user experience to be the same as if we did synchronous processing with immediate feedback." So Revolut changes the model first and derives the event from it (revolut-recording-events-2020, 2020).
- Request-level resilience: deck lists "Timeouts, retries, standard response codes" (revolut-xt25-slides-2025); during a database primary switchover requests are rejected and retried, and systems "retry operations if needed, or gracefully fail the client's request" (revolut-devops-qcon-2025).
- A named workflow engine product (for example Temporal or Camunda): No public source found.

### Deployment topology
- Cloud: Google Cloud. In 2020 the event platform used "the Google Cloud Platform, specifically virtual private clouds to isolate different parts of the system" (revolut-recording-events-2020, 2020). In 2024: "We use some networking services from Google." (revolut-qcon-architecture-2025). The 2019 fraud system ran on App Engine, Dataflow, BigQuery and Cloud Composer (revolut-sherlock-fraud-2019, 2019).
- Runtime: "At Revolut, our systems are primarily running in Kubernetes"; teams also use cloud load balancers, Pub/Sub, plain virtual machines and Revolut-managed NAT devices (revolut-devops-qcon-2025).
- Self-managed databases: "we manage our own databases. Why? Because data is important." PostgreSQL clusters run a primary with replicas, one of them an analytical replica; major version upgrades use logical replication and a switchover with "a few seconds of unavailability" (revolut-devops-qcon-2025). A job listing says clusters run "on bare metal or cloud outside of managed services" (revolut-db-reliability-job-2026).
- Regions: the Tower catalogue example shows a component with "a deployment in production in Europe, and another one as well in development environment" (revolut-devops-qcon-2025). The data platform team wanted components "easy to deploy in new regions", and uses regional and dual-regional storage buckets by resilience need (revolut-gcp-data-nd, vendor case study). How many production regions run the core platform, and whether they are active-active or standby: No public source found.
- Event store topology (2020): a main PostgreSQL 12 cluster (last 12 months) and an archive cluster, each a master with standby read replicas, plus backups; Revolut named "the high dependency on a single-master" as a limitation (revolut-event-streaming-2020, 2020).
- Availability tiers: four SLO tiers, 99.99, 99.9, 99.8 and 99.5 percent, with availability mandatory for every component (revolut-devops-qcon-2025).
- Disaster recovery: the 2024 annual report says Revolut "maintains a suite of Business Continuity Plans and Disaster Recovery Plans", tested regularly, with tolerance limits set for Important Business Services (revolut-annual-report-2024, page 56). The technical DR design (secondary region, backup platform, failover): No public source found.
- Cells or shards of infrastructure per customer group: No public source found.

### Platform layer
- Service types: Frontend API ("To be used by frontend only"), Flow, State ("Always has a database"), Gateway ("A portal to a 3rd party system"), ML Model, Batch, and Eventstore (revolut-xt25-slides-2025). The 2024 talk names the same core three: frontend, flow and state services (revolut-qcon-architecture-2025).
- Boundary rules: "only frontend API can be exposed via a public endpoint" and "only gateways can connect to external systems" (revolut-xt25-slides-2025).
- How boundaries are drawn: code modules are organised by (sub)domain and service layer; new work starts as a Frontend API monolith and later extracts flow, state or gateway services (revolut-xt25-slides-2025). Every team is a product team, "most likely, with a service they own", using DDD strategic patterns and business context (revolut-qcon-architecture-2025).
- Chassis: an internal DDD framework for all service types, Alpha for predefined templates, and Tower for infrastructure UI and governance (revolut-xt25-slides-2025). Defining a service presets its CI/CD and monitoring (revolut-qcon-architecture-2025).
- Allowed stacks: "We have Java, Python, Scala, and ML service. We don't have a lot of stacks." (revolut-devops-qcon-2025).
- Repositories: not a monorepo. The deck counts 1.9K repositories, 4K production services, 700 database clusters and 1.4K engineers in 2025, against 1 repository, 5 services, 1 database cluster and 15 engineers in 2017 (revolut-xt25-slides-2025). A 2025 DevOps talk gives 1,200 microservices and 1,100 databases; the two talks count differently (revolut-devops-qcon-2025).
- Configuration and deployment: Rhea reads the Tower catalogue and writes Git commits that a GitOps system applies, generating TeamCity pipelines, HashiCorp Vault policies, Kubernetes namespaces and service accounts; it manages 10,000 pipelines and 37,000 policies, and engineers make about 100 production deployments per day (revolut-devops-qcon-2025).
- Release: 2020 releases used blue-green deployment, and every pull request is built on TeamCity with tens of thousands of tests (revolut-under-the-hood-2020, 2020).
- Gates: Security Drone can block pull requests based on an application risk score and a team's open bug count from DARC, with a derogation path for emergencies (revolut-cicd-constraints-2023). Teams with more than two bug tickets are blocked from non-emergency changes, which Revolut calls its error budget (revolut-devops-qcon-2025).
- Inter-service communication: "Services communicate through events" with CQRS (revolut-under-the-hood-2020, 2020). The event platform uses RSocket between EventStream and consumers and ships Java client SDKs (revolut-event-streaming-2020, 2020). The synchronous RPC protocol and any service mesh: No public source found.

### Data platform
- EventStore and EventStream (2020): events are stored in PostgreSQL; EventStore is a stateless Kotlin/Ktor service writing to the master, and EventStream (Java 11, RSocket) streams from replicas using PostgreSQL LISTEN/NOTIFY (revolut-recording-events-2020, 2020).
- Scale and uses (2020): "more than 37 billion streamed events each month", used to decouple applications and for fraud detection, FX-risk calculation, marketing and materialised views (revolut-event-streaming-2020, 2020). Customer services use the event log as an audit trail, and FX exposure is hedged from real-time events (revolut-recording-events-2020, 2020).
- Consumers keep offsets, leases and locks in Redis and can repartition a subscription on the fly (revolut-event-streaming-2020, 2020).
- Into the warehouse: each operational database has an instance "used by data warehouse to extract information", run by a separate data platform team (revolut-devops-qcon-2025). The deck diagram shows an ETL from the core services into a Data Warehouse that feeds FPA, with Reporting, GL Builder and Risk Engines in a "Finance / Treasury / Reporting" group (revolut-xt25-slides-2025).
- General ledger and regulatory reporting: the same diagram draws the General Ledger as Oracle NetSuite and regulatory reporting as a tool such as Abacus360, both marked "3rd party SaaS", feeding regulating authorities; a Journal component handles "vendor invoice reconciliation" (revolut-xt25-slides-2025). This separates an in-house Core Ledger from an external accounting general ledger, but no source explains the split.
- 2019 batch path: a nightly Cloud Composer (Airflow) job dumped the day's transaction delta from PostgreSQL into BigQuery, and Beam jobs on Dataflow built training data and profiles (revolut-sherlock-fraud-2019, 2019).
- Lakehouse (vendor case study): 17,000 Apache Iceberg tables in 400 Cloud Storage buckets, Trino on GKE behind 13,000+ Looker dashboards, and more than 10,000 Spark jobs on GKE (revolut-gcp-data-nd).
- Reconciliation of the ledger against card schemes and payment rails: No public source found. The only reconciliation processes described are event re-publishing (revolut-recording-events-2020, 2020) and vendor invoice reconciliation in the Journal component (revolut-xt25-slides-2025).

### Published architecture diagrams
- https://www.juxt.pro/xt25/donato-lucia.pdf (page 12): Revolut service topology, a stack of frontend, Frontend API, Batch, Flow, State, gateway, ML Model and EventStore with the allowed call direction (revolut-xt25-slides-2025).
- https://www.juxt.pro/xt25/donato-lucia.pdf (page 18): domain map of services by area (Retail APIs, Business APIs, Open Banking, RevP, Card Payment Engine, Core Services, FinCrime, Card Issuing, FX, Bank Payments Platform, Card Acquiring, Share Trading), coloured as frontend API, domain backend or integration gateway (revolut-xt25-slides-2025).
- https://www.juxt.pro/xt25/donato-lucia.pdf (page 19): end-to-end data flow from apps and card networks through frontend APIs, Core, EventStore, FinCrime, payment processors and gateways, to the Data Warehouse, finance systems and regulators (revolut-xt25-slides-2025).
- https://medium.com/revolut/recording-more-events-but-where-will-we-store-them-4b1dad457cf5: EventStore solution design (producers, load balancer, EventStore, master and replica PostgreSQL, EventStream, consumers), plus model-and-event consistency and reconciler diagrams (revolut-recording-events-2020, 2020).
- https://medium.com/revolut/event-streaming-the-revolut-way-9d928005ddf7: EventStore and EventStream flows, the database topology (main and archive clusters, standby replicas, backups) and subscription partitioning (revolut-event-streaming-2020, 2020).
- https://medium.com/revolut/building-a-state-of-the-art-card-fraud-detection-system-in-9-months-96463d7f652d: Sherlock production flow on GCP, real-time scoring between Processing Backend and App Engine, and the nightly batch from PostgreSQL through BigQuery and Dataflow (revolut-sherlock-fraud-2019, 2019).
- https://medium.com/revolut/improving-product-reliability-by-imposing-constraints-as-a-part-of-ci-cd-process-597cf2307224: blocking-mode sequence diagram for Security Drone and DARC pull request checks (revolut-cicd-constraints-2023).

### Stated architectural principles (verbatim quotes)
> "What's the Revolut approach? Simplified architecture by design. We try to really reduce the randomness." (revolut-qcon-architecture-2025, 2025-02)

> "Every service would have its own type predefined." (revolut-qcon-architecture-2025, 2025-02)

> "If you introduce a very important component to banking, such as the technology that is not exactly built for these purposes, you introduce the randomness, and you will need to build the workarounds around that randomness." (revolut-qcon-architecture-2025, 2025-02)

> "Complexity is inevitable, but accidental complexity isn't." (revolut-xt25-slides-2025, 2025)

> "A convention-based approach gave us speed, reliability, and safety." (revolut-xt25-slides-2025, 2025)

> "Structure enabled scale" ... "not the other way around." (revolut-xt25-slides-2025, 2025)

> "All state components publish change events, any other components can subscribe to any events" (revolut-xt25-slides-2025, 2025)

> "Guaranteed consistency between state changes and persisted events, for example, card blocking in the state database guarantees the CardBlocked event." (revolut-recording-events-2020, 2020-01)

> "A ready solution like Kafka might have solved some of our problems, but it would also introduce the complexity of maintenance, configuration, and keeping it available." (revolut-recording-events-2020, 2020-01)

> "Simpler software architecture is proven to be more stable, secure, flexible, and scalable." (revolut-under-the-hood-2020, 2020-05)

> "We cannot lose data. We cannot leak data." (revolut-under-the-hood-2020, 2020-05)

> "We wanted reusable, loosely coupled components that were easy to deploy in new regions and interacted through open standards and interfaces," (Denis Agiev, Lead Software Engineer, in revolut-gcp-data-nd, vendor case study)

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| revolut-qcon-architecture-2025 | Unveiling the Tech Underpinning FinTech's Revolution, QCon London 2024 (Wojtek Ptak, Andrzej Grzesik) | InfoQ | 2025-02 | https://www.infoq.com/presentations/advice-architecture | talk | Strong | yes |
| revolut-jooq-plugin-2026 | revolut-engineering/jooq-plugin: Gradle plugin for generating jOOQ classes using dockerized databases (created 2019-05, last commit 2026-02) | Revolut (GitHub) | 2026-02 | https://github.com/revolut-engineering/jooq-plugin | repo | Strong | yes |
| revolut-pgexposed-2019 | revolut-engineering/PgExposed: Exposed fork which focuses on PostgreSQL | Revolut (GitHub) | 2019 | https://github.com/revolut-engineering/PgExposed | repo | Strong | partial |
| revolut-annual-report-2024 | Revolut Group Holdings Ltd Annual Report 2024 | Revolut | 2024 | https://assets.revolut.com/pdf/annualreport2024.pdf | filing | Strong | partial |
| revolut-bank-uab-report-2024 | Revolut Bank UAB Annual Financial Report 2024 | Revolut Bank UAB | 2024 | https://assets.revolut.com/pdf/RBUAB_Annual_Financial_Report_2024_EN.pdf | filing | Strong | partial |
| revolut-eventstore-job-2026 | Lead Software Engineer (Java) - Eventstore (job listing, undated, accessed 2026-11) | Revolut via TCV job board | 2026 | https://portfoliojobs.tcv.com/companies/revolut-com/jobs/46696894-lead-software-engineer-java-eventstore | job-listing | Medium | yes |
| revolut-core-banking-job-2026 | Software Engineer (Java) - Core Banking (job listing, undated, accessed 2026-11) | Revolut via Seedcamp job board | 2026 | https://talent.seedcamp.com/companies/revolut-com/jobs/49892505-software-engineer-java-core-banking | job-listing | Medium | yes |
| revolut-db-reliability-job-2026 | Software Engineer (DevOps) - Database Reliability (job listing, undated, accessed 2026-11) | Revolut via Point Nine job board | 2026 | https://jobs.pointnine.com/companies/revolut-com/jobs/50436420-software-engineer-devops-database-reliability | job-listing | Medium | yes |
| revolut-xt25-talk-2025 | XT25 Fintech: Taming complexity in distributed systems (write-up of Donato Lucia's talk) | JUXT | 2025-08 | https://www.juxt.pro/blog/xt25-fintech-taming-complexity-in-distributed-systems/ | third-party | Weak | yes |
| revolut-event-streaming-2020 | Event Streaming: The Revolut way | Revolut Tech (Medium) | 2020-07 | https://medium.com/revolut/event-streaming-the-revolut-way-9d928005ddf7 | engineering-blog | Strong | yes |
| revolut-under-the-hood-2020 | Under the Hood: Engineering at Revolut | Revolut Tech (Medium) | 2020-05 | https://medium.com/revolut/under-the-hood-engineering-at-revolut-2dc183c04228 | engineering-blog | Strong | yes |
| revolut-java-interview-2025 | How to ace your Java interview at Revolut | Revolut | 2025-03 | https://www.revolut.com/blog/post/how-to-ace-your-java-interview-at-revolut/ | engineering-blog | Medium | no |
| revolut-komo-stack-2026 | What tech stack does Revolut use? | komo.ai | unknown | https://komo.ai/directory/revolut-tech-stack | third-party | Weak | no |
| revolut-xt25-slides-2025 | Taming Complexity in Distributed Systems: What's behind Revolut success, XT25 slide deck (Donato Lucia, Partner and Head of Technology; 28 slides, copyright 2025 Revolut) | Revolut (hosted by JUXT) | 2025 | https://www.juxt.pro/xt25/donato-lucia.pdf | talk | Strong | yes |
| revolut-devops-qcon-2025 | Extreme DevOps Automation, QCon London 2025 transcript (Sergio Amorim, DevOps Platform Developer Experience lead) | InfoQ | 2025-08 | https://www.infoq.com/presentations/revolut-devops-automation | talk | Strong | yes |
| revolut-recording-events-2020 | Recording more events... But where will we store them? (Jacek Spolnik; full text read via the Medium RSS feed medium.com/feed/revolut/tagged/java) | Revolut Tech (Medium) | 2020-01 | https://medium.com/revolut/recording-more-events-but-where-will-we-store-them-4b1dad457cf5 | engineering-blog | Strong | yes |
| revolut-sherlock-fraud-2019 | Building a state-of-the-art card fraud detection system in 9 months (Dmitri Lihhatsov; full text read via the Medium RSS feed medium.com/feed/revolut/tagged/data) | Revolut Tech (Medium) | 2019-11 | https://medium.com/revolut/building-a-state-of-the-art-card-fraud-detection-system-in-9-months-96463d7f652d | engineering-blog | Strong | yes |
| revolut-cicd-constraints-2023 | Improving product reliability by imposing constraints as a part of CI/CD process (Pedro Moura; read via the Medium RSS feed medium.com/feed/revolut) | Revolut Tech (Medium) | 2023-11 | https://medium.com/revolut/improving-product-reliability-by-imposing-constraints-as-a-part-of-ci-cd-process-597cf2307224 | engineering-blog | Strong | partial |
| revolut-gcp-data-nd | Revolut: Driving efficiency in data management with automated governance (Google Cloud customer case study with quotes from Revolut's Denis Agiev; undated, accessed 2026-11) | Google Cloud | undated | https://cloud.google.com/customers/revolut-data | vendor case study | Medium | yes |
