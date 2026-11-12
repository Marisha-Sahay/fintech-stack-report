## Key findings

This report reviews the architecture and design of the systems that move money at 24 fintechs, banks and platforms, using only what they have published themselves. It is written for principal engineers and architects. Part I covers system architecture. Part II covers the design decisions inside it: the options companies took, what each bought, and what it cost.

### Architecture

1. **Very different stacks converge on eight components, and only one of them owns money.** Edge, orchestration, rail gateways, ledger, balance store, event backbone, reconciliation and data platform appear across the sample. Balances, events and warehouse tables are all derived from the ledger. Uber names exactly two sources of truth: "the money order store and the entity balance store" [@uber-zero-sum-2026; @stripe-ledger-2024].

2. **The network edge stays physical.** Cloud-first banks still run their own data centers for card scheme and bank rail connections: Monzo, Starling, Wise and Nubank. Nubank authorizes cards without any cloud round trip [@monzo-thousands-microservices-2023; @starling-card-processor-2022; @wise-tech-stack-2025; @nubank-architecture-qcon-2017].

3. **The strongest isolation partitions whole stacks, not databases.** Ant Group routes users to units at the network entry, across three regions and five data centers, with a stated RPO of 0. Nubank clones its entire infrastructure per customer partition. Shopify forbids any action that crosses pods [@ant-group-fingrade-arch-2026; @nubank-architecture-qcon-2017; @shopify-pods-2018].

4. **Regional failure is designed for, and tested by reality.** In the October 2025 us-east-1 outage, Cash App kept running from us-west-2, while Square's European sellers saw up to 30% of transactions fail. Capital One removed database failover entirely, and Monzo keeps a separately written standby bank on a second cloud [@block-resilience-2025; @capital-one-dynamodb-resiliency-2021; @monzo-stand-in-2025].

### Design decisions

5. **Money is stored as entries, never as an overwritten balance.** The open questions are where the zero-sum invariant runs, how to keep balance reads fast, and how to handle hot accounts. Uber batches writes to hot accounts for a 10x gain, and Ant built a separate store for them [@stripe-ledger-2024; @monzo-balance-read-time-2023; @uber-high-throughput-2026; @ant-group-maxwell-2021].

6. **Atomicity is kept local.** No company lets a money transaction span shards under two-phase commit. Cash App keeps each one on a single customer's shard, Starling inside one service's database, and Monzo gives up transactions and repairs afterwards [@block-sharding-cash-2018; @starling-cloud-bank-slides-2018; @monzo-thousands-microservices-2023].

7. **A narrow data access layer is what makes the database replaceable.** Klarna swapped Mnesia for PostgreSQL under its own access layer with no downtime. Stripe exposes only "a minimal battle-tested set of functions". ORMs survive scale when sharding happens beneath them [@klarna-kred-mnesia-postgres-2025; @stripe-docdb-qcon-2025; @block-sharding-cash-2018].

8. **Service counts vary more than 100x, from about 30 at Starling to more than 4,000 at Nubank.** The rule that holds everywhere is one database per service or module [@starling-rampant-pragmatism-2020; @nubank-cloud-limits-2025; @klarna-modular-monolith-2025].

9. **Correctness is three layers, and the last one is a number.** Invariants stop bad writes, idempotency makes retries safe, and reconciliation measures the result. Stripe reports over 99.9999% explainability of money movement [@adyen-design-duty-accounting-2021; @airbnb-orpheus-2019; @stripe-ledger-2024].
