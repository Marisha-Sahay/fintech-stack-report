# ING

**Category:** bank
**HQ / founded:** Amsterdam (No public source read in this pass)
**Scale signal:** Workload on (private) cloud 34% in 2021, target above 70% by 2025; 63% of customer online traffic through Touchpoint in 2021 (ing-investor-update-tech-2022)
**Last researched:** 2026-11-11

## Summary

ING describes its architecture as a slow break-up of the traditional core rather than a core replacement: its CTO says modular design "led to the disappearance of what used to be called the core banking concept" and calls modernisation "a permanent journey" (ing-tonella-core-2026). The platform pieces that are public are a private cloud (34% of workload in 2021, target above 70% by 2025), a shared Banking Technology Platform called Touchpoint, and a shared engineering platform (ing-investor-update-tech-2022). Kafka has run since a 2014 fraud-detection proof of concept and grew into an "Event Bus" used with Flink and Cassandra (ing-kafka-summit-2018). ING's open-source workflow engine Baker persists state through "Event sourcing with Cassandra" (ing-baker-repo-2016). Oracle is described as "the current ING corporate standard" database in a Temenos case study (ing-temenos-belgium-nd), and current job listings for ING Germany ask for Java, Kotlin, Spring Boot, Oracle and Kafka on OpenShift (ing-germany-backend-job-2026).

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Java and Kotlin (ING Germany); Scala (Baker, other open source) | Medium (Java, Kotlin); Strong (Scala in repos) | ing-germany-backend-job-2026; ing-baker-repo-2016 |
| Main frameworks | Spring Boot; Baker (in-house orchestration, Akka-based runtime) | Medium (Spring Boot); Strong (Baker) | ing-germany-backend-job-2026; ing-baker-repo-2016 |
| Primary OLTP store(s) | Oracle ("corporate standard"); Cassandra (Baker persistence, Kafka use cases) | Medium (Oracle); Strong (Cassandra) | ing-temenos-belgium-nd; ing-baker-repo-2016; ing-kafka-summit-2018 |
| Service-layer persistence | No public source found | None | |
| Money / ledger model | No public source found; CTO describes a slimmed core around account management (writer's summary) | Medium (partial) | ing-tonella-core-2026 |
| Messaging / streaming | Kafka "Event Bus" since 2014, with Flink and Cassandra | Strong | ing-kafka-summit-2018 |
| Infrastructure | Mainly private cloud (ING Private Cloud); Kubernetes (OpenShift) platform; back-end systems kept off Kubernetes | Strong (targets); Medium (Kubernetes) | ing-investor-update-tech-2022; ing-cncf-case-study-2018 |
| Scaling approach | Shared platforms: private cloud, Touchpoint, shared engineering platform, OnePipeline | Strong | ing-investor-update-tech-2022 |
| Build vs buy (core) | Mixed: componentised in-house platforms; ING Belgium and Netherlands standardising on one core banking platform (Unite, vendor not named); Temenos for wealth | Medium | ing-tonella-core-2026; ing-temenos-belgium-nd |
| Notable open source | Lion (web components), Baker, popmon, cassandra-jdbc-wrapper, threshold-signatures | Strong | ing-github-org-2026 |

## Languages and frameworks

- ING Germany's Daily Banking backend uses "modern frameworks like Spring Boot, Java and Kotlin" and "Java (17 or higher, ideally 21+), Spring Boot, Oracle databases, SQL, and API management" (ing-germany-backend-job-2026, Medium).
- "Our backend systems are the backbone of ING's Daily Banking platform" (ing-germany-backend-job-2026).
- Baker, open-sourced in 2016, orchestrates "microservice-based process flows" declared as recipes in "the Java, Kotlin, or Scala DSL"; its runtime is "based on Akka" (ing-baker-repo-2016).
- ING's public repos span Scala, Python, Java, Go, Rust and JavaScript; the most-starred is Lion, a web component library (ing-github-org-2026).

## The money layer (ledger, balances, payments)

- No public source found that describes how ING records balances or ledger entries.
- The CTO's account, in the writer's summary: ING began more than a decade ago with modular architecture, APIs and microservices and has been shrinking its legacy central system around a slimmer account management core (ing-tonella-core-2026, Medium, summary not quote).
- ING Belgium and ING Netherlands "decided to standardize on a single core banking platform for both retail banking businesses" under an initiative named Unite; the case study does not name the platform (ing-temenos-belgium-nd, Medium, undated).

## Service-layer persistence and databases

- Oracle: ING Belgium is "migrating from its legacy Sybase platform to Oracle Database, which is the current ING corporate standard." (ing-temenos-belgium-nd). ING Germany listings ask for "Oracle databases" (ing-germany-backend-job-2026).
- Cassandra: Baker's feature comparison lists its data persistence as "Event sourcing with Cassandra" (ing-baker-repo-2016). ING maintains a JDBC wrapper for Cassandra, open-sourced in 2020 (ing-cassandra-jdbc-repo-2020). The 2018 Kafka talk describes use cases where "Kafka is used in combination with Nginx, Flink and Cassandra" (ing-kafka-summit-2018).
- No public source found on ORM vs SQL-first choices.

## Scale

- 2021 baseline and 2025 targets: "Workload on (private) cloud >70% by 2025 versus 34% in 2021"; "Customer online traffic using Touchpoint >90% by 2025 versus 63% in 2021"; "Adoption of shared engineering platform >90% by 2025 versus ~40% in 2021" (ing-investor-update-tech-2022).
- Tech and Operations costs were about 40% of total 2021 costs (ing-investor-update-tech-2022).
- No public source found for transaction volumes on the core or on Kafka.

## Build vs buy

- Build: shared platforms (private cloud, Touchpoint, OnePipeline engineering tooling) and in-house frameworks such as Baker (ing-investor-update-tech-2022; ing-baker-repo-2016).
- Buy: Temenos investment management platform at ING Belgium for over 20 years and Temenos Wealth Front Office for onboarding (ing-temenos-belgium-nd, Medium).
- 2015: CIO Ron van Kemenade described building "a new digital platform that was cloud-based and API-based, and Web scale at the same time" and decommissioning the mainframe, including "a rehosting environment that allows COBOL code residing on a mainframe to run in a container technology" (ing-bcg-van-kemenade-2015, Medium, 2015).
- Core vendor for the Unite platform: no public source found.

## Correctness (idempotency, reconciliation, audit)

- Compliance is enforced in the delivery pipeline: "applications are only allowed to go through the pipeline, where compliance is enforced" (ing-cncf-case-study-2018, Medium, 2018).
- Baker recipes declare failure strategies such as retry with incremental backoff and a deadline (ing-baker-repo-2016).
- No public source found on idempotency, reconciliation or ledger audit.

## Changes over time (migrations and reasons)

- 2014: Kafka proof of concept "to improve our fraud detection system for online banking", later the group Event Bus (ing-kafka-summit-2018).
- 2015: mainframe decommissioning roadmap and consolidation "of data centers, platforms, operating systems, and middleware" (ing-bcg-van-kemenade-2015).
- 2018: ING standardises on Kubernetes ("We decided to standardize ING on a Kubernetes framework"), starting with OpenShift Origin; traditional back-end systems stay off it because "it only makes sense to move things to cloud if they are cloud native" (ing-cncf-case-study-2018).
- 2022: targets for private cloud, Touchpoint and shared engineering platform set to 2025 (ing-investor-update-tech-2022).
- ING Belgium: Sybase to Oracle and on-premises data center to private cloud (ing-temenos-belgium-nd).
- 2026: CTO describes modernisation as continuous rather than a single core swap (ing-tonella-core-2026).

## Stated reasons (verbatim quotes)

> "That led to the disappearance of what used to be called the core banking concept," (Daniele Tonella, ING CTO, in ing-tonella-core-2026)

> "It all started within ING when a solution was needed to improve our fraud detection system for online banking." (ing-kafka-summit-2018, 2018)

> "It enables us to improve our customers banking experience and helps us to become a truly event-driven bank." (ing-kafka-summit-2018, 2018)

> "We decided to standardize ING on a Kubernetes framework." (Thijs Ebbers, ING, in ing-cncf-case-study-2018, 2018-06)

> "it only makes sense to move things to cloud if they are cloud native" (Onno Van der Voort, ING, in ing-cncf-case-study-2018, 2018-06)

> "To decommission the mainframe, you need a fully functional roadmap." (Ron van Kemenade, ING CIO, in ing-bcg-van-kemenade-2015, 2015-12)

> "Our goal was not simply to drive down costs but rather to ensure that the money we do spend delivers maximum value." (Ron van Kemenade, in ing-bcg-van-kemenade-2015, 2015-12)

## Open questions

- Which core banking platform did ING Belgium and ING Netherlands standardise on under Unite? Search snippets mention Finacle for ING Belgium (2012) and an aggregator claims SAP Fioneer (2023). Both unverified.
- Did ING meet its 2025 targets? A 2024 trade article reports 63% (body) or 65% (headline) of operations on private cloud, citing an ING interview (ing-finai-cloud-2024, Weak). An aggregator claims 68% of compute cores in the 2025 annual report. Unverified.
- The agile "squads and tribes" model is widely described (McKinsey 2017 interview, ING newsroom 2016) but neither page could be fetched (ing-mckinsey-agile-2017; ing-agile-newsroom-2016, both read = no).
- ING's Medium tech blog (medium.com/ing-blog) returned HTTP 403, so no post from it was read. A 2026 Payment Expert interview in which the CTO reportedly says ING moved away from a monolithic core also returned HTTP 403 (ing-payment-expert-tonella-2026, read = no).
- Ledger model and Kafka volumes: no public source found.

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| ing-kafka-summit-2018 | The Evolution of Kafka at ING Bank (Timor Timuri, Richard Bras) | Confluent (Kafka Summit London 2018) | 2018 | https://www.confluent.io/kafka-summit-london18/the-evolution-of-kafka-at-ing-bank | talk | Strong | partial |
| ing-investor-update-tech-2022 | ING Investor Update 2022: Tech and Operations (unedited text repost; ing.com page returned 404) | ING, reposted by MarketScreener | 2022-06 | https://www.marketscreener.com/quote/stock/ING-GROEP-N-V-56358303/news/ING-Investor-Update-2022-Tech-Operations-40705575/ | filing | Strong | partial |
| ing-baker-repo-2016 | ing-bank/baker repository, README and docs (feature comparison, getting started) | ING (GitHub) | 2016-12 | https://github.com/ing-bank/baker | repo | Strong | yes |
| ing-cassandra-jdbc-repo-2020 | ing-bank/cassandra-jdbc-wrapper repository and README | ING (GitHub) | 2020-12 | https://github.com/ing-bank/cassandra-jdbc-wrapper | repo | Strong | yes |
| ing-github-org-2026 | ing-bank GitHub organization repository list | ING (GitHub) | 2026-11 | https://github.com/ing-bank | repo | Strong | yes |
| ing-cncf-case-study-2018 | ING: Driving banking innovation with cloud native | CNCF | 2018-06 | https://www.cncf.io/case-studies/ing/ | press | Medium | yes |
| ing-bcg-van-kemenade-2015 | Building a Cutting-Edge Banking IT Function (interview with Ron van Kemenade) | BCG | 2015-12 | https://www.bcg.com/publications/2015/financial-institutions-ron-van-kemenade-building-cutting-edge-banking-it-function | third-party | Medium | yes |
| ing-temenos-belgium-nd | ING Belgium Success Story | Temenos | n.d. | https://www.temenos.com/?p=5915 | press | Medium | yes |
| ing-tonella-core-2026 | ING, EastWest and ANEXT show why core modernisation is becoming a permanent banking capability | The Banking Conversation | 2026 | https://bankingconversation.com/episodes/ing-eastwest-and-anext-show-why-core-modernisation-is-becoming-a-permanent-banking-capability | third-party | Medium | partial |
| ing-germany-backend-job-2026 | Senior Backend Engineer (w/m/d), Daily Banking and Savings, ING Germany | ING via Built In | 2026-03 | https://builtinlondon.uk/job/senior-backend-engineer-w-m-d/8213843 | job-listing | Medium | yes |
| ing-finai-cloud-2024 | Inside ING's hybrid, multi-cloud strategy | FinAi News | 2024-03 | https://finainews.com/allposts/core-cloud/inside-ings-hybrid-multi-cloud-strategy | third-party | Weak | partial |
| ing-mckinsey-agile-2017 | ING's agile transformation | McKinsey | 2017 | https://www.mckinsey.com/industries/financial-services/our-insights/ings-agile-transformation | third-party | Medium | no |
| ing-agile-newsroom-2016 | Nothing beats engineering talent: ING's agile transformation | ING newsroom | 2016-07 | https://www.ing.com/Newsroom/News/Nothing-beats-engineering-talent-INGs-agile-transformation.htm | press | Strong | no |
| ing-payment-expert-tonella-2026 | Interview with Daniele Tonella on AI and payments | Payment Expert | 2026-06 | https://paymentexpert.com/2026/06/30/ing-daniele-tonella-ai-payments/ | third-party | Weak | no |
