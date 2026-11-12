## The reference architecture

<div class="finding">

**Behind very different stacks, the companies in this sample converge on the same eight components.** They differ in which component holds the truth, which ones are synchronous, and where the hard boundaries sit. This section maps the components. Part II covers the decisions inside them.

</div>

<div class="diagram">
<svg viewBox="0 0 760 486" role="img" aria-labelledby="ra-title ra-desc" xmlns="http://www.w3.org/2000/svg">
<title id="ra-title">Reference architecture of a system that moves money</title>
<desc id="ra-desc">Requests flow from clients through an edge layer to payment orchestration. Orchestration writes to an append-only ledger and calls rail gateways that connect to external networks. The ledger feeds a derived balance store and an event backbone. The backbone feeds reconciliation and the data platform. Reconciliation also receives settlement files from external networks. A platform layer runs underneath everything.</desc>
<defs><marker id="ra-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-head"/></marker></defs>
<rect x="20" y="16" width="220" height="50" rx="8" class="dg-ext"/>
<text x="130" y="38" text-anchor="middle" class="dg-title">Clients and partner APIs</text>
<text x="130" y="55" text-anchor="middle" class="dg-sub">apps, merchants, card terminals</text>
<rect x="520" y="16" width="220" height="50" rx="8" class="dg-ext"/>
<text x="630" y="38" text-anchor="middle" class="dg-title">External networks</text>
<text x="630" y="55" text-anchor="middle" class="dg-sub">card schemes, bank rails, processors</text>
<rect x="20" y="100" width="220" height="56" rx="8" class="dg-box"/>
<text x="130" y="123" text-anchor="middle" class="dg-title">1. Edge and API</text>
<text x="130" y="141" text-anchor="middle" class="dg-sub">auth, rate limits, idempotency keys</text>
<rect x="20" y="190" width="220" height="56" rx="8" class="dg-box"/>
<text x="130" y="213" text-anchor="middle" class="dg-title">2. Payment orchestration</text>
<text x="130" y="231" text-anchor="middle" class="dg-sub">workflows, steps saved before running</text>
<rect x="290" y="190" width="200" height="56" rx="8" class="dg-box"/>
<text x="390" y="213" text-anchor="middle" class="dg-title">3. Rail gateways</text>
<text x="390" y="231" text-anchor="middle" class="dg-sub">one adapter per network</text>
<rect x="20" y="280" width="220" height="56" rx="8" class="dg-box dg-core"/>
<text x="130" y="303" text-anchor="middle" class="dg-title">4. Ledger (system of record)</text>
<text x="130" y="321" text-anchor="middle" class="dg-sub">append-only, double-entry</text>
<rect x="290" y="280" width="200" height="56" rx="8" class="dg-box"/>
<text x="390" y="303" text-anchor="middle" class="dg-title">5. Balance store</text>
<text x="390" y="321" text-anchor="middle" class="dg-sub">derived, read-optimized</text>
<rect x="20" y="372" width="470" height="44" rx="8" class="dg-box"/>
<text x="255" y="392" text-anchor="middle" class="dg-title">6. Event backbone</text>
<text x="255" y="408" text-anchor="middle" class="dg-sub">Kafka, Kinesis, or the database itself (outbox, event store)</text>
<rect x="520" y="280" width="220" height="56" rx="8" class="dg-box dg-core"/>
<text x="630" y="303" text-anchor="middle" class="dg-title">7. Reconciliation and audit</text>
<text x="630" y="321" text-anchor="middle" class="dg-sub">invariants, explainability, alerts</text>
<rect x="520" y="372" width="220" height="44" rx="8" class="dg-box"/>
<text x="630" y="392" text-anchor="middle" class="dg-title">8. Data platform</text>
<text x="630" y="408" text-anchor="middle" class="dg-sub">change data capture, warehouse</text>
<rect x="20" y="440" width="720" height="32" rx="8" class="dg-box"/>
<text x="380" y="461" text-anchor="middle" class="dg-sub">Platform: service chassis and shared libraries, RPC, Kubernetes, monorepo, one database per service</text>
<line x1="130" y1="66" x2="130" y2="98" class="dg-line" marker-end="url(#ra-arrow)"/>
<line x1="130" y1="156" x2="130" y2="188" class="dg-line" marker-end="url(#ra-arrow)"/>
<line x1="240" y1="218" x2="288" y2="218" class="dg-line" marker-end="url(#ra-arrow)"/>
<path d="M490,218 L630,218 L630,68" class="dg-line" marker-end="url(#ra-arrow)"/>
<line x1="130" y1="246" x2="130" y2="278" class="dg-line" marker-end="url(#ra-arrow)"/>
<line x1="240" y1="308" x2="288" y2="308" class="dg-line" marker-end="url(#ra-arrow)"/>
<line x1="130" y1="336" x2="130" y2="370" class="dg-line" marker-end="url(#ra-arrow)"/>
<path d="M490,394 L505,394 L505,320 L518,320" class="dg-line" marker-end="url(#ra-arrow)"/>
<line x1="490" y1="402" x2="518" y2="402" class="dg-line" marker-end="url(#ra-arrow)"/>
<path d="M700,66 L700,278" class="dg-line" marker-end="url(#ra-arrow)"/>
<text x="706" y="176" class="dg-label">settlement</text>
<text x="706" y="189" class="dg-label">files</text>
<text x="250" y="210" class="dg-label">calls</text>
<text x="138" y="268" class="dg-label">writes entries</text>
<text x="248" y="300" class="dg-label">derives</text>
</svg>
<p class="caption">Figure 1. The components shared across the sample. Bold outlines mark the two components that hold or verify the truth about money. Dashed boxes are outside the system.</p>
</div>

| Component | Job | Where it is documented |
|---|---|---|
| **1. Edge and API** | Authenticate, rate-limit, and attach an idempotency key to every request that can move money | Adyen stores API idempotency keys in CockroachDB [@adyen-design-duty-architecture-2021]; Airbnb's Billing Interface API fronts payments [@airbnb-payments-platform-2016] |
| **2. Payment orchestration** | Run multi-step flows, save each step before running it, and resume after failure | Uber runs in-session payment flows on its Cadence workflow engine [@uber-zero-sum-2026]; Starling stores each step before processing it [@starling-cloud-bank-java-2018]; Revolut has a dedicated "flow services" type [@revolut-qcon-architecture-2025] |
| **3. Rail gateways** | Translate internal payments into each external network's protocol | Monzo built its own Faster Payments gateway and runs it in its own data centres [@monzo-faster-payments-gateway-2020]; Airbnb has a Payments Gateway in front of processors [@airbnb-payments-platform-2016] |
| **4. Ledger** | Record every movement as immutable, balanced entries | Stripe's Ledger [@stripe-ledger-2024], Uber's LedgerStore [@uber-ledgerstore-indexes-2024], Square's Books [@block-books-ledger-2019] |
| **5. Balance store** | Serve current balances fast, derived from the ledger | Uber's User Account Store holds authoritative balances [@uber-high-throughput-2026]; Monzo precomputes balance blocks [@monzo-balance-read-time-2023]; Nubank syncs authorizer balances through Kafka [@nubank-architecture-qcon-2017] |
| **6. Event backbone** | Carry state changes to everything downstream | Kafka at Nubank, PayPal and Wise [@nubank-cloud-limits-2025; @paypal-kafka-2023; @wise-tech-stack-2025]; Kinesis at Chime [@chime-event-bus-2022]; PostgreSQL at Revolut [@revolut-qcon-architecture-2025] |
| **7. Reconciliation and audit** | Prove that internal records match each other and the outside world | Uber's audit framework [@uber-audit-framework-2023]; Airbnb's integrity pipeline [@airbnb-transactional-integrity-2018]; Coinbase's Overseer [@coinbase-overseer-reconciliation-2022] |
| **8. Data platform** | Copy online data out without loading the online databases | Shopify streams binlogs from 100+ MySQL shards with Debezium [@shopify-cdc-2021]; Stripe streams DocDB changes to Kafka and S3 [@stripe-docdb-2024]; Monzo runs reconciliation models in its warehouse [@monzo-payments-safely-2022] |

### Three things the model shows

**The ledger is the only component that owns money.** Balances, events and warehouse tables are all derived from it, and can be rebuilt. That is why the companies with the most mature systems put their strongest guarantees in the ledger and accept looser ones elsewhere. Robinhood, for example, lets balances lag the ledger until end of day [@robinhood-clearing-accounting-2022].

**The money path is short, and the rest is asynchronous.** Only the edge, orchestration, ledger and gateway sit on the request path. Uber states the split directly: synchronous, in-session flows run on Cadence, and Kafka carries the rest asynchronously [@uber-zero-sum-2026].

**Verification is a component, not a test suite.** Reconciliation has its own pipeline, data feeds and alerts at Uber, Airbnb, Stripe and Coinbase. It reads settlement files from outside the system, not only internal records [@airbnb-transactional-integrity-2018; @stripe-ledger-2024].
