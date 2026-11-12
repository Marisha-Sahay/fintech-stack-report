## Migrating a live money system

<div class="finding">

**The migrations in this sample were slow, layered and verified.** None was a cutover. Each one changed one thing at a time behind an abstraction, and compared the old and new paths until the numbers matched.

</div>

| Technique | Who | What it looked like |
|---|---|---|
| Put an abstraction in first | Klarna | Mnesia swapped for PostgreSQL behind its kdb layer, over about three years, with no downtime |
| Remodel the data before splitting it | Cash App | Payments split into per-customer movements before the first shard split |
| Dual-write, compare, then cut over | Stripe (2017) | Four steps: dual-write, move reads, move writes, remove the old path; reads compared with Scientist |
| Shadow, backfill, validate | Uber | Shadow validation at 99.99% or better; idempotent backfills; checksums matched across regions |
| Move data online in small units | Stripe | Online data movement across DocDB shards with versioned gating |

Sources: Klarna [@klarna-kred-mnesia-postgres-2025]; Cash App [@block-remodeling-payments-2018; @block-sharding-cash-2018]; Stripe [@stripe-online-migrations-2017; @stripe-docdb-qcon-2025]; Uber [@uber-ledgerstore-migration-2024; @uber-docstore-ledger-migration-2021].

### Prove equivalence, do not assume it

Klarna used property-based tests to check that the Mnesia and PostgreSQL backends of kdb behaved identically. It also added multi-read and multi-write operations, because one batched PostgreSQL select was much faster than many separate calls [@klarna-kred-mnesia-postgres-2025]. The abstraction had to grow a little to fit the new store.

Uber's ledger migrations show the scale such verification reaches. The 2021 phase backfilled more than 250 billion records (about 300 TB) at up to 1 million messages a second. It closed each sealing window only when checksums from two regions matched, and used Kafka offsets and sequence numbers for exactly-once processing [@uber-docstore-ledger-migration-2021]. The later move off DynamoDB targeted at least 99.99% completeness and correctness in shadow validation, checked offline against a DynamoDB dump, and required every backfill job to be idempotent [@uber-ledgerstore-migration-2024].

### Remodel first

Cash App could not shard payments as they were, because a payment touched two customers. Splitting each payment into two movements, one for the sender and one for the recipient, came first. Sharding came after [@block-remodeling-payments-2018]. The order matters: the data model decides what can be partitioned, so it has to change before the storage does.
