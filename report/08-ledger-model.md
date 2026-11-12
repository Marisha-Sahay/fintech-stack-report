## Decision 1: How to record money

<div class="finding">

**Every company that describes its ledger stores money as entries and derives the balance from them. None stores a balance it overwrites.** Once that is settled, the real design work is in three places: where the zero-sum invariant is enforced, how a derived balance stays cheap to read, and what happens to accounts that are too hot to serialize.

</div>

| Approach | Who | What it buys | What it costs |
|---|---|---|---|
| Immutable double-entry event log | Stripe | Every movement can be explained; Stripe reports over 99.9999% explainability | Corrections need revert-and-reprocess, not an UPDATE |
| Records that must net to zero before commit | Uber, Starling, Adyen | An unbalanced state cannot be written | More rows per payment (about 50 at Adyen) |
| Immutable database | Nubank | Audit history comes from the store itself | Poor fit for "fire hose writes", yet it became the default everywhere |
| Bitemporal rows | Goldman Sachs | Any past report can be reproduced after a correction | Two time axes in every query |
| Reserve, then confirm | Ant Group | Funds are held before a multi-service transaction commits | Every service implements try, confirm and cancel |

Sources: Stripe [@stripe-ledger-2024]; Uber [@uber-zero-sum-2026]; Starling [@starling-rampant-pragmatism-2020]; Adyen [@adyen-design-duty-accounting-2021]; Nubank [@nubank-f1-2021; @nubank-architecture-qcon-2017]; Goldman Sachs [@goldman-sachs-reladomo-infoq-part2-2017]; Ant Group [@ant-group-seata-tcc-2019].

### Where the invariant runs

The zero-sum check can run at three points, and each moves cost somewhere different. Uber checks at write time: a money order whose debits and credits do not sum to zero is rejected before commit, and a correction is a new money order [@uber-zero-sum-2026]. Adyen checks before deployment: journals can only be produced by templates, and every change to a template is verified automatically by proving that all combinations of inputs net to zero [@adyen-design-duty-accounting-2021]. That costs nothing at runtime, but every new money flow needs a template. Stripe checks after the fact, by measuring how much money movement it can explain [@stripe-ledger-2024]. Mature systems combine these. Decision 6 covers the after-the-fact layer.

### The read path is the cost nobody plans for

A derived balance gets slower as history grows. Monzo's ledger had no time component in its Cassandra partitions, so they "kept getting larger". By early 2023, P99 balance reads took 400 to 500 ms. Monzo reindexed entries into time-bucketed tables and precomputed sums of consecutive entries ("blocks"), which brought reads to about 200 ms [@monzo-balance-read-time-2023]. A year earlier it had fixed a different read problem: each team computed balances with its own time axis, which "brought inconsistency between our data warehouse and our backend", so it replaced them with named balance definitions [@monzo-balances-2022].

Robinhood hit the write side of the same problem. Its clearing ledger was a set of PostgreSQL tables updated by Kafka consumers in "a gigantic transaction with heavy locking". The redesign relaxed atomicity: ledger entries "only need to be eventually consistent with account balances at the end of the day" [@robinhood-clearing-accounting-2022].

### Hot accounts break per-account serialization

Serializing writes per account is the natural way to keep a balance correct, and it fails on hot accounts. At Uber some accounts needed more than 30 operations per second while the system handled 3 to 4. A batching service with 250 ms windows applies each batch as "an atomic update with optimistic locking", and Uber reports 10x throughput for hot entities [@uber-high-throughput-2026; @uber-zero-sum-2026]. Ant Group went further and built Maxwell, a separate "hot-spot accounting database" for large sellers during shopping festivals. Ant says the usual workarounds (splitting accounts, buffering, non-real-time accounts) all have side effects, and reports "three orders of magnitude performance improvement" [@ant-group-maxwell-2021].

### Corrections and deletion

Immutability changes how mistakes are fixed. Stripe: "we can't run simple queries to mutate the state; instead, we have to revert and reprocess prior operations" [@stripe-ledger-2024]. One cost no company here addresses publicly is erasing personal data from an immutable store under GDPR or Brazil's LGPD. Datomic supports a deletion feature called excision, but this research found no source on how any company in the sample uses it.
