# Zalando

<!--
Light-touch reference case for SQL-first persistence. Zalando is e-commerce, not fintech.
Most persistence evidence is from 2012 to 2015 (older than 5 years): always state the year.
-->

**Category:** platform (e-commerce; SQL-first reference case, not fintech)
**HQ / founded:** Berlin (Henning Jacobs joined "on 1st of February 2010 in Berlin"; HQ and founding year not confirmed from a read source) (zalando-decade-2020)
**Scale signal:** 2013: "> 5 TB of PostgreSQL data", "> 90 database master instances", "> 200 developers, 8 DBAs" (zalando-postgresql-goto-2013). 2015: "15 million active customers", "80+ database master instances" (zalando-postgresql-pgconfru-2015). 2020: "a few hundred PostgreSQL clusters" on Kubernetes (zalando-postgres-k8s-fosdem-2020). No payment volume figures found.
**Last researched:** 2026-11-11

## Summary
From its 2010 rewrite until the 2015 move to microservices, Zalando's main Java stack reached PostgreSQL through a versioned layer of stored procedures, called from Java via its own open-source SProcWrapper library (zalando-sprocwrapper-talk-2012; zalando-postgresql-goto-2013). The reasons it gave were performance, validation close to the data, a clear transaction scope, schema independence and a cross-language API (zalando-postgresql-goto-2013; zalando-postgresql-pgconfru-2015). The rule was never absolute: the 2013 slides show a separate "CRUD/JPA" stack on the same databases, and the 2015 slides list the developer cost ("CRUD operations need too much code") (zalando-postgresql-goto-2013; zalando-postgresql-pgconfru-2015). After 2015 each microservice team owned its data and could pick its own persistence, and no public source says whether stored procedures stayed the default (zalando-data-integration-2015). PostgreSQL is still on ADOPT on the May 2026 Tech Radar, with MySQL, Oracle, MongoDB and Cassandra on HOLD (zalando-tech-radar-2026).

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Java (2010 to 2015 core); 2026 radar ADOPT: Java, Kotlin, Go, Python, Scala, TypeScript | Strong | zalando-postgresql-goto-2013; zalando-tech-radar-2026 |
| Main frameworks | 2013: Tomcat 7, CXF-WS, JDBC plus SProcWrapper; current framework not found | Strong (2013) | zalando-postgresql-goto-2013 |
| Primary OLTP store(s) | PostgreSQL (ADOPT 2026); DynamoDB also ADOPT; MySQL, Oracle, MongoDB, Cassandra on HOLD | Strong | zalando-tech-radar-2026 |
| Service-layer persistence | 2012 to 2015: SQL-first via versioned PostgreSQL stored procedures (SProcWrapper), JPA for plain CRUD apps; after 2015 chosen per team | Strong (dated) | zalando-postgresql-goto-2013; zalando-data-integration-2015 |
| Money / ledger model | No public source found | None | |
| Messaging / streaming | 2026 radar ADOPT: Kafka, Nakadi, AWS SQS, SNS, Kinesis; RabbitMQ TRIAL | Strong | zalando-tech-radar-2026 |
| Infrastructure | AWS and Kubernetes (EKS, Kubernetes on ADOPT 2026); PostgreSQL run on Kubernetes since about 2017 | Strong | zalando-tech-radar-2026; zalando-postgresql-kubernetes-2017 |
| Scaling approach | Application-side sharding of PostgreSQL through SProcWrapper shard keys (2013 to 2015) | Strong (dated) | zalando-postgresql-goto-2013; zalando-postgresql-pgconfru-2015 |
| Build vs buy (core) | Built: replaced ERP with home-grown order and payment services in 2012 | Medium | zalando-decade-2020 |
| Notable open source | java-sproc-wrapper, Patroni, Spilo, PGObserver, pg_view | Strong | zalando-sprocwrapper-repo-2025; zalando-postgresql-kubernetes-2017; zalando-postgresql-pgconfru-2015 |

## Languages and frameworks
- 2013 (older than 5 years): the main stack was "Java 7, Tomcat 7, Python 2.7, PostgreSQL 9.0–9.3", with three stacks on the same databases: Main/Production (Tomcat, CXF-WS, JDBC, SProcWrapper, API schema), CRUD/JPA (Tomcat, CXF-WS, JDBC, JPA) and Scripting/Python (CherryPy, psycopg2, SQLAlchemy) (zalando-postgresql-goto-2013).
- 2010: the Magento/PHP/MySQL shop was rewritten "in Java/Spring/Tomcat with PostgreSQL" (zalando-decade-2020, first-hand account by a Zalando engineer, 2020).
- From 2015 teams could choose their language: "we only allowed Java/Tomcat/PostgreSQL and Python for our data center workloads, teams could now write microservices in whatever language they preferred" (zalando-decade-2020).
- May 2026 Tech Radar, Languages quadrant: ADOPT for Go, GraphQL, Java, JavaScript, Kotlin, OpenAPI, Python, Scala, Swift, TypeScript; TRIAL for Dart; ASSESS for R; HOLD for Clojure, Haskell and Rust (zalando-tech-radar-2026).

## The money layer (ledger, balances, payments)
- No public source found on a Zalando ledger or money model.
- In 2012 Zalando "dumped our Enterprise ERP (Semiramis) and created home-grown services for order and payment processing", built on the same Java/PostgreSQL stack as other production services (zalando-decade-2020, Medium, 2020).

## Service-layer persistence and databases
- PGConf.EU 2012 abstract (older than 5 years): "At Zalando we store most of our critical data in PostgreSQL databases. To achieve both high performance and implement a secure API layer all database access is done through stored procedures, using plpgsql and sql functions." (zalando-sprocwrapper-talk-2012)
- Same abstract: before SProcWrapper, "we used a Spring based stored procedure implementation where a lot of extra classes and custom mappers were required" (zalando-sprocwrapper-talk-2012).
- SProcWrapper maps annotated Java interface methods 1:1 to stored procedures and handles object serialization. It also supports horizontal sharding with partition logic in the application, `pg_advisory_lock` through annotations, and per-procedure statement timeouts (zalando-sprocwrapper-repo-2025).
- API versioning (2013 and 2015 slides): stored procedures live in versioned API schemas (for example `z_api_v13_42`, `api_v14_23`) separate from the data schema, and the Java backend picks its version with `SET search_path` (zalando-postgresql-goto-2013; zalando-postgresql-pgconfru-2015). The 2015 slides list the results as "Tests are done to the whole API version", "No API migrations needed" and "Deployments are fully automated" (zalando-postgresql-pgconfru-2015).
- Counter-example inside Zalando: the 2013 slides list "CRUD ⇒ JPA" under stored procedure experience and show a separate CRUD/JPA stack, so the "all database access" rule of 2012 did not cover every application by 2013 (zalando-postgresql-goto-2013).
- The 2015 slides compare ORM with stored procedures directly (see Stated reasons). The listed ORM downsides are "error prone transaction management", "you have to reflect your tables in your code" and "schema changes are not easy" (zalando-postgresql-pgconfru-2015).
- Schema changes: developers write SQL scripts ("DBDIFFs") that "should be reviewed by DB guys", and DB engineers roll them out on the live system. The stored procedure layer "Helps to change data structure without application noticing it" (zalando-postgresql-pgconfru-2015).
- After 2015: "With each service owning its data, data is spread over a significantly larger number of cloud-based microservices — each of which can use individual persistence mechanisms and storage technologies." (zalando-data-integration-2015)
- 2017: "PostgreSQL remains the preferred relational database for most engineers around", and "teams have the choice of deploying PostgreSQL either with AWS RDS or Spilo" (zalando-postgresql-kubernetes-2017).
- 2026 Tech Radar, Datastores quadrant: ADOPT for PostgreSQL, AWS DynamoDB, AWS S3, Amazon ElastiCache, Redshift, Elasticsearch; HOLD for MySQL, Oracle DB, MongoDB, Apache Cassandra, Redis, Memcached, HBase, Hazelcast (zalando-tech-radar-2026).
- SProcWrapper is still maintained in a small way: the GitHub repo (zalando-stups/java-sproc-wrapper) is not archived and was last pushed in October 2025 (zalando-sprocwrapper-repo-2025). Whether new services still use it is unknown.

## Scale
- 2013: "> 90 deployment units (WARs)", "> 800 production Tomcat instances", "> 50 different databases", "> 90 database master instances", "> 5 TB of PostgreSQL data", "> 200 developers, 8 DBAs" (zalando-postgresql-goto-2013).
- 2015: "200+ deployment units (WARs)", "1300+ production tomcat instances", "80+ database master instances", "90+ different database schemas", "10 database engineers" (zalando-postgresql-pgconfru-2015).
- Sharding (2013 and 2015): customers sharded by ID, articles by SKU using an MD5 hash, queries run on all shards in parallel; advice to "Start with a reasonable number of shards (8)" and use virtual shard IDs for pre-sharding (zalando-postgresql-goto-2013; zalando-postgresql-pgconfru-2015).
- 2015 slides on trade-offs of sharding: data fits in memory and "OLTP is fast again", but "Joins only between entities aggregates" and "BI need more tooling" (zalando-postgresql-pgconfru-2015).
- 2020: "Operating a few hundred PostgreSQL clusters in a containerized environment" (zalando-postgres-k8s-fosdem-2020).

## Build vs buy
- Built its own PostgreSQL tooling and open-sourced it: SProcWrapper, PGObserver, pg_view (zalando-postgresql-pgconfru-2015), Patroni ("today Zalando's most popular open source GitHub project") and Spilo (zalando-postgresql-kubernetes-2017).
- Teams could use managed AWS RDS instead of the in-house Spilo setup by 2017 (zalando-postgresql-kubernetes-2017).
- Replaced a bought ERP with home-grown order and payment services in 2012 (zalando-decade-2020, Medium).

## Correctness (idempotency, reconciliation, audit)
- Stored procedures were credited with "Validation close to data" and "Simple transaction scope" (2013), and "clear transaction scope" and "more data consistency checks" (2015) (zalando-postgresql-goto-2013; zalando-postgresql-pgconfru-2015).
- Change data capture from PostgreSQL logical replication (Saiki Banyu) was chosen because it "allows for a non-intrusive and reliable Change Data Capture of PostgreSQL databases" (zalando-data-integration-2015).
- No public source found on idempotency or reconciliation practice.

## Changes over time (migrations and reasons)
- 2010: Magento/PHP/MySQL to Java/Spring/Tomcat/PostgreSQL. Reason: "Our Magento/PHP/MySQL stack reached its limits, both in terms of scaling as well as adaptability." (zalando-decade-2020, Medium)
- 2015: monolithic data-center services to microservices on AWS, with each service owning its data. Reason given: "to facilitate large-scale growth of our massive business while reinforcing the agility of a startup" (zalando-data-integration-2015).
- 2017 onward: PostgreSQL moved onto Kubernetes, citing "a stable API and declarative deployment descriptions" and "less lock in"; the old process still had "a ticketing system" between a team wanting a database and the database team creating it (zalando-postgresql-kubernetes-2017).
- Trade-off seen in hindsight (2020, first-hand): free choice of stack led to "similar (CRUD) REST services written in 6 different languages. This prevented us from providing the best library & platform support and hurts productivity at scale." (zalando-decade-2020, Medium)

## Stated reasons (verbatim quotes)
> "To achieve both high performance and implement a secure API layer all database access is done through stored procedures, using plpgsql and sql functions." (zalando-sprocwrapper-talk-2012, 2012)

> "Performance benefits", "Easy to change live behavior", "Validation close to data", "Simple transaction scope", "Makes moving to new software version easy", "Cross language API layer", "CRUD ⇒ JPA" (slide "Stored Procedures Experience") (zalando-postgresql-goto-2013, 2013)

> Stored procedures: "return/receive entity aggregates", "clear transaction scope", "more data consistency checks", "independent from underlying data schema" (zalando-postgresql-pgconfru-2015, 2015)

> Stored procedures for developers: "CRUD operations need too much code", "Developers have to learn SQL", "Developers can write bad SQL", "Code reviews are needed" (zalando-postgresql-pgconfru-2015, 2015)

> ORM: "is well known to developers", "CRUD operations are easy", "error prone transaction management", "you have to reflect your tables in your code", "schema changes are not easy" (zalando-postgresql-pgconfru-2015, 2015)

> "With each service owning its data, data is spread over a significantly larger number of cloud-based microservices — each of which can use individual persistence mechanisms and storage technologies." (zalando-data-integration-2015, 2015-09)

> "Despite the adoption of other technologies, PostgreSQL remains the preferred relational database for most engineers around." (zalando-postgresql-kubernetes-2017, 2017-06)

Note: the 2015 slide quotes come from text extracted from the PDF. Bullet glyphs did not survive extraction, so which items are listed as pros and which as cons is inferred from slide order (pros first, cons added on the next build of the same slide).

## Open questions
- Do Zalando microservices built after 2015 still use stored procedures or SProcWrapper, and is there any internal guidance? No public source found. The repo is still pushed to (2025), which suggests some use, but this is unverified.
- Which persistence libraries (JPA, Spring Data, jOOQ, plain JDBC) do current Java and Kotlin services use? No public source found.
- How does Zalando Payments record money (ledger model, store)? No public source found.
- Exact date of the PGConf.RU 2015 talk. The deck cites 2014 figures and sits under a 2015 URL path, so it is dated 2015 here; the exact day is unconfirmed.
- The GOTO 2013 slides were read through a third-party transcript mirror (sambuz.com), not the original SlideShare upload.

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| zalando-sprocwrapper-talk-2012 | Java Wrapper for PostgreSQL Stored Procedures (Jan Mussler, PGConf.EU 2012 session abstract) | PostgreSQL Europe | 2012-10 | https://postgresql.eu/events/pgconfeu2012/schedule/session/323-java-wrapper-for-postgresql-stored-procedures | talk | Strong | yes |
| zalando-postgresql-goto-2013 | Why Zalando trusts in PostgreSQL (Henning Jacobs and Valentine Gogichashvili, GOTO Berlin 2013, slide text via transcript mirror) | Zalando via sambuz.com mirror | 2013-10 | https://www.sambuz.com/doc/why-zalando-trusts-in-postgresql-ppt-presentation-1035155 | talk | Strong | yes |
| zalando-postgresql-pgconfru-2015 | Enabling development teams to move fast: PostgreSQL at Zalando (Valentine Gogichashvili and Oleksii Kliukin, PGConf.RU slides) | PGConf.RU | 2015 | https://pgconf.ru/rmedia/2015c/klyukin.pdf | talk | Strong | partial |
| zalando-data-integration-2015 | Data Integration in a World of Microservices | Zalando Engineering Blog | 2015-09 | https://engineering.zalando.com/posts/2015/09/data-integration-in-a-world-of-microservices.html | engineering-blog | Strong | yes |
| zalando-postgresql-kubernetes-2017 | PostgreSQL in a time of Kubernetes | Zalando Engineering Blog | 2017-06 | https://engineering.zalando.com/posts/2017/06/postgresql-in-a-time-of-kubernetes.html | engineering-blog | Strong | yes |
| zalando-postgres-k8s-fosdem-2020 | PostgreSQL on K8S at Zalando: Two years in production (Alexander Kukushkin, FOSDEM 2020 abstract) | FOSDEM | 2020-02 | https://archive.fosdem.org/2020/schedule/event/postgresql_postgresql_on_k8s_at_zalando_two_years_in_production/ | talk | Strong | partial |
| zalando-decade-2020 | One Decade in Zalando Tech (Henning Jacobs, Senior Principal at Zalando, personal blog) | srcco.de | 2020-03 | https://srcco.de/posts/one-decade-in-zalando-tech.html | engineering-blog | Medium | yes |
| zalando-sprocwrapper-repo-2025 | zalando-stups/java-sproc-wrapper (README and repo metadata, last push 2025-10) | GitHub (Zalando) | 2025-10 | https://github.com/zalando-stups/java-sproc-wrapper | repo | Strong | yes |
| zalando-tech-radar-2026 | Zalando Tech Radar (config.json dated 2026.05) | Zalando | 2026-05 | https://opensource.zalando.com/tech-radar/ | docs | Strong | yes |
