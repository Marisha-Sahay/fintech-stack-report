# Chime

**Category:** neobank
**HQ / founded:** San Francisco, California, 2012 (incorporated as 1debit, Inc.; renamed Chime Financial, Inc. in 2019) (chime-ipo-prospectus-2025)
**Scale signal:** 9.5 million Active Members as of Dec 31, 2025 (chime-10k-2026); $115.2 billion Purchase Volume in 2024 and a data streaming platform "handling over 60 billion events per month" (chime-ipo-prospectus-2025)
**Last researched:** 2026-11-11

## Summary
Chime is the clearest build-vs-buy reversal in this cluster: for most of its life a third-party processor, Galileo, processed its transactions and "provides a ledger for member accounts", and in 2024 to 2025 Chime replaced it with ChimeCore, its own payment processor and ledger (chime-ipo-prospectus-2025; chime-10k-2026). As of November 2025 ChimeCore processes all member transactions and "serves as the system of record for member accounts, keeping track of transaction, balance, and other data" (chime-10k-2026). Chime says the move cuts transaction processing costs "by an estimated 60%" and that it is "now 100% on our own technology stack" (chime-q4-earnings-2026). It still depends on partner banks (The Bancorp Bank and Stride Bank) to hold deposits, and on card networks and AWS (chime-ipo-prospectus-2025). The application layer is Ruby on Rails, used "from the very beginning" (chime-rails-foundation-2025); no public source describes the language or database inside ChimeCore.

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Ruby (Python and Go also present) | Medium | chime-rails-foundation-2025; chime-frameworks-job-2025 |
| Main frameworks | Ruby on Rails | Medium | chime-rails-foundation-2025; chime-frameworks-job-2025 |
| Primary OLTP store(s) | No public source found for the main relational store; DynamoDB used by at least one Rails service | Strong (DynamoDB use only) | chime-dynamodb-ruby-2022 |
| Service-layer persistence | No public source found | n/a | n/a |
| Money / ledger model | ChimeCore: in-house processor and ledger, system of record for member transactions and balances (since Nov 2025 for all members); deposits held at partner banks | Strong | chime-10k-2026; chime-ipo-prospectus-2025 |
| Messaging / streaming | Kinesis-based event bus with Protocol Buffers schemas; SNS/SQS; Kafka and Flink named in data job ads (not read) | Strong (Kinesis); Medium (SNS/SQS) | chime-event-bus-2022; chime-frameworks-job-2025 |
| Infrastructure | AWS; Kubernetes, Terraform, Helm, Docker | Strong (AWS); Medium (rest) | chime-ipo-prospectus-2025; chime-frameworks-job-2025 |
| Scaling approach | Cloud-native on AWS, scale capacity on demand; no public source found on database scaling | Strong | chime-ipo-prospectus-2025 |
| Build vs buy (core) | Bought (Galileo processor and ledger) until 2024; built ChimeCore, migration complete Q4 2025; banking by partner banks | Strong | chime-ipo-prospectus-2025; chime-10k-2026; chime-q4-earnings-2026 |
| Notable open source | Upstream fix to aws-sdk-ruby credential refresh (2022); no Chime-owned projects found | Strong | chime-dynamodb-ruby-2022 |

## Languages and frameworks
- Co-founder Ryan King: "Rails has been core to Chime's technology from the very beginning." (chime-rails-foundation-2025, 2025)
- His stated reason: "When we were building Chime, we chose Ruby on Rails because it allowed us to iterate quickly and create a seamless experience for our members." (chime-rails-foundation-2025, 2025)
- The Rails Foundation post says Chime's engineering team "includes hundreds of Ruby developers who rely on Rails to manage transactions, improve security, and drive innovation" (chime-rails-foundation-2025, 2025).
- A platform team listing (removed Nov 2025) asks for "Strong Ruby/Rails experience; Python or Go is an added bonus." and covers "Ruby versioning, Jemalloc/YJIT, Rails generators" and "Shared Rails libraries for logging, tracing, security, and other cross-cutting features" (chime-frameworks-job-2025, 2025).
- A 2022 engineering post traces latency spikes in "a Ruby on Rails service calling DynamoDB" to the AWS SDK for Ruby creating one client per class, process and thread (chime-dynamodb-ruby-2022, 2022).
- ChimeCore's implementation language: no public source found.

## The money layer (ledger, balances, payments)
- Before ChimeCore, the third-party processor "processes transactions and provides a ledger for member accounts", priced at "a fixed amount per transaction coupled with a large-volume discount factor" (chime-ipo-prospectus-2025, 2025).
- ChimeCore is "our proprietary payment processor and ledger, launched in 2024" (chime-ipo-prospectus-2025, 2025).
- It does not hold money: "ChimeCore's role in transaction processing does not involve receiving or transmitting funds; rather, as transaction processor, ChimeCore's role is to facilitate the necessary messaging between parties involved in a transaction (e.g., members, bank partners, external banks involved in a transaction, and card networks)" (chime-ipo-prospectus-2025, 2025).
- As of Nov 2025: "ChimeCore processes all of the payments, transfers, deposits, withdrawals, and other financial transactions that are conducted through our platform" and "ChimeCore also serves as the system of record for member accounts, keeping track of transaction, balance, and other data." (chime-10k-2026, 2026)
- Deposits sit at partner banks: "Banking services are provided by The Bancorp Bank, N.A. or Stride Bank, N.A.; Members FDIC." (chime-ipo-prospectus-2025, 2025)
- The first product built entirely on ChimeCore was Chime Card, launched in Q3 2025 (chime-q4-earnings-2026, 2026).
- Ledger data model (double-entry, append-only, event-sourced): no public source found.

## Service-layer persistence and databases
- DynamoDB is used from Rails services; Chime fixed a per-thread client bug by creating a singleton client at boot and contributed a change to the aws-sdk-ruby gem so credential refresh runs in a background thread (chime-dynamodb-ruby-2022, 2022).
- The 2022 event-bus post says "Data originates from within the product code, usually from databases and event logs" and mentions change data capture from databases, without naming the relational engine (chime-event-bus-2022, 2022).
- Redis is governed by a platform team: "Redis governance, patterns, and operational improvements" (chime-frameworks-job-2025, 2025).
- Primary relational database, ORM use (ActiveRecord or otherwise), and the database behind ChimeCore: no public source found.

## Scale
- 9.5 million Active Members (Dec 31, 2025) (chime-10k-2026, 2026); 8.6 million (Mar 31, 2025) (chime-ipo-prospectus-2025, 2025).
- Data streaming platform "handling over 60 billion events per month" (chime-ipo-prospectus-2025, 2025).
- Event bus design: a multi-tenant, randomly partitioned Kinesis stream (the Global Event Stream), persisted by Firehose to S3 and Snowflake, with a fan-out service delivering subscribed events to consumer streams; events are Protocol Buffers (chime-event-bus-2022, 2022).
- Reliability claim: "we are able to deliver 99.95% average uptime" (chime-ipo-prospectus-2025, 2025).
- Cost work on AWS: replacing managed NAT Gateways with self-managed NAT instances cut the AWS bill "by seven figures" per the post title (chime-nat-aws-2022, 2022).

## Build vs buy
- Most of the stack is partnered: card issuing and deposits at The Bancorp Bank and Stride Bank; cash deposits processed by Interactive Communications International; ATM access via Allpoint, MoneyPass and Visa Plus Alliance; hosting on Amazon Web Services (chime-ipo-prospectus-2025, 2025). Outbound instant transfers are processed by TabaPay (chime-10k-2026, 2026).
- The processor and ledger were moved in house. Timeline: ChimeCore launched 2024; "As of the end of 2024, we had transitioned all credit card transactions to being processed by ChimeCore, while all debit card transactions were still processed by Galileo." (chime-ipo-prospectus-2025, 2025)
- Exit cost: a February 2025 amendment with Galileo removed minimum monthly payments and provides "for the payment of an $18 million termination fee by us in March 2026" (chime-ipo-prospectus-2025, 2025).
- Completion: "In Q4, we completed our multi-year migration to ChimeCore, and are now 100% on our own technology stack." (chime-q4-earnings-2026, 2026)
- Stated reasons: lower processing cost, less vendor dependence, faster product changes. "We expect ChimeCore to significantly lower certain processing costs and reduce our reliance on third parties." (chime-ipo-prospectus-2025, 2025)
- Claimed result: "reducing transaction processing costs by an estimated 60%" (chime-q4-earnings-2026, 2026); product configuration changes that "may have previously taken 12 weeks" now take "as little as three days or less" (chime-ipo-prospectus-2025, 2025).
- Counter-point in the filings: the transition is listed as a risk, "Any problems or delays with the transition to ChimeCore may adversely affect our business" (chime-ipo-prospectus-2025, 2025).

## Correctness (idempotency, reconciliation, audit)
- "We conduct daily reconciliations of ChimeCore against transaction information provided by third-party partners that we work with to ensure the completeness and accuracy of transaction processing." (chime-ipo-prospectus-2025, 2025)
- Bank partners read from ChimeCore to do their own reconciliations, "including matching of transactions and formal account reconciliations at the omnibus account level" (chime-ipo-prospectus-2025, 2025).
- Idempotency and audit design inside ChimeCore: no public source found.

## Changes over time (migrations and reasons)
- 2012 onward: Rails application; Galileo as processor and ledger of record (chime-rails-foundation-2025; chime-ipo-prospectus-2025).
- 2022: self-serve streaming platform (Event Bus Pro) built so data engineers stop being a bottleneck for each new event consumer (chime-event-bus-2022, 2022).
- 2024: ChimeCore launched; all credit card transactions moved by end of 2024 (chime-ipo-prospectus-2025, 2025).
- 2025: debit and remaining accounts migrated; all transactions on ChimeCore as of November 2025; migration declared complete in Q4 2025 (chime-10k-2026; chime-q4-earnings-2026).

## Stated reasons (verbatim quotes)
> "When we were building Chime, we chose Ruby on Rails because it allowed us to iterate quickly and create a seamless experience for our members." Ryan King, co-founder (chime-rails-foundation-2025, 2025-07)

> "We expect ChimeCore to significantly lower certain processing costs and reduce our reliance on third parties." (chime-ipo-prospectus-2025, 2025-06)

> "By building our technology platform in-house, we can reduce spend on maintenance and expensive legacy vendors." (chime-ipo-prospectus-2025, 2025-06)

> "With ChimeCore, we have the flexibility to build products directly on our platform, which enables us to avoid development cycles integrating with third party vendors, which often have preconfigured product templates." (chime-ipo-prospectus-2025, 2025-06)

> "In Q4, we completed our multi-year migration to ChimeCore, and are now 100% on our own technology stack." (chime-q4-earnings-2026, 2026-02)

## Open questions
- What is ChimeCore built with (language, database, ledger model)? No public source found. A FinTech Futures podcast with Ryan King on building ChimeCore (2026) exists but the page returned HTTP 403 and was not read.
- The 60% cost reduction is Chime's own estimate; no independent check exists.
- Is Rails still the main application layer for new services, or is Go growing? Only job listings hint at Go; unverified.
- Third-party summaries (Sacra) describe ChimeCore internals; not company material and not used.

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| chime-ipo-prospectus-2025 | Chime Financial, Inc. IPO prospectus, Form 424B4 (Business, Risk Factors, MD&A) | Chime / SEC EDGAR | 2025-06-11 | https://www.sec.gov/Archives/edgar/data/1795586/000162828025030855/chimefinancialinc-finalpro.htm | filing | Strong | partial |
| chime-10k-2026 | Chime Financial, Inc. Form 10-K for fiscal year 2025 | Chime / SEC EDGAR | 2026-03-06 | https://www.sec.gov/Archives/edgar/data/1795586/000179558626000013/chym-20251231.htm | filing | Strong | partial |
| chime-q4-earnings-2026 | Chime Reports Fourth Quarter and Full Year 2025 Financial Results (Form 8-K, Exhibit 99.1) | Chime / SEC EDGAR | 2026-02-25 | https://www.sec.gov/Archives/edgar/data/1795586/000179558626000004/ex991q425.htm | filing | Strong | partial |
| chime-rails-foundation-2025 | Chime joins the Rails Foundation as a Contributing Member (quotes Chime co-founder Ryan King) | Rails Foundation | 2025-07-15 | https://rubyonrails.org/2025/7/15/chime-joins-foundation-contributing-member | third-party | Medium | yes |
| chime-event-bus-2022 | Bridging the Data Gap (Part I of Building a Streaming Platform at Chime; read via the publication's RSS feed) | Life at Chime (Medium) | 2022-11-15 | https://medium.com/life-at-chime/bridging-the-data-gap-4c3ee2568a76 | engineering-blog | Strong | yes |
| chime-dynamodb-ruby-2022 | Increasing application performance and deep-diving into open-source code (read via RSS feed) | Life at Chime (Medium) | 2022-10-27 | https://medium.com/life-at-chime/increasing-application-performance-and-deep-diving-into-open-source-code-d1f0b1336bf0 | engineering-blog | Strong | partial |
| chime-nat-aws-2022 | How we reduced our AWS bill by seven figures (read via RSS feed) | Life at Chime (Medium) | 2022-12-14 | https://medium.com/life-at-chime/how-we-reduced-our-aws-bill-by-seven-figures-5144206399cb | engineering-blog | Strong | partial |
| chime-frameworks-job-2025 | Senior Software Engineer, Application and Language Frameworks (listing removed 2025-11-05) | Chime via Built In | 2025 | https://builtin.com/job/senior-software-engineer-application-and-language-frameworks/7150764 | job-listing | Medium | yes |
