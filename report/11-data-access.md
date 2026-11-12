## Decision 4: The data access layer

<div class="finding">

**The ORM versus SQL debate has four answers in this sample, not two. The layer's most valuable property is narrowness.** The companies that changed databases or shards without rewriting their services all had one thing in common: data access went through a single, deliberately narrow layer.

</div>

| Pattern | Who | What it buys | What it costs |
|---|---|---|---|
| ORM | Cash App (Hibernate), Shopify (ActiveRecord) | Productivity on schemas the service owns | Sharding keys must be patched through it; generated SQL is harder to bound |
| SQL-first | Adyen (MyBatis, PL/pgSQL), Revolut (jOOQ), Starling (SQL on Java interfaces), Alibaba (MyBatis rules) | Exact SQL on very large tables; schema-checked queries | More code per CRUD operation |
| Custom data layer or proxy | Stripe, Monzo, Uber, PayPal, Klarna | A narrow, controlled set of operations; the store can change underneath | A platform team to build and run it |
| Immutable database | Nubank (Datomic) | History and audit are built in | One store's limits apply everywhere |

Sources: [@block-remodeling-payments-2018; @shopify-shop-vitess-2024; @adyen-sql-comments-2023; @revolut-jooq-plugin-2026; @starling-rampant-pragmatism-2020; @ant-group-java-guidelines-en-2022; @stripe-docdb-qcon-2025; @monzo-1500-microservices-2020; @paypal-hera-talk-2019; @klarna-kred-mnesia-postgres-2025; @nubank-architecture-qcon-2017].

### Narrow layers make the database replaceable

Klarna moved its 15 TB core from Mnesia to PostgreSQL over about three years, with no downtime, because business logic had not called Mnesia directly for years. All access went through kdb, an in-house layer that kept its API and gained a PostgreSQL backend [@klarna-kred-mnesia-postgres-2025]. PayPal's 2026 onboarding service goes further: business code sees only repository interfaces, and the backing store, DynamoDB or Spanner, is chosen at build time [@paypal-two-clouds-2026].

Stripe makes narrowness a reliability feature. DocDB exposes a minimal set of database functions behind Go proxies: "By exposing only a minimal battle-tested set of functions to our engineers, we ensure that these unintended performance and reliability issues don't materialize" [@stripe-docdb-qcon-2025]. Proxies also absorb load the application cannot control. Coinbase wrote a connection pooler because its "high scale Rails app" caused MongoDB connection storms [@coinbase-mongobetween-repo-nd], and Shopify routes MySQL traffic through ProxySQL [@shopify-shop-vitess-2024].

### ORMs survive scale when the scaling happens underneath

Cash App kept Hibernate and sharded MySQL with Vitess under it [@block-remodeling-payments-2018; @block-sharding-cash-2018]. Shopify kept ActiveRecord through pods and Vitess, at the cost of patches it hoped Rails composite keys would remove [@shopify-shop-vitess-2024; @shopify-composite-pk-2020]. Mixing styles is normal: 2026 Block job listings name Hibernate for Cash App Banking, jOOQ for the Ledgering team, and iBatis for Cash App Taxes [@block-job-cash-banking-2026; @block-job-ledgering-2026; @block-job-cash-taxes-2026].

### The sources disagree about stored procedures

Zalando routed all Java database access through versioned PostgreSQL stored procedures from 2012, "to achieve both high performance and implement a secure API layer" [@zalando-sprocwrapper-talk-2012]. By 2015 its own slides listed the cost, "CRUD operations need too much code", and teams later chose their own persistence [@zalando-postgresql-pgconfru-2015; @zalando-data-integration-2015]. Alibaba's coding manual bans stored procedures as "difficult to debug, extend and not portable" [@ant-group-java-guidelines-en-2022]. The OceanBase team concluded the opposite: "the stored procedure still has great value for OLTP applications" [@ant-group-oceanbase-vldb-2022]. That is a database team writing about its own product. Adyen uses PL/pgSQL in production today [@adyen-sql-comments-2023].
