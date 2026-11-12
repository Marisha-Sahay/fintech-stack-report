## Heuristics for architects

Each rule below is practiced by several companies in the sample. The parenthesis names where the evidence is.

### Architecture

1. **Make the ledger the only component that owns money.** Treat balances, events and warehouse tables as derived and rebuildable, and put the strongest guarantees in one place (Uber, Stripe).

2. **Keep the synchronous path short.** Edge, orchestration, ledger and gateway are on the request path. Everything else consumes events (Uber's split between Cadence and Kafka; Adyen's asynchronous processing behind a stateless edge).

3. **Keep the edge stateless and unable to write to core data.** An internet-facing component that cannot write to central databases limits what an attacker or a bug can reach (Adyen).

4. **Put network connectivity on a thin physical tier, and keep decisions in the core.** Scheme connections need owned hardware. Business logic does not (Monzo, Nubank, Starling, Wise).

5. **Use one partition key for data, traffic and deployment.** Route requests to cells by the same key that shards the database, and design an explicit global path for the few operations that cross cells (Ant Group, Nubank, Shopify).

6. **Pick regions for low failure correlation, and drill the failover.** Multi-zone is not multi-region, as one 2025 outage showed (Block).

7. **Take database failover off the critical path where you can.** Writes that stay in their own region and replicate continuously removed a 10 to 15 minute promotion step (Capital One).

8. **For the most critical customer functions, consider a standby built from different code on a different provider.** A replica shares the primary's bugs. An independent minimal platform does not (Monzo).

### Design

1. **Store entries, derive balances, and design the balance read path on day one.** Summing history gets slow, and fixing it later means reindexing a live ledger (Monzo, Decision 1).

2. **Put the zero-sum invariant where it is cheapest to enforce, and enforce it more than once.** At build time for known flows (Adyen), at commit for everything (Uber), and in reconciliation afterwards (Stripe).

3. **Size the atomic unit to fit one database.** Choose the partition key so that a money transaction never needs a second shard. If a business operation spans two owners, split it into two records (Cash App).

4. **Treat hot accounts as a separate design problem.** Per-account serialization caps throughput. Batching (Uber, 10x) or a dedicated store (Ant, three orders of magnitude) are the documented answers.

5. **Exhaust vertical scale, partitioning and read offloading before sharding.** Single PostgreSQL databases of 100 to 300 TB run in production (Adyen). Most read traffic can move to a copy (Capital One, BBVA).

6. **Keep data access behind one narrow layer.** It is what made database swaps (Klarna), store portability (PayPal) and safe scaling (Stripe) possible without rewriting services. An ORM is acceptable inside that layer, as long as sharding happens underneath it (Cash App, Shopify).

7. **Give every service or module exclusive ownership of its data, and choose the service count by operating cost.** Thirty services (Starling) and four thousand (Nubank) both work. A distributed monolith does not (Klarna).

8. **Prefer the system your team already operates for events, until throughput forces a log.** PostgreSQL as an event store (Revolut) and Kafka peaking above a trillion messages a day (PayPal) are both valid at their scale. Either way, make every consumer idempotent.

9. **Keep idempotency keys and money reads on the primary.** Store the response with the key, and record the steps completed so a retry can resume (Airbnb, PayPal, Shopify).

10. **Measure correctness as a number.** An explainability rate or a daily audit count turns "we think it is right" into something a team can track (Stripe, Uber).

11. **Migrate behind an abstraction, remodel before you split, and verify by comparison.** Klarna's kdb, Cash App's movements, and Stripe's and Uber's dual paths all followed this order.
