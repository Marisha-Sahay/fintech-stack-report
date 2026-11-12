# Ant Group / Alibaba (Alipay)

<!--
Scope: Ant Group (Alipay, MYbank, OceanBase, SOFAStack) is the main subject. Alibaba Group material
(the Java Development Manual, the 11.11 order peak) is included where it shows the wider Alibaba
engineering culture Ant grew out of. Ant and Alibaba are separate companies: per the 2020 prospectus,
Alibaba owned 33% of Ant and the two keep separate databases (ant-group-prospectus-2020).
-->

**Category:** platform (payments and digital finance)
**HQ / founded:** Hangzhou, China. Alipay established 2004 (ant-group-prospectus-2020; ant-group-sofa-decade-2026)
**Scale signal:** Over 1 billion Alipay app annual active users and RMB118 trillion total payment volume in mainland China in the 12 months to June 30, 2020. Peak of 459,000 payment transactions per second on 11.11 in 2019 (ant-group-prospectus-2020)
**Last researched:** 2026-11-11

## Summary
Ant built its own stack end to end: a distributed SQL database (OceanBase, started in 2010) and a Java middleware suite (SOFAStack), and states that "Using SOFA and OB, Ant replaced its stack of IBM AIX servers, Oracle databases, and EMC storage" (ant-group-sofa-evolution-2026). Since the 2016 Double 11, 100% of Alipay's core database traffic, "including transactions, payments, membership, and the most critical accounting database", has run on OceanBase (ant-group-oceanbase-history-2025). Cross-service money consistency is handled in the service layer, not the database: Ant chose to "place the commit protocol in the service layer" with its XTS transaction service around January 2008, using TCC (Try, Confirm, Cancel) where the accounting service freezes funds in Try and deducts them in Confirm (ant-group-sofa-evolution-2026; ant-group-seata-tcc-2019). Scale comes from "unitization", which shards user requests by user ID at the network entry so each data center acts as a shard, deployed across "three regions and five data centers" (ant-group-unitization-2026; ant-group-fingrade-arch-2026). The Alibaba Java Development Manual sets SQL-first, MyBatis-style persistence rules, requires money to be stored as integers in the smallest currency unit, and bans stored procedures and foreign keys (ant-group-java-manual-2022).

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Java (services and middleware); C++ (OceanBase) | Strong | ant-group-sofaboot-repo-2018; ant-group-sofarpc-repo-2018; ant-group-oceanbase-repo-2026 |
| Main frameworks | SOFABoot (built on Spring Boot), SOFARPC | Strong (Medium for current use, job listing) | ant-group-sofaboot-repo-2018; ant-group-job-worldfirst-2026 |
| Primary OLTP store(s) | OceanBase (in-house distributed SQL, MySQL and Oracle compatible); replaced Oracle | Strong | ant-group-oceanbase-history-2025; ant-group-oceanbase-vldb-2022 |
| Service-layer persistence | SQL-first, iBATIS/MyBatis rules in Alibaba's Java manual; Ant-specific ORM choice not confirmed | Strong for Alibaba, unconfirmed for Ant | ant-group-java-manual-2022 |
| Money / ledger model | Accounting service with available and frozen funds, moved by TCC; money as integer minor units (Alibaba rule); double-entry: no public source found | Medium / Strong | ant-group-seata-tcc-2019; ant-group-java-manual-2022 |
| Messaging / streaming | No public source found (DTX docs say it integrates with "message queues") | Strong (for the integration only) | ant-group-dtx-overview-2026 |
| Infrastructure | Own data centers, active geo-redundancy over three regions and five data centers; Kubernetes cluster per unit; hybrid cloud | Strong | ant-group-fingrade-arch-2026; ant-group-unitization-2026 |
| Scaling approach | Unitization (shard requests by user ID per data center) plus OceanBase partitions replicated with Paxos | Strong | ant-group-unitization-2026; ant-group-oceanbase-vldb-2022 |
| Build vs buy (core) | Build: OceanBase, SOFAStack, XTS/DTX distributed transactions, Maxwell hot-spot account store | Strong | ant-group-sofa-evolution-2026; ant-group-maxwell-2021 |
| Notable open source | OceanBase (2021), SOFABoot and SOFARPC (2018), SOFAJRaft (2019), TCC mode contributed to Seata (2019) | Strong / Medium | ant-group-oceanbase-history-2025; ant-group-sofaboot-repo-2018; ant-group-sofajraft-repo-2019; ant-group-seata-readme-2025 |

## Languages and frameworks
- Ant's open-source middleware is Java: SOFABoot is "an open source Java development framework based on Spring Boot", which Ant built because Spring Boot lacked readiness checks, class isolation and shared log configuration (ant-group-sofaboot-repo-2018).
- SOFARPC is a Java RPC framework that "In Ant Financial ... has been used for more than ten years and developing for five generations" (ant-group-sofarpc-repo-2018).
- The first SOFA generation (from late 2006) used OSGi so engineers could build components that were assembled into services (ant-group-sofa-evolution-2026).
- A current Ant International backend listing asks for "experience in developing SpringBoot / SofaBoot microservices" (ant-group-job-worldfirst-2026, Medium).
- OceanBase is written mainly in C++ per the GitHub repository language stats (ant-group-oceanbase-repo-2026).
- SOFAJRaft is Ant's Java implementation of Raft, which states it "Passed Jepsen consistency verification test" (ant-group-sofajraft-repo-2019).

## The money layer (ledger, balances, payments)
- Accounting database: since the 2016 Double 11, OceanBase has carried 100% of Alipay's core database traffic, "including transactions, payments, membership, and the most critical accounting database" (ant-group-oceanbase-history-2025).
- Balance model in the Alipay escrow ("secured transaction") flow, described by an Ant engineer on the Seata blog (2019, machine-translated): the accounting service's Try step "deducts the user's available funds and transfers them to pre-frozen funds"; Commit "deducts the pre-frozen funds and increases the funds available in the intermediate account"; funds move from the intermediate account to the merchant "only after seven days" (ant-group-seata-tcc-2019). Ant's DTX product docs describe the same pattern: "deduct the user's funds, freeze them, and place them in an intermediary staging account" (ant-group-dtx-benefits-2026).
- The same post describes the three core services of transaction, payment and accounting, where the payment service "calls the billing service to record the account flow and bookkeeping" inside one TCC distributed transaction (ant-group-seata-tcc-2019).
- Hot-spot accounts: Ant built Maxwell, a dedicated "hot-spot accounting database", for accounts of "big sellers such as livestreamers and shops that participate in shopping festivals". Ant says the usual workarounds (account splitting, buffering, non-real-time accounts) cause side effects, and Maxwell reports "three orders of magnitude performance improvement" over the existing online solution. Maxwell grew "from thousands to hundreds of millions" of accounts (ant-group-maxwell-2021).
- Money representation (Alibaba Group rule): "任何货币金额，均以最小货币单位且为整型类型进行存储" (translation: any monetary amount must be stored as an integer in the smallest currency unit), marked mandatory. Decimal columns must be `decimal`, never float or double (ant-group-java-manual-2022).
- Double-entry, immutable or event-sourced ledger: No public source found. No Ant source read for this note describes the journal or posting model of the accounting system.

## Service-layer persistence and databases
- OceanBase is the primary OLTP store. It is a shared-nothing distributed relational database, started in May 2010, first used by Taobao Favorites in 2011, by Alipay in 2014 and by Zhejiang E-Commerce Bank (MYbank) in 2015 (ant-group-oceanbase-vldb-2022).
- Replication: transactions are replicated across 1, 3 or 5 zones using Paxos, with RPO = 0 and RTO under 30 seconds (ant-group-oceanbase-vldb-2022). Distributed commits use "a Paxos-based 2PC" that cuts Paxos synchronizations "from three to two" (ant-group-oceanbase-vldb-2022). OceanBase 4.0 uses PALF, "a Paxos-backed Append-only Log File System" (ant-group-palf-vldb-2024).
- Isolation: OceanBase supports read committed and snapshot isolation and "makes the former as the default isolation level" (ant-group-oceanbase-vldb-2022).
- Compatibility as a design goal: applications on classical RDBMS "should be able to run on OceanBase with or without only a few minor modifications", including stored procedures (ant-group-oceanbase-vldb-2022). Oracle-compatible mode arrived in V2.0 in 2018 (ant-group-oceanbase-history-2025).
- Service-layer access (Alibaba Group): the manual's "ORM" section is written for iBATIS/MyBatis. It defines ORM as "本文泛指 iBATIS，mybatis 等框架" (in this document, iBATIS, MyBatis and similar frameworks). Rules: never `SELECT *`; always declare a `resultMap` for every table, never `resultClass`; use `#{}` not `${}` to avoid SQL injection; do not return `HashMap` as a result type (ant-group-java-manual-2022; ant-group-java-guidelines-en-2022).
- Schema rules (Alibaba Group): "Stored procedures are not allowed. They are difficult to debug, extend and not portable." Foreign keys and cascades are banned because they "are suitable for single machine, low parallel systems, not for distributed, high parallel cluster systems." Sharding is recommended only above 5 million rows or 2 GB per table (ant-group-java-guidelines-en-2022; ant-group-java-manual-2022).
- Whether Ant (as distinct from Alibaba) mandates MyBatis or uses a different data access layer: not confirmed. Ant's DTX docs mention "data access proxies, RDS, MySQL, and OceanBase" as integrated data sources (ant-group-dtx-overview-2026).
- Separate databases from Alibaba: "data collected by us and Alibaba are stored in the respective databases of us and Alibaba" (ant-group-prospectus-2020). Alibaba's commerce side cited PolarDB, not OceanBase, for 11.11 2019 (ant-group-alicloud-1111-2019).

## Scale
- 11.11 2019: "the peak payment transactions per second was 459,000", and "OceanBase handled a peak of more than 60 million processes per second" (ant-group-prospectus-2020, 2020 filing).
- Ant's SOFAStack docs give a different 2019 number: the middleware "handled a peak of 544,000 transactions per second during Double 11 in 2019", versus "20,000 transactions per minute" in 2010 (ant-group-sofa-decade-2026). 544,000 per second is the figure Alibaba Cloud gave for Alibaba's peak order rate that day (ant-group-alicloud-1111-2019), so the two Ant sources may be counting different things. The prospectus figure is the filed one.
- DTX "supported 256,000 payment operations per second during the 2021 Double 11 shopping festival" (ant-group-dtx-benefits-2026).
- TPC-C: 707 million tpmC in 2020 on more than 1,500 servers in 3 zones (ant-group-oceanbase-vldb-2022). "Tens of thousands of OceanBase servers have been deployed in Alipay.com as well as many other commercial organizations" (ant-group-oceanbase-vldb-2022).
- Storage: an Alipay system migrated from Oracle to OceanBase compressed "from 100TB to 33TB" (ant-group-oceanbase-vldb-2022).

## Build vs buy
- Build, almost everywhere in the core. Ant replaced IBM AIX, Oracle and EMC with SOFA and OceanBase (ant-group-sofa-evolution-2026). Distributed transactions (XTS, sold externally as DTX since 2013) were built in-house (ant-group-seata-readme-2025; ant-group-sofa-evolution-2026). A specialized hot-spot accounting store (Maxwell) was built after "Having investigated existing solutions" (ant-group-maxwell-2021).
- Ant now sells what it built: SOFAStack and DTX on Alibaba Cloud, and OceanBase, which reached Bank of Nanjing in 2017 (ant-group-oceanbase-history-2025; ant-group-dtx-overview-2026).
- Open source: SOFABoot and SOFARPC repos created April 2018 (ant-group-sofaboot-repo-2018; ant-group-sofarpc-repo-2018); SOFAJRaft March 2019 (ant-group-sofajraft-repo-2019); OceanBase opened on June 1, 2021 under Mulan PubL 2.0 (ant-group-oceanbase-history-2025; ant-group-oceanbase-vldb-2022). Ant joined Alibaba's Fescar project, which was renamed Seata; Seata entered the Apache Incubator in October 2023 (ant-group-seata-readme-2025). The Seata TCC mode was "contributed by the ant gold service team" (machine translation of Ant Financial) (ant-group-seata-tcc-2019).

## Correctness (idempotency, reconciliation, audit)
- Consistency at the service layer: Ant puts the distributed commit protocol in services, not the database, via XTS (online around January 2008), which "still supports all business transactions for Ant Group today" (ant-group-sofa-evolution-2026). DTX "Ensures eventual data consistency in any abnormal scenario to safeguard funds" (ant-group-fingrade-arch-2026; ant-group-dtx-overview-2026).
- Replica checksums: after OceanBase's daily major compaction, "all copies will be compared with the checksum of the data when the merge is completed to ensure complete consistency", and index checksums are compared against the base table (ant-group-oceanbase-vldb-2022).
- Locking for money (Alibaba Group): "资金相关的金融敏感信息，使用悲观锁策略" (use pessimistic locking for fund-related financial data), because with optimistic locking the update is already done when the lock is obtained, so "校验逻辑容易出现漏洞" (validation logic is prone to gaps) (ant-group-java-manual-2022). The general rule allows optimistic locking with a version column when conflict probability is under 20% (ant-group-java-guidelines-en-2022).
- Reconciliation: Ant's DTX docs position distributed transactions as a replacement for after-the-fact reconciliation in multi-service flows: "The traditional reconciliation method for these scenarios is slow and costly to adapt to business changes" (ant-group-dtx-benefits-2026). No public source found describing Alipay's own reconciliation system.
- Idempotency: No public source found that I read. The Seata blog index lists a post on TCC "Idempotence, Dangling, and Empty Rollback" issues, not read for this note.
- Timeouts: OceanBase's lesson is that "every transaction and every SQL should have a timeout set because of the higher failure rate of distributed system networks and nodes" (ant-group-oceanbase-vldb-2022).

## Changes over time (migrations and reasons)
- 2004 to 2006: monolith on one application server and one database, serving Taobao (ant-group-sofa-evolution-2026).
- End of 2006: service-oriented architecture, SOFA ("Service Oriented Fabric Architecture"), first generation on OSGi (ant-group-sofa-evolution-2026).
- About January 2008: XTS distributed transaction service online. The Seata README says development started in 2007; since 2013 sold as DTX (ant-group-sofa-evolution-2026; ant-group-seata-readme-2025).
- 2010 to 2012: OceanBase begins as distributed NoSQL storage for Taobao Favorites, gains SQL in 2012 (ant-group-oceanbase-vldb-2022; ant-group-oceanbase-history-2025).
- 2014: OceanBase takes "a portion of the transaction database's traffic" at Double 11; MYbank runs all core transaction databases on it (ant-group-oceanbase-history-2025).
- 2016: OceanBase V1.0 with distributed transactions; 100% of Alipay core database traffic, including accounting, on OceanBase at Double 11 (ant-group-oceanbase-history-2025). Oracle, IBM AIX and EMC replaced (ant-group-sofa-evolution-2026).
- Later: cloud platform, elastic hybrid cloud, then cloud-native with a Kubernetes cluster per unit and a federated API server; etcd moving onto the OB KV engine for cross-region consistency (ant-group-sofa-evolution-2026; ant-group-unitization-2026).
- 2021 onward: OceanBase open source (June 2021); OceanBase 4.0 with PALF (ant-group-oceanbase-history-2025; ant-group-palf-vldb-2024).
- Reasons given: the cost and limits of centralized commercial databases at Internet concurrency, cross-region fault tolerance, and the toil of manual sharding (see quotes below).

## Stated reasons (verbatim quotes)
> "Classical centralized RDBMS are not capable of meeting the requirements of the scalability, cross-region fault tolerance, and cost-effectiveness of these businesses." (ant-group-oceanbase-vldb-2022, 2022)

> "Sharding and resharding can be extremely taxing on human resource and time" (ant-group-oceanbase-vldb-2022, 2022)

> "Owing to such large concurrent access, the cost of commercial database software and its highly reliable database server and shared storage has become unaffordable." (ant-group-oceanbase-vldb-2022, 2022)

> "The stored procedure still has great value for OLTP applications" (ant-group-oceanbase-vldb-2022, 2022, listed as a lesson from building OceanBase)

> "If this protocol is implemented at the database layer, it is very inefficient. This is because the database layer has no knowledge of business logic." ... "So, the team decided to place the commit protocol in the service layer." (ant-group-sofa-evolution-2026, page updated 2026-03)

> "Using SOFA and OB, Ant replaced its stack of IBM AIX servers, Oracle databases, and EMC storage." (ant-group-sofa-evolution-2026)

> "If the data layer does not use horizontal scaling or a distributed database, the data layer becomes a bottleneck that limits the scalability of the entire system." (ant-group-fingrade-arch-2026)

> "The core idea of unitization is to shard user requests at the network entry point, not just at the data layer." (ant-group-unitization-2026)

> "Non-real-time accounting may result in overdrafts and capital losses." (ant-group-maxwell-2021, 2021-12)

> "Stored procedures are not allowed. They are difficult to debug, extend and not portable." (ant-group-java-guidelines-en-2022, Alibaba Group)

> "任何货币金额，均以最小货币单位且为整型类型进行存储。" Translation: "Any monetary amount must be stored as an integer in the smallest currency unit." (ant-group-java-manual-2022, Alibaba Group, 2022)

> "资金相关的金融敏感信息，使用悲观锁策略。" Translation: "Use a pessimistic locking strategy for fund-related financial data." (ant-group-java-manual-2022, Alibaba Group, 2022)

## Open questions
- Ledger model: does Alipay's accounting database use double-entry postings, an append-only journal, or balance rows updated in place under TCC? No Ant primary source found. Unverified.
- Persistence layer at Ant specifically: does Ant follow the Alibaba manual's MyBatis rules, or use its own data access layer (the DTX docs mention "data access proxies")? Unverified.
- Tension worth reporting carefully: OceanBase's paper says stored procedures "still" have great value for OLTP, while Alibaba's Java manual bans them. These come from different companies and audiences (a database vendor courting legacy Oracle users versus an application coding standard), so they may not conflict in practice. Unverified how Ant's own applications use stored procedures.
- 2014 share of traffic: OceanBase's English blog (en.oceanbase.com/blog/18210830592) reportedly says OceanBase began with a 1% trial and then took about 10% of Alipay's transaction database load in 2014. Seen only in search snippets (page returned HTTP 429). Unverified.
- 2019 peak figures disagree across Ant sources (459,000 payment TPS in the prospectus vs 544,000 TPS in SOFAStack docs). Unverified which metric each uses.
- Reconciliation and fund-security tooling (a "TRaaS" platform with real-time fund reconciliation was reported in third-party summaries of a 2023 talk). Unverified, no primary source read.
- Messaging: which message broker Alipay's payment path uses. No public source found.
- Maxwell's implementation language (a third-party summary says C and assembly). Unverified.

## System architecture

Source notes: the SOFAStack white-paper pages on help.aliyun.com are English pages in Alibaba Cloud's help center, show no publication date ("Updated at" is blank) and do not say whether they are machine translated. The Seata TCC post is a machine translation of a Chinese original from 2019 (ant-group-seata-tcc-2019). The RZone, GZone and CZone definitions come from SOFAStack product documentation written for customers, not from a page describing Alipay's own deployment (ant-group-ldc-zones-2026).

### Money path
1. Network entry and routing. "At the network access layer, requests are sharded based on a dimension, such as user ID", and the access layer "routes it to a specific regional data center based on the user's ID" (ant-group-unitization-2026).
2. Unit-local processing. "Most processing then occurs within that data center." Calls that cross data centers, "such as a money transfer between users in different data centers", "require a stateful design" (ant-group-unitization-2026).
3. Transaction service. In the Alipay example, "the transaction service is accessed first to create the transaction order" (ant-group-seata-tcc-2019, 2019, machine-translated).
4. Payment service. The transaction service "calls the payment service to create the payment order for the transaction and performs the collection action" (ant-group-seata-tcc-2019).
5. Accounting (also called billing) service. "the payment service calls the billing service to record the account flow and bookkeeping"; its Try step freezes the buyer's funds and its Confirm step deducts the frozen funds and increases the seller's available funds (ant-group-seata-tcc-2019).
6. Storage. OceanBase "provides a distributed architecture for storage and stateful services, such as databases", while SOFAStack covers "the application layer and stateless services" (ant-group-fingrade-arch-2026). The accounting database has run on OceanBase since the 2016 Double 11 (ant-group-oceanbase-history-2025).
7. External networks (banks, card schemes, clearing houses). No public source found.

### Orchestration
- Ant coordinates multi-step payments with TCC in the service layer, not with a workflow engine: XTS went online around January 2008 and "still supports all business transactions for Ant Group today" (ant-group-sofa-evolution-2026).
- Nesting: the transaction service is the master, payment is a slave, and billing is "the nested slave service of the payment service", so all three succeed or fail together (ant-group-seata-tcc-2019).
- Asynchronous second phase: in the escrow ("secured transaction") case, the payment result is returned after phase one and the Commit is deferred to an off-peak period, where the framework will "slowly digest it and execute it asynchronously" (ant-group-seata-tcc-2019).
- Asynchronous guaranteed TCC: a reliable messaging service implements Try, Confirm and Cancel ("The Try interface pre-sends, and is only responsible for persistently storing the message data") and is used only for "passive businesses" such as sending email after registration (ant-group-seata-tcc-2019).
- Compensated TCC: services expose Do and Compensate for external parties such as airline booking, and "the Compensate operation needs to satisfy idempotency" (ant-group-seata-tcc-2019).
- DTX, the product version of XTS, "Ensures eventual data consistency in any abnormal scenario to safeguard funds" (ant-group-fingrade-arch-2026; ant-group-dtx-overview-2026).
- A saga engine or general workflow engine on the Alipay payment path: No public source found.

### Deployment topology
- Unitization, also called LDC: SOFAStack's developer docs refer to "the LDC unitized architecture" and set the unit through properties such as `com.alipay.ldc.zone` (ant-group-ldc-config-2026).
- Unit types (SOFAStack product docs): RZone is "Used for deploying critical business systems that are sharded by user dimension", where "Each unit is designed to be self-contained, has its own data, and can handle all business processes internally"; GZone holds non-shardable data and services and "Only one global GZone exists"; CZone serves read-heavy, non-shardable data per city and is "a snapshot of the GZone" (ant-group-ldc-zones-2026).
- Regions and data centers: Ant "designed and implemented an active geo-redundancy architecture that spans three regions and five data centers", with "a Recovery Point Objective (RPO) of 0, and a Recovery Time Objective (RTO) of less than 30 s" (ant-group-fingrade-arch-2026).
- Active-active: a "cable cutting" demo at the 2018 Apsara Conference showed "the architecture's cross-city active-active capabilities" (ant-group-fingrade-arch-2026).
- Kubernetes per unit: "we deploy a Kubernetes cluster in each unit" behind "a logically global Federated API Server deployment"; because etcd only covers "two data centers within the same city", Ant is moving etcd onto its OB KV engine (ant-group-unitization-2026).
- Own data centers and cloud: to absorb burst traffic, Ant "evolved its architecture into an elastic hybrid cloud" (ant-group-sofa-evolution-2026). The SOFAStack product supports "same-city active-active, two-region, three-data-center, active geo-redundancy, and hybrid cloud on heterogeneous infrastructure" (ant-group-sofa-advantages-2026).
- Disaster recovery drills: the TRaaS platform offers "end-to-end disaster recovery switchover capabilities" through "unified orchestration and regular drills" (ant-group-sofa-advantages-2026).

### Platform layer
- Service framework and RPC: SOFABoot (on Spring Boot) and SOFARPC (ant-group-sofaboot-repo-2018; ant-group-sofarpc-repo-2018).
- Service mesh: "SOFAStack Service Mesh = Traditional Microservices + Service Mesh", using a sidecar that "intercepts all incoming and outgoing network requests to enforce network policies" (ant-group-service-mesh-2026). The fifth-generation SOFAStack "Service Mesh architecture has been implemented at a massive scale within Ant Group and successfully handled the peak traffic of the Double 11 sales promotion" (ant-group-sofa-solution-2026). The data plane name (MOSN) appeared only in search results that were not read.
- Registry: SOFA Mesh integrates with "ZooKeeper, SOFA Registry, Nacos, Eureka, and Consul" (ant-group-sofa-advantages-2026).
- Deployment: the CAFE application platform supports VM and container releases, "Instance-level canary release" and "unit-based traffic shifting" (ant-group-sofa-advantages-2026). CAFE Deployment, a Kubernetes Deployment extension, supports "more graceful large-scale cluster releases, canary releases, and rollbacks" (ant-group-unitization-2026).
- Monorepo or repository layout: No public source found.

### Data platform
- Change data capture, event bus or warehouse feeding Alipay reporting: No public source found among pages read (third-party summaries of Ant's real-time warehouse appeared in search but were not read).
- Reconciliation tooling: TRaaS "establishes a bypass monitoring system for financial security to safeguard critical financial operations" and "provides consulting services for building and implementing reconciliation rules" based on Ant Group and MYbank experience (ant-group-sofa-advantages-2026). SOFAStack lists "fund security reconciliation" in its O&M phase (ant-group-sofa-solution-2026).
- The message broker on the payment path: No public source found.

### Published architecture diagrams
- https://help.aliyun.com/en/document_detail/2806106.html : "Diagram of an elastic architecture with unitization and cloud-native"; shows RZone units keyed by user ID ranges, CZone and GZone layers, a Federated ApiServer control plane over per-unit Kubernetes, and bare metal plus Alibaba Cloud infrastructure linked by a leased line. (ant-group-unitization-2026)
- https://help.aliyun.com/en/document_detail/2806105.html : uncaptioned figure of five data centers behind a carrier network and CDN, each with load balancing, a "service registry/message/transaction" layer, Trading and Accounting services and sharded databases. (ant-group-fingrade-arch-2026)
- https://help.aliyun.com/en/document_detail/416823.html : two regions and three data centers with RZones each writing a shard range (00~24 and so on) of OceanBase, GZones writing a shared OceanBase with intra-region and cross-region replicas, and CZones reading synchronized read-only copies. (ant-group-ldc-zones-2026)
- https://help.aliyun.com/en/document_detail/147610.html : "Service Mesh diagram" and "Sidecar pattern diagram". (ant-group-service-mesh-2026)
- https://seata.apache.org/blog/tcc-mode-applicable-scenario-analysis/ : diagrams of the general-purpose, asynchronous guaranteed and compensated TCC variants, using the Alipay transaction, payment and accounting services (machine-translated page). (ant-group-seata-tcc-2019)

### Stated architectural principles (verbatim)
> "The core idea of unitization is to shard user requests at the network entry point, not just at the data layer." (ant-group-unitization-2026)

> "This approach treats each data center as a massive, stateful database shard." (ant-group-unitization-2026)

> "Therefore, a truly distributed system must be distributed end-to-end to achieve unlimited scalability and high performance." (ant-group-fingrade-arch-2026)

> "These principles, which Ant applied to its development at every stage, include autonomy, cost, security, stability, massive scale, and agility." (ant-group-sofa-evolution-2026)

> "Using a Sidecar proxy, Service Mesh decouples service administration from business logic and moves it into a separate process." (ant-group-service-mesh-2026)

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| ant-group-oceanbase-vldb-2022 | OceanBase: A 707 Million tpmC Distributed Relational Database System (PVLDB 15(12)) | OceanBase (Ant Group), VLDB Endowment | 2022 | https://www.vldb.org/pvldb/vol15/p3385-xu.pdf | paper | Strong | partial |
| ant-group-palf-vldb-2024 | PALF: Replicated Write-Ahead Logging for Distributed Databases (PVLDB 17(12)) | OceanBase (Ant Group), VLDB Endowment | 2024 | https://www.vldb.org/pvldb/vol17/p3745-xu.pdf | paper | Strong | partial |
| ant-group-oceanbase-history-2025 | Development of OceanBase Database (official docs, V4.3.5) | OceanBase | 2025-01 | https://github.com/oceanbase/oceanbase-doc/blob/V4.3.5/en-US/700.reference/100.oceanbase-database-concepts/200.history-of-oceanbase.md | docs | Strong | yes |
| ant-group-oceanbase-repo-2026 | oceanbase/oceanbase GitHub repository README and language stats | OceanBase | 2026-11 (accessed) | https://github.com/oceanbase/oceanbase | repo | Strong | partial |
| ant-group-sofa-decade-2026 | A decade of Ant Middleware (SOFAStack docs) | Alibaba Cloud / Ant Group | 2026-03 (last updated; original date not shown) | https://help.aliyun.com/en/document_detail/2805932.html | docs | Strong | yes |
| ant-group-sofa-evolution-2026 | From monolithic to cloud platform to financial-grade hybrid cloud (SOFAStack docs) | Alibaba Cloud / Ant Group | 2026-03 (last updated; original date not shown) | https://help.aliyun.com/en/document_detail/2805953.html | docs | Strong | yes |
| ant-group-fingrade-arch-2026 | Building a financial-grade transaction system from distributed to cloud-native (SOFAStack docs) | Alibaba Cloud / Ant Group | 2026-03 (last updated; original date not shown) | https://help.aliyun.com/en/document_detail/2806105.html | docs | Strong | yes |
| ant-group-unitization-2026 | From unitization to elastic architecture: Handling explosive traffic spikes on the Internet (SOFAStack docs) | Alibaba Cloud / Ant Group | 2026-03 (last updated; original date not shown) | https://help.aliyun.com/en/document_detail/2806106.html | docs | Strong | yes |
| ant-group-dtx-overview-2026 | What are distributed transactions and their roles (SOFAStack DTX docs) | Alibaba Cloud / Ant Group | 2026-01 (last updated) | https://help.aliyun.com/en/document_detail/132903.html | docs | Strong | yes |
| ant-group-dtx-benefits-2026 | Benefits of distributed transaction (SOFAStack DTX docs) | Alibaba Cloud / Ant Group | 2026-01 (last updated) | https://help.aliyun.com/en/document_detail/132904.html | docs | Strong | yes |
| ant-group-seata-readme-2025 | Apache Seata (incubating) README, History section | Apache Seata (originated at Alibaba and Ant Financial) | 2025-12 (last updated) | https://github.com/apache/incubator-seata | repo | Medium | partial |
| ant-group-seata-tcc-2019 | Analysis of Applicable Models and Scenarios for TCC (English machine translation; older than 5 years) | Apache Seata blog, author zhangthen (Ant Financial team) | 2019-03 | https://seata.apache.org/blog/tcc-mode-applicable-scenario-analysis/ | engineering-blog | Medium | yes |
| ant-group-maxwell-2021 | Maxwell: a hardware and software highly integrated compute-storage system (arXiv 2112.11030) | Ant Group | 2021-12 | https://arxiv.org/abs/2112.11030 | paper | Strong | yes |
| ant-group-prospectus-2020 | Ant Group Co., Ltd. H Share IPO prospectus (HKEX, listing later suspended; older than 5 years) | Ant Group / HKEX | 2020-10 | https://www1.hkexnews.hk/listedco/listconews/sehk/2020/1026/2020102600165.pdf | filing | Strong | partial |
| ant-group-java-manual-2022 | Java开发手册 (黄山版) / Java Development Manual, Huangshan edition v1.7.1 (Chinese) | Alibaba Group (alibaba/p3c) | 2022-02 | https://github.com/alibaba/p3c | docs | Strong | partial |
| ant-group-java-guidelines-en-2022 | Alibaba Java Coding Guidelines (English translation of an earlier edition) | Alibaba Group | 2022-02 (last commit) | https://github.com/alibaba/Alibaba-Java-Coding-Guidelines | docs | Strong | partial |
| ant-group-sofaboot-repo-2018 | sofastack/sofa-boot README | Ant Group (SOFAStack) | 2018-04 (repo created; read 2026-11) | https://github.com/sofastack/sofa-boot | repo | Strong | yes |
| ant-group-sofarpc-repo-2018 | sofastack/sofa-rpc README | Ant Group (SOFAStack) | 2018-04 (repo created; read 2026-11) | https://github.com/sofastack/sofa-rpc | repo | Strong | yes |
| ant-group-sofajraft-repo-2019 | sofastack/sofa-jraft README | Ant Group (SOFAStack) | 2019-03 (repo created; read 2026-11) | https://github.com/sofastack/sofa-jraft | repo | Strong | partial |
| ant-group-alicloud-1111-2019 | Alibaba Cloud Powered $1B of GMV in 68 Seconds, with Zero Downtime During 11.11 (older than 5 years) | Alibaba Cloud | 2019-11 | https://www.alibabacloud.com/press-room/alibaba-cloud-powered-1b-of-gmv-in-68-seconds | press | Strong | yes |
| ant-group-job-worldfirst-2026 | Backend Software Engineer, Estepona (WorldFirst, Ant International) | WorldFirst / Ant Group | 2026-11 (accessed; posting date not shown) | https://jobs.jobvite.com/worldfirst/job/og4tAfw7 | job-listing | Medium | yes |
| ant-group-ldc-zones-2026 | Logical units (SOFAStack docs: RZone, GZone, CZone) | Alibaba Cloud / Ant Group | 2026-11 (accessed; no date shown) | https://help.aliyun.com/en/document_detail/416823.html | docs | Strong | yes |
| ant-group-ldc-config-2026 | How to Set Parameters Related to LDC Unitization (SOFAStack docs) | Alibaba Cloud / Ant Group | 2026-11 (accessed; no date shown) | https://help.aliyun.com/en/document_detail/159837.html | docs | Strong | partial |
| ant-group-sofa-solution-2026 | Financial-grade cloud-native full-stack solution (SOFAStack docs) | Alibaba Cloud / Ant Group | 2026-11 (accessed; no date shown) | https://help.aliyun.com/en/document_detail/313930.html | docs | Strong | yes |
| ant-group-sofa-advantages-2026 | Key technical advantages (SOFAStack docs: SOFA Mesh, CAFE, TRaaS, unit-based active geo-redundancy) | Alibaba Cloud / Ant Group | 2026-11 (accessed; no date shown) | https://help.aliyun.com/en/document_detail/313936.html | docs | Strong | yes |
| ant-group-service-mesh-2026 | What is Service Mesh (SOFAStack docs) | Alibaba Cloud / Ant Group | 2026-11 (accessed; no date shown) | https://help.aliyun.com/en/document_detail/147610.html | docs | Strong | yes |
