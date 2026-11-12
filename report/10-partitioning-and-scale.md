## Decision 3: Partitioning and scaling the store

<div class="finding">

**Partition by whoever owns the money, and exhaust vertical scale, partitioning and read offloading before you shard.** The companies that sharded early paid with remodeling. The ones that avoided distributed databases did so to protect their data access code.

</div>

### Choosing the partition key

| Partition key | Who | What it buys | What it costs |
|---|---|---|---|
| Customer | Cash App, Nubank | A customer's money stays in one shard | Payments between customers need two records, one per shard |
| Shop | Shopify | Each shop is isolated in a "pod" | The sharding key must flow through every query, which needed ORM patches |
| Round-robin | Adyen (accounting) | Any shard can take any write; easy to add shards | Queries for one merchant fan out across all shards |

Shopify's pods and its later move to Vitess both shard by shop. The Vitess move required "patches to ActiveRecord" to pass the sharding key through queries, which the team "wanted to avoid" [@shopify-pods-2018; @shopify-shop-vitess-2024]. Adyen chose the opposite of locality on purpose. When it sharded its accounting database, it routed writes round-robin, not by merchant: "we decided the benefits domain knowledge routing would offer were not worth the loss of flexibility and increased complexity" [@adyen-design-duty-accounting-2021].

### How to shard

- **In the application.** Robinhood sharded its brokerage system from 1 to 10 shards at the application level. It had considered Spanner, DynamoDB, CitusDB and CockroachDB, and rejected them because they "would probably require a more invasive rewrite of our core business logic, and data access layers" [@robinhood-brokerage-sharding-2021].
- **In a proxy.** Cash App and Shopify's Shop app use Vitess under their ORMs [@block-sharding-cash-2018; @shopify-shop-vitess-2024]. PayPal built Hera, its own sharding and connection proxy, and has used custom sharding since 2009 [@paypal-hera-talk-2019; @paypal-oracle-sharding-2017].
- **In a database service.** Stripe built DocDB, a database service on MongoDB, which serves more than 5 million queries a second across more than 2,000 shards [@stripe-docdb-qcon-2025].
- **In a distributed database.** Ant Group built OceanBase, which has carried all of Alipay's core database traffic since 2016 [@ant-group-oceanbase-history-2025].

### Before sharding

Vertical scale goes further than most teams assume. Stripe scaled single shards vertically to tens of terabytes before building online data movement to scale out [@stripe-docdb-qcon-2025]. Adyen runs single PostgreSQL databases of 100 to 300 TB, and partitions any table that might exceed 100 GB [@adyen-pgconf-100tb-2025; @adyen-partitioning-2023].

Moving reads elsewhere buys the most time:
- Adyen split a reporting database off its accounting database before sharding accounting [@adyen-design-duty-accounting-2021].
- Capital One fed a read-only DynamoDB store from its mainframe core (2017), because "close to 80% of the traffic was related to reading transactions" [@capital-one-serverless-transactions-2017].
- BBVA put Elasticsearch in front of DB2, so that "as soon as the customer logged in, the system was already querying Elastic, not DB2" [@bbva-elastic-nd]. That source is a vendor case study.
- Uber kept only 12 weeks of hot data in DynamoDB and moved older ledger data to blob storage [@uber-ledgerstore-migration-2024].

Sharding is not the end state either. Nubank shards by customer, and says the scheme "worked well for a time but eventually hit physical limits" [@nubank-10-years-2025].
