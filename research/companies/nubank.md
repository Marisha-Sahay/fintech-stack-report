# Nubank (Nu Holdings)

**Category:** neobank
**HQ / founded:** Sao Paulo, Brazil (operational headquarters; the listed holding company is Nu Holdings Ltd., Cayman Islands), 2013 (nubank-f1-2021)
**Scale signal:** "over 122 million customers" (Aug 2025) (nubank-10-years-2025); "more than 4,000 microservices" on Kubernetes and "72 billion daily events via Kafka" (Apr 2025) (nubank-cloud-limits-2025); about 2,300 Datomic databases and about 500 microservices (Jul 2020) (nubank-cognitect-acquisition-2020)
**Last researched:** 2026-11-11

## Summary
Nubank picked its database first and its language second: the team chose Datomic, an immutable "ledger of facts" database, and then adopted Clojure because Datomic is written in it (nubank-cavalcanti-podcast-2021; nubank-architectural-decisions-2021; nubank-cognitect-acquisition-2020). Its own filing calls the result "an advanced, immutable ledger" with "a highly reliable audit trail and transaction history" (nubank-f1-2021). In 2017 the team described real-time double-entry accounting on Datomic, where a balance is "a cumulative function over the debits and credits for the book account" (nubank-architecture-qcon-2017). Nubank bought Cognitect, the company behind Clojure and Datomic, in 2020 and made Datomic free of licensing fees in 2023 (nubank-f1-2021; nubank-datomic-free-2023). It built its own core banking platform and card processor instead of buying one, and scales by sharding whole copies of its infrastructure by customer (nubank-f1-2021; nubank-architecture-qcon-2017; nubank-cloud-limits-2025).

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Clojure (on the JVM) | Strong | nubank-cavalcanti-podcast-2021; nubank-f1-2021 |
| Main frameworks | No framework; HTTP server and client libraries only (early years) | Strong | nubank-cavalcanti-podcast-2021 |
| Primary OLTP store(s) | Datomic (DynamoDB as storage backend in early years) | Strong | nubank-datomic-free-2023; nubank-architectural-decisions-2021 |
| Service-layer persistence | Datomic per service, queried with Datalog; no ORM reported | Strong | nubank-datomic-free-2023; nubank-data-privacy-2024 |
| Money / ledger model | Immutable database; real-time double-entry book accounts, balances derived from debits and credits | Strong | nubank-f1-2021; nubank-architecture-qcon-2017 |
| Messaging / streaming | Kafka (multiple clusters per shard) | Strong | nubank-architecture-qcon-2017; nubank-cloud-limits-2025 |
| Infrastructure | AWS; Kubernetes | Strong | nubank-f1-2021; nubank-cloud-limits-2025 |
| Scaling approach | Shard by customer into full infrastructure copies ("scalability units"), since 2016 | Strong | nubank-architecture-qcon-2017; nubank-10-years-2025 |
| Build vs buy (core) | Built own core banking platform and card processor (NuCore); card authorization network is Mastercard | Strong | nubank-f1-2021 |
| Notable open source | Owns Datomic (free of licensing fees since 2023, binaries Apache 2.0); sponsors Clojure | Strong | nubank-datomic-free-2023; nubank-cognitect-acquisition-2020 |

## Languages and frameworks
- Datomic came first and the language followed: "So because of Datomic, we chose Clojure as the main programming language." (nubank-cavalcanti-podcast-2021, 2021)
- The CTO tells the same story: reading the "Out of the Tarpit" paper led the team to ask "what about the database?", which led to Datomic, "which in turn led us to Clojure." (nubank-cognitect-acquisition-2020, 2020)
- Early services used no framework, only HTTP server and client libraries, deployed as WAR files to Jetty on AWS images (nubank-cavalcanti-podcast-2021, 2021).
- A second stated reason for Clojure: "It's easier to map finance logic in a functional programming language." (nubank-architectural-decisions-2021, 2021)
- The F-1 also frames Clojure as a security choice: "We utilize a less common code language, Clojure, which allows us to operate efficiently while minimizing our exposure to common security vulnerabilities" (nubank-f1-2021, 2021).
- Scale of the code base in July 2020: about 2.7 million lines of Clojure(Script) and about 600 engineers (nubank-cognitect-acquisition-2020, 2020).

## The money layer (ledger, balances, payments)
- In 2017 the team described double-entry accounting as a real-time operational system: "the balance at any given time is a cumulative function over the debits and credits for the book account, the cumulative sum." (nubank-architecture-qcon-2017, 2017)
- They named the hard parts as event ordering and late-arriving events, and used property-based tests because "you cannot write-up unit tests that capture the entire space" (nubank-architecture-qcon-2017, 2017).
- The F-1 describes "an advanced, immutable ledger, utilizing the Datomic database technology we own, which provides us with a highly reliable audit trail and transaction history" (nubank-f1-2021, 2021).
- Datomic never updates a fact in place: "it is like Git for your data. You never lose anything" (nubank-architecture-qcon-2017, 2017).
- The F-1 also says Datomic is used "for various purposes that range from storing registration data to storing metadata", so it is the general-purpose store, not only the ledger (nubank-f1-2021, 2021).
- Card authorization keeps balance state in sync across replicas through Kafka, because "if something is routed to a stale authorizer, you can spend the same money twice." (nubank-architecture-qcon-2017, 2017)

## Service-layer persistence and databases
- Datomic is "our primary transactional database" and "an ACID compliant, immutable database with powerful history and audit capabilities" (nubank-datomic-free-2023, 2023).
- Nubank chose Datomic as "the company's official database" in 2014 (nubank-datomic-free-2023, 2023).
- Early Datomic deployments used DynamoDB for storage: "We used DynamoDB as a backend database for Datomic, which was also easy to operate." (nubank-architectural-decisions-2021, 2021)
- Each microservice has its own database; the 2024 privacy post counts "over 400 microservices, each with its own database" in scope (nubank-data-privacy-2024, 2024).
- Customer personal data was kept in separate services from the start because it had different storage and encryption needs (nubank-cavalcanti-podcast-2021, 2021).
- Trade-off the team named: Datomic became the default even where it fit badly. "It doesn't work that well for fire hose writes, or long strings" (nubank-architecture-qcon-2017, 2017).
- Another named cost: Datomic was niche, so hiring experienced people was hard (nubank-architectural-decisions-2021, 2021).
- ORM vs SQL-first does not apply in the usual sense: there is no relational schema or ORM layer in any source read. No public source found on how services model Datomic access in code (library, conventions).

## Scale
- Sharding by customer started in 2016: "Scalability improvements, like sharding introduced in 2016, worked well for a time but eventually hit physical limits" (nubank-10-years-2025, 2025).
- The shard unit is a full copy of the system: "we build clones of the infrastructure and we assign different partitions of our customer base to different clones" (nubank-architecture-qcon-2017, 2017).
- In 2025: "Our primary database, Datomic, runs multiple transactors in Kubernetes, each handling a subset of data." and "we maintain multiple Kafka clusters for different shards to spread out messaging loads" (nubank-cloud-limits-2025, 2025).
- Stated reasons for sharding: isolation of failures and predictable capacity planning (nubank-cloud-limits-2025, 2025).
- Cost of the design: "each shard has a minimum cost no matter how many customers you have in it" (nubank-architectural-decisions-2021, 2021).
- The first shard ended up too large because the sharding project took longer than planned; "this first shard ended up being a special shard for a while." (nubank-cavalcanti-podcast-2021, 2021)
- Other limits: AWS service quotas, and in one case "AWS running out of machines to match Nubank's scaling pace." (nubank-10-years-2025, 2025; nubank-cloud-limits-2025, 2025)
- Deploy rate: "120+ deployments per day on average during the nine months ended September 30, 2021" (nubank-f1-2021, 2021).

## Build vs buy
- Core banking and processing were built in house: "We made the unusual decision to build our own core banking platform and processor from the ground up" (nubank-f1-2021, 2021).
- NuCore is described as "our proprietary, cloud-based core banking platform that we designed and built from the ground up", covering transaction authorization and processing, core banking, regulatory reporting and more (nubank-f1-2021, 2021).
- The F-1 contrasts this with fintechs and banks "dependent on third-party core bank systems and credit card processors" (nubank-f1-2021, 2021).
- Counter-point in the same filing: "our credit and debit (pre-paid) card transaction authorization is provided by Mastercard", and Nubank "cannot easily switch our operations to another cloud provider" (nubank-f1-2021, 2021).
- Moving credit card processing in house was gradual: "Every little feature was a migration that we had to do" (nubank-architectural-decisions-2021, 2021).
- Nubank bought the vendor of its database and language: it acquired Cognitect in 2020 for US$10.4 million in cash plus contingent consideration (nubank-f1-2021, 2021).
- Stated reason for the acquisition: "I see strong strategic logic in aligning Nubank as a scaled reference example which in turn supports the advancement of the ecosystem and community." (nubank-cognitect-acquisition-2020, 2020)
- AWS is the cloud: "We have partnered with Amazon Web Services to be our primary third-party cloud infrastructure provider." (nubank-f1-2021, 2021)

## Correctness (idempotency, reconciliation, audit)
- Idempotency is a rule for all messages: "any message that goes on Kafka has to be idempotent because you can consume the same message more than once" (nubank-architecture-qcon-2017, 2017).
- They use correlation IDs and ACID transactions in Datomic for this, not Kafka Streams state (nubank-architecture-qcon-2017, 2017).
- Audit is the stated reason for the database: "for banking we need to have the whole history, the whole audit trail of everything that we do." (nubank-cavalcanti-podcast-2021, 2021)
- Named regret on audit: some self-corrections ran only in memory, and "what I regret the most, is to have implicit operations that are not stored into the database, or that don't have origination information." (nubank-cavalcanti-podcast-2021, 2021)
- Second named regret: no customer identifier on every Datomic transaction, "if every transaction had an identifier that could point to the actual customer that owns that data" (nubank-architecture-qcon-2017, 2017).
- Reconciliation: no public source found on how Nubank reconciles its ledger against Mastercard, Brazil's payment rails or partner banks.
- Personal data deletion on an immutable store: Nubank says a Data Inventory "ensures that our data deletion and access report services are efficiently executed", but gives no mechanism (nubank-data-privacy-2024, 2024). Datomic's own docs offer excision for this ("Privacy laws might require you to excise data from ex-customers"), with a cost: "Excision puts a substantial burden on background indexing" (nubank-datomic-excision-docs-nd). No public source says whether Nubank uses excision.

## Changes over time (migrations and reasons)
- 2013 to 2014: blank-sheet start; Datomic chosen in 2014, Clojure followed (nubank-datomic-free-2023, 2023; nubank-cognitect-acquisition-2020, 2020).
- Infrastructure: EC2 to Docker, then Docker to Kubernetes, migrated shard by shard while live; CloudFormation replaced because it scaled poorly with the number of services (nubank-architectural-decisions-2021, 2021).
- Services: from "four or five services" at launch to about 500 (2020) and more than 4,000 (2025) (nubank-cavalcanti-podcast-2021; nubank-cognitect-acquisition-2020; nubank-cloud-limits-2025).
- 2016: customer sharding introduced; later hit physical limits (nubank-10-years-2025, 2025).
- Later: a "Core Banking architecture that could support multiple products across multiple countries" for expansion beyond Brazil (nubank-10-years-2025, 2025).
- Data pipeline: batch ETL chosen because Kafka Streams was not stable then; "If we were to start today, we would go to streaming." (nubank-architectural-decisions-2021, 2021)
- 2020: acquired Cognitect; 2023: Datomic made free of licensing fees, with the stated aim "to make Datomic more useful to more people in more situations" (nubank-f1-2021; nubank-datomic-free-2023).

## Stated reasons (verbatim quotes)
> "So because of Datomic, we chose Clojure as the main programming language." (nubank-cavalcanti-podcast-2021, 2021-08)

> "So instead of storing the data, it stores the changes on the data like a Git Repository." (nubank-cavalcanti-podcast-2021, 2021-08)

> "So on that first assumption, is for banking we need to have the whole history, the whole audit trail of everything that we do." (nubank-cavalcanti-podcast-2021, 2021-08)

> "We chose as a database, Datomic, a very niche database, which is an immutable ledger of facts." (nubank-architectural-decisions-2021, 2021-11)

> "It's easier to map finance logic in a functional programming language." (nubank-architectural-decisions-2021, 2021-11)

> "we like that concept of immutable log, it helps us with logical and temporal decoupling" (nubank-architecture-qcon-2017, 2017-12)

> "We have created an advanced, immutable ledger, utilizing the Datomic database technology we own, which provides us with a highly reliable audit trail and transaction history that we believe provides better accuracy, control, reliability and transparency when compared to traditional database architectures." (nubank-f1-2021, 2021-11)

> "We made the unusual decision to build our own core banking platform and processor from the ground up, using a modern, cloud-based architecture, and integrating data science and machine learning across key processes." (nubank-f1-2021, 2021-11)

> "Datomic's flexible data model and elastic scaling have been critical to our rapid growth" (nubank-datomic-free-2023, 2023-04)

> "We took the leap and have never regretted it." (nubank-cognitect-acquisition-2020, 2020-07)

> "Datomic has helped us solve really hard business problems and, frankly, make impossible business problems possible for us." Edward Wible, CTO, in a Cognitect case study (nubank-cognitect-casestudy-2015, 2015-09)

## Open questions
- How does Nubank honor LGPD deletion requests on Datomic? Excision exists in Datomic Pro, but no Nubank source says it is used. Third-party writers suggest "encrypt and throw away the key" or keeping personal data outside Datomic; unverified for Nubank.
- Does the double-entry design from the 2017 talk still hold, or did the Core Banking re-architecture change the ledger model? No public source after 2021 describes it.
- What replaced DynamoDB as Datomic storage (if anything) after the Kubernetes move? Not stated in sources read.
- How does NuCore relate to the Mastercard authorization dependency named in the F-1 (stand-in processing, network only)? Not explained.
- Commonly repeated but unverified here: "200+ Kafka clusters" and "1 PB of Kafka data per day" (seen only in a job-board snippet, not read).
- The Medium post "Microservices at Nubank, An Overview" (medium.com/building-nubank) returned HTTP 403 and was not read.

## System architecture

Most of the detailed evidence on the money path comes from a 2017 talk and 2019 to 2021 posts, all older than 5 years. Posts from 2025 and 2026 confirm the sharded design and add the fraud, streaming and connectivity layers, but no source after 2021 redraws the authorization or transfer path (nubank-architecture-qcon-2017; nubank-microservices-overview-2019; nubank-cloud-limits-2025; nubank-finconnect-2026).

### Money path: card purchase (credit card, as described in 2017)
1. Merchant, acquirer and network: the acquirer forwards the purchase to the card network (Mastercard), which sends the authorization request to Nubank as issuer (nubank-architecture-qcon-2017, 2017).
2. Mastercard interface device: an edge device the network places in a data center Nubank controls. It accepts TCP connections; Nubank connects to it as a network client and receives ISO 8583 messages (slide 19; the transcript renders it "ISO-8553") (nubank-architecture-qcon-2017, 2017).
3. router: the Finagle client that faces Mastercard and forwards requests to authorizers over Thrift (slide 19) (nubank-architecture-qcon-2017, 2017).
4. authorizer: decides approve or decline. It runs on physical servers in Nubank's data centers and needs no cloud call on the hot path (nubank-architecture-qcon-2017, 2017).
5. crypto and fraud: services the authorizer calls. crypto talks to an HSM over a proprietary protocol; chip cryptograms are validated through the HSM, and protocol keys are derived from a primary key held on it (nubank-architecture-qcon-2017, 2017).
6. Authorizer state: in 2017, held in memory in each authorizer replica, kept consistent by consuming the same Kafka log. A snapshotter service writes snapshots to disk and S3; a new authorizer loads a snapshot and resumes from the matching Kafka offset (slide 21) (nubank-architecture-qcon-2017, 2017). A 2021 vendor case study says the Authorizer team then moved this state to CockroachDB, "initially deployed CockroachDB on-prem in three locations" (nubank-cockroachdb-2021, vendor material).
7. Kafka bridge: the authorizer publishes each authorization to the cloud services on AWS, which own customer data; the cloud publishes changes such as a new credit limit back to the authorizer. Slide 20 labels the data center "neverland" and the AWS VPC "the real world" (nubank-architecture-qcon-2017, 2017).
8. global section: unsharded services that map externally known identifiers to customer IDs and shards, and route the purchase to the customer's shard (slide 37) (nubank-architecture-qcon-2017, 2017).
9. Shard services, including double entry: the double entry service maps business events such as a purchase or payment to debit and credit entries and derives balances and the available limit as cumulative sums (nubank-architecture-qcon-2017, 2017). Ledger detail is in "The money layer" above.
10. Back to the authorizer: the new open-to-buy is pushed through Kafka to every authorizer instance, because "if something is routed to a stale authorizer, you can spend the same money twice" (nubank-architecture-qcon-2017, 2017).
- Later change: card logic was restructured into a card platform "which decoupled debit and credit functionalities from specific products or geographies", replacing the single CreditCardAccounts service (nubank-platformization-2025). No public source found that names the card platform's services or redraws the authorization path after 2021.

### Money path: real-time bank transfer (TED, as described in 2017)
Steps follow slide 48, "Realtime money transfer".
1. Transfer request from the app (nubank-architecture-qcon-2017, 2017).
2. Investments: liquidates the customer's invested balance so the money is available (nubank-architecture-qcon-2017, 2017).
3. In-shard Transfers: initiates the transfer out (nubank-architecture-qcon-2017, 2017).
4. Ledger (double entry): observes the events and posts debits and credits (nubank-architecture-qcon-2017, 2017).
5. Global Transfers: "a global service that consumes from every shard to get all of the global transfers into a single stateful service, so we can maintain idempotence" (nubank-architecture-qcon-2017, 2017).
6. Internal transfer: shard routing sends it to the recipient's shard, which completes it (nubank-architecture-qcon-2017, 2017).
7. External transfer: the SPB Client translates Kafka messages to SOAP; messages go over RSFN (XML) to SITRAF (TED) and on to other Brazilian banks, with real-time gross settlement (nubank-architecture-qcon-2017, 2017).
8. Failure: if the transfer out fails, "we do a compensating transaction, re-invest the money and roll it back" (nubank-architecture-qcon-2017, 2017).
- Pix: No public source found describing the Pix money path. The only Pix-specific design found is the fraud check: a Pix event enters the Defense Platform, where "a component called the Flow Orchestrator takes over" and runs over 40 rule and model processes in parallel before deciding (nubank-defense-platform-2025). A QCon San Francisco talk on Nubank's infrastructure for Pix scale is scheduled for 2026-11-16; only the abstract exists (nubank-qconsf-pix-2026).
- App traffic: login goes to a global service, which returns hypermedia links pointing the app at services in the customer's shard, so Nubank does not "need to build an enormous routing layer that would intercept every single request from the outside" (slide 38) (nubank-architecture-qcon-2017, 2017).

### Orchestration
- No workflow engine, saga framework or state-machine product is named in any source read. No public source found.
- Multi-step flows are chained through messages rather than a central coordinator: "the initiator service will reliably publish a message to be later consumed by the next service in the flow" (nubank-microservices-overview-2019, 2019).
- Cross-shard flows cannot use a database transaction ("there is no database transaction here, because people are in different shards"), so the transfer flow undoes work with a compensating transaction (nubank-architecture-qcon-2017, 2017). No source read uses the word saga.
- Resume after failure: a consumer that throws forwards the message with error metadata to a dead letter topic; a service called mortician stores them, and an engineer republishes to the original topic once the bug is fixed (nubank-architecture-qcon-2017, 2017; nubank-microservices-overview-2019, 2019).
- Circuit breakers pause the Kafka consumer when outbound calls keep failing, so an incident becomes lag on the topic instead of a stream of errors, and consumption resumes after the fix (nubank-architecture-qcon-2017, 2017).
- Replay: Kafka offsets can be reset to reprocess old messages (nubank-architectural-decisions-2021, 2021). Every Kafka message must be idempotent, using correlation IDs and Datomic transaction functions (nubank-architecture-qcon-2017, 2017).
- Credit platform (2021): the published diagram shows one credit-platform service (name blurred) that knows the customer's overall debts and coordinates credit lifecycle events across the charging, debt and amortisation services (nubank-credit-platform-2021, 2021).
- Defense Platform (2025): the Flow Orchestrator knows which processes each event type needs. It was refactored from layer-by-layer execution to a DAG built with Nodely, an open-source Nubank library, cutting complex flows from 550 ms to about 350 ms (nubank-defense-platform-2025).

### Deployment topology
- Cloud: AWS. A few large AWS accounts ("Pangeia") were split into per-domain and per-team accounts ("continental drift") to reduce blast radius (nubank-cloud-limits-2025).
- Cells: each shard is a full copy of the infrastructure, a "scalability unit". In 2017 a copy held 120+ services with their databases, Kafka clusters, Zookeeper clusters and networking, and each served one partition of customers (nubank-architecture-qcon-2017, 2017). In 2025 Brazil alone had 20 shards, "essentially full replicas of the entire system" (nubank-defense-platform-2025), with separate Datomic transactors and Kafka clusters per shard (nubank-cloud-limits-2025).
- global section: unsharded services that route external events and handle cross-shard work, such as Global Transfers (nubank-architecture-qcon-2017, 2017).
- Own data centers: the card authorizer runs on physical servers co-located with the Mastercard devices; "we have multiple live data centers accepting transaction requests", and slide 19 lists "Active-active disaster recovery (not shown)" (nubank-architecture-qcon-2017, 2017).
- Data center to cloud (2026): FinConnect links on-premises data centers to the cloud over dedicated circuits, with DNS-based Global Traffic Management and redundant circuits. Failover between data centers used to be manual; automation cut recovery windows from 40 minutes to under 5 minutes (nubank-finconnect-2026).
- Whole-stack blue-green: for larger changes Nubank builds a complete new production stack (services, Kubernetes clusters, Kafka clusters), tests it, then moves traffic by updating the DNS aliases of all entry points, which a small team does "every couple of months" (nubank-microservices-overview-2019, 2019; nubank-architecture-qcon-2017, 2017).
- Tenancy: most services share Kubernetes clusters and Kafka broker pools; some critical workloads get single-tenant clusters (nubank-cloud-limits-2025).
- Countries: Brazil, Mexico and Colombia (nubank-cloud-limits-2025; nubank-finconnect-2026). No public source found naming the AWS regions used, or how shards map to regions or countries.
- Cloud-side disaster recovery: No public source found describing a standby region or a fallback platform for a full AWS outage. Card authorization is isolated from the cloud by design (nubank-architecture-qcon-2017, 2017).

### Platform layer
- Services: Clojure microservices from day one; 4,000+ on Kubernetes in 2025 (nubank-microservices-overview-2019, 2019; nubank-cloud-limits-2025). "All teams work with Clojure, build microservices, and favor asynchronous communication." (nubank-platformization-2025)
- Service chassis: no framework. Code follows what Nubank calls a "diplomat architecture", a ports-and-adapters (hexagonal) layout that keeps side effects in the controller layer and business logic as pure functions over maps (nubank-cavalcanti-podcast-2021, 2021; nubank-architectural-decisions-2021, 2021).
- Communication: Kafka for most service-to-service flows ("Most service-to-service interactions are intermediated by a reliable replicated messaging broker"), plus HTTP; Nubank handled "billions of Kafka messages and HTTP requests every day" in 2021 (nubank-microservices-overview-2019, 2019; nubank-architectural-decisions-2021, 2021). Thrift over Finagle inside the authorizer (nubank-architecture-qcon-2017, 2017).
- Service mesh: No public source found.
- Monorepo: No public source found. Service metadata (database type, workload size, build and test tooling) is declared in a shared git repository, from which a Clojure automation codebase provisions databases, service discovery and build pipelines (nubank-microservices-overview-2019, 2019).
- Deployment: WAR files on Jetty in baked AWS images with CloudFormation, then Docker, then Nubank's own Kubernetes clusters (nubank-cavalcanti-podcast-2021, 2021; nubank-microservices-overview-2019, 2019). Containers deploy blue-green; Prometheus metrics feed canary deploys (nubank-microservices-overview-2019, 2019; nubank-architectural-decisions-2021, 2021). A 2020 CNCF case study reports production deploys falling from 90 to 15 minutes and 700 deploys a week, and NuCLI with 500+ shortcuts for common operations (nubank-kubernetes-cncf-2020, 2020).
- Testing: end-to-end tests that took over an hour were replaced with consumer-driven contract tests (nubank-architectural-decisions-2021, 2021).
- Service boundaries: first drawn by storage needs (customer PII, transactional data, authorization, geolocation) (nubank-cavalcanti-podcast-2021, 2021); redrawn often, "we had to redraw service boundaries", by splitting or merging services (nubank-microservices-overview-2019, 2019); later grouped into business platforms (credit, card, payments, assets) and horizontal platforms built by specialist teams (nubank-architectural-decisions-2021, 2021; nubank-platformization-2025). The 2021 credit platform split credit card financing into charging, debt and amortisation parts over a shared credit platform (nubank-credit-platform-2021, 2021). Shard versus global is a second boundary (nubank-architecture-qcon-2017, 2017). The 2019 post also mentions "back-ends for our front-ends" without detail (nubank-microservices-overview-2019, 2019).

### Data platform
- 2017 design: an always-on extractor tails Datomic transaction logs and selected Kafka topics into an S3 data lake (change capture, chunking, format conversion). "Contracts" rebuild one logical table per entity across shards, and a DAG of datasets, models and policies in Scala SQL runs on Spark (slide 44) (nubank-architecture-qcon-2017, 2017).
- Contracts are Scala objects generated from each service's data model and checked by automated tests (nubank-microservices-overview-2019, 2019).
- 2020: a data platform service pulls logs from every production Datomic database at intervals and writes them as Avro files on S3; no separate change data capture is needed because Datomic's log is first-class. Services can also publish to Kafka, and a platform service batches those messages into Avro on S3. The ops DAG writes Parquet to S3, and analysts use a warehouse on Google BigQuery (nubank-data-platform-sed-2020, 2020).
- Scale: over 100 TB of event data processed daily (nubank-spark-2024); Defense Platform events are logged into the distributed ETL, which aggregates over 100 TB of logs a day (nubank-defense-platform-2025).
- Real time: the Avalanche stack runs Flink on Kubernetes, with Kafka for messaging and Apache Pinot for real-time queries (nubank-avalanche-2025).
- Reporting and checks: regulator reports and per-customer contribution margin (double entry revenue joined with ERP costs) are produced in the analytical environment (nubank-architecture-qcon-2017, 2017). The ETL is also used as a consistency check: "We use also the ETL to check against the consistence, against the systems as well." (nubank-architectural-decisions-2021, 2021)
- No public source found describing reconciliation against Mastercard settlement or Brazil's central bank systems (SPB, Pix).

### Published architecture diagrams
- https://www.infoq.com/presentations/nubank-architecture (QCon SF 2017 slides, numbered as in the InfoQ viewer) (nubank-architecture-qcon-2017):
  - Slide 11, "Core banking + credit card architecture": map of about 30 domain modules (KYC, authorizer, general ledger, realtime transfers, ETL and others).
  - Slide 13, "Purchase authorization value chain": customer, merchant, acquirer, Mastercard, Nubank as issuer.
  - Slide 19, "Authorizer service layout": Mastercard over ISO 8583 to two router, authorizer, crypto and fraud stacks with HSMs, Finagle and Thrift.
  - Slide 20, "Kafka as the bridge between environments": Nubank data center and AWS VPC with 100+ microservices, linked by Kafka.
  - Slide 21, "Kafka-based log/snapshot": authorizer and snapshotter consuming a topic partition, snapshot, new authorizer start-up.
  - Slide 36, "Option #2: scalability units": customer groups mapped to shards S0, S1, S2 running the same services.
  - Slide 37, "Scalability units + global routing": purchase and deposit events routed through global services to shards.
  - Slide 38, "Hypermedia for interactions": login at global, then links to services in shard S1.
  - Slide 44, "Extract, transform, load": Datomic logs and Kafka topics through an extractor to S3, contracts and "The DAG" on Spark.
  - Slide 48, "Realtime money transfer": numbered transfer flow from Investments to SITRAF.
- https://building.nu.com/nubank-credit-card-from-product-to-platform-mindset/ (nubank-credit-platform-2021): "Legacy Architecture" (not viewed for this note) and "New architecture definition", showing the charging platform, credit products and credit/finance platform services, with service names blurred.
- https://building.nu.com/microservices-at-nubank-an-overview/ (nubank-microservices-overview-2019): one diagram captioned "Partial failure and network partitions must be embraced to guarantee reliability." The image did not load for this research; only the caption is recorded.

### Stated architectural principles (verbatim quotes)
> "We don't need any cloud communication in order to authorize the transaction, that was important." (nubank-architecture-qcon-2017, 2017-12)

> "We had to work hard to decouple them and we use Kafka and asynchronous messaging as the life blood under that." (nubank-architecture-qcon-2017, 2017-12)

> "When you are doing scalability units, your shards are not database shards, they are actually copies of your infrastructure." (nubank-architecture-qcon-2017, 2017-12)

> "Our answer is to heavily rely on asynchronous messaging." (nubank-microservices-overview-2019, 2019-08)

> "it's always safer to build updated copies of data than to change it in place" (nubank-microservices-overview-2019, 2019-08)

> "If the shards are small enough, you don't have to optimize code, or you can delay it as much as you can." (nubank-architectural-decisions-2021, 2021-11)

> "A platform mindset means splitting the solution to a problem into a generic part which can be used by multiple products and a specific part which solves that particular product." (nubank-credit-platform-2021, 2021-05)

> "Highly aligned, but loosely coupled. So that means principles, not rules and bureaucracy." (nubank-engineering-principles-2022, 2022-05)

> "Leverage comes through platforms, libraries, and other collective or shared assets." (nubank-engineering-principles-2022, 2022-05)

> "It means fewer, tighter, and more deliberate choices." (nubank-engineering-principles-2022, 2022-05, on "canonical approaches")

> "All teams work with Clojure, build microservices, and favor asynchronous communication." (nubank-platformization-2025, 2025-06)

> "FinConnect decouples the complexity of connectivity from product development." (nubank-finconnect-2026, 2026-03)

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| nubank-f1-2021 | Nu Holdings Ltd. Form F-1 registration statement (Business, Risk Factors, Letter from founders) | Nu Holdings / SEC EDGAR | 2021-11-01 (older than 5 years) | https://www.sec.gov/Archives/edgar/data/1691493/000119312521314359/d213207df1.htm | filing | Strong | partial |
| nubank-architecture-qcon-2017 | Architecting a Modern Financial Institution (Edward Wible, Rafael Ferreira, QCon SF 2017) | InfoQ | 2017-12 (older than 5 years) | https://www.infoq.com/presentations/nubank-architecture | talk | Strong | yes |
| nubank-cavalcanti-podcast-2021 | Lucas Cavalcanti on Nubank's architecture, Clojure and Datomic (InfoQ Podcast) | InfoQ | 2021-08-16 (older than 5 years) | https://www.infoq.com/podcasts/lucas-cavalcanti-nubank-fintech-clojure/ | talk | Strong | yes |
| nubank-architectural-decisions-2021 | Architecting Software for Leverage (Lucas Cavalcanti, QCon Plus) | InfoQ | 2021-11 (about 5 years old) | https://www.infoq.com/presentations/nubank-architectural-decisions | talk | Strong | yes |
| nubank-cognitect-acquisition-2020 | Nubank and Cognitect: a personal perspective (Edward Wible) | Building Nubank | 2020-07-23 (older than 5 years) | https://building.nu.com/welcoming-cognitect-nubank/ | engineering-blog | Strong | yes |
| nubank-datomic-free-2023 | Datomic is available free of licensing fees | Building Nubank | 2023-04-27 | https://building.nu.com/datomic-is-available-free-of-licensing-fees/ | engineering-blog | Strong | yes |
| nubank-data-privacy-2024 | Software-driven data privacy: an innovative project journey | Building Nubank | 2024-04-22 | https://building.nu.com/software-driven-data-privacy-an-innovative-project-journey/ | engineering-blog | Strong | yes |
| nubank-cloud-limits-2025 | Managing cloud limits (Engineering Meetup #10) | Building Nubank | 2025-04-09 | https://building.nu.com/managing-cloud-limits | engineering-blog | Strong | yes |
| nubank-10-years-2025 | 10 years of engineering at Nubank: Lessons from scaling to 122+ million customers | Building Nubank | 2025-08-20 | https://building.nu.com/10-years-of-engineering-at-nubank-lessons-from-scaling-to-110-million-customers | engineering-blog | Strong | yes |
| nubank-cognitect-casestudy-2015 | Nubank case study (Datomic) | Cognitect | 2015-09-14 (older than 5 years) | https://cognitect.com/blog/2015/9/14/nubank | third-party | Medium | yes |
| nubank-datomic-excision-docs-nd | Datomic Pro documentation: Excision (product docs; Datomic is owned by Nubank; describes the feature, not Nubank's use of it) | Datomic (Nubank) | undated (accessed 2026-11) | https://docs.datomic.com/reference/excision.html | docs | Strong | yes |
| nubank-microservices-overview-2019 | Microservices at Nubank, an overview (Rafael Ferreira) | Building Nubank | 2019-08-12 (older than 5 years) | https://building.nu.com/microservices-at-nubank-an-overview/ | engineering-blog | Strong | yes |
| nubank-credit-platform-2021 | Nubank Credit Card: from Product to Platform mindset (Jacqueline Yumi Asano and others) | Building Nubank | 2021-05-25 (older than 5 years) | https://building.nu.com/nubank-credit-card-from-product-to-platform-mindset/ | engineering-blog | Strong | yes |
| nubank-cockroachdb-2021 | Brazil's Nubank uses CockroachDB for application resiliency and scale (vendor case study) | Cockroach Labs | 2021-06-25 (older than 5 years) | https://www.cockroachlabs.com/blog/nubank/ | vendor case study | Medium | yes |
| nubank-kubernetes-cncf-2020 | How Kubernetes empowered Nubank engineers to deploy 700 times a week (CNCF case study with Nubank quotes) | CNCF | 2020-07-10 (older than 5 years) | https://www.cncf.io/blog/2020/07/10/how-kubernetes-empowered-nubank-engineers-to-deploy-200-times-a-week/ | vendor case study | Medium | partial |
| nubank-data-platform-sed-2020 | Nubank Data Platform with Sujith Nair, Software Engineering Daily episode 999 (transcript PDF) | Software Engineering Daily | 2020-02 (older than 5 years) | https://softwareengineeringdaily.com/wp-content/uploads/2020/02/SED999-Nubank-Data-Platform.pdf | talk | Strong | partial |
| nubank-engineering-principles-2022 | Nubank's Engineering Principles: interview with Edward Wible | Building Nubank | 2022-05-26 | https://building.nu.com/nubanks-engineering-principles-interview-with-ed-wible/ | engineering-blog | Strong | yes |
| nubank-spark-2024 | How Nubank uses Spark to process data | Building Nubank | 2024-11-04 | https://building.nu.com/how-nubank-uses-spark-to-process-data/ | engineering-blog | Strong | partial |
| nubank-platformization-2025 | Evolving Nubank's Architecture Toward Thoughtful Platformization (Engineering Meetup #12) | Building Nubank | 2025-06-25 | https://building.nu.com/meetup-platform-architecture-career-growth/ | engineering-blog | Strong | yes |
| nubank-defense-platform-2025 | Scaling fraud defense: How Nubank evolved its risk analysis platform (Engineering Meetup #13) | Building Nubank | 2025-07-23 | https://building.nu.com/scaling-fraud-defense-how-nubank-evolved-its-risk-analysis-platform/ | engineering-blog | Strong | yes |
| nubank-avalanche-2025 | Avalanche stack and real-time streaming applications at Nu (DS and ML Meetup #98) | Building Nubank | 2025-08-18 | https://building.nu.com/avalanche-stack-and-real-time-streaming-applications-at-nu/ | engineering-blog | Strong | yes |
| nubank-finconnect-2026 | FinConnect: Building a standardized global connectivity platform for financial services | Building Nubank | 2026-03-16 | https://building.nu.com/finconnect-building-a-standardized-global-connectivity-platform-for-financial-services/ | engineering-blog | Strong | yes |
| nubank-qconsf-pix-2026 | Architecting Nubank's Global Financial Infrastructure (Cat Swetel, QCon SF 2026; abstract only, talk on 2026-11-16) | QCon San Francisco | 2026-11 | https://qconsf.com/presentation/nov2026/architecting-nubanks-global-financial-infrastructure | talk | Medium | yes |
| nubank-kafka-consistency-2019 | Maintaining consistency for a financial event-driven architecture (Iago Borges, Kafka Summit NYC 2019, slides) | SlideShare | 2019 (older than 5 years) | https://www.slideshare.net/slideshow/maintaining-consistency-for-a-financial-eventdriven-architecture-iago-borges-nubank-kafka-summit-nyc-2019/139737750 | talk | Strong | no |
