## Decision 5: Service and event boundaries

<div class="finding">

**Service counts differ by more than 100x between companies doing similar work, and two companies moved back toward modular monoliths. The rule that holds everywhere is one database per service or module.**

</div>

| Company | Granularity | Data ownership | Source |
|---|---|---|---|
| Nubank | More than 4,000 microservices | Each microservice has its own database | [@nubank-cloud-limits-2025; @nubank-data-privacy-2024] |
| Monzo | About 2,800 Go services | One Cassandra keyspace per service | [@monzo-migrations-2800-services-2024; @monzo-thousands-microservices-2023] |
| Wise | More than 1,000 services | In-house chassis sets database access defaults | [@wise-tech-stack-2025] |
| Starling | "About 30-odd services" | Each service has its own database instance | [@starling-rampant-pragmatism-2020; @starling-cloud-bank-slides-2018] |
| Klarna (payments) | Microservices merged into a modular monolith | "One service, one database" | [@klarna-modular-monolith-2025] |
| Shopify | Modular monolith (2019) | Sharded by shop | [@shopify-modular-monolith-2019] |

### Why the counts diverge

The reasons given point in opposite directions. Klarna merged its per-payment-method microservices because shared steps were duplicated across them, creating "a distributed monolith". The result has "one service, one database, and a structured, clean codebase" and handles over a million orders a day [@klarna-modular-monolith-2025]. Shopify chose a modular monolith in 2019 to avoid the network, deployment and data-access costs of splitting its Rails application [@shopify-modular-monolith-2019]. Starling runs a core bank on about 30 services in a monorepo, released several times a day [@starling-rampant-pragmatism-2020]. At the other end, Monzo and Nubank put the platform work into shared libraries and tooling, so that a new service is cheap. Monzo, for example, builds Cassandra and etcd integration into its shared library [@monzo-1500-microservices-2020].

The count is a consequence of how cheap a new service is to create and operate, not a target. The invariant across every model is that a service or module owns its data and nothing else writes to it.

### Kafka, or the database you already run

Most of the sample moves events through Kafka. Nubank reports 72 billion events a day [@nubank-cloud-limits-2025]. PayPal runs more than 1,500 brokers and has peaked at 1.32 trillion messages a day [@paypal-kafka-2023]. Wise uses Kafka for "most of our real-time data movement" [@wise-tech-stack-2025].

Two neobanks chose PostgreSQL instead. Revolut uses it "as the database, as the event store and event stream". It explains why it skipped Kafka: "Because we know exactly how to deal with databases ... We know exactly how to monitor them, how to scale them" [@revolut-qcon-architecture-2025]. Starling chose PostgreSQL notifications over Kafka [@starling-rampant-pragmatism-2020]. The trade: one fewer system to operate, and state and events that commit together, in exchange for the fan-out and throughput a dedicated log provides.

Whichever transport is used, consumers must assume duplicates. Nubank requires every Kafka message to be idempotent [@nubank-architecture-qcon-2017]. Wise's task engine detects the same task being created twice, typically from a redelivered Kafka message [@wise-tw-tasks-executor-2025].
