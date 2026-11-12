# Fintech and bank data-layer decisions: initial findings (Nov 11, 2026)

Status: first pass, built from web search while writing the Spring JDBC vs JPA post (`posts/spring-jdbc-vs-jpa/`).
Nothing here is publish-ready until the primary source for each claim has been read end to end.

Evidence levels:
- **Strong**: the company's own engineering post, conference talk or docs.
- **Medium**: the company's job listings, or indirect material from the company.
- **Weak**: third-party directories or summaries. Do not publish on these alone.

---

## Working thesis

Fintechs split their data into two layers, and each layer follows a different rule.

1. **The money layer** (balances, ledgers, payments). Append-only. Nobody overwrites money. Teams build custom ledgers or adopt immutable databases, and the ORM question barely applies.
2. **The service layer** (customers, onboarding, workflows, back office). Ordinary engineering choices, ORM or SQL-first, decided mostly by who owns the schema and how large the tables get.

---

## Company notes

### Goldman Sachs
- **Persistence:** Reladomo (formerly Mithra), an in-house Java ORM, open-sourced in 2016 under Apache 2.0.
- **What is distinctive:** bitemporal chaining (business time plus processing time), an audit-only mode, a typed query language checked at compile time, built-in in-memory test database, custom cache, multi-schema support.
- **Stated reasons:** existing ORMs did not meet their requirements. String-based query languages were a poor fit for dynamic queries, and testability was a priority from the start.
- **Evidence:** Strong.
- **To verify:** read the English "Why build another ORM?" section of the InfoQ article. Find whether Hibernate is named. Find which internal systems use it and since when.
- Sources: https://www.goldmansachs.com/careers/blog/posts/reladomo.html, https://www.infoq.com/articles/Reladomo-Open-Source-ORM, https://www.infoq.com/articles/Reladomo-Open-Source-ORM-Part2, https://goldmansachs.github.io/reladomo/mithrafaq/ReladomoFaq.pdf

### Nubank
- **Language and store:** Clojure, with Datomic (immutable, accumulate-only) as the system of record for most products.
- **Stated reasons:** a database that does not lose data on updates suits a fintech. Built-in audit history and time-travel queries. Clojure was adopted because Datomic is written in it.
- **Ownership:** acquired Cognitect (Clojure and Datomic) in 2020. Datomic binaries became free in April 2023.
- **Evidence:** Strong, but partly Nubank's own promotional material.
- **To verify:** user and transaction counts (seen only in a secondary source). How they handle right-to-erasure requests on an immutable store (Datomic excision?).
- Sources: https://cognitect.com/blog/2015/9/14/nubank, https://www.infoq.com/podcasts/lucas-cavalcanti-nubank-fintech-clojure/, https://building.nubank.com/datomic-is-available-free-of-licensing-fees/, https://www.finextra.com/newsarticle/36297/nubank-buys-firm-behind-clojure-programming-language

### Uber (payments platform, Gulfstream)
- **Ledger:** LedgerStore, a custom storage layer built with Uber's Storage Platform team. Migrated off DynamoDB. InfoQ reports about $6M a year in savings. Indexes are built from materialized views in Docstore (MySQL-based).
- **Model:** money orders are immutable. Adjustments are recorded as new money orders. Pre-commit checks make every entry sum to zero.
- **Stated reasons:** auditability and tamper-evident records.
- **Evidence:** Strong.
- **To verify:** Gulfstream start year (Uber says 2016, InfoQ says 2017). The publication date of Uber's "Zero Sum by Design" post. Which languages the ledger services use.
- Sources: https://www.uber.com/blog/ubers-payments-platform, https://www.infoq.com/news/2024/05/uber-dynamodb-ledgerstore

### Stripe
- **Ledger:** a double-entry system of record for money movement, the base of Stripe's Data Quality Platform.
- **Stated reasons:** double-entry gives a mathematical basis for proving correctness.
- **Evidence:** Strong for double-entry. "Immutable" and "99.9999% explainability" come from third-party summaries, so check them against Stripe's own post.
- **To verify:** underlying storage and language.
- Source: https://stripe.dev/blog/ledger-stripe-system-for-tracking-and-validating-money-movement

### Cash App (Block)
- **Persistence:** Hibernate for most MySQL access (2018). Hibernate `@Version` for detecting concurrent edits. Payments split into two "movements" before sharding. Vitess shards MySQL underneath.
- **Framework:** Misk, Cash App's Kotlin service framework, reportedly ships both `misk-hibernate` and `misk-jooq` (third-party source, so check the Misk repo).
- **Takeaway:** they scaled below the ORM (sharding plus data-model changes) instead of replacing it.
- **Evidence:** Strong for 2018. The current state is unknown.
- **To verify:** whether Hibernate is still the default in 2026, and whether jOOQ is used.
- Sources: https://code.cash.app/remodeling-cash-app-payments, https://code.cash.app/sharding-cash

### Adyen
- **Persistence:** Java 17, PostgreSQL, MyBatis (job listing, plus Adyen's own graph database write-up). They partition tables expected to pass about 100 GB. A 2023 post digs into the PostgreSQL JDBC driver's prepared-statement cache.
- **Stated reasons:** none found for MyBatis specifically. Likely SQL control on very large tables, but that is an inference.
- **Evidence:** Medium.
- **To verify:** read Adyen's "Design to duty" accounting and reporting posts for the ledger model. Find any statement on why they chose MyBatis.
- Sources: https://www.adyen.com/knowledge-hub/injecting-metadata-as-comments, https://www.adyen.com/knowledge-hub/partitioning-at-adyen, https://www.adyen.com/knowledge-hub/the-adyen-way-of-engineering-oss-or-built-in-house, https://dev.to/adyen/design-to-duty-the-accounting-and-reporting-systems-at-adyen-3fae

### Alibaba (Ant Group still to research)
- **Persistence:** the Alibaba Java Development Manual has an ORM rules section written for MyBatis/iBATIS. No `SELECT *`, `#{}` instead of `${}` to prevent SQL injection, and explicit `resultMap` field mapping.
- **Evidence:** Medium (read via mirrors).
- **To verify:** the official manual on GitHub. Whether Ant Group / Alipay follow the same rules, plus OceanBase and SOFAStack.
- Sources: https://m.php.cn/java/java-alibaba-orm.html, https://gitee.com/zgxtech_admin/Alibaba-Java-Coding-Guidelines

### Zalando (e-commerce, not fintech; a reference point for SQL-first)
- **Persistence:** all database access goes through PostgreSQL stored procedures, called from Java via SProcWrapper interfaces. Stored-procedure APIs are versioned by schema.
- **Stated reasons (GOTO 2013):** performance, validation close to the data, simple transaction scope, an API that any language can call.
- **Evidence:** Strong, but dated (2012 to 2013).
- **To verify:** whether this still holds after Zalando's move to microservices.
- Sources: https://de.slideshare.net/try_except_/goto-2013whyzalandotrustsinpostgre-sql20131018, https://postgresql.eu/events/pgconfeu2012/schedule/session/323-java-wrapper-for-postgresql-stored-procedures

### Revolut
- **Stack:** Java 17/21, PostgreSQL, Redis, GCP, Kubernetes. Their own listing describes a "minimalist approach to external frameworks". Job postings describe an in-house EventStore built on PostgreSQL.
- **jOOQ and Flyway:** third-party directory only. Unconfirmed.
- **Evidence:** Medium for the stack and framework stance, Weak for jOOQ.
- **To verify:** Revolut engineering blog or talks on persistence and the event store design.
- Sources: https://revolut.com/careers/position/backend-software-engineer-java-530d3bfd-bdca-4390-8f8a-bc88ddc1eb51/, https://www.revolut.com/blog/post/how-to-ace-your-java-interview-at-revolut/, https://komo.ai/directory/revolut-tech-stack

### Wise
- **Stack:** Java/Spring, Postgres, Kafka. Job listings ask for Hibernate experience.
- **Relevant post:** "When not to use Hibernate" (Wise Engineering, 2016). A stored-procedure policy collided with JPA and forced unusual mappings.
- **Evidence:** Medium.
- **To verify:** the Wise Tech Stack 2022 and 2025 posts for current persistence and ledger choices.
- Sources: https://medium.com/wise-engineering/when-not-to-use-hibernate-84fec5091fd1, https://medium.com/wise-engineering/wise-tech-stack-2025-update-d0e63fe718c7

### Industry baseline
- Vlad Mihalcea's 2022 Java data access survey: JPA and Hibernate are still the most popular. Get the exact percentages from the page.
- Source: https://vladmihalcea.com/java-data-access-technology/

---

## Patterns so far

1. **Nobody overwrites money.** Goldman (bitemporal rows), Nubank (immutable database), Uber (immutable money orders), Stripe (double-entry ledger).
2. **When the ORM did not fit, they built or bought a model.** Nobody fell back to raw JDBC for the ledger. Goldman wrote an ORM, Nubank bought the database company, Uber built a storage layer.
3. **Who owns the schema predicts the tool.** The app owns it: JPA (Cash App). A governed database or huge tables: SQL-first (Zalando, Adyen, Alibaba).
4. **Scale is solved below the ORM.** Cash App with Vitess, Adyen with partitioning.
5. **The choice is a spectrum.** JdbcTemplate, then MyBatis or jOOQ, then Spring Data JDBC, then JPA, then custom immutable models.

## Open tensions worth researching

- **Immutability vs right to erasure (GDPR).** How do append-only ledgers delete personal data? Datomic has excision. What do the others do?
- **The cost of immutability.** Storage growth, query complexity for "current balance", bitemporal query ergonomics.
- **Freshness.** Several sources are 7 to 13 years old (Zalando 2013, Cash App 2018, Wise 2016). Find newer statements or label the dates clearly.

## Gaps and next research

- **Traditional banks** (JPMorgan, Capital One, ING, BBVA, HSBC, Citi): little public detail on persistence. Decide whether to include a "what is public" row or scope the article to fintechs plus Goldman.
- **More fintechs to check (all unverified):** Monzo, Starling, Robinhood, PayPal, Klarna, Coinbase, Chime, N26.
- **Language dimension:** Java vs Kotlin vs Go vs Clojure, and whether language follows the data model (Nubank) or the reverse.
- For every Strong source: read it end to end and capture exact quotes with dates.
