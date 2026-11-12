# Goldman Sachs

**Category:** bank
**HQ / founded:** New York (No public source read in this pass)
**Scale signal:** Reladomo "used in multiple ledgers, middle office trade processing, balance sheet processing" (goldman-sachs-reladomo-infoq-2017). No current user, volume or transaction count read.
**Last researched:** 2026-11-11

## Summary

Goldman's best-documented choice is in the persistence layer: in 2004 it built its own Java ORM, Reladomo (code still carries the older name Mithra, as in MithraManager), because "our core requirements were not met by existing solutions", and open-sourced it in 2016 (goldman-sachs-reladomo-infoq-2017; goldman-sachs-reladomo-repo-2016). Reladomo's defining feature is bitemporal data (business date plus processing date), which Goldman ties directly to ledger requirements such as reproducing past reports after corrections (goldman-sachs-reladomo-infoq-part2-2017). Goldman also open-sourced its Legend data modeling platform through FINOS in 2020 (goldman-sachs-legend-finos-2020). On infrastructure, the public record is thin and mostly vendor-hosted: an AWS story quotes a Goldman MD on "re-platforming our core data architecture onto AWS" (goldman-sachs-aws-story-2022), and Goldman bought rather than built in two newer businesses: Finacle for Marcus lending in 2016 and Volante for Transaction Banking payments (goldman-sachs-marcus-finacle-2016; goldman-sachs-volante-txb-nd). Goldman's own developer blog and history pages (developer.gs.com, goldmansachs.com) refused automated fetches, so SecDB and Transaction Banking architecture remain unread here.

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Java (Reladomo, Legend, Obevo); Python (gs-quant toolkit); Slang for SecDB is third-party only | Strong (Java, Python); Weak (Slang) | goldman-sachs-github-org-2026; goldman-sachs-legend-repo-2020; goldman-sachs-secdb-efinancialcareers-2017 |
| Main frameworks | Reladomo (in-house ORM), Legend (in-house data modeling platform, now FINOS) | Strong | goldman-sachs-reladomo-repo-2016; goldman-sachs-legend-repo-2020 |
| Primary OLTP store(s) | Relational; production vendor not stated. Reladomo supports Sybase ASE and IQ, DB2, Oracle, Postgres, MS-SQL | Strong (supported list only) | goldman-sachs-reladomo-repo-2016 |
| Service-layer persistence | Custom ORM (Reladomo, built from 2004) | Strong | goldman-sachs-reladomo-infoq-2017 |
| Money / ledger model | Bitemporal (processingDate plus businessDate) in Reladomo-based ledgers | Strong | goldman-sachs-reladomo-infoq-part2-2017 |
| Messaging / streaming | No public source read | None | |
| Infrastructure | Hybrid; core data architecture being re-platformed onto AWS; Transaction Banking described as cloud-native | Medium | goldman-sachs-aws-story-2022; goldman-sachs-volante-txb-nd |
| Scaling approach | Same schema across many databases; Reladomo "transparent multi-schema support (partition data across many databases)" | Strong | goldman-sachs-reladomo-infoq-2017; goldman-sachs-reladomo-repo-2016 |
| Build vs buy (core) | Build for trading and ledgers (Reladomo, Legend); buy for newer retail and payments (Finacle for Marcus lending, Volante for TxB) | Strong (build); Medium (buy) | goldman-sachs-reladomo-infoq-2017; goldman-sachs-marcus-finacle-2016; goldman-sachs-volante-txb-nd |
| Notable open source | Reladomo, Legend (FINOS), GS Collections (now Eclipse Collections), gs-quant, Obevo | Strong | goldman-sachs-github-org-2026 |

## Languages and frameworks

- Java is the language of everything Goldman has open-sourced on the persistence side: Reladomo, Obevo (database deployment) and the Legend engine (goldman-sachs-github-org-2026; goldman-sachs-legend-repo-2020). The Legend engine repo is overwhelmingly Java by GitHub's language count (goldman-sachs-legend-repo-2020).
- gs-quant, Goldman's "Python toolkit for quantitative finance", is its most-starred public repo (created 2018-12) (goldman-sachs-github-org-2026).
- Legend includes its own language, Legend-PURE, "an immutable functional language based on the Unified Modeling Language (UML)" (goldman-sachs-legend-repo-2020).
- SecDB and its Slang language: the only source read is a 2017 eFinancialCareers piece based on anonymous staff, which says Slang is still used to code SecDB and estimates 15 to 40 million lines (goldman-sachs-secdb-efinancialcareers-2017, Weak, 2017). Goldman's own SecDB pages returned HTTP 403 (goldman-sachs-secdb-history-nd; goldman-sachs-secdb-observability-2023, read = no).

## The money layer (ledger, balances, payments)

- Reladomo was built for ledgers. Part 2 of the InfoQ series uses "the textbook example of a securities ledger" and states: "Core requirements for a ledger include the ability to reproduce previous reports" and "Ability for users (or upstream data) to correct past events, without losing reproducibility." (goldman-sachs-reladomo-infoq-part2-2017, 2017).
- The model is bitemporal. Transaction time is called processingDate and validity time is called businessDate (goldman-sachs-reladomo-infoq-part2-2017). A back-dated change is applied as inserts plus updates that close out old rows, so earlier query results stay reproducible; the article shows one `incrementValue` call producing "two inserts and two updates" (goldman-sachs-reladomo-infoq-part2-2017).
- The repo lists three temporal modes: "Audit-only, Business time-series only, and Bi-temporal chaining", and says Reladomo can "Maintain complete and accurate audit history of changes efficiently" and answer "as-of questions" (goldman-sachs-reladomo-repo-2016).
- Payments: Transaction Banking runs on the Volante Payments Platform for Fedwire, ACH and SWIFT, per Volante's case study (goldman-sachs-volante-txb-nd, Medium, undated).

## Service-layer persistence and databases

- Reladomo is an in-house ORM with a "Strongly typed compile-time checked query language", "Full support for unit-testable code" and tunable caching (goldman-sachs-reladomo-repo-2016).
- Why not a string query language: "String based languages were a poor fit for our applications" (goldman-sachs-reladomo-infoq-2017). The InfoQ article does not name Hibernate or any other ORM; it refers only to "traditional ORMs" (goldman-sachs-reladomo-infoq-2017). The FAQ also names no other ORM (goldman-sachs-reladomo-faq-nd).
- Supported databases: "Sybase (ASE & IQ), DB2, Oracle, Postgres, MS-SQL, H2, Derby" (goldman-sachs-reladomo-repo-2016). Which of these Goldman runs in production is not stated in any source read.
- Schema change tooling: Obevo, open-sourced in 2017, is a "Database Deployment Tool for Enterprise Scale and Complexity" for systems "with hundreds (or thousands) of tables, views, stored procedures" (goldman-sachs-obevo-repo-2017).
- Data modeling: Legend's stated aims are "Consistent data vocabularies" and "Built-in mechanisms for data governance with formal constructs to define ownership, validations, and provenance" (goldman-sachs-legend-repo-2020).

## Scale

- The 2004 requirements: "There were over 100 databases with the same schema, but different data." and "The data model was reasonably complex - several hundred tables." (goldman-sachs-reladomo-infoq-2017, 2017).
- Reladomo partitions data "across many databases" via multi-schema support; the FAQ calls this the SourceAttribute feature (goldman-sachs-reladomo-repo-2016; goldman-sachs-reladomo-faq-nd).
- Caching: "It's a keyless, multi-index, transactional object cache." and "The query cache is smart - it will not return stale results." (goldman-sachs-reladomo-infoq-2017).
- No current transaction volumes or user counts were found in a source that could be read.

## Build vs buy

- Build: Reladomo (since 2004), Legend (developed for about seven years before 2020 per the FINOS release), and SecDB (third-party only) (goldman-sachs-reladomo-infoq-2017; goldman-sachs-legend-finos-2020).
- Buy, consumer lending: Marcus deployed Infosys Finacle core banking for its lending business in eight months, "fully cloud-based and hosted by Goldman Sachs", covering the loan-servicing lifecycle (goldman-sachs-marcus-finacle-2016, Medium, 2016).
- Buy, payments: Goldman's Transaction Banking business runs on the Volante Payments Platform (goldman-sachs-volante-txb-nd, Medium).
- Pattern: the trading and ledger stack is home-built; the newer retail and transaction-banking businesses bought core processing from vendors.

## Correctness (idempotency, reconciliation, audit)

- Audit and reproducibility are designed into the data model through bitemporal and audit-only tables (goldman-sachs-reladomo-repo-2016; goldman-sachs-reladomo-infoq-part2-2017).
- The FAQ covers optimistic locking ("deadlock/timeout/optimistic lock failure") and audit-only dated objects (goldman-sachs-reladomo-faq-nd).
- Testability was a design goal: "Real testability was high on the list of things to get right." (goldman-sachs-reladomo-infoq-2017).
- No public source read on idempotency or reconciliation in Goldman's payments systems.

## Changes over time (migrations and reasons)

- 2004: Reladomo development starts (goldman-sachs-reladomo-infoq-2017). 2016: open-sourced on GitHub under Apache 2.0 (goldman-sachs-reladomo-repo-2016). The repo was still active in 2026 (last push 2026-09).
- 2016: Marcus lending launched on Finacle (goldman-sachs-marcus-finacle-2016).
- 2020-10: Legend open-sourced through FINOS (goldman-sachs-legend-finos-2020).
- 2022: Goldman MD Andy Phillips says the firm has "been re-platforming our core data architecture onto AWS" (goldman-sachs-aws-story-2022).

## Stated reasons (verbatim quotes)

> "Quite simply, our core requirements were not met by existing solutions" (goldman-sachs-reladomo-infoq-2017, 2017-03)

> "String based languages were a poor fit for our applications" (goldman-sachs-reladomo-infoq-2017, 2017-03)

> "Real testability was high on the list of things to get right." (goldman-sachs-reladomo-infoq-2017, 2017-03)

> "Core requirements for a ledger include the ability to reproduce previous reports" (goldman-sachs-reladomo-infoq-part2-2017, 2017-06)

> "AWS allows us to achieve the kind of business velocity that we can't achieve on premises." (Andy Phillips, Goldman Sachs MD, in goldman-sachs-aws-story-2022, 2022-10)

> "Volante met our top criteria for an ideal collaborator: modern cloud-native technology" (Luc Teboul, Goldman Sachs Transaction Banking, in goldman-sachs-volante-txb-nd)

> "With the successful deployment of the Finacle Core Banking Solution we have the agility to respond to customer needs" (Boe Hartman, CTO Marcus by Goldman Sachs, in goldman-sachs-marcus-finacle-2016, 2016-11)

## Open questions

- Which database vendors back Reladomo in production today (Sybase, DB2, Oracle, Postgres)? Not stated in any source read.
- SecDB and Slang: architecture, storage model and any migration plans. Goldman's own pages (developer.gs.com, goldmansachs.com history) returned HTTP 403. Search snippets mention an October 2023 developer.gs.com post on SecDB observability. Unverified.
- Transaction Banking architecture: search snippets describe developer.gs.com posts on instant payments using Amazon MSK (Kafka), DynamoDB and Fargate, and on multi-region failover for RDS and Aurora (2022-03) (goldman-sachs-txb-instant-payments-nd; goldman-sachs-txb-multiregion-2022, both read = no). Not read (site refuses automated fetches). Unverified.
- Hibernate: the seed note asked whether Goldman names Hibernate as the ORM it rejected. Neither InfoQ part, the README nor the FAQ names it.
- Status of Marcus after Goldman scaled back consumer banking; not researched.

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| goldman-sachs-reladomo-infoq-2017 | Introducing Reladomo - Enterprise Open Source Java ORM, Batteries Included! (Mohammad Rezaei) | InfoQ | 2017-03 | https://www.infoq.com/articles/Reladomo-Open-Source-ORM | engineering-blog | Strong | partial |
| goldman-sachs-reladomo-infoq-part2-2017 | Introducing Reladomo - Enterprise Open Source Java ORM, Batteries Included! (Part 2) | InfoQ | 2017-06 | https://www.infoq.com/articles/Reladomo-Open-Source-ORM-Part2 | engineering-blog | Strong | partial |
| goldman-sachs-reladomo-repo-2016 | goldmansachs/reladomo repository and README | Goldman Sachs (GitHub) | 2016-09 | https://github.com/goldmansachs/reladomo | repo | Strong | yes |
| goldman-sachs-reladomo-faq-nd | Reladomo FAQ | Goldman Sachs (GitHub Pages) | n.d. | https://goldmansachs.github.io/reladomo/mithrafaq/ReladomoFaq.html | docs | Strong | partial |
| goldman-sachs-obevo-repo-2017 | goldmansachs/obevo repository and README | Goldman Sachs (GitHub) | 2017-04 | https://github.com/goldmansachs/obevo | repo | Strong | yes |
| goldman-sachs-github-org-2026 | goldmansachs GitHub organization repository list | Goldman Sachs (GitHub) | 2026-11 | https://github.com/goldmansachs | repo | Strong | yes |
| goldman-sachs-legend-repo-2020 | finos/legend repository and README (plus legend-engine language stats) | FINOS (GitHub) | 2020 | https://github.com/finos/legend | repo | Strong | yes |
| goldman-sachs-legend-finos-2020 | Goldman Sachs Open Sources its Data Modeling Platform through FINOS | Linux Foundation | 2020-10 | https://www.linuxfoundation.org/press/press-release/goldman-sachs-open-sources-its-data-modeling-platform-through-finos | press | Medium | yes |
| goldman-sachs-aws-story-2022 | Goldman Sachs, an established financial services firm, transforms its operations on AWS | AWS for Industries blog | 2022-10 | https://aws.amazon.com/blogs/industries/goldman-sachs-a-legacy-financial-services-firm-transforms-its-operations-on-aws | press | Medium | partial |
| goldman-sachs-volante-txb-nd | Goldman Sachs: Redefining transaction banking with cloud-native innovation | Volante Technologies | n.d. | https://www.volantetech.com/case-studies/goldman-sachs-redefining-transaction-banking/ | press | Medium | yes |
| goldman-sachs-marcus-finacle-2016 | Marcus by Goldman Sachs deploys Finacle solution on cloud for its new online lending business | Infosys Finacle (EdgeVerve), republished by The Asian Banker | 2016-11 | https://www.theasianbanker.com/press-releases/marcus-by-goldman-sachs-deploys-finacle-solution-on-cloud-for-its-new-online-lending-business | press | Medium | yes |
| goldman-sachs-secdb-efinancialcareers-2017 | The hidden weakness inside Goldman Sachs? | eFinancialCareers | 2017-02 | https://www.efinancialcareers.com/news/2017/02/secdb-goldman-sachs-slang | third-party | Weak | yes |
| goldman-sachs-secdb-history-nd | 1993: SecDB (Our firm history) | Goldman Sachs | n.d. | https://www.goldmansachs.com/our-firm/history/moments/1993-secdb | docs | Strong | no |
| goldman-sachs-secdb-observability-2023 | SecDB observability journey | Goldman Sachs Developer blog | 2023-10 | https://developer.gs.com/blog/posts/secdb-observability-journey | engineering-blog | Strong | no |
| goldman-sachs-txb-instant-payments-nd | Transaction Banking instant payments architecture | Goldman Sachs Developer blog | n.d. | https://developer.gs.com/blog/posts/txb-instant-payments | engineering-blog | Strong | no |
| goldman-sachs-txb-multiregion-2022 | Building multi-region resiliency with Amazon RDS and Amazon Aurora | Goldman Sachs Developer blog | 2022-03 | https://developer.gs.com/blog/posts/building-multi-region-resiliency-with-amazon-rds-and-amazon-aurora | engineering-blog | Strong | no |
