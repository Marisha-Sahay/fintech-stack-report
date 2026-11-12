# Starling Bank

**Category:** neobank (also sells its platform to other banks as Engine by Starling)
**HQ / founded:** UK. Founded 2014 by Anne Boden; banking licence and first account in production July 2016 (starling-cloud-bank-slides-2018). HQ city not verified from a source read.
**Scale signal:** 6.2m group platform accounts in FY26 (5.3m in FY25), customer deposits £12.7bn (starling-results-2026; starling-annual-report-2026).
**Last researched:** 2026-11-11

## Summary
Starling built its own core banking platform in about a year (build started January 2016, licence July 2016, public launch May 2017), mostly in Java on AWS, and now sells that same platform to other banks as Engine (starling-cloud-bank-slides-2018; starling-results-2026). Its architecture is a small number of "self-contained systems" (about 30 services in 2020), each with its own PostgreSQL database, linked by asynchronous, idempotent, retried commands it calls DITTO, "do idempotent things to others" (starling-rampant-pragmatism-2020; starling-cloud-bank-java-2018). The ledger is double-entry and immutable: "The ledger, as a whole, always adds up to zero" and "a ledger is immutable", with corrections posted as new entries that separate posted time from value time (starling-rampant-pragmatism-2020). Starling chose plain SQL behind annotated Java interfaces, and PostgreSQL `pg_notify` over Kafka, because, in Martin Dow's words, "we were unwilling to take on what we considered as inessential complexity, early on" (starling-rampant-pragmatism-2020). Most detailed sources are 2018 to 2020 talks, older than 5 years; 2026 job listings confirm Java, PostgreSQL on RDS and CloudSQL, and a move to AWS plus GCP for Engine (starling-finance-job-2026; starling-engine-gcp-job-2026).

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Java ("the majority of our backend codebase"); Kotlin shown on careers page | Strong (Java); Medium (Kotlin) | starling-rampant-pragmatism-2020; starling-finance-job-2026; starling-careers-engineering-2026 |
| Main frameworks | JAX-RS (RESTEasy); in-house patterns (recoverable commands, catch-up processors) | Strong | starling-rampant-pragmatism-2020; starling-cloud-bank-slides-2018 |
| Primary OLTP store(s) | PostgreSQL, one database per service (RDS; CloudSQL for Engine on GCP) | Strong (2020); Medium (2026) | starling-rampant-pragmatism-2020; starling-engine-gcp-job-2026 |
| Service-layer persistence | SQL-first: "a Java interface annotated with some SQL"; constraints in the database; no ORM mentioned | Strong | starling-rampant-pragmatism-2020 |
| Money / ledger model | In-house double-entry, immutable ledger; journals net to zero; posted vs value timestamps | Strong | starling-rampant-pragmatism-2020 |
| Messaging / streaming | Database queues and PostgreSQL `pg_notify`; Kafka deliberately not adopted (2020) | Strong | starling-rampant-pragmatism-2020 |
| Infrastructure | AWS from launch; now AWS and GCP (EKS and GKE), co-located payment HSMs | Strong (2018); Medium (2026) | starling-cloud-bank-slides-2018; starling-engine-gcp-job-2026 |
| Scaling approach | Few self-contained systems; async + idempotent retries; stateless instances safe to kill | Strong | starling-cloud-bank-slides-2018; starling-cloud-bank-java-2018 |
| Build vs buy (core) | Build; platform resold to other banks as Engine | Strong | starling-cloud-bank-slides-2018; starling-results-2026 |
| Notable open source | No public source found | Unknown | |

## Languages and frameworks
- Java was chosen because "exceptions are noisy and difficult to ignore", for "integrations with legacy third parties (SOAP etc)", because it is "lightweight (if you cut down on your dependencies)" and for its "reliable ecosystem (user base, job market, etc)" (starling-cloud-bank-slides-2018, 2018, older than 5 years).
- In the talk: "Java provides us with an easy way of interfacing with all of those crazy more outdated systems." (starling-cloud-bank-java-2018).
- 2020: "We break it up into about 30-odd services." "They're written in Java, and they're in a mono repo." Services use RESTEasy and JAX-RS; business logic is written as pure functions (starling-rampant-pragmatism-2020, 2020, older than 5 years).
- 2026: "Java (makes up the majority of our backend codebase)" (starling-finance-job-2026). The engineering careers page shows Java, Kotlin and JavaScript logos without saying how each is used (starling-careers-engineering-2026).

## The money layer (ledger, balances, payments)
- "A Bank is an Accounting Machine" is a slide heading in Starling's 2020 talk, and the ledger section covers "Denormalised Postings" (starling-rampant-pragmatism-slides-2020).
- Double-entry: debits and credits post to ledger accounts and group into journals; each journal nets to zero. "The ledger, as a whole, always adds up to zero, which apparently is quite important." (starling-rampant-pragmatism-2020).
- Immutable: "Then a ledger is immutable, which is also reasonably important." Adjustments are new entries, "distinguishing between the posted timestamp when the event landed in the ledger from the value timestamp." (starling-rampant-pragmatism-2020).
- Payment flow (2018): the customer service validates the request, stores it, reduces the balance and records the transaction; the payment service sends to Faster Payments; the bank service records the payment in the ledger. Each step is stored before it is processed so work resumes after a failure (starling-cloud-bank-java-2018).
- One synchronous exception to the async design: "balance allocation" (starling-cloud-bank-slides-2018).
- 2026: a Finance Engineering team is "responsible for the correct accounting of every transaction that passes through the bank's systems" and owns ledgers and the systems that integrate with them (starling-finance-job-2026).

## Service-layer persistence and databases
- "all services have their own RDS instance" (starling-cloud-bank-slides-2018). PostgreSQL is named as the relational database in 2020, used for SQL "access path independence" and constraints as "a declarative barrier" (starling-rampant-pragmatism-slides-2020; starling-rampant-pragmatism-2020).
- Data access is SQL-first: "At the bottom of our Java stack is a Java interface annotated with some SQL." No library is named and no ORM is mentioned (starling-rampant-pragmatism-2020). (Annotated SQL interfaces are the style of libraries such as JDBI, but Starling does not name one; unverified.)
- Consistency at service boundaries: data of record and the command to push it are committed "in the same database transaction", delegating cross-boundary consistency "to a Postgres transaction management", which avoids two-phase commit and distributed locks (starling-rampant-pragmatism-2020).
- Data movement: "Each system as event source" and "Database queues"; Kafka and Postgres logical replication listed as options (starling-rampant-pragmatism-slides-2020).
- 2026 estate: "Maintain and scale Starling's PostgreSQL RDS fleet using Terraform and Java automation", with the goal that the database layer "remains provider-agnostic" (starling-dbre-job-2026); Engine lists "RDS and CloudSQL for PostgreSQL" (starling-engine-gcp-job-2026).

## Scale
- 2019: 1 million customers and £1 billion on deposit (starling-rampant-pragmatism-slides-2020).
- FY26: 6.2m group platform accounts (FY25: 5.3m); deposits £12.7bn (starling-results-2026; starling-annual-report-2026).
- Release cadence 2018: "1-5 backend software releases per day", backend released "at 10x the rate of the mobile apps" (starling-cloud-bank-slides-2018). 2025: many services released several times a day, features shipped dark behind config flags (starling-engineering-delivery-2025).
- Starling scales by keeping the service count small (about 30 in 2020) rather than splitting into many microservices (starling-rampant-pragmatism-2020).

## Build vs buy
- Built its own bank platform in about a year: "We built a bank in a year" (starling-cloud-bank-slides-2018).
- Greg Hawkins (2017): "building from scratch means we can move faster and evolve more quickly", contrasting legacy bank systems that "have become too important to throw away, too fragile to change" (starling-hawkins-interview-2017, older than 5 years).
- Engine by Starling provides the Group's "proprietary technology platform" to other banks as SaaS; FY26 client base doubled, including Tangerine (Canada) and SBS Bank (New Zealand), with £70m committed ARR (starling-results-2026).
- Engine's Chief Product Officer: "Engine is the technology platform that was built to power Starling Bank, and this technology has been fundamental..." (starling-engine-tearsheet-2024, Weak, third-party interview).
- Build extends to plumbing: Starling chose PostgreSQL `pg_notify` over adopting Kafka (starling-rampant-pragmatism-2020).

## Correctness (idempotency, reconciliation, audit)
- DITTO: "do everything at least once and at most once", "async + idempotence + retry", "often achieve idempotence by immutability", "no distributed transactions", "don't trust other services" (starling-cloud-bank-slides-2018).
- Every entity gets a UUID; a service that sees an already-processed UUID returns success instead of repeating the work. "Give EVERYTHING a UUID" (starling-cloud-bank-java-2018; starling-cloud-bank-slides-2018).
- Recoverable commands mark items processed only after success; catch-up processors run every 1, 5 or 10 minutes to retry unfinished items; persistent failures go to exception dashboards and a pager rotation (starling-cloud-bank-java-2018).
- Known weaknesses named by Starling: retries can self-DoS at scale, and two instances can pick up the same item (starling-cloud-bank-java-2018).
- "We can replay the message as many times as we like." (starling-rampant-pragmatism-2020).
- Reconciliation design: No public source found beyond the 2026 finance listing's ownership of "correct accounting of every transaction" (starling-finance-job-2026).

## Changes over time (migrations and reasons)
- 2016 to 2017: built on AWS from scratch, "100% cloud-based" (starling-cloud-bank-slides-2018).
- 2018 to 2020: stayed with a relational core and few services instead of a broad microservice split, to "Reduce blast radius", "Avoid distributed monolith" and "Minimise synchronous calls" (starling-rampant-pragmatism-slides-2020).
- 2020: Kafka considered but not adopted; might be introduced if more consumers or large replays appear (starling-rampant-pragmatism-2020).
- Platform packaged as Engine for other banks (launch year not verified from a source read); in FY26 Engine received £19.7m of group investment (starling-results-2026).
- By 2026: infrastructure spans "GCP and AWS", "Kubernetes (GKE on GCP, EKS on AWS)", with hybrid links to co-located payment HSMs (starling-engine-gcp-job-2026). No public source found that explains why GCP was added.

## Stated reasons (verbatim quotes)
> "exceptions are noisy and difficult to ignore" ... "integrations with legacy third parties (SOAP etc)" ... "reliable ecosystem (user base, job market, etc)" (starling-cloud-bank-slides-2018, 2018-03, on why Java)

> "do everything at least once and at most once" (starling-cloud-bank-slides-2018, 2018-03)

> "building from scratch means we can move faster and evolve more quickly" (starling-hawkins-interview-2017, 2017-05)

> "The ledger, as a whole, always adds up to zero, which apparently is quite important." (starling-rampant-pragmatism-2020, 2020)

> "Then a ledger is immutable, which is also reasonably important." (starling-rampant-pragmatism-2020, 2020)

> "We're trying to reduce the blast radius of errors here" (starling-rampant-pragmatism-2020, 2020)

> "For a start, at the beginning, we were unwilling to take on what we considered as inessential complexity, early on." (starling-rampant-pragmatism-2020, 2020, on not adopting Kafka)

> "We don't need to worry about complicated two-phase commits or expensive distributed locking" (starling-rampant-pragmatism-2020, 2020)

## Open questions
- Is the 2020 design (about 30 services, `pg_notify`, no Kafka) still current in 2026? The newest strong sources are six years old.
- Which SQL library sits behind the "Java interface annotated with some SQL"? Not named in any source read.
- Why Engine added GCP alongside AWS, and whether Starling Bank itself runs on GCP. No public source found.
- How multi-tenancy works in Engine (one deployment per bank or shared). No public source found.
- Reconciliation and audit design for the ledger. No public source found.
- Open-source projects: none found.

## System architecture

Starling runs a few dozen Java "self-contained systems", each with its own PostgreSQL database, that call each other over plain REST and keep all queueing, retry and idempotency logic inside the services instead of in a broker (starling-cloud-bank-java-2018; starling-rampant-pragmatism-2020; starling-k8s-pragmatism-2022). Every instruction is stored before it is processed, so a killed instance or a failed hop is recovered by a catch-up processor that retries the same UUID until the work is done (starling-cloud-bank-java-2018). The card processor has a different shape: Mastercard interface devices and HSMs in Starling's UK data centres feed a "zero trust" VPC on AWS that only gathers data, and a separate core VPC makes the decision (starling-card-processor-2022). The detailed sources are 2018 to 2022 talks; 2025 and 2026 sources add release tooling, a GCP footprint and a BigQuery warehouse, but no current end-to-end description (starling-release-engineer-2025; starling-engine-gcp-job-2026; starling-google-cloud-story-nd).

### Money path: outbound bank transfer (Faster Payments, as described in 2018)
1. **App to customer service.** The mobile app sends the payment to the customer service, "the service responsible for storing the balance and storing the transactions that the customer wants to make". It checks the customer has enough money, stores the request in its database and answers the app; this is the only synchronous step (starling-cloud-bank-java-2018). The slide shows this call as `POST`, answered `201 Created {uuid}` (starling-cloud-bank-slides-2018, slide 18).
2. **Customer service records and forwards.** It records the transaction, reduces the balance and sends the payment, keyed by its UUID, to the payment service as a `PUT`; the payment service stores it and answers `202 Accepted` (starling-cloud-bank-java-2018; starling-cloud-bank-slides-2018, slide 18).
3. **Payment service to the scheme.** The payment service "is there to communicate with the outside world" and sends the payment to the Faster Payments network (starling-cloud-bank-java-2018). In 2026 a Payment Schemes team "sits at the edge of the bank" and owns the integrations with Faster Payments, BACS and SWIFT connectivity (starling-payment-schemes-job-2026).
4. **Payment service to bank service (ledger).** The payment service sends the payment to the bank service, which "maintains the ledger"; bank stores it, acknowledges it, then writes it into the ledger so the bill from the Faster Payments network can be reconciled later (starling-cloud-bank-java-2018).
5. **Back to the customer.** The app already has its answer from step 1, and steps 2 to 4 complete asynchronously; a caller that gets no good response retries the same UUID a few minutes later, and a receiver that already did the work just returns success (starling-cloud-bank-java-2018). No public source found on how a payment that the scheme rejects after step 1 is reported back to the customer.
6. **Ledger feed (2020 view).** Domain services such as payment, card and FX keep their detailed records and push one simplified record per event into the ledger service; slide 50 shows the card service inserting into PostgreSQL, being notified, then calling `PUT /card-posting` on the ledger (starling-rampant-pragmatism-2020; starling-rampant-pragmatism-slides-2020, slides 49 and 50).

### Money path: card authorisation (in-house processor, as described in 2022)
1. **Card network routing.** The terminal sends the transaction to the acquirer, which puts it into the Mastercard network; Mastercard routes it by card number (BIN range) to the right processor (starling-card-processor-2022).
2. **Two processors in parallel.** In 2022 about half of Starling's card traffic went through its in-house processor and half still through the original third-party processor; moving a card to the new processor means reissuing it into the new BIN range (starling-card-processor-2022).
3. **Starling data centres.** Mastercard Interface Processor (MIP) devices in Starling's UK data centres receive real-time authorisation messages over TCP/IP, which reach AWS over AWS Direct Connect with VPN tunnels, not over the internet (starling-card-processor-2022).
4. **Zero trust VPC (data gathering).** The MasterCard service decodes ISO 8583 messages into a Java object; the tokenization service replaces the card number with a hashed token; the validator creates short-lived access tickets; the HSM service, a proxy that "doesn't have a database", uses those tickets to fetch secrets from the PAN safe, PIN safe and Track safe and sends PIN-verification and cryptogram-validation commands to the HSMs (starling-card-processor-2022). This VPC "will never make any decisions about if this card transaction will be approved or not." (starling-card-processor-2022)
5. **Core VPC (decision and balance).** The card processor applies business rules (enough money, merchant blocks, fraud checks) with a lightweight in-house business rules engine, and holds the account balances itself; the old third-party processor instead calls Starling to check funds (starling-card-processor-2022).
6. **Response deadline.** Mastercard gives the issuing bank 7 seconds to respond before it decides on the bank's behalf by pre-agreed rules; running the processor in house gives Starling the full 7 seconds (starling-card-processor-2022).
7. **Settlement into the ledger.** Settlement messages from Mastercard or Visa are stored in detail in the card domain and projected into simplified ledger postings, in what Dow calls "a hypothetical ledger that is pretty close to what we do" (starling-rampant-pragmatism-2020). No public source found on how an approved authorisation updates the customer balance outside the card processor in the 2022 design.

### Orchestration
- No central workflow engine or message broker coordinates a transfer in the 2018 design. Each service stores the instruction in its own database first, Starling "chose to use the database essentially, as our queue of work", and a killed instance therefore loses nothing (starling-cloud-bank-java-2018).
- Recoverable Command: processes one item by UUID. It fetches the item in a short-lived session, checks it was not already processed on another instance, calls the other service or connector outside the database transaction, then marks the item processed in a short-lived transaction (starling-cloud-bank-slides-2018, slide 21).
- Catch-up Processor: runs every 1, 5 or 10 minutes, selects unprocessed items (the code comment suggests a partial index on a boolean `processed` column, capped per run) and hands them to Recoverable Commands through "a big ring buffer command bus" (starling-cloud-bank-slides-2018, slide 23; starling-cloud-bank-java-2018).
- A called service returns "a promise, essentially a UUID", not a finished result; the caller asks for progress by that UUID (starling-cloud-bank-java-2018).
- Partial completion is expected: there are no distributed transactions, and every service checks that its own part is done and that it has passed the item on (starling-cloud-bank-java-2018).
- Operators can pause a catch-up processor, and pause or delete single work items, from the management application; this was added after retries at scale overloaded services (starling-cloud-bank-java-2018). Two instances picking up the same item could bypass the idempotency check, and in 2018 Starling had no fix yet (starling-cloud-bank-java-2018).
- 2020: across service boundaries, a record of data and the command to push it are committed in one PostgreSQL transaction, and `pg_notify` wakes the Java service to push it; receiving endpoints are idempotent, so failures are handled by replaying (starling-rampant-pragmatism-2020).
- 2022 card processor: decisions run in the core VPC, where engineers "can see the steps that it took through our workflow engine"; the engine is not named or described (starling-card-processor-2022).
- Sagas or compensating transactions: No public source found.

### Deployment topology
- AWS from day one: "100% cloud-based" in 2018 (starling-cloud-bank-slides-2018). Each self-contained system ran on EC2 instances with its own RDS database, "at least two of each running at all times for redundancy purposes", scaled out by adding instances (starling-cloud-bank-java-2018).
- Instances are disposable: "single stateless service per instance" and "rolling deployments by termination (not quick but safe)" (starling-cloud-bank-slides-2018). Starling ran an instance killer in production and did database upgrades during office hours (starling-cloud-bank-java-2018).
- Kubernetes came late. In the QCon Plus talk published 2022-07, services ran "in Docker containers on EC2 instances" and the move to Kubernetes was just starting; the reasons given were a standard template for new services and UK regulators' worry about "concentration risk" on one cloud provider (starling-k8s-pragmatism-2022). The 2022 card processor talk also says "We currently run everything on AWS" and that services were moving to Kubernetes (starling-card-processor-2022).
- A 2023 vendor case study counts "2,000 container pods spread over six Kubernetes clusters, as well as 800 services" in what IBM calls a "multi-tenant environment" (starling-ibm-instana-2023). IBM does not define "services", and the figure does not match the 40 to 50 self-contained systems Starling cites (starling-k8s-pragmatism-2022).
- Own data centres for payment hardware: "multiple data centers across UK, and multiple MIP devices and multiple HSMs for redundancy and resiliency", linked to AWS by Direct Connect and VPN (starling-card-processor-2022).
- 2026: GCP and AWS, GKE and EKS, RDS and CloudSQL for PostgreSQL, with Engine deployed "across multiple regions and cloud providers globally" and hybrid links from GCP to co-located Payment HSMs (starling-engine-gcp-job-2026).
- Engine says its SaaS platform is "built and fully-managed by us in a dedicated environment", which reads as one environment per client bank; it does not say how environments map to clouds or regions (starling-engine-platform-nd).
- Regions, availability-zone layout, active-active versus standby, and the disaster recovery design: No public source found. The Engine listing asks for "Proven GCP multi-region disaster recovery experience", a hiring requirement, not a description (starling-engine-gcp-job-2026).
- DEMO is a prod-like environment where simulators drive production-like traffic (starling-release-engineer-2025); "It's always at least three times busier than our production environment" (starling-account-numbers-2026).

### Platform layer
- Service shape (2018): every service has its own RDS instance, inter-service calls are "generally async", the mobile layer combines data from several services, and there are no start-up order dependencies (starling-cloud-bank-slides-2018, slide 12). Deviations from pure self-contained systems: services not owned by a single team, REST APIs without an internal web UI, and "one key area with sync interaction (balance allocation)" (starling-cloud-bank-slides-2018, slide 13).
- Clients: services are called by each other, by the mobile apps and by a browser-based management portal for bank staff (starling-cloud-bank-java-2018).
- Count: about 30 services in 2020 and "about 40 to 50" self-contained systems in the 2022 talk (starling-rampant-pragmatism-2020; starling-k8s-pragmatism-2022).
- Common chassis (2020): stateless services that communicate "through HTTP APIs", may have daemon processes or scheduled jobs, and persist to their own transactional relational datastore; cross-cutting concerns are wrapped and applied the same way in every service, built with Maven and few dependencies (starling-rampant-pragmatism-2020). JAX-RS with RESTEasy generates HTTP clients from annotated server interfaces, and Jackson handles JSON (starling-rampant-pragmatism-2020).
- RPC and mesh: REST with JSON payloads, "the pipework is boring, just a payload over the wire" (starling-k8s-pragmatism-2022); the card processor also uses protobuf over Netty "for performance reasons" (starling-card-processor-2022). No public source found naming a service mesh.
- Monorepo: "They're written in Java, and they're in a mono repo." Engineers open every service in one IDE to trace data flow across network boundaries, and run the whole bank on a laptop with simulators for Faster Payments and SWIFT (starling-rampant-pragmatism-2020).
- Service boundaries follow domains and teams (Conway's Law and domain-driven design); each piece of data has one owning service, and data crossing a boundary is pushed, not fetched by RPC (starling-rampant-pragmatism-2020).
- Service groups: payments processing; customer details and account management; customer service and chat. Each group is owned by a team, deployed together, and rolled back together when one service fails (starling-k8s-pragmatism-2022). In 2025, Engineering Groups (for example Account Management, Customer Service) own sets of services and Engineering Practices (for example Infrastructure, Developer Experience) serve all engineers (starling-release-engineer-2025).
- Deployment history: in 2018, "auto build, dockerise, test, scan, deploy < 1h" (starling-cloud-bank-slides-2018). Early on all services were deployed in lockstep, "We were deploying as a monolith", then split into per-group releases as engineers and services grew (starling-k8s-pragmatism-2022).
- Deployment in 2025: each service is containerised independently but usually released per engineering group. Merging to main deploys to DEMO, and the in-house Engineering Portal creates the release, collects Commit, Technical and Business approvals, invokes a release Lambda and supports selective rollback; it is "our immutable audit of what software we release to production" (starling-release-engineer-2025). CI is TeamCity and infrastructure is Terraform (starling-engine-gcp-job-2026; starling-card-processor-2022).
- Card processor network isolation: each microservice has its own subnet, and AWS Network ACLs define which side may open a connection (starling-card-processor-2022).
- Observability: Prometheus, Grafana, correlation IDs in logs, and Instana for tracing (starling-card-processor-2022; starling-ibm-instana-2023).

### Data platform
- Online, between services: "Each system as event source" and "Database queues", implemented with `pg_notify`; Kafka was not adopted, and PostgreSQL logical replication was named as a better option to "turn this place orientated datastore into an event producer" (starling-rampant-pragmatism-2020; starling-rampant-pragmatism-slides-2020, slides 50 and 51).
- Into the ledger: one record per domain event is pushed from its home service into the ledger service, which Starling calls "a form of event sourcing" (starling-rampant-pragmatism-2020).
- Warehouse: Starling moved its data warehouse to BigQuery and adopted Vertex AI for model work, according to a Google Cloud customer story (starling-google-cloud-story-nd).
- Pipelines (job listings): batch and file-based pipelines in AWS and GCP into the warehouse, with Google Cloud Storage, Data Transfer Service, Dataflow, Pub/Sub, Cloud Run, BigQuery, Debezium/Kafka and dbt named as relevant (starling-data-pipelines-job-2025); dbt in BigQuery, "Kafka or Debezium", Kubernetes Operators and Helm, and links between the AWS and GCP environments (starling-data-infra-job-2026). These are listed skills; no Starling source describes a change data capture pipeline in production.
- Reconciliation: the bank service records outbound payments in the ledger so the Faster Payments bill can be reconciled (starling-cloud-bank-java-2018), and Dow says of the split service databases, "There's definitely a role for reconciliation." (starling-rampant-pragmatism-2020). Where reconciliation and regulatory reporting jobs read their data (online databases or warehouse): No public source found.

### Published architecture diagrams
- https://archive.qconlondon.com/system/files/presentation-slides/qcon_2018.pptx.pdf, slide 14: mobile app and management portal calling a row of self-contained systems, each with its own database (starling-cloud-bank-slides-2018).
- Same PDF, slide 18: "Make a payment" across the customer, payment and bank services, `POST` answered `201 Created {uuid}`, then `PUT {uuid}` answered `202 Accepted` at each hop (starling-cloud-bank-slides-2018).
- Same PDF, slide 19: the same flow with failed calls retried, with side labels saying retry provides "at least once" and idempotence gives "at most once" (starling-cloud-bank-slides-2018).
- Same PDF, slides 21 and 23: code of the `RecoverableCommand` interface and the `CatchupProcessor` base class (starling-cloud-bank-slides-2018).
- https://archive.qconlondon.com/system/files/presentation-slides/dan_osborne_-_qcon_2020_rampant_pragmatism-exportable.pdf, slide 46: hand-drawn logical model joining payment, card and FX entities to journal, posting and ledger account (starling-rampant-pragmatism-slides-2020).
- Same PDF, slide 49: the same model cut into payment, ledger, card and FX service boundaries (starling-rampant-pragmatism-slides-2020).
- Same PDF, slide 50: card service inserts into PostgreSQL, is notified, and pushes `PUT /card-posting` to the ledger service (starling-rampant-pragmatism-slides-2020).
- https://www.infoq.com/presentations/card-processor-microservices/: card processor architecture diagram, described in the transcript as the Starling data centre (MIPs, HSMs), the zero trust VPC and the core VPC; the image sits in the video player and was not inspected (starling-card-processor-2022).
- https://technology.starlingbank.com/blog/how-we-made-everyone-a-release-engineer: release flow from CI builds to Starling Demo, then release creation, staging and approvals in Engineering Portal, a release Lambda, and deploy to Starling Prod (starling-release-engineer-2025).

### Stated architectural principles (verbatim)
> "do everything at least once and at most once" ... "async + idempotence + retry" ... "each service constantly working towards correctness" ... "often achieve idempotence by immutability" ... "no distributed transactions" ... "don't trust other services" (starling-cloud-bank-slides-2018, 2018-03, slide 17, the DITTO principles)

> "So they receive instructions and they immediately store these instructions in the database. Then the database becomes the repository of what work must be done." (starling-cloud-bank-java-2018, 2018)

> "Your smarts are in your services here, not in the pipes between them." (starling-cloud-bank-java-2018, 2018)

> "Instance termination is safe. This is the key point about our architecture." (starling-cloud-bank-java-2018, 2018)

> "We're trying to reduce the blast radius of errors here, to stop a problem in one service taking down others." (starling-rampant-pragmatism-2020, 2020)

> "Each piece of data in the system has a home." (starling-rampant-pragmatism-2020, 2020)

> "First and foremost, we optimize for developer productivity." (starling-rampant-pragmatism-2020, 2020)

> "We believe in simplicity and consistency." (starling-rampant-pragmatism-2020, 2020)

> "The way out of that is to make sure that you are running on multiple cloud providers at once." (starling-k8s-pragmatism-2022, 2022-07)

> "the big mantra at Starling for our technology stack is keeping things simple" (starling-card-processor-2022, 2022-12)

> "We prefer small incremental changes delivered to production frequently." ... "Every part of our system and process should be automated." (starling-release-engineer-2025, 2025-10)

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| starling-hawkins-interview-2017 | Greg Hawkins on open banking and building a cloud bank (interview by Daniel Bryant) | InfoQ | 2017-05 | https://www.infoq.com/news/2017/05/hawkins-open-banking | press | Medium | yes |
| starling-cloud-bank-slides-2018 | Building a Reliable Cloud Bank in Java, slides (Jason Maude, March 2018) | QCon London archive | 2018-03 | https://archive.qconlondon.com/system/files/presentation-slides/qcon_2018.pptx.pdf | talk | Strong | yes |
| starling-cloud-bank-java-2018 | Building a Reliable Cloud-Based Bank in Java, QCon San Francisco 2018 transcript (Jason Maude) | InfoQ | 2018 | https://www.infoq.com/presentations/starling-bank | talk | Strong | yes |
| starling-rampant-pragmatism-2020 | Rampant Pragmatism: Growth and Change at Starling Bank, QCon London 2020 transcript (Dan Osborne, Martin Dow) | InfoQ | 2020 | https://www.infoq.com/presentations/starling-bank-pragmatism | talk | Strong | yes |
| starling-rampant-pragmatism-slides-2020 | Rampant Pragmatism, slides (Dan Osborne, Martin Dow) | QCon London archive | 2020 | https://archive.qconlondon.com/system/files/presentation-slides/dan_osborne_-_qcon_2020_rampant_pragmatism-exportable.pdf | talk | Strong | yes |
| starling-engine-tearsheet-2024 | Inside Starling Bank's evolution as a technology platform (Rabab Ahsan) | Tearsheet | 2024-01 | https://tearsheet.co/banking/the-platform-has-been-designed-to-cope-with-working-in-different-markets-inside-starling-banks-evolution-as-a-technology-platform/ | press | Weak | yes |
| starling-engineering-delivery-2025 | How Starling Builds a Bank - Part I (Sam Clarke) | Starling Bank | 2025-12 | https://technology.starlingbank.com/blog/engineering-delivery-part-i | engineering-blog | Strong | yes |
| starling-results-2026 | Starling delivers fifth year of profitability and accelerates global growth strategy (FY26 results press release) | Starling Bank | 2026-05 | https://www.starlingbank.com/news/starling-delivers-fifth-year-of-profitability-and-accelerates-global-growth-strategy | press | Strong | yes |
| starling-annual-report-2026 | Annual Report 2026 (web summary page) | Starling Bank | 2026 | https://www.starlingbank.com/investors/2026/annual-report-2026/ | filing | Strong | partial |
| starling-finance-job-2026 | Java Software Engineer - Finance and Accounting (job listing) | Starling Bank via Workable | 2026-10 | https://apply.workable.com/starling-bank/jobs/view/81904DD41D.md | job-listing | Medium | yes |
| starling-dbre-job-2026 | Database Reliability Engineer (job listing, posted about 2026-10) | Starling Bank via Built In London | 2026 | https://builtinlondon.uk/job/database-reliability-engineer/11525440 | job-listing | Medium | yes |
| starling-engine-gcp-job-2026 | Staff Infrastructure Engineer (GCP) - Engine by Starling (job listing, undated, accessed 2026-11) | Starling Bank via Workable | 2026 | https://jobs.workable.com/jobs/37422d5f-3238-4ed3-bcce-ef8ff8fd9b40.md | job-listing | Medium | yes |
| starling-careers-engineering-2026 | Engineering careers page (accessed 2026-11) | Starling Bank | 2026 | https://starlingbank.com/careers/engineering | job-listing | Medium | yes |
| starling-card-processor-2022 | How Starling Built Their Own Card Processor, QCon Plus transcript (Rob Donovan, Ioana Creanga) | InfoQ | 2022-12 | https://www.infoq.com/presentations/card-processor-microservices/ | talk | Strong | yes |
| starling-k8s-pragmatism-2022 | K8s: Rampant Pragmatism in the Cloud at Starling Bank, QCon Plus transcript (Jason Maude) | InfoQ | 2022-07 | https://www.infoq.com/presentations/k8-rampant-pragmatism/ | talk | Strong | yes |
| starling-release-engineer-2025 | How we made everyone a Release Engineer (Paul J Moore, Marcus Mak) | Starling Bank | 2025-10 | https://technology.starlingbank.com/blog/how-we-made-everyone-a-release-engineer | engineering-blog | Strong | yes |
| starling-account-numbers-2026 | Stress Testing a Bank: What happens when you run out of account numbers? (Laura Jaques) | Starling Bank | 2026-07 | https://technology.starlingbank.com/blog/no-account-numbers-left | engineering-blog | Strong | yes |
| starling-engine-platform-nd | Engine by Starling Platform Overview (product page, undated, accessed 2026-11) | Engine by Starling | undated (accessed 2026-11) | https://www.enginebystarling.com/platform/ | docs | Medium | yes |
| starling-google-cloud-story-nd | Starling puts the power of AI in customers' hands with Gemini and Google Cloud (vendor customer story, undated, accessed 2026-11) | Google Cloud | undated (accessed 2026-11) | https://cloud.google.com/customers/starling | third-party | Medium | yes |
| starling-ibm-instana-2023 | Starling Bank case study, IBM Instana Observability (vendor case study, produced 2023-08) | IBM | 2023-08 | https://www.ibm.com/case-studies/starling-bank | third-party | Medium | yes |
| starling-payment-schemes-job-2026 | Senior Java Software Engineer - Payment Schemes (job listing, removed 2026-10-06) | Starling Bank via Built In | 2026 | https://builtin.com/job/senior-java-software-engineer-payment-schemes/9385319 | job-listing | Medium | yes |
| starling-data-pipelines-job-2025 | Data Engineer - Data Pipelines (job listing, removed 2025-09-11) | Starling Bank via Built In | 2025 | https://builtin.com/job/data-engineer-data-pipelines/4762158 | job-listing | Medium | yes |
| starling-data-infra-job-2026 | Data Engineer - Data Infrastructure (job listing, removed 2026-06-24) | Starling Bank via Built In | 2026 | https://builtin.com/job/data-engineer-data-infrastructure/7806309 | job-listing | Medium | yes |
