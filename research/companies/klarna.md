# Klarna

**Category:** BNPL
**HQ / founded:** Registered office London (Klarna Group plc, incorporated 2022); began operations in Sweden in 2005; EEA banking through Klarna Bank AB (klarna-f1-2025)
**Scale signal:** GMV of $105 billion in 2024; "more than 5.2 billion transactions conducted through our network since our founding"; 99.989% platform uptime and an average of 67,000 deployments a month (Oct 2023 to Sep 2024) (klarna-f1-2025)
**Last researched:** 2026-11-11

## Summary
Klarna's original core, KRED, is an Erlang system from December 2004 that kept its data in Mnesia, Erlang's built-in distributed database, on a seven-node cluster where every node held a full copy of a database that reached about 15 TB (klarna-kred-mnesia-postgres-2025). Between about 2019 and 2025 Klarna moved KRED from Mnesia to Aurora PostgreSQL with zero downtime, behind a compatibility layer, after concluding that a larger Mnesia cluster and LevelDB compaction on hot tables were limits "that KRED would eventually hit one way or another" (klarna-kred-mnesia-postgres-2025). Newer services are written in Java with Spring Boot on PostgreSQL, DynamoDB and Kafka on AWS (klarna-java-job-2026; klarna-f1-2025). In payments Klarna reversed a microservice split, merging per-payment-method services into a modular monolith with "one service, one database" (klarna-modular-monolith-2025). No public source describes Klarna's ledger model.

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Erlang (KRED core); Java on newer backend services; Scala, Clojure, Haskell, PureScript also used | Strong (Erlang); Medium (others) | klarna-kred-mnesia-postgres-2025; klarna-java-job-2026; klarna-fp-job-nd |
| Main frameworks | OTP (Erlang); Spring and Spring Boot (Java) | Medium | klarna-fp-job-nd; klarna-java-job-2026 |
| Primary OLTP store(s) | Aurora PostgreSQL (KRED since migration; Mnesia before); DynamoDB | Strong (Postgres); Medium (DynamoDB) | klarna-kred-mnesia-postgres-2025; klarna-java-job-2026 |
| Service-layer persistence | KRED: in-house data access layer (kdb) over Mnesia, then Postgres; no source on Java services | Strong | klarna-kred-mnesia-postgres-2025 |
| Money / ledger model | No public source found; KRED is the servicing system that tracks consumer debt | Strong (KRED role only) | klarna-kred-mnesia-postgres-2025 |
| Messaging / streaming | Kafka | Medium | klarna-java-job-2026; klarna-fp-job-nd |
| Infrastructure | AWS (primary cloud); Kubernetes, Docker, Terraform | Strong (AWS); Medium (rest) | klarna-f1-2025; klarna-fp-job-nd |
| Scaling approach | KRED: moved from full-copy Mnesia nodes to a separate managed Postgres so app nodes and database scale independently; sharding investigated and shelved | Strong | klarna-kred-mnesia-postgres-2025 |
| Build vs buy (core) | Built core systems and risk engine in house; holds a Swedish banking license; AWS for cloud | Strong | klarna-f1-2025 |
| Notable open source | No public source found in sources read | n/a | n/a |

## Languages and frameworks
- Klarna's first core system is Erlang: KRED dates to December 2004, when the company was still Kreditor (klarna-kred-mnesia-postgres-2025, 2025).
- In 2013 the CTO said Erlang had helped Klarna scale, but that fast growth left "tons of technical debt", and presented a new "no master" transaction engine (klarna-qcon-london-2013, 2013; abstract only).
- An undated functional-programming job listing names "Functional programming languages including Erlang, Scala (typelevel stack) and JVM tooling." and "We are also utilising Clojure, PureScript, and Haskell." (klarna-fp-job-nd)
- A Klarna engineer's 2020 slides say "Services at Klarna written in Haskell" exist, using Servant, postgresql-simple and Hedgehog, with Haskell not officially supported (klarna-haskell-slides-2020, 2020).
- A June 2026 backend listing asks for "Experience with Java (latest versions)." and "Familiarity with Spring and Spring Boot." (klarna-java-job-2026, 2026)
- No public source found that states why Klarna moved new work from Erlang toward the JVM, or what share of services each language has.

## The money layer (ledger, balances, payments)
- KRED is described as a "servicing system" that, among other things, tracks consumer debt (klarna-kred-mnesia-postgres-2025, 2025).
- Klarna funds most lending with deposits through its banking license: "in 2024, we funded 94% of our lending activities by utilizing consumer deposits" (klarna-f1-2025, 2025).
- Payments orchestration: per-payment-method microservices (pay now, pay later, pay over time) were merged into one modular monolith with "one service, one database, and a structured, clean codebase"; it handles over a million orders daily and about a third of Klarna's transactions on Black Friday (klarna-modular-monolith-2025, 2025).
- Ledger data model (double-entry, immutable, event-sourced): no public source found.

## Service-layer persistence and databases
- Mnesia era: a 7-node cluster, each node with a full on-disk copy; "The Mnesia database was around 15 TB and at its peak in 2018 around 1.3 TB was held in memory at all times." The rest was on disk through mnesia_eleveldb (klarna-kred-mnesia-postgres-2025, 2025).
- Business logic had not called Mnesia directly for years; all access went through kdb, an in-house layer that kept its API and gained a Postgres backend. Multi-read and multi-write were added because batching reads into one Postgres select was much faster than separate calls (klarna-kred-mnesia-postgres-2025, 2025).
- Schema was the hard part: "Mnesia stores untyped records (tuples) whereas Postgres requires types to build its columns." The team scanned the whole database to infer a type per field and had to reconcile three different null conventions (klarna-kred-mnesia-postgres-2025, 2025).
- The target is Aurora: cleanup required "an upgrade of our Aurora Postgres from 13 to 14" (klarna-kred-mnesia-postgres-2025, 2025).
- Newer services: "Database experience in PostgreSQL, DynamoDB, and Elasticsearch." (klarna-java-job-2026, 2026). The undated FP listing also names Mnesia, LevelDB, Kafka and serverless (klarna-fp-job-nd).
- ORM vs SQL-first for Java services: no public source found.

## Scale
- Network scale: GMV of $105 billion in 2024 (klarna-f1-2025, 2025).
- Platform: 99.989% average uptime and "an average of 67,000 new monthly deployments from October 2023 to September 2024" (klarna-f1-2025, 2025).
- KRED scaling options: sharding was investigated and shelved because surrounding systems were not ready; the team chose to move the database out of the application nodes instead (klarna-kred-mnesia-postgres-2025, 2025).
- Expected gains from Postgres included managed operations, lower cost than seven full copies, scaling app nodes and database separately, secondary indexes, a query language, schema evolution, and standard backup and deploy tooling (klarna-kred-mnesia-postgres-2025, 2025).

## Build vs buy
- "We prioritize building our own technology and investing in extraordinary engineering talent." Over 1,650 positions, about 48% of the organization, were engineering and data science roles at the end of 2024 (klarna-f1-2025, 2025).
- Cloud is bought: "we use Amazon Web Services ("AWS") as our primary third-party cloud infrastructure provider." (klarna-f1-2025, 2025)
- Risk is built: "Our sophisticated in-house risk engine is built on data collected over the last 20 years of operations." (klarna-f1-2025, 2025)
- The F-1 credits AI adoption with a "reduction in the use of third-party suppliers and vendors" (klarna-f1-2025, 2025). The filing does not name which systems were replaced.
- Datastore choice: Klarna moved from an embedded database it operated itself (Mnesia) to a managed one (Aurora PostgreSQL), partly because as one of the largest Mnesia users it "did not have the luxury of having the community find bugs and issues before they hit us" (klarna-kred-mnesia-postgres-2025, 2025).

## Correctness (idempotency, reconciliation, audit)
- Migration correctness: property-based tests checked that the Mnesia and Postgres backends of kdb behaved the same (klarna-kred-mnesia-postgres-2025, 2025).
- During the migration data replicated both ways: Mnesia to Postgres through a batched worker (about 20 ms follower lag), and Postgres back to Mnesia using prepared transactions (two-phase commit), later replaced by Postgres logical decoding messages, which saved about 20 ms per transaction (klarna-kred-mnesia-postgres-2025, 2025).
- Validation: row-by-row comparison took about seven days per run, so the team switched to logging written keys and checking convergence across nodes, and ran this for almost a year before cutover (klarna-kred-mnesia-postgres-2025, 2025).
- How Postgres was made to match Mnesia's transaction semantics (serializable transactions) is left for a Part 2 not found (klarna-kred-mnesia-postgres-2025, 2025).
- Idempotency and financial reconciliation design: no public source found.

## Changes over time (migrations and reasons)
- 2004 to 2005: KRED built in Erlang on Mnesia (klarna-kred-mnesia-postgres-2025, 2025; klarna-f1-2025).
- 2013: CTO talk on removing technical debt while building a new horizontally scalable transaction engine (klarna-qcon-london-2013, 2013).
- About 2019 to 2025: KRED moved from Mnesia to Aurora PostgreSQL. Work began with mob programming in November 2019, took about three years, and ended with a zero-downtime cutover; "Honestly, after 3 years of work this was probably among the most anticlimactic changes we've ever made." (klarna-kred-mnesia-postgres-2025, 2025)
- Reason given: "The answer quickly revolved around the issues of running Mnesia on an even larger cluster and with leveldb compaction hitting some hot tables during peak times." (klarna-kred-mnesia-postgres-2025, 2025)
- About 2024 to 2025: payments microservices merged into a modular monolith because shared steps were duplicated across services, creating "a distributed monolith"; the migration was still ongoing in March 2025 (klarna-modular-monolith-2025, 2025).
- Trade-off named: "The modular monolith presents an increased risk of a single point of failure" (klarna-modular-monolith-2025, 2025).

## Stated reasons (verbatim quotes)
> "KRED has been a stable workhorse at Klarna so why change a winning concept?" (klarna-kred-mnesia-postgres-2025, 2025-02)

> "The answer quickly revolved around the issues of running Mnesia on an even larger cluster and with leveldb compaction hitting some hot tables during peak times." (klarna-kred-mnesia-postgres-2025, 2025-02)

> "Each of these were limits that KRED would eventually hit one way or another." (klarna-kred-mnesia-postgres-2025, 2025-02)

> "We had officially migrated from Mnesia to Postgres with zero downtime!" (klarna-kred-mnesia-postgres-2025, 2025-02)

> "Microservices excel when applied to truly independent business domains with distinct scaling needs" (klarna-modular-monolith-2025, 2025-03)

> "Because we operate a single cloud-based platform, our consumer and merchant solutions are highly scalable and secure." (klarna-f1-2025, 2025-03)

## Open questions
- What is Klarna's ledger model, and does KRED hold it? No public source found.
- Part 2 of "The fellowship of the forgotten" (serializable transactions on Postgres) was not found.
- The CodeBEAM V EU 2021 talk "Breaking up with Mnesia" (Daniel Szoboszlay and Onno Vos) page returned HTTP 404; not read.
- Third-party claims that Klarna's core once used Riak (Erlang Solutions page) are unverified.
- Widely reported claims that Klarna replaced SaaS tools (Salesforce, Workday) with in-house AI-built systems are not in the F-1 sections read; unverified here.
- Which language Klarna treats as default for new services today: job listings show Java, Python, JavaScript and Go tracks; no company statement found.

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| klarna-kred-mnesia-postgres-2025 | The fellowship of the forgotten (KRED migration from Mnesia to Postgres; Onno Vos; read via the blog's RSS feed) | Klarna Engineering | 2025-02-26 | https://engineering.klarna.com/the-fellowship-of-the-forgotten-d341045a6123 | engineering-blog | Strong | yes |
| klarna-modular-monolith-2025 | How micro should your microservices be? (Raya Rizk; read via RSS feed) | Klarna Engineering | 2025-03-24 | https://engineering.klarna.com/how-micro-should-your-microservices-be-9ae7507a625c | engineering-blog | Strong | yes |
| klarna-f1-2025 | Klarna Group plc Form F-1 (Business, Risk Factors) | Klarna / SEC EDGAR | 2025-03-14 | https://www.sec.gov/Archives/edgar/data/2003292/000162828025012824/klarnagroupplcf-1.htm | filing | Strong | partial |
| klarna-qcon-london-2013 | Leapfrogging online payments and burying tech debt (David Craelius, CTO; session abstract) | QCon London | 2013 (older than 5 years) | https://qconlondon.com/london-2013/qconlondon.com/london-2013/presentation/Leapfrogging%20online%20payments%20%26%20burying%20tech%20debt.html | talk | Strong | partial |
| klarna-java-job-2026 | Senior Software Engineer - Java (Stockholm) | Klarna via Atomico job board | 2026-06-23 | https://careers.atomico.com/companies/klarna/jobs/83670663-senior-software-engineer-java | job-listing | Medium | yes |
| klarna-fp-job-nd | Software Engineer - Functional Programming (Stockholm) | Klarna via relocate.me | undated | https://relocate.me/sweden/stockholm/klarna/software-engineer-functional-programming-4100 | job-listing | Medium | yes |
| klarna-haskell-slides-2020 | Haskell at Klarna (slides by Klarna engineer Felix Mulder; event not stated) | felixmulder.com | 2020-01-21 (older than 5 years) | https://felixmulder.com/talks/2020/01/21/Haskell-at-Klarna.html | talk | Medium | yes |
| klarna-mnesia-codebeam-2021 | Breaking up with Mnesia (Daniel Szoboszlay, Onno Vos, Code BEAM V EU 2021) | Code Sync | 2021 (older than 5 years) | https://codesync.global/media/breaking-up-with-mnesia-daniel-szoboszlay-onno-vos-code-beam-v-eu-21/ | talk | Strong | no |
