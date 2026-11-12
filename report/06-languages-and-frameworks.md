## Languages and frameworks

<div class="finding">

**The JVM is the most common runtime, but the language is rarely the decision that shapes the architecture.** More than half of the sample runs its core services on the JVM. Where a company explains its language, the language usually followed something else: the database, latency, or an existing codebase.

</div>

| Runtime | Companies (main service language) |
|---|---|
| **JVM** | Adyen, Revolut, Starling, PayPal, Goldman Sachs, Ant Group, ING, Airbnb payments (Java); Wise, Cash App, N26 (Java and Kotlin); Nubank (Clojure) |
| **Go** | Monzo; Uber (60% of compute); Robinhood's newer services |
| **Ruby** | Stripe, Shopify, Chime; Coinbase's original application |
| **Erlang** | Klarna's core system, with Java for newer services |

Sources: [@adyen-design-duty-architecture-2021; @revolut-qcon-architecture-2025; @starling-rampant-pragmatism-2020; @paypal-hera-talk-2019; @goldman-sachs-reladomo-repo-2016; @ant-group-java-guidelines-en-2022; @airbnb-transactional-integrity-2018; @wise-tech-stack-2025; @block-misk-repo-2026; @n26-tech-stack-2022; @nubank-f1-2021; @monzo-migrations-2800-services-2024; @uber-arm-2025; @robinhood-ceres-derivatives-2026; @stripe-sorbet-2022; @shopify-pods-2018; @chime-rails-foundation-2025; @coinbase-mongobetween-repo-nd; @klarna-kred-mnesia-postgres-2025].

Adyen is "almost exclusively" Java, and Monzo states that "All of our services are written in Go" across about 2,800 services [@adyen-design-duty-architecture-2021; @monzo-migrations-2800-services-2024]. Single-language estates like these make shared libraries and platform tooling cheaper, which matters more to the architecture than the language itself.

### When the language followed something else

- **The database chose the language.** Nubank picked Datomic first: "So because of Datomic, we chose Clojure as the main programming language" [@nubank-cavalcanti-podcast-2021].
- **Latency chose the language.** Robinhood began on Python and Django, then moved latency-sensitive trading and market data services to Go [@robinhood-sed-podcast-2020]. Its newest platform is Go on PostgreSQL [@robinhood-ceres-derivatives-2026].
- **The codebase kept the language.** Stripe kept Ruby and made it safer instead, building Sorbet, a type checker, for a Ruby codebase of more than 15 million lines [@stripe-sorbet-2022].
- **The language stayed and the database moved.** Klarna's core system, KRED, has run on Erlang since 2004. Klarna migrated its 15 TB database from Mnesia to Aurora PostgreSQL over about three years, with no downtime, without rewriting the Erlang [@klarna-kred-mnesia-postgres-2025].

### Frameworks are thin, and often in-house

Where companies describe their frameworks, they favor small, internal ones that encode platform decisions. Revolut runs "really vanilla Java services with our own internal DDD framework" [@revolut-qcon-architecture-2025]. Cash App builds on Misk, its own open-source Kotlin service framework [@block-misk-repo-2026]. Monzo's services share in-house Go libraries with Cassandra and etcd built in [@monzo-1500-microservices-2020]. Wise uses Spring Boot across more than 1,000 services, wrapped in an in-house chassis that sets defaults for security, observability, database access and Kafka [@wise-tech-stack-2025]. The pattern is the same in each case: the framework is where the platform team puts the decisions it does not want every service team to make again.
