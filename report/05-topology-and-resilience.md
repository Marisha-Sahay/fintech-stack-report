## Topology and resilience

<div class="finding">

**Cloud-first companies still keep the connection to the payment networks on hardware they own, and the most resilient designs isolate whole stacks, not just databases.** Recovery targets are almost never published. The best evidence of resilience in this sample comes from one real regional outage.

</div>

### The network edge stays physical

Card schemes and bank rails connect through hardware security modules and scheme devices, so even cloud-native banks run a small physical tier:

- Monzo runs "a few data centers to integrate with some of the payment schemes", and keeps them minimal on purpose [@monzo-thousands-microservices-2023].
- Starling runs "multiple data centers across UK, and multiple MIP devices and multiple HSMs for redundancy", connected to AWS [@starling-card-processor-2022].
- Wise integrates with physical data centres in the UK, Hungary and Australia, and was an early user of AWS Outposts there [@wise-tech-stack-2025].
- Nubank's card authorizer (2017) runs on physical servers alongside the Mastercard devices, in several live data centers, so that authorization needs no cloud round trip [@nubank-architecture-qcon-2017].

Adyen goes furthest: all its main systems run in its own data centers on several continents, with no public cloud for payment processing [@adyen-infrastructure-2026].

### Cells: partition the whole stack

| Design | Unit of isolation | What crosses units | Source |
|---|---|---|---|
| Ant Group "unitization" | A data center serving a range of user IDs, routed at the network entry | Calls that cross data centers are kept to a minimum | [@ant-group-unitization-2026] |
| Nubank shards (2017) | A full copy of the infrastructure per customer partition | A global section of unsharded services, such as transfers between customers | [@nubank-architecture-qcon-2017] |
| Shopify pods (2018) | A set of shops on fully isolated datastores | Nothing: "we don't allow any actions to reach across pods" | [@shopify-pods-2018] |

The common idea is that the partition key chosen for the database (Decision 3) is also used to route traffic and deploy infrastructure. Ant states it directly: the approach "treats each data center as a massive, stateful database shard" [@ant-group-unitization-2026]. The cost is a separate path for anything that spans units. Nubank needs a global section, and Shopify forbids cross-pod actions outright.

### Active-active, active-passive, and an independent standby

| Pattern | Who | Notes |
|---|---|---|
| Active-active across regions or sites | Ant Group, Adyen, Square, Capital One (virtual cards), Nubank (authorization) | Ant states RPO 0 and RTO under 30 seconds across three regions and five data centers |
| Active in one region, replicated to another | Shopify (per pod) | A whole pod fails over to its second region |
| Independent standby platform | Monzo (Stand-in) | Separately written services on a different cloud, holding minimal state. Not the system of record |

Sources: [@ant-group-fingrade-arch-2026; @adyen-infrastructure-2026; @block-resilience-2025; @capital-one-dynamodb-resiliency-2021; @nubank-architecture-qcon-2017; @shopify-flash-sale-talk-2022; @monzo-stand-in-2025].

The database is usually what makes active-active hard. In 2021 Capital One found application failover across regions "nearly instantaneous" except for PostgreSQL, where promoting a cross-region replica took ten to fifteen minutes. Moving that service to DynamoDB global tables removed database failover entirely [@capital-one-dynamodb-resiliency-2021]. Monzo's Stand-in solves a different problem. Because its services are written separately and run on another cloud, it can cover failures that a replica of the same code on the same provider would share.

### What a real outage showed

During the October 2025 AWS us-east-1 outage, Cash App kept running from us-west-2, a region Block had chosen "for its stability and low failure correlation". Square's European sellers, whose transactions were "primarily routed through us-east-1", saw up to 30% of transactions fail at peak [@block-resilience-2025]. Block's stated stance: "we design our systems with the assumption that outages like this will happen" [@block-resilience-2025]. The two outcomes, from one company in one incident, show the gap between multi-zone and multi-region designs more clearly than any target could.

### Targets are rarely published

Ant Group is the only company in the sample that states RPO and RTO [@ant-group-fingrade-arch-2026]. Stripe states a 99.9995% reliability target for its service mesh proxy and API availability above 99.999% [@stripe-mesh-proxy-2026; @stripe-ledger-2024]. Revolut assigns every component one of four availability tiers [@revolut-devops-qcon-2025]. For Uber, Airbnb, Wise, Adyen and Block, the research notes record no published recovery targets.
