## Decision 2: Where atomicity lives

<div class="finding">

**No company in the sample lets a money transaction span shards under two-phase commit.** They shrink the atomic unit until one database can hold it, or they give up atomicity and repair inconsistency afterwards. Ant Group is the one company that runs a distributed transaction protocol, and it built its own.

</div>

| Approach | Who | What it buys | What it costs |
|---|---|---|---|
| Every money transaction on one shard | Cash App | Full ACID inside MySQL | Payments had to be remodeled into per-customer "movements" before sharding |
| One database per service, no distributed transactions | Starling | Simple local transactions; failures handled by retrying | Every operation must be idempotent |
| Reserve, then confirm (TCC) | Ant Group | An atomic outcome across transaction, payment and accounting services | A protocol that every service must implement |
| No transactions; detect and repair | Monzo | Horizontal scale on Cassandra | A coherence service, locks and daily reconciliation |
| Relax to end-of-day consistency | Robinhood | Heavy locking removed from the ledger write path | Ledger and balances can disagree during the day |
| No cross-shard two-phase commit | PayPal | Simple failure modes in the sharding proxy | Applications must keep each transaction on one shard |
| State change and event in one commit (outbox) | PayPal (2026) | The event and the state cannot diverge | An outbox relay to run |

### Shrink the unit until it fits

Cash App shows the cost of the first option. Before its first shard split in November 2017, it split every payment into two "movements", one per customer, so each could live on its own customer's shard. The customer became the unit that never spans shards [@block-remodeling-payments-2018; @block-sharding-cash-2018]. The reason, in its words: "We will never compromise data consistency in exchange for availability" [@block-sharding-cash-2018]. PayPal's Hera proxy enforces the same limit from below, by rejecting cross-shard two-phase commit [@paypal-hera-talk-2019]. Nubank's version is the largest unit of all: each customer partition gets a complete clone of the infrastructure [@nubank-architecture-qcon-2017].

Starling applies the rule at service level. Each service owns its own database, there are no distributed transactions, and the rule is to "do everything at least once and at most once": retry until success, and make every operation idempotent [@starling-cloud-bank-slides-2018].

### Give up atomicity, then pay to repair

Monzo chose Cassandra and says it "traded off the ability to have transactional consistency" [@monzo-1500-microservices-2020]. The repair machinery is the price. Reads use quorum, writes go to index tables before the canonical table, and a separate coherence service detects and fixes inconsistencies [@monzo-thousands-microservices-2023]. Robinhood made the narrower trade on one path only. It relaxed consistency between ledger entries and balances to end of day, while noting that "if accounting ledgers are stale, downstream operations like trade reconciliation or settlement will be blocked" [@robinhood-clearing-accounting-2022].

### When a distributed transaction is unavoidable

Ant Group's escrow payments touch transaction, payment and accounting services, and it coordinates them with TCC. In the Try step, the accounting service moves the user's available funds into "pre-frozen funds". Confirm consumes the frozen funds and credits the recipient [@ant-group-seata-tcc-2019]. That source is a 2019 engineer's blog post, machine-translated, and graded Medium. Ant built the coordinator itself and has sold it externally since 2013 [@ant-group-dtx-benefits-2026].

### Make state and events agree

When a state change must also publish an event, PayPal's 2026 onboarding service commits both in one transaction (an outbox), and stores idempotency keys with their responses in the same database [@paypal-two-clouds-2026]. Revolut gets the same guarantee by using PostgreSQL as both database and event store (Decision 5).
