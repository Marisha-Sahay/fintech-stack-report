# Wise

**Category:** payments (cross-border transfers and multi-currency accounts)
**HQ / founded:** Not verified from a source read for this note (formerly TransferWise; the GitHub organisation is still named transferwise (wise-idempotence4j-2026)).
**Scale signal:** 15.6m active customers in FY2025, about £36bn moved across borders each quarter, about 65% of transfers arrive instantly (wise-tech-stack-2025).
**Last researched:** 2026-11-11

## Summary
Wise runs "over 1000 services", mainly in Java and Kotlin on Spring Boot, with MariaDB and PostgreSQL (moved from self-managed EC2 to Amazon RDS), Kafka for "most of our real-time data movement" and its own Kubernetes platform on AWS (wise-tech-stack-2025; wise-account-ledger-job-2026). Its open-source code shows how it handles correctness: `tw-tasks-executor` guarantees "no set up task will go missing or is processed twice. We don't want to have missing payouts or double payouts", and `idempotence4j` persists every action to PostgreSQL or MariaDB so retries return the stored result (wise-tw-tasks-executor-2025; wise-idempotence4j-2026). The money layer is split across in-house ledgers: the "main ledger of Wise Account" processes "millions of transactions per day", Finance Core Accounting provides "ledger as a service" and records "over 1 billion ledger entries per month", and a Treasury Ledger tracks money held in each banking entity (wise-account-ledger-job-2026; wise-core-accounting-job-2026; wise-treasury-ledger-job-2026). Whether those ledgers are double-entry or immutable is not stated in any source read, and Wise's own posts on Hibernate (2016) and the 2022 stack could not be fetched.

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Java and Kotlin | Strong | wise-tech-stack-2025 |
| Main frameworks | Spring Boot; in-house "microservice chassis" with defaults for database access and Kafka | Strong (chassis); Medium (Spring Boot) | wise-tech-stack-2025; wise-account-ledger-job-2026; wise-idempotence4j-2026 |
| Primary OLTP store(s) | MariaDB and PostgreSQL on Amazon RDS; MongoDB Atlas and Redis for other workloads | Strong | wise-tech-stack-2025 |
| Service-layer persistence | No current public source found. Hibernate named in a 2016 post title and an undated listing, neither read | Unknown | wise-hibernate-2016 |
| Money / ledger model | Several in-house ledgers (Wise Account main ledger, Core Accounting ledger-as-a-service, Treasury Ledger); event-driven. Double-entry not stated | Medium | wise-account-ledger-job-2026; wise-core-accounting-job-2026; wise-treasury-ledger-job-2026 |
| Messaging / streaming | Kafka (brokers on Kubernetes), Kafka Streams and Flink | Strong | wise-tech-stack-2025; wise-kafka-summit-2023 |
| Infrastructure | AWS; own Kubernetes "Compute Runtime Platform" (6 to 20+ clusters); AWS Outposts in Australia | Strong | wise-tech-stack-2025 |
| Scaling approach | Monolith split into 1,000+ services, which multiplied the number of databases; central platforms and automation | Strong | wise-tech-stack-2025; wise-temporal-replay-2025 |
| Build vs buy (core) | Build: own services, chassis and ledgers. No vendor core found | Strong | wise-tech-stack-2025 |
| Notable open source | idempotence4j; tw-tasks-executor (archived 2025); PipelineWise | Strong | wise-idempotence4j-2026; wise-tw-tasks-executor-2025 |

## Languages and frameworks
- "In the backend we are primarily using Java and Kotlin." and "Wise runs on over 1000 services in total" (wise-tech-stack-2025).
- In-house chassis: "Introduced an in-house microservice chassis framework, built on the principle of minimal configuration". It ships as an artifact and sets defaults for security, observability, database access and Kafka (wise-tech-stack-2025).
- Build standardisation: "an in-house collection of Gradle plugins" (wise-tech-stack-2025).
- Spring Boot appears in ledger team listings: "Strong understanding of Java with experience with Spring boot." (wise-account-ledger-job-2026); "Java, Spring Boot, PostgreSQL, Kafka and React" (wise-core-accounting-job-2026). `idempotence4j` ships a Spring Boot starter (wise-idempotence4j-2026).
- Workflow engine: "We have adopted a workflow engine called Temporal to automate critical tasks like switchovers and recovery tests." (wise-tech-stack-2025).

## The money layer (ledger, balances, payments)
- Wise Account main ledger: the Hold team will "own and evolve the main ledger of Wise Account - processing millions of transactions per day", supporting card spending and Direct Debits (wise-account-ledger-job-2026).
- Finance Core Accounting: "Providing ledger as a service and responsible for the Third Party integrations". "Finance Services at Wise record over 1 billion ledger entries per month" (wise-core-accounting-job-2026). The events-per-minute figure differs between copies of the same listing: 400,000 on wise.jobs (wise-core-accounting-job-2026) and 40,000 on Built In (wise-core-accounting-builtin-2026). Use only the 1 billion entries figure.
- Treasury Ledger: gives "a real-time view of how much money is in Wise's various banking entities" by translating product events into actual and forecast money movements; trading teams use it to manage FX exposure, and "it is very important that the data is correct and up to date" (wise-treasury-ledger-job-2026).
- Stream processing on financial data: Kafka Streams and Flink run real-time aggregations, replication and enrichment over "transaction, balance, and other financial data" (wise-confluent-award-2023, vendor page).
- Double-entry, immutability or event sourcing of these ledgers: No public source found.

## Service-layer persistence and databases
- "We've worked hard to migrate most of our MariaDB and Postgres workloads off EC2 and into Amazon RDS." Reason: "This shift has cut down on maintenance tasks, reduced operational overhead, and offered more robust security features." (wise-tech-stack-2025).
- "we're moving from self-hosted MongoDB to MongoDB Atlas"; "Redis continues to power our in-memory workloads." (wise-tech-stack-2025).
- Breaking up the monolith caused "a significant increase in the number of databases"; Wise has "an exceptionally low tolerance for downtime, measured in mere milliseconds, for critical databases", and is automating upgrades and maintenance with Temporal (wise-temporal-replay-2025).
- Library-level evidence of both engines: `idempotence4j` has PostgreSQL and MariaDB modules with Flyway migrations, and expects clients to use "database master node to avoid any possible issues caused by the replication lag" (wise-idempotence4j-2026).
- ORM vs SQL-first: No current public source found. A 2016 Wise post, "When not to use Hibernate", reportedly describes a project where a stored-procedure policy clashed with JPA; it returned HTTP 403 and was not read (wise-hibernate-2016). The 2025 stack post, as read, does not mention Hibernate, JPA or jOOQ (wise-tech-stack-2025).

## Scale
- 15.6m active customers, about £36bn moved each quarter (FY2025); about 65% of transfers instant; "more than 850 engineers" (wise-tech-stack-2025).
- Over 1,000 services; Kubernetes clusters grew "from 6 Kubernetes clusters to more than 20" (wise-tech-stack-2025).
- "Hundreds of stateful stream processing applications power Wise's instant money movement." (wise-kafka-summit-2023).
- Over 1 billion ledger entries per month in Finance (wise-core-accounting-job-2026).

## Build vs buy
- Wise builds its platform in-house: its own microservice chassis, Gradle plugins, Kubernetes platform (CRP) and ledgers (wise-tech-stack-2025; wise-account-ledger-job-2026).
- It also sells that infrastructure: "our Wise Platform facilitates payments for banks, financial institutions and enterprises globally" (wise-tech-stack-2025).
- Buys managed infrastructure where it reduces toil: Amazon RDS, MongoDB Atlas, Temporal (wise-tech-stack-2025).
- Data catalogue: Wise built its own data inventory rather than adopt existing catalogue tools, which (paraphrasing the post) did not fit its security controls. The inventory reads MariaDB and PostgreSQL schemas from their system catalogues (wise-data-inventory-2025).
- No source read names a vendor core banking or ledger product at Wise.

## Correctness (idempotency, reconciliation, audit)
- `tw-tasks-executor` (Wise's open-source async task engine) states: "TwTasks guarantees that no set up task will go missing or is processed twice. We don't want to have missing payouts or double payouts." It detects the same task being set up twice, "usually because of receiving same Kafka message multiple times", uses optimistic locking, and only runs tasks after the business transaction commits (wise-tw-tasks-executor-2025).
- It depends on Zookeeper (leader election, locks), Kafka (triggering tasks) and a database (task state) (wise-tw-tasks-executor-2025).
- `idempotence4j`: "All actions are persisted to a database"; callers pass an action ID and the stored result is returned on retry (wise-idempotence4j-2026).
- Reconciliation: No public source found from Wise engineering.

## Changes over time (migrations and reasons)
- Messaging inside services: TwTasks was built to fix "the issue we had with Artemis, where in some cases a message was sent before transaction was committed or in worse case rolled back" (wise-tw-tasks-executor-2025; repo created 2019).
- 2018 onward: Kubernetes built with Terraform, JSONNET and ConcourseCI; replaced by the Compute Runtime Platform because "we needed a more scalable & standardised approach"; Helm replaced JSONNET "for better maintainability and upstream compatibility" (wise-tech-stack-2025).
- Databases moved from EC2 to RDS; MongoDB to Atlas (wise-tech-stack-2025).
- Monolith to services: the move multiplied database count (wise-temporal-replay-2025). A 2026 talk covers coupling problems as Wise grew "from an international transfers company into a global financial account" (paraphrase, wise-qcon-global-account-2026).
- Late 2025: `tw-tasks-executor` moved to a private repository "to better align with evolving business requirements" (wise-tw-tasks-executor-2025).

## Stated reasons (verbatim quotes)
> "This shift has cut down on maintenance tasks, reduced operational overhead, and offered more robust security features." (wise-tech-stack-2025, 2025-02, on moving MariaDB and Postgres to RDS)

> "While this model served us well, we needed a more scalable & standardised approach." (wise-tech-stack-2025, 2025-02, on replacing its first Kubernetes setup)

> "This helps us keep downtime to a minimum and stay compliant with strict regulations on resilience." (wise-tech-stack-2025, 2025-02, on Temporal)

> "TwTasks guarantees that no set up task will go missing or is processed twice. We don't want to have missing payouts or double payouts." (wise-tw-tasks-executor-2025)

> "it is very important that the data is correct and up to date" (wise-treasury-ledger-job-2026, undated listing)

## Open questions
- ORM vs SQL-first today. The seed note says listings ask for Hibernate experience; one undated listing found in search asks for "database abstraction layers like Hibernate", but it was not read. Unverified.
- Wise's 2016 "When not to use Hibernate" post and the 2022 and 2020 stack posts returned HTTP 403 and were not read (wise-hibernate-2016; wise-tech-stack-2022; wise-stack-2020). Search snippets say the 2022 post reports "over 600 backend services" on the JVM using Spring Boot, and an older post says "MySQL still holds most of our data in production" and that a Grails monolith remained in 2020. Unverified.
- Ledger design: double-entry, immutability, how the Account, Core Accounting and Treasury ledgers relate. No public source found.
- Which store each ledger uses (PostgreSQL vs MariaDB). Listings name PostgreSQL for Core Accounting and the Account ledger, as a requirement only.
- HQ and founding year not verified from a source read.

## System architecture

Note on Temporal: every Wise source read ties Temporal to database and infrastructure automation, not to transfer orchestration. Whether Temporal coordinates customer transfers: No public source found.

### Money path
1. Clients and API. Web apps are built on CRAB, "a Wise-specific abstraction on top of the popular Next.js framework", as 40 apps; businesses use "secure REST APIs backed by OAuth authentication" (wise-tech-stack-2025).
2. Business operations. Wise names the operations in a "send money" flow as "get a quote, set up a transfer, pay in for the transfer" (wise-availability-2024).
3. Pay-in. "For EUR pay-ins, we integrate with external vendors that act as the bridge between Wise and a large number of European banks"; a health check "runs on every payment request" and switches vendor "before the payment is created" when a healthy alternative exists (wise-vendor-switching-2026).
4. Ledgers. The Wise Account main ledger, Finance Core Accounting ("ledger as a service") and the Treasury Ledger record balances and money movements (wise-account-ledger-job-2026; wise-core-accounting-job-2026; wise-treasury-ledger-job-2026, all Medium).
5. Payout. Payouts run as asynchronous tasks in tw-tasks-executor: "Every payout has many asynchronous steps", instant payouts get higher priority, and partner failures are retried later (wise-tw-tasks-executor-2025).
6. Local schemes. Wise connects directly to instant payment systems: it "went live with InstaPay" and gained access to Zengin and PIX (wise-tech-stack-2025).

### Orchestration
- tw-tasks-executor: tasks are set up "inside business logic", and only "when business logic is successfully committed, the set up tasks will be executed"; tasks move through a documented state machine, retry on partner errors, and can be capped per partner (for example "15 total payout execution, but not more than 5 per partner") (wise-tw-tasks-executor-2025). It was archived in 2025 and moved to a private repository (wise-tw-tasks-executor-2025).
- Idempotency: idempotence4j persists each action and returns the stored result on retry (wise-idempotence4j-2026).
- Temporal: "We have adopted a workflow engine called Temporal to automate critical tasks like switchovers and recovery tests." (wise-tech-stack-2025). The Replay 2025 talk describes "Temporal workflows that integrate with AWS" for database upgrades with "seamless rollback and recovery" (wise-temporal-replay-2025).
- Service boundaries: Wise follows the principle to "treat each internal subsystem as a third-party product 'sold' to other teams" (wise-qcon-global-account-2026, talk abstract).
- Sagas or TCC for transfers: No public source found.

### Deployment topology
- AWS with centralized networking: "networking centralised using AWS Transit Gateways" (wise-tech-stack-2025).
- Physical sites for scheme links: "There is substantial variance between the details of the integrations with physical data centres required in the UK, Hungary and Australia. Our Australian data centres were one of the first deployments of AWS Outpost Servers" (wise-tech-stack-2025).
- Kubernetes: "from 6 Kubernetes clusters to more than 20" on the Compute Runtime Platform (wise-tech-stack-2025).
- Kafka: "rack-aware stand-by replicas to boost fault tolerance" (wise-tech-stack-2025).
- Number of AWS regions, active-active versus standby for the transfer path, and RTO or RPO targets: No public source found.

### Platform layer
- Chassis: "an in-house microservice chassis framework, built on the principle of minimal configuration and shipped as an artifact", configuring "security, observability, database communication, working with Kafka, and more" (wise-tech-stack-2025).
- Repositories: Gradle plugins standardize GitHub Actions "across our 700+ Java repositories", which indicates many repositories rather than one monorepo (wise-tech-stack-2025).
- Compute Runtime Platform: Terraform, "RKE2 handles cluster bootstrapping, with Rancher managing overall cluster state", Helm and ArgoCD (wise-tech-stack-2025).
- Service mesh: the earlier Kubernetes stack supported "service-mesh controls (Envoy)", and "Our Envoy-powered service proxy now includes seamless integration & discovery between services"; Envoy sidecars are "Fully managed" (wise-tech-stack-2025).
- Deployment: moving from Octopus to Spinnaker, where automated canary analysis routes "Only 5% of traffic" to new versions for a "30-minute analysis" with automatic rollback (wise-tech-stack-2025).
- Internal RPC protocol (REST, gRPC or other) between services: No public source found.

### Data platform
- Event bus: "Kafka underpins most of our real-time data movement" (wise-tech-stack-2025). "Hundreds of stateful stream processing applications power Wise's instant money movement." (wise-kafka-summit-2023), using Kafka Streams and Flink (wise-confluent-award-2023, Medium).
- Pipelines: "Our in-house data movement service helps funnel information from Kafka or databases into destinations like Snowflake, S3 Parquet, Iceberg, or other targets." (wise-tech-stack-2025). Whether the database path is log-based CDC: No public source found.
- Archive: "Data Archives, now archives more than 100 billion records across multiple databases" (wise-tech-stack-2025).
- Warehouse and lake: Snowflake plus an Iceberg data lake on S3, queried through Trino, with Airflow and dbt-core and Looker or Superset for reporting (wise-tech-stack-2025).
- Treasury view: the Treasury Ledger translates product events into actual and forecast money movements (wise-treasury-ledger-job-2026, Medium).
- Reconciliation pipeline: No public source found.

### Published architecture diagrams
- https://github.com/transferwise/tw-tasks-executor/blob/master/docs/index.md : "Task State Machine" diagram (TwTasksStates.png) and a "Task and Handlers" diagram (TwTasksHandlers.png). (wise-tw-tasks-executor-2025)
- https://medium.com/wise-engineering/wise-tech-stack-2025-update-d0e63fe718c7 : several images, including one after the Compute Runtime Platform section; alt text is empty in the copy read, so their content is not verified. (wise-tech-stack-2025)

### Stated architectural principles (verbatim)
> "TwTasks allows to set up tasks inside business logic and guarantees, that only when business logic is successfully committed, the set up tasks will be executed." (wise-tw-tasks-executor-2025)

> "The goal was to have exactly the same flow for normal and instant payouts, difference being, that instant payouts' tasks have just higher priority." (wise-tw-tasks-executor-2025)

> "At Wise, we have been following a simple principle to avoid building a tightly coupled system: treat each internal subsystem as a third-party product 'sold' to other teams." (wise-qcon-global-account-2026, 2026-03; inner quotes straightened)

> "When the signal itself is unreliable, the system does nothing rather than something." (wise-vendor-switching-2026, 2026-11)

> "Kafka underpins most of our real-time data movement" (wise-tech-stack-2025, 2025-02)

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| wise-tech-stack-2025 | Wise Tech Stack (2025 update) (Milon James); read via the publication's RSS feed because the article page returned 403 | Wise Engineering (Medium) | 2025-02 | https://medium.com/wise-engineering/wise-tech-stack-2025-update-d0e63fe718c7 | engineering-blog | Strong | yes |
| wise-data-inventory-2025 | Data Inventory (Ritesh Modi); read via the publication's RSS feed | Wise Engineering (Medium) | 2025-02 | https://medium.com/wise-engineering/data-inventory-4eff3f015553 | engineering-blog | Strong | partial |
| wise-idempotence4j-2026 | transferwise/idempotence4j README (created 2020-05, release 2.0.0 in 2026-05) | Wise (GitHub) | 2026-05 | https://github.com/transferwise/idempotence4j | repo | Strong | yes |
| wise-tw-tasks-executor-2025 | transferwise/tw-tasks-executor README and docs (created 2019-05, archived 2025-11) | Wise (GitHub) | 2025-11 | https://github.com/transferwise/tw-tasks-executor | repo | Strong | partial |
| wise-kafka-summit-2023 | Streaming Infrastructure at Wise, Kafka Summit London 2023 session page (Levani Kokhreidze) | Kafka Summit (Confluent) | 2023-05 | https://www.kafka-summit.org/sessions/streaming-infrastructure-at-wise | talk | Strong | partial |
| wise-temporal-replay-2025 | From Massive to Multitudes: Database management after breaking a monolith at Wise Payments, Replay 2025 session page (Samira El Aabidi, Yash Vanzara) | Temporal | 2025-03 | https://temporal.io/resources/on-demand/database-management-after-breaking-a-monolith-at-wise-payments | talk | Strong | partial |
| wise-qcon-global-account-2026 | Evolving Wise Architecture to Power a Global Account, QCon London 2026 abstract (Andrei Tognolo) | QCon London | 2026-03 | https://qconlondon.com/presentation/mar2026/evolving-wise-architecture-power-global-account | talk | Strong | partial |
| wise-account-ledger-job-2026 | Senior Software Engineer I - Account - Backend (Java) (expired listing, undated, accessed 2026-11) | Wise (wise.jobs) | 2026 | https://wise.jobs/job/senior-software-engineer-i-account-backend-java-in-london-jid-1687 | job-listing | Medium | yes |
| wise-treasury-ledger-job-2026 | Software Engineer - Treasury Ledger (expired listing, undated, accessed 2026-11) | Wise (wise.jobs) | 2026 | https://wise.jobs/job/software-engineer-treasury-ledger-in-london-jid-1489 | job-listing | Medium | yes |
| wise-core-accounting-job-2026 | Senior Software Engineer - Finance Core Accounting, Tallinn (undated, accessed 2026-11) | Wise (wise.jobs) | 2026 | https://wise.jobs/job/senior-software-engineer-finance-core-accounting-in-tallinn-jid-3779 | job-listing | Medium | yes |
| wise-core-accounting-builtin-2026 | Senior Software Engineer - Finance Core Accounting (copy; removed 2026-05-21) | Wise via Built In | 2026-05 | https://builtin.com/job/senior-software-engineer-finance-core-accounting/7949854 | job-listing | Medium | yes |
| wise-confluent-award-2023 | Data Streaming Awards 2023 winner: Wise | Confluent | 2023 | https://current.confluent.io/data-streaming-awards-winners/wise | vendor case study | Medium | yes |
| wise-hibernate-2016 | When not to use Hibernate | Wise Engineering (Medium) | 2016-10 | https://medium.com/wise-engineering/when-not-to-use-hibernate-84fec5091fd1 | engineering-blog | Strong | no |
| wise-tech-stack-2022 | Wise Tech Stack (2022 edition) | Wise Engineering (Medium) | 2022-12 | https://medium.com/wise-engineering/wise-tech-stack-2022-edition-a6ac089a382f | engineering-blog | Strong | no |
| wise-stack-2020 | The TransferWise stack, 2020 edition | Wise Engineering (Medium) | 2020 | https://medium.com/wise-engineering/the-transferwise-stack-2020-edition-68f70267501b | engineering-blog | Strong | no |
| wise-availability-2024 | Measuring meaningful availability / uptime of Wise; read via the publication's RSS feed | Wise Engineering (Medium) | 2024-08 | https://medium.com/wise-engineering/meaningful-availability-uptime-of-wise-b1439ddc6270 | engineering-blog | Strong | partial |
| wise-vendor-switching-2026 | From Onboarding to Production: How I Built Dynamic Vendor Switching at Wise; read via the publication's RSS feed | Wise Engineering (Medium) | 2026-11 | https://medium.com/wise-engineering/from-onboarding-to-production-how-i-built-dynamic-vendor-switching-at-wise-876942d6031f | engineering-blog | Strong | partial |
