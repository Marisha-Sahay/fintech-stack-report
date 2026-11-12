## Decision 6: How to know the money is right

<div class="finding">

**No company trusts a single mechanism.** Every company that describes its approach combines three layers: invariants that stop bad writes, idempotency that makes retries safe, and reconciliation that measures the result.

</div>

| Layer | Mechanism | Who |
|---|---|---|
| Stop bad writes | Zero-sum check at commit; templates proven to net to zero; single-shard transactions | Uber, Adyen, Cash App |
| Make retries safe | Idempotency keys on the primary; deduplication tables; idempotent consumers | Airbnb, Wise, Starling, Shopify, Robinhood, Nubank, PayPal |
| Measure the result | Explainability rate; daily audits; continuous reconciliation from database logs | Stripe, Uber, Airbnb, Monzo, Coinbase |

### Idempotency details that matter

- **Keep keys on the primary database.** Airbnb's Orpheus library keeps idempotency tables "always read and written from a sharded master database (for consistency)", sharded by idempotency key [@airbnb-orpheus-2019]. For payments, Airbnb also disables replica reads, "trading off load on the main database for data integrity" (2015) [@airbnb-rails-payments-2015]. Replica lag is how a retry turns into a double charge.
- **Store the response with the key.** PayPal stores idempotency keys with their responses in the same database, and expires them with a TTL or a deletion policy [@paypal-two-clouds-2026].
- **Record progress, not just completion.** Shopify saves each payment request as a database row recording which step has completed, so a retry resumes instead of starting over [@shopify-graphql-idempotency-2019].
- **Make it a library.** Wise's open-source task engine guarantees that no task "is processed twice. We don't want to have missing payouts or double payouts", and its idempotence4j library records every action in the database [@wise-tw-tasks-executor-2025; @wise-idempotence4j-2026].

### Reconciliation as a metric

- Stripe measures the share of money movement it can explain, and reports over 99.9999% [@stripe-ledger-2024].
- Uber's audit framework checks more than 1 billion accounting transactions a day [@uber-audit-framework-2023].
- Airbnb compares every transaction "from day zero" across its own systems and its processors' settlement files [@airbnb-transactional-integrity-2018].
- Monzo reconciles its ledger daily against bank statements [@monzo-payments-safely-2022].
- Coinbase's Overseer reconciles by reading database write-ahead logs, which cut detection time from up to 24 hours to under a minute [@coinbase-overseer-reconciliation-2022].

The working definition this suggests: a money system is correct when its errors are detected quickly and explained, not when its code is assumed to be bug-free.
