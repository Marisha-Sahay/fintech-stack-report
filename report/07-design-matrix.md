## The design matrix

One row per company, condensed from the research notes. "Not public" means no source was found, not that the design is absent.

<div class="matrix">

| Company | Transactional store | Data access | Ledger model | Atomic unit | Scaling approach | Sources |
|---|---|---|---|---|---|---|
| **Stripe** | DocDB, its own service on MongoDB | Minimal function set behind Go proxies | Immutable double-entry event log | Not public | 2,000+ shards; online data movement | [@stripe-docdb-qcon-2025; @stripe-ledger-2024] |
| **Adyen** | PostgreSQL, single databases of 100 to 300 TB | SQL-first: MyBatis, PL/pgSQL | Double-entry; templates proven to net to zero | Not public | Partition large tables; accounting sharded round-robin | [@adyen-sql-comments-2023; @adyen-pgconf-100tb-2025; @adyen-design-duty-accounting-2021] |
| **PayPal** | Oracle (2017); DynamoDB and Spanner in new services | Hera proxy; repository interfaces | Not public | One shard; no cross-shard 2PC; outbox | Custom sharding since 2009 | [@paypal-hera-talk-2019; @paypal-oracle-sharding-2017; @paypal-two-clouds-2026] |
| **Block** (Cash App) | MySQL on Vitess | ORM: Hibernate | Immutable double-entry (Square Books, 2019) | One customer's shard | Vitess under the ORM | [@block-sharding-cash-2018; @block-remodeling-payments-2018; @block-books-ledger-2019] |
| **Monzo** | Cassandra | Own Go data library | Double-entry; balance is the sum of entries | None; coherence service repairs | More nodes; time-bucketed balance blocks | [@monzo-thousands-microservices-2023; @monzo-balance-read-time-2023] |
| **Revolut** | PostgreSQL, also the event store | SQL-first: jOOQ | Not public | State and event in one database | Not public | [@revolut-qcon-architecture-2025; @revolut-jooq-plugin-2026] |
| **Wise** | MariaDB, PostgreSQL | Shared in-house chassis | Several in-house ledgers | Idempotent tasks | Not public | [@wise-tech-stack-2025; @wise-tw-tasks-executor-2025] |
| **Starling** | PostgreSQL, one per service | SQL-first: SQL on Java interfaces | Immutable double-entry | One service's database; no distributed transactions | About 30 services | [@starling-rampant-pragmatism-2020; @starling-cloud-bank-slides-2018] |
| **N26** | PostgreSQL (from MySQL) | Not public | Not public | Not public | Not public | [@n26-tech-stack-2022] |
| **Nubank** | Datomic, one per service | Immutable database | Immutable double-entry | One customer partition | Infrastructure cloned per customer partition | [@nubank-architecture-qcon-2017; @nubank-f1-2021] |
| **Robinhood** | PostgreSQL | Not public | Ledger eventually consistent with balances by day end | Relaxed on the ledger path | Application-level shards | [@robinhood-brokerage-sharding-2021; @robinhood-clearing-accounting-2022] |
| **Coinbase** | MongoDB; PostgreSQL | Connection-pooling proxy | Not public | Not public | Not public | [@coinbase-mongobetween-repo-nd] |
| **Chime** | Not public | Not public | Own ledger (ChimeCore) | Not public | Not public | [@chime-10k-2026] |
| **Klarna** | Aurora PostgreSQL (from Mnesia) | Own access layer (kdb) | Not public | One module, one database | Batched reads and writes | [@klarna-kred-mnesia-postgres-2025; @klarna-modular-monolith-2025] |
| **Goldman Sachs** | Relational, vendor not stated | Own ORM: Reladomo | Bitemporal history | Not public | Same schema across 100+ databases (2004) | [@goldman-sachs-reladomo-infoq-2017; @goldman-sachs-reladomo-infoq-part2-2017] |
| **JPMorgan Chase** | Not public | Not public | Not public | Not public | Not public | |
| **Capital One** | Mainframe core (2017) | Not public | Not public | Not public | Reads offloaded to a read-only DynamoDB copy | [@capital-one-serverless-transactions-2017] |
| **ING** | Oracle; Cassandra | Not public | Not public | Not public | Group-wide Kafka event bus | [@ing-temenos-belgium-nd; @ing-kafka-summit-2018] |
| **BBVA** | DB2 on mainframe | Not public | Not public | Not public | Reads offloaded to Elasticsearch | [@bbva-elastic-nd] |
| **Uber** | LedgerStore on Docstore (MySQL-based) | Custom storage layer | Immutable double-entry money orders | One account, optimistic locking | Hot-account batching; hot and cold tiers | [@uber-zero-sum-2026; @uber-high-throughput-2026; @uber-ledgerstore-migration-2024] |
| **Airbnb** | MySQL | ActiveRecord (legacy) | Immutable payment events | Idempotency keys on the primary | Idempotency tables sharded by key | [@airbnb-orpheus-2019; @airbnb-payment-orchestration-2022] |
| **Shopify** | MySQL, Vitess | ORM: ActiveRecord | Not public | One shop's pod | Shard by shop | [@shopify-pods-2018; @shopify-shop-vitess-2024] |
| **Ant Group** | OceanBase | SQL-first: MyBatis rules | Reserve, then confirm | TCC across services | Distributed SQL; separate hot-account store | [@ant-group-oceanbase-history-2025; @ant-group-seata-tcc-2019; @ant-group-maxwell-2021] |
| **Zalando** (reference) | PostgreSQL | Stored procedures (2012 to 2015) | n/a | n/a | n/a | [@zalando-sprocwrapper-talk-2012] |

</div>

Three patterns are visible before any analysis. Every ledger that is described is built from entries. Where the atomic unit is described, it fits inside one database. And the banks fill most of the "Not public" cells, which is a finding in itself (see Limitations).
