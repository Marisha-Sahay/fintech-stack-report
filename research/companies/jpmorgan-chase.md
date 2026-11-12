# JPMorgan Chase

**Category:** bank
**HQ / founded:** New York (No public source read in this pass)
**Scale signal:** "44,000 software engineers managing nearly an exabyte of data" (2024-12) (jpmorgan-chase-cio-reinvent-2024); 2025 firmwide technology expense outlook "~$18B" (jpmorgan-chase-investor-day-2025)
**Last researched:** 2026-11-11

## Summary

JPMorgan publishes numbers about its technology program (spend, share of applications in cloud, data center exits) but very little about how individual systems are built. Its filings say about 50% of applications and 70% of data ran largely in public or private cloud in early 2024, that it wants "multiple clouds to avoid lock-in", and that cloud is chosen because "it accelerates the speed of delivery of new services" (jpmorgan-chase-ceo-letter-2024). For core banking it buys: Thought Machine's Vault Core is being deployed across US Consumer & Community Banking in a multi-year program (jpmorgan-chase-thought-machine-2022), while Chase UK, the digital bank launched in 2021, runs on 10x Banking's platform, not Thought Machine (jpmorgan-chase-uk-10x-nd). The card platform still runs on mainframe and is being rewritten with AI-assisted tooling (jpmorgan-chase-card-mainframe-2025). Athena, the markets risk and pricing platform, is built in-house in Python (jpmorgan-chase-athena-job-2026).

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Python (Athena); Java (Chase UK backend); legacy mainframe languages on card platform | Medium | jpmorgan-chase-athena-job-2026; jpmorgan-chase-uk-backend-job-2026; jpmorgan-chase-card-mainframe-2025 |
| Main frameworks | Athena (in-house Python platform with its own data store, Hydra) | Medium | jpmorgan-chase-athena-job-2026 |
| Primary OLTP store(s) | No public source found | None | |
| Service-layer persistence | No public source found | None | |
| Money / ledger model | Vendor core ledgers: Thought Machine Vault Core (US consumer, migration in progress); 10x platform (Chase UK). Internal model not public | Medium | jpmorgan-chase-thought-machine-2022; jpmorgan-chase-uk-10x-nd |
| Messaging / streaming | Kafka via Confluent Platform (2019) | Medium | jpmorgan-chase-confluent-2019 |
| Infrastructure | Hybrid: new private-cloud data centers plus public cloud, multi-cloud by intent; Chase UK on AWS (vendor claim) | Strong (hybrid); Medium (Chase UK) | jpmorgan-chase-ceo-letter-2024; jpmorgan-chase-uk-10x-nd |
| Scaling approach | No public source found | None | |
| Build vs buy (core) | Buy for retail core (Thought Machine in US, 10x in UK); build for markets (Athena) and payments (Graphite) | Strong (Graphite); Medium (rest) | jpmorgan-chase-thought-machine-2022; jpmorgan-chase-uk-10x-nd; jpmorgan-chase-investor-day-2025 |
| Notable open source | Training material and UI kits (python-training, salt-ds, jupyter-fs); nothing from the core or payments stack | Strong | jpmorgan-chase-github-org-2026 |

## Languages and frameworks

- Athena is described in a 2026 job listing as "a next generation risk, pricing, and trade management platform built in-house at JP Morgan", and the role is "Developing Athena (Python) analytics software that is used to price and risk manage financial products" (jpmorgan-chase-athena-job-2026, Medium).
- The same listing names Athena components: a dependency graph, "a ubiquitous data store called Hydra", a real-time risk reporting framework, and Reactive, "a forward propagating, event-driven graph" (jpmorgan-chase-athena-job-2026).
- Chase UK backend roles ask for "a recent version of the Java programming language" and "cloud-native microservices architecture applications", with AWS preferred (jpmorgan-chase-uk-backend-job-2026, Medium).
- The Chase card platform "was built on mainframe, using legacy programming languages", per its head of technology (jpmorgan-chase-card-mainframe-2025).
- Widely repeated figures on Athena's size (35 million lines of Python, 2017 talk) come from a 2019 TechRepublic article that could not be fetched (jpmorgan-chase-techrepublic-athena-2019, read = no).

## The money layer (ledger, balances, payments)

- US retail core: Thought Machine says Vault Core will be deployed "across JPMorgan Chase's Consumer & Community banking business" in a multi-year programme, and quotes CCB CIO Gill Haus: "We are thankful for their support and look forward to continuing to innovate as we migrate" (jpmorgan-chase-thought-machine-2022, Medium, 2022-10). Trade press dated the deal to September 2021 (jpmorgan-chase-finovate-vault-2021, Weak).
- Chase UK core: 10x Banking says Chase chose the "10x Banking Platform", a cloud-native core built on AWS, and quotes former Chase UK CEO Sanjiv Somani on why (jpmorgan-chase-uk-10x-nd, Medium). JPMorgan's own launch release does not name the vendor; it says Chase "designed the bank from scratch" (jpmorgan-chase-uk-launch-2021).
- Payments: the 2025 Investor Day deck says JPMorgan "Completed modern payments processing platform (Graphite) in 2024" and that existing payments applications were ~100% migrated to strategic data centers and public cloud as of Q1 2025 (jpmorgan-chase-investor-day-2025, Strong).
- How balances are recorded inside these systems (double-entry, event-sourced, immutable) is not described in any JPMorgan source read.

## Service-layer persistence and databases

- No public source found on ORM vs SQL-first choices or on which OLTP databases back consumer or payments systems.
- The Chase UK job listing asks only for an "Understanding with different kinds of data stores (including relational data stores)" (jpmorgan-chase-uk-backend-job-2026).
- Athena uses its own data store, Hydra (jpmorgan-chase-athena-job-2026). Its design is not public in any source read.

## Scale

- "44,000 software engineers managing nearly an exabyte of data" (jpmorgan-chase-cio-reinvent-2024, 2024-12).
- 2025 technology expense outlook "~$18B", up from $17.0B in 2024 (jpmorgan-chase-investor-day-2025).
- The April 2024 letter: "we have 32 data centers globally" and the new ones "are around 30% more efficient than our existing legacy data centers" (jpmorgan-chase-ceo-letter-2024).
- Chase UK, per its vendor: over 2.5 million customers as of February 2025 and 3 million daily transactions (jpmorgan-chase-uk-10x-nd, Medium, vendor figures).

## Build vs buy

- Retail core banking is bought on both sides of the Atlantic: Thought Machine for the US consumer bank and 10x for Chase UK (jpmorgan-chase-thought-machine-2022; jpmorgan-chase-uk-10x-nd). JPMorgan is also an investor in Thought Machine's 2021 Series C, per the Thought Machine release (jpmorgan-chase-thought-machine-2022).
- Markets analytics (Athena) and payments processing (Graphite) are built in-house (jpmorgan-chase-athena-job-2026; jpmorgan-chase-investor-day-2025).
- Chase UK presents itself as a builder on top of that bought core: "we build lots of things from scratch" and "As a greenfield bank, our engineers create from the bottom up" (jpmorgan-chase-uk-careers-nd, undated careers page).
- Event streaming is bought: Confluent Platform for Kafka (jpmorgan-chase-confluent-2019, 2019).
- Open source output is small and peripheral to the core: training notebooks, UI component libraries, Jupyter tools (jpmorgan-chase-github-org-2026).

## Correctness (idempotency, reconciliation, audit)

- No JPMorgan-attributed public source found on idempotency, reconciliation or ledger audit design.
- An InfoQ podcast with a JPMorgan engineering manager describes daily reconciliation of mainframe change-data-capture streams against cloud data ("we take the CDC streamed data and the system of reference data, we compare"), but the transcript attributes the examples to a previous employer, so it cannot be used as JPMorgan evidence (jpmorgan-chase-infoq-podcast-2026, Weak).
- On AI-rewritten mainframe code, the card technology head says the test harness gives "a very high degree of confidence that we didn't miss anything" (jpmorgan-chase-card-mainframe-2025).

## Changes over time (migrations and reasons)

- 2019: Confluent inducted into JPMorgan's Hall of Innovation for "highly reliable event streaming and event management technology" for microservice applications (jpmorgan-chase-confluent-2019).
- 2021: Chase UK launched (announced 2021-01) (jpmorgan-chase-uk-launch-2021); US core deal with Thought Machine reported 2021-09 (jpmorgan-chase-finovate-vault-2021).
- 2024-04: about 50% of applications and 70% of data in public or private cloud; target 70% and 75% by end of 2024 (jpmorgan-chase-ceo-letter-2024).
- 2025 Investor Day: the deck reports ~65% and ~80% figures for applications running largely in the cloud and on modern infrastructure, against ~50% and ~75% the year before. The text extraction read here does not unambiguously pair each number with its label, so check the slide before citing (jpmorgan-chase-investor-day-2025). The same deck says >90% of analytical data moved to the public cloud.
- 2025-10: card platform mainframe exit under way; "It will end when we decommission the last line of mainframe code" (jpmorgan-chase-card-mainframe-2025).

## Stated reasons (verbatim quotes)

> "it accelerates the speed of delivery of new services" and "it simultaneously reduces the cost of compute power" (jpmorgan-chase-ceo-letter-2024, 2024-04)

> "it is critical that we eventually use multiple clouds to avoid lock-in." (jpmorgan-chase-ceo-letter-2024, 2024-04)

> "we should carefully pick which applications and which data go to the public cloud versus the private cloud" (jpmorgan-chase-ceo-letter-2024, 2024-04)

> "We chose 10x because we needed a modern scalable core banking platform built on micro-services and accessible via APIs" (Sanjiv Somani, former Chase UK CEO, in jpmorgan-chase-uk-10x-nd)

> "But it was built on mainframe, using legacy programming languages." (Roman Eisenberg, head of technology for Chase card, in jpmorgan-chase-card-mainframe-2025, 2025-10)

> "Confluent's innovative real-time event and data management platform helps us to accomplish that" (Andrew J. Lang, CTO, in jpmorgan-chase-confluent-2019, 2019-01)

## Open questions

- The seed brief says Chase UK runs on Thought Machine Vault. No source read supports that. The vendor case study names 10x, and the Thought Machine release covers US Consumer & Community Banking only. Search snippets suggest Thought Machine did rewards work for Chase UK; unverified.
- How far the US Vault Core migration has progressed (accounts or deposits moved) is not in any filing read. The 2021 Finextra report of the deal could not be fetched (jpmorgan-chase-finextra-vault-2021, read = no).
- Athena's current size and its Python 3 migration: only a 2019 third-party article (not fetched) reports numbers. Unverified.
- Graphite: language, data store and ledger model not described in any source read.
- Databases behind consumer, card and payments systems: no public source found.

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| jpmorgan-chase-ceo-letter-2024 | Chairman and CEO Letter to Shareholders, Annual Report 2023 (section "Our Journey to the Cloud") | JPMorganChase | 2024-04 | https://jpmorganchase.com/ir/annual-report/2023/ar-ceo-letters | filing | Strong | partial |
| jpmorgan-chase-investor-day-2025 | 2025 Investor Day presentation slides (Form 8-K Exhibit 99.2) | JPMorganChase via SEC EDGAR | 2025-05 | https://www.sec.gov/Archives/edgar/data/19617/000001961725000483/investordaypresentation.htm | filing | Strong | partial |
| jpmorgan-chase-cio-reinvent-2024 | JPMorganChase Global CIO Lori Beer showcases strategic advancements at AWS re:Invent | JPMorganChase technology blog | 2024-12 | https://www.jpmorganchase.com/about/technology/blog/jpmc-global-cio-showcases-advancements-at-aws-re-invent | engineering-blog | Strong | yes |
| jpmorgan-chase-uk-launch-2021 | JPMorgan Chase to launch digital consumer banking in the U.K. | JPMorganChase newsroom | 2021-01 | https://www.jpmorganchase.com/newsroom/press-releases/2021/jpmorgan-chase-to-launch-digital-consumer-banking-in-the-uk | press | Strong | yes |
| jpmorgan-chase-github-org-2026 | jpmorganchase GitHub organization repository list | JPMorganChase (GitHub) | 2026-11 | https://github.com/jpmorganchase | repo | Strong | yes |
| jpmorgan-chase-thought-machine-2022 | Thought Machine inducted into JPMorgan Chase's 2022 Hall of Innovation | Thought Machine | 2022-10 | https://thoughtmachine.net/press-releases/jpmorgan-chase-hall-of-innovation | press | Medium | yes |
| jpmorgan-chase-uk-10x-nd | How Chase UK built a next-gen digital bank with 10x Banking | 10x Banking | n.d. | https://www.10xbanking.com/chase-uk-launches-new-retail-banking-proposition-in-uk | press | Medium | yes |
| jpmorgan-chase-confluent-2019 | Confluent Inducted Into JPMorgan Chase Hall of Innovation | Confluent | 2019-01 | https://www.confluent.io/press-release/confluent-inducted-into-jpmorgan-chase-hall-of-innovation/ | press | Medium | yes |
| jpmorgan-chase-athena-job-2026 | Quantitative Research - Athena Analytics Developer - Executive Director (London) | JPMorganChase via Built In | 2026-01 | https://builtin.com/job/quantitative-research-athena-analytics-developer-executive-director/6320726 | job-listing | Medium | yes |
| jpmorgan-chase-uk-backend-job-2026 | Lead Software Engineer - Backend Engineer - Chase UK | JPMorganChase via Built In | 2026-01 | https://builtin.com/job/lead-software-engineer-backend-engineer-chase-uk/7304368 | job-listing | Medium | yes |
| jpmorgan-chase-uk-careers-nd | Engineering careers, Chase UK | Chase UK | n.d. | https://www.chase.co.uk/gb/en/careers-at-chase/engineering/ | docs | Medium | yes |
| jpmorgan-chase-card-mainframe-2025 | JPMorgan Chase enlists generative AI to drive modernization (on-record quotes from Roman Eisenberg) | CIO Dive / Banking Dive | 2025-10 | https://www.bankingdive.com/news/jpmorgan-chase-credit-card-AI-mainframe-modernization-platform-eisenberg/803212/ | third-party | Medium | yes |
| jpmorgan-chase-finovate-vault-2021 | JP Morgan Taps Thought Machine to Replace Retail Banking Core | Finovate | 2021-09 | https://finovate.com/jp-morgan-taps-thought-machine-to-replace-retail-banking-core/ | third-party | Weak | yes |
| jpmorgan-chase-infoq-podcast-2026 | Building Resilient Event-Driven Microservices in Financial Systems with Muzeeb Mohammad | InfoQ | 2026-02 | https://www.infoq.com/podcasts/building-resilient-event-driven-microservices | talk | Weak | partial |
| jpmorgan-chase-techrepublic-athena-2019 | JPMorgan's Athena has 35 million lines of Python code, and won't be updated to Python 3 in time | TechRepublic | 2019 | https://www.techrepublic.com/article/jpmorgans-athena-has-35-million-lines-of-python-code-and-wont-be-updated-to-python-3-in-time/ | third-party | Weak | no |
| jpmorgan-chase-finextra-vault-2021 | JPMorgan Chase to replace US retail core with Thought Machine's Vault | Finextra | 2021-09 | https://www.finextra.com/newsarticle/38882/jpmorgan-chase-to-replace-us-retail-core-with-thought-machines-vault | third-party | Weak | no |
