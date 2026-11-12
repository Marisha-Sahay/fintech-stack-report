# PayPal

**Category:** payments
**HQ / founded:** San Jose, California (paypal-earnings-4q25-2026). Founding year not sourced in this note
**Scale signal:** Full-year 2025 total payment volume of $1.79 trillion, 25.4 billion payment transactions, 439 million active accounts (paypal-earnings-4q25-2026). Kafka peaked at 1.32 trillion messages per day on Retail Friday 2022 (paypal-kafka-2023)
**Last researched:** 2026-11-11

## Summary

PayPal's best primary sources on its core data layer are dated: in 2017 to 2019 its engineers described Oracle as the main store for site-critical, transactional systems, with more than 800 Oracle databases, Oracle RAC, and custom sharding since 2009 (paypal-oracle-sharding-2017; paypal-hera-talk-2019). Instead of an ORM-level fix, PayPal built Hera, a shared connection-pool and sharding proxy in front of Oracle and MySQL, rewrote it from C++ to Go, and open-sourced it in 2019; it later open-sourced JunoDB, a Go key-value store on RocksDB (paypal-hera-talk-2019; paypal-hera-repo-2019; paypal-junodb-repo-2023). The engineering stack is polyglot (C++, Java, Python, Node.js and Go in 2019), and 2026 job listings center on Java, Spring Boot and Hibernate (paypal-hera-talk-2019; paypal-job-ledger-2026). Newer services run on public cloud: a 2026 onboarding service runs on AWS DynamoDB in one market and Google Cloud Spanner in another, behind a custom data access layer with a transactional outbox and stored idempotency keys (paypal-two-clouds-2026). No public PayPal engineering source describing the design of its core ledger was found.

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Java; also C++, Python, Node.js, Go (2019) | Strong (2019); Medium (2026) | paypal-hera-talk-2019; paypal-job-ledger-2026 |
| Main frameworks | Spring Boot, Spring MVC, Hibernate | Medium | paypal-job-ledger-2026; paypal-job-wallet-2026 |
| Primary OLTP store(s) | Oracle (main footprint, RAC) plus MySQL; DynamoDB and Spanner in newer cloud services | Strong (dated 2017 to 2019); Strong (2026, one service) | paypal-oracle-sharding-2017; paypal-hera-talk-2019; paypal-two-clouds-2026 |
| Service-layer persistence | Mixed: Hibernate in job listings; Hera proxy under JDBC and Go drivers; custom repository data access layer in one 2026 service | Medium; Strong | paypal-job-ledger-2026; paypal-hera-talk-2019; paypal-two-clouds-2026 |
| Money / ledger model | No public source found on ledger design; job listings mention settlement mapped to "cash and accounting ledgers" | Medium | paypal-job-settlement-2026 |
| Messaging / streaming | Kafka since 2015: 1,500+ brokers, 20,000+ topics, 85+ clusters | Strong | paypal-kafka-2023 |
| Infrastructure | Own geographically distributed data centers; AWS and GCP for newer services and Kafka QA | Strong | paypal-kafka-2023; paypal-two-clouds-2026 |
| Scaling approach | Application sharding through Hera (1,024 scuttle bins mapped to shards), read replicas, connection multiplexing | Strong (2019) | paypal-hera-talk-2019 |
| Build vs buy (core) | Commercial database (Oracle) with in-house access and sharding layer; own key-value store | Strong (dated) | paypal-hera-talk-2019; paypal-junodb-repo-2023 |
| Notable open source | Hera (database proxy, Go, 2019); JunoDB (key-value store, Go, 2023) | Strong | paypal-hera-repo-2019; paypal-junodb-repo-2023 |

## Languages and frameworks

- "We have five primary languages like C++, Java, Python, Node.js, Go." (paypal-hera-talk-2019, 2019)
- "PayPal started off as a C++ shop", then added Java and later Go (paypal-hera-talk-2019, 2019).
- Hera was rewritten from C++ to Go; the Go version had been in production about a year by 2019, matched the C++ version's latency and used less CPU on Hera nodes (paypal-hera-talk-2019; paypal-hera-repo-2019). The Hera repo still includes a C++ Oracle worker (paypal-hera-repo-2019).
- 2026 ledger team listing asks for Java and "Spring (Spring Boot, Spring MVC) and Hibernate" and "hands-on experience in ORM tools like Hibernate" (paypal-job-ledger-2026, Medium).
- 2026 wallet team listing asks for "Java/J2EE, Spring and Hibernate" and "cloud databases such as DynamoDB, Spanner" (paypal-job-wallet-2026, Medium).
- The 2026 onboarding service is Java, built with Maven profiles and Spring-wired beans (paypal-two-clouds-2026).
- Kafka clients at PayPal include Java, Python, Spark and Node (paypal-kafka-2023).
- Node.js adoption for web apps in 2013 is widely reported, but the original PayPal post was not read (paypal-nodejs-2013, not read).

## The money layer (ledger, balances, payments)

- No public PayPal engineering post or talk describing the core ledger's model (double-entry, immutability, storage) was found. No public source found.
- PayPal has a team named "Ledger" (Stockholm) whose listing names Java, Spring, Hibernate and relational plus NoSQL databases (paypal-job-ledger-2026, Medium).
- A 2026 settlement role asks for experience "mapping settlements to cash and accounting ledgers" and Oracle schema design and transaction management (paypal-job-settlement-2026, Medium).
- A 2026 wallet role covers "onboarding, identity, ledger services, accounts, and global money movement" (paypal-job-wallet-2026, Medium).
- 2019 statement of principle: "all the payments must succeed" and "correctness is our most important principle" (paypal-hera-talk-2019, 2019).

## Service-layer persistence and databases

- "PayPal runs 800+ Oracle databases"; "Oracle is used for all site-critical applications; NoSQL is onboarding"; "Core transactional systems on Oracle" (paypal-oracle-sharding-2017, PDF dated 2017).
- "Our main footprint is Oracle, but we also support MySQL." (paypal-hera-talk-2019, 2019)
- Databases are organized into about 300 schemas, and some of the busiest "process billions per hour" (paypal-hera-talk-2019, 2019).
- Hera is an out-of-process shared connection pool and multiplexer; clients are thin (a Go client of about 1,000 lines plus a JDBC driver) and logic lives in the server (paypal-hera-talk-2019).
- Hera does read-write split for Oracle RAC (writes to a preferred node to cut interconnect traffic), transparent failover between read replicas, and evicts slow queries under overload (paypal-hera-talk-2019; paypal-hera-repo-2019).
- Hera "started as Oracle Connection Cache (occ) in PayPal's early days" (paypal-hera-repo-2019).
- Hera now multiplexes connections for MySQL, Oracle and PostgreSQL (paypal-hera-repo-2019).
- JunoDB: "PayPal's home-grown secure, consistent and highly available key-value store"; proxy-based, consistent hashing, data in memory or RocksDB, shard map in etcd, client libraries in Java, Go and C++ (paypal-junodb-repo-2023).
- 2026 onboarding service: business code talks only to repository interfaces; the provider (DynamoDB or Spanner) is chosen at build time by Maven profile; entities track dirty fields so only changed attributes are written; keys are immutable by construction (paypal-two-clouds-2026).

## Scale

- 2025: TPV $1.79 trillion; 25.4 billion payment transactions; 439 million active accounts (paypal-earnings-4q25-2026).
- Kafka: over 1,500 brokers, over 20,000 topics, close to 2,000 MirrorMaker nodes, 85+ clusters, 99.99% availability; peak 21 million messages per second on Retail Friday 2022 (paypal-kafka-2023).
- 2019: Hera moved 400 to 500 scuttles in about 40 seconds during resharding; multiplexing gave up to 10 times improvement in some cases (paypal-hera-talk-2019).
- 2019: PayPal volume grew about 25% per year, which drove connection exhaustion (paypal-hera-talk-2019).

## Build vs buy

- PayPal bought the database (Oracle, including RAC, with separate read-only replicas for read scale-out) and built the access and sharding layer itself (paypal-oracle-sharding-2017; paypal-hera-talk-2019).
- Custom sharding was hard to maintain; in 2017 PayPal evaluated Oracle's native sharding in beta and listed what it liked (auto-configuration, cross-shard query support, consistent hashing) (paypal-oracle-sharding-2017).
- Hera's sharding logic sits in the server, not client libraries, so it is not duplicated across five languages (paypal-hera-talk-2019).
- Open-sourced Hera in 2019 and JunoDB in 2023 (paypal-hera-repo-2019; paypal-junodb-repo-2023).

## Correctness (idempotency, reconciliation, audit)

- No cross-shard distributed transactions: "We don't believe in the two PC and the cross-shard transactions." (paypal-hera-talk-2019, 2019)
- Read-after-write: PayPal uses Oracle's synchronous replication for read-write split because clients expect to read their own updates (paypal-hera-talk-2019).
- Once an application is fully sharded, a query without a shard key fails instead of going to a default shard, because "sending into the wrong shard is probably worse than having an error" (paypal-hera-talk-2019).
- 2026 onboarding service: state change and audit event commit in one transaction (transactional outbox); idempotency keys are stored with the response in the same database and expire via TTL (DynamoDB) or a row deletion policy (Spanner) (paypal-two-clouds-2026).
- 2026 settlement role: "Build and implement idempotent systems with exactly-once processing guarantees" and reconciliation of bank files (paypal-job-settlement-2026, Medium).

## Changes over time (migrations and reasons)

- Early years: C++ services and Oracle Connection Cache, which became Hera (paypal-hera-repo-2019; paypal-hera-talk-2019).
- 2009: custom fixed-number sharding started for high-scale workloads (paypal-oracle-sharding-2017).
- 2015: Kafka introduced with a few isolated clusters; grown to 85+ clusters by 2023 (paypal-kafka-2023).
- Around 2018: Hera rewritten from C++ to Go because the C++ code "got very complex and it was very costly to enhance" (paypal-hera-talk-2019).
- 2023: Kafka QA clusters hosted on Google Cloud Platform (paypal-kafka-2023).
- 2026: a regulated onboarding service runs as two deployments, one on AWS DynamoDB and one on Google Cloud Spanner, from one codebase (paypal-two-clouds-2026).
- Unverified: a third-party report that PayPal moved thousands of Oracle databases to Google Cloud (AlloyDB, Spanner). See Open questions.

## Stated reasons (verbatim quotes)

> "Most importantly at PayPal, all the payments must succeed. We work with people's money and correctness is our most important principle and, of course, resiliency, availability, and performance are very important." (paypal-hera-talk-2019, 2019)

> "Honestly, we did it because we were running out of connections." (paypal-hera-talk-2019, 2019, on building Hera's multiplexing)

> "We don't want to duplicate the code on all those stacks, so our client is thin. Most of the logic is in the server." (paypal-hera-talk-2019, 2019)

> "We specifically use Oracle in that case because we want a synchronous replication." (paypal-hera-talk-2019, 2019)

> "Go would help with the complexity, because in Go you can write blocking code, the complexity would go down." (paypal-hera-talk-2019, 2019)

> "Maintaining custom sharding code and infrastructure challenging" (paypal-oracle-sharding-2017, slide text, 2017)

> "Oracle Sharding will allow us to more easily and effectively scale our mission-critical transactional databases" (paypal-oracle-sharding-2017, slide text, 2017)

> "Transactions, atomicity between a state change and its audit event, and key management are where two clouds diverge at the API level." (paypal-two-clouds-2026, 2026-07)

> "Onboarding sits upstream of money movement and identity provisioning. A retried request must never trigger a side effect twice." (paypal-two-clouds-2026, 2026-07)

## Open questions

- Core ledger design (double-entry or not, immutability, storage engine): No public source found.
- Whether Oracle is still the main OLTP store in 2026. A third-party article (WebProNews, "PayPal Bets Its AI Future on a Massive Google Cloud Database Migration") reports a move of thousands of databases from Oracle to Google Cloud; it could not be fetched and no PayPal or Google primary source was found. Unverified.
- Whether PayPal ever adopted Oracle native sharding after the 2017 beta evaluation. No public source found.
- The Stockholm "Ledger" team may belong to the Zettle business rather than core PayPal. Unverified.
- PayPal's Medium tech blog (medium.com/paypal-tech) returned HTTP 403 to automated reads, so the Hera and JunoDB announcement posts were not read. A third-party snippet says JunoDB is not the source of truth for critical services. Unverified.
- Node.js at PayPal (2013) figures are reported widely but the original post was not read.
- Founding year not sourced in this note.

## Sources

Freshness: sources dated before 2021-11 are older than 5 years and are labeled with their year in the text above. The Oracle sharding slides are undated on their face; the date given is the PDF creation date.

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| paypal-hera-talk-2019 | Scaling DB Access for Billions of Queries Per Day @PayPal (QCon New York 2019, InfoQ transcript) | InfoQ (speakers Petrica Voicu and Kenneth Kang, PayPal) | 2019-09 | https://www.infoq.com/presentations/paypal-scale-db/ | talk | Strong | yes |
| paypal-hera-repo-2019 | paypal/hera: High Efficiency Reliable Access to data stores (README and history) | PayPal (GitHub) | 2019-05 | https://github.com/paypal/hera | repo | Strong | partial |
| paypal-junodb-repo-2023 | paypal/junodb (README and architecture overview) | PayPal (GitHub) | 2023-02 | https://github.com/paypal/junodb | repo | Strong | partial |
| paypal-oracle-sharding-2017 | Oracle Database Native Sharding: a Customer Perspective (slides by John Kanagaraj, PayPal Core Data Platform) | Oracle (vendor-hosted PDF) | 2017-02 | https://www.oracle.com/tw/a/ocom/docs/sharding-paypal-3610614.pdf | talk | Medium | yes |
| paypal-kafka-2023 | Scaling Kafka to Support PayPal's Data Growth | PayPal Developer Blog (Monish Koppa) | 2023-09 | https://developer.paypal.com/community/blog/scaling-kafka-to-support-paypals-data-growth/ | engineering-blog | Strong | yes |
| paypal-two-clouds-2026 | One Codebase, Two Clouds | PayPal Developer Blog (Mounika Gampa) | 2026-07 | https://developer.paypal.com/community/blog/one_codebase_two_clouds | engineering-blog | Strong | yes |
| paypal-earnings-4q25-2026 | PayPal 4Q and FY 2025 earnings release | PayPal Holdings | 2026-02 | https://s205.q4cdn.com/875401827/files/doc_financials/2025/q4/PYPL-4Q-25-Earnings-Release.pdf | filing | Strong | partial |
| paypal-job-ledger-2026 | Sr Software Engineer, Ledger (Stockholm) job listing, via anitab.org job board | PayPal | 2026 | https://jobs.anitab.org/companies/paypal/jobs/69438857-sr-software-engineer-ledger | job-listing | Medium | yes |
| paypal-job-settlement-2026 | Senior Software Engineer (bank settlement) job listing, via anitab.org job board | PayPal | 2026-08 | https://jobs.anitab.org/companies/paypal/jobs/88922356-senior-software-engineer | job-listing | Medium | yes |
| paypal-job-wallet-2026 | Senior Software Engineer, Backend (Java), Wallet-as-a-Service, job listing via anitab.org job board | PayPal | 2026 | https://jobs.anitab.org/companies/paypal/jobs/59983627-senior-software-engineer-backend-java | job-listing | Medium | yes |
| paypal-hera-blog-2019 | Scaling Database Access for 100s of Billions of Queries per Day @ PayPal: Introducing HERA | PayPal Technology Blog (Medium) | 2019 | https://medium.com/paypal-tech/scaling-database-access-for-100s-of-billions-of-queries-per-day-paypal-introducing-hera-e192adacda54 | engineering-blog | Strong | no |
| paypal-junodb-blog-2023 | Unlocking the Power of JunoDB: PayPal's Key-Value Store Goes Open-Source | PayPal Technology Blog (Medium, Yaping Shi) | 2023-05 | https://medium.com/paypal-tech/unlocking-the-power-of-junodb-paypals-key-value-store-goes-open-source-ee85f935bdc1 | engineering-blog | Strong | no |
| paypal-nodejs-2013 | Node.js at PayPal | PayPal Engineering blog (Jeff Harrell) | 2013-11 | https://www.paypal-engineering.com/2013/11/22/node-js-at-paypal/ | engineering-blog | Strong | no |
