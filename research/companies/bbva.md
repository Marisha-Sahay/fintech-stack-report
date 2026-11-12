# BBVA

**Category:** bank
**HQ / founded:** Bilbao and Madrid, Spain (No public source read in this pass)
**Scale signal:** "80 million customers across more than 25 countries"; "over 45 billion transactions, equating to 120 terabytes of data" searchable in Elastic (bbva-elastic-nd, vendor page, undated). In 2016 BBVA platforms handled "more than 542 million transactions a day" (bbva-aws-2016, 2016)
**Last researched:** 2026-11-11

## Summary

BBVA's public technology record is about data and cloud, not about its core banking or ledger. Its BBVA architects describe an internal multi-cloud called Ether Cloud Services that spans Google Cloud, AWS and Azure, built "to avoid vendor lock-in", with MySQL as the default relational database "since people often have experience working with it" (bbva-google-cloudsql-2021). Its analytics platform ADA moved from on-premises to AWS between 2023 and early 2026 and the old local data platform was shut down (bbva-ada-europe-2024; bbva-ada-global-2026). On the transactional side, the only detail found is from a vendor page: customer transaction queries used to run against DB2 and were moved to Elasticsearch to "reduce mainframe load and operational cost" (bbva-elastic-nd). No public source names BBVA's core banking platform, ledger model or OLTP databases for accounts.

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | No public source found for core services; open source mainly Go and Python | Strong (open source only) | bbva-github-org-2026 |
| Main frameworks | No public source found | None | |
| Primary OLTP store(s) | DB2 behind customer transaction data (mainframe); MySQL default and PostgreSQL for some cases on Google Cloud SQL (internal and employee apps) | Medium (DB2); Strong (Cloud SQL) | bbva-elastic-nd; bbva-google-cloudsql-2021 |
| Service-layer persistence | No public source found | None | |
| Money / ledger model | No public source found | None | |
| Messaging / streaming | No public source found | None | |
| Infrastructure | Hybrid: mainframe core; internal multi-cloud (Ether Cloud Services on Google Cloud, AWS, Azure); data platform ADA on AWS | Strong | bbva-google-cloudsql-2021; bbva-ada-global-2026 |
| Scaling approach | Read offload of transaction queries from DB2 to Elasticsearch; ADA consolidated 16 tenants into one platform across two AWS regions | Medium | bbva-elastic-nd; bbva-aws-ada-part1-2025 |
| Build vs buy (core) | No public source found for the core; builds internal cloud and data platforms on public cloud | Strong (platforms only) | bbva-google-cloudsql-2021; bbva-ada-global-2026 |
| Notable open source | QED (tamper-evident log, Go), Kapow, apicheck, MirrorGate | Strong | bbva-github-org-2026; bbva-qed-repo-2018 |

## Languages and frameworks

- No public source found on the languages and frameworks of BBVA's core or channel services. Two job listings that search snippets describe as naming Java, Spring and an internal framework called APX returned HTTP 410 and were not read.
- BBVA's public GitHub output is mostly security, DevOps and data tooling in Go and Python: Kapow (Go), apicheck (Python), QED (Go), MirrorGate (Java) (bbva-github-org-2026).

## The money layer (ledger, balances, payments)

- No public source found on how BBVA records balances or ledger entries, or which core banking system it runs.
- The closest signal is a vendor page: customer transaction data lived in "around nine services, each containing information in different tables" backed by DB2, and BBVA consolidated reads into Elasticsearch (bbva-elastic-nd, Medium, undated).
- BBVA open-sourced QED in 2018, "Scalable, auditable and high-performance tamper-evident log", which it says can be used for "Distributed business transactions" and is "Designed to manage billions of events per shard" (bbva-qed-repo-2018). The repo has had no pushes since 2020-02, and no source read says QED is used in BBVA's money systems.

## Service-layer persistence and databases

- On Google Cloud: "For most initiatives, we use MySQL, since people often have experience working with it." and "PostgreSQL is also used for more specific use cases such as global deployments" (bbva-google-cloudsql-2021, 2021). The workloads named are internal employee apps such as "paycheck portals, internal directories" and procurement, not core banking (bbva-google-cloudsql-2021).
- Mainframe: "As soon as the customer logged in, the system was already querying Elastic, not DB2." (bbva-elastic-nd).
- No public source found on ORM vs SQL-first choices.

## Scale

- Elastic holds "over 45 billion transactions, equating to 120 terabytes of data" for "80 million customers across more than 25 countries" (bbva-elastic-nd, vendor page, undated).
- ADA: "40,000 daily data consumers across seven countries on two continents"; "BBVA successfully merged 16 separate tenants into one unified global platform" (bbva-aws-ada-part1-2025).
- 2016: "more than 542 million transactions a day", up from 90 million in 2006 (bbva-aws-2016, 2016).

## Build vs buy

- Build on top of public cloud: Ether Cloud Services is "an internal cloud" spanning three providers (bbva-google-cloudsql-2021); ADA is "built around Amazon Web Services (AWS)" (bbva-ada-global-2026).
- Buy for search: Elasticsearch for transaction search (bbva-elastic-nd).
- AWS was chosen in 2023 for the data transformation (bbva-ada-europe-2024).
- Core banking build vs buy: No public source found.
- BBVA says its 2025 German digital bank combines "cutting-edge technology" with its app, but does not say whether it shares Italy's platform or what core it runs (bbva-germany-launch-2025).

## Correctness (idempotency, reconciliation, audit)

- QED is BBVA's public work on audit: it "guarantees that the system itself, even when deployed into a non-trusted server, cannot be modified without being detected" and uses "Consistent replication through RAFT" (bbva-qed-repo-2018). Production use at BBVA is not stated.
- No public source found on idempotency or reconciliation in BBVA's payments or ledgers.

## Changes over time (migrations and reasons)

- 2016: agreement with AWS to migrate "selected platform components and workloads" (bbva-aws-2016).
- By 2021: internal multi-cloud Ether Cloud Services across Google Cloud, AWS and Azure (bbva-google-cloudsql-2021).
- 2023: AWS selected for the data platform; 2024-12: Europe and Uruguay migrated with "Tens of thousands of processes and thousands of users" and no service interruption (bbva-ada-europe-2024).
- 2026-01: ADA live in all BBVA geographies and "the Group completed the definitive shutdown of its former local data platform", "lowering operating costs" (bbva-ada-global-2026).
- The on-premises data platform was replaced because "traditional solutions could not cope with its 40% data infrastructure growth year over year" (bbva-aws-ada-part1-2025).

## Stated reasons (verbatim quotes)

> "to avoid vendor lock-in, we've designed and built a multi-cloud architecture" (bbva-google-cloudsql-2021, 2021-06)

> "For most initiatives, we use MySQL, since people often have experience working with it." (bbva-google-cloudsql-2021, 2021-06)

> "The on-premises environment's limitations in scaling and evolving BBVA's data platform clearly demanded change." (bbva-aws-ada-part1-2025, 2025-10)

> "BBVA discovered that traditional solutions could not cope with its 40% data infrastructure growth year over year." (bbva-aws-ada-part1-2025, 2025-10)

> "cloud computing technologies have much to contribute in this direction." (Ricardo Moreno, Global Head of BBVA Engineering, in bbva-aws-2016, 2016-10)

> "There were around nine services, each containing information in different tables" (David Jimenez Ausin, BBVA, in bbva-elastic-nd)

## Open questions

- BBVA's core banking platform (in-house, vendor, mainframe generation) is not described in any source read. This is the main gap for BBVA.
- Search snippets mention an internal Java architecture called APX in BBVA job listings; the listings returned HTTP 410. Unverified.
- Search snippets of a 2018 Red Hat case study say BBVA's OpenShift-based PaaS runs loans, mortgages and credit card contract workloads in three countries. The PDF was not read (bbva-redhat-paas-2018, read = no). Unverified.
- Whether the Italy (2021) and Germany (2025) digital banks share one platform, and what it is: not stated in BBVA's launch release.
- Whether QED is used in production for any money flow: not stated.

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| bbva-google-cloudsql-2021 | How BBVA is using Cloud SQL for its next generation IT initiatives (by BBVA Google Cloud architects) | Google Cloud blog | 2021-06 | https://cloud.google.com/blog/products/databases/multicloud-with-bbva-how-they-use-cloud-sql | engineering-blog | Strong | yes |
| bbva-ada-global-2026 | BBVA Completes its Global Move to the Cloud With a Single Data and Artificial Intelligence Platform | BBVA | 2026-01 | https://www.bbva.com/en/innovation/bbva-completes-its-global-move-to-the-cloud-with-a-single-data-and-artificial-intelligence-platform/ | press | Strong | yes |
| bbva-ada-europe-2024 | BBVA migrates its data platform to the AWS cloud in Europe | BBVA | 2024-12 | https://www.bbva.com/en/innovation/bbva-migrates-its-data-platform-to-the-aws-cloud-in-europe/ | press | Strong | yes |
| bbva-aws-2016 | BBVA works with Amazon Web Services to accelerate the Group's transformation | BBVA | 2016-10 | https://bbva.com/en/bbva-works-amazon-web-services-accelerate-groups-transformation | press | Strong | yes |
| bbva-germany-launch-2025 | BBVA launches a 100% digital bank in Germany, offering an interest-bearing checking account with no fees | BBVA | 2025-06 | https://www.bbva.com/en/innovation/bbva-launches-a-100-digital-bank-in-germany-offering-an-interest-bearing-checking-account-with-no-fees/ | press | Strong | yes |
| bbva-qed-repo-2018 | BBVA/qed repository and README | BBVA (GitHub) | 2018-05 | https://github.com/BBVA/qed | repo | Strong | yes |
| bbva-github-org-2026 | BBVA GitHub organization repository list | BBVA (GitHub) | 2026-11 | https://github.com/BBVA | repo | Strong | yes |
| bbva-aws-ada-part1-2025 | Part 1: BBVA: Building a multi-region, multi-country global Data and ML Platform at scale | AWS for Industries blog | 2025-10 | https://aws.amazon.com/blogs/industries/part-1-bbva-building-a-multi-region-multi-country-global-data-and-ml-platform-at-scale | press | Medium | partial |
| bbva-elastic-nd | BBVA transforms global banking operations with Elasticsearch | Elastic | n.d. | https://www.elastic.co/customers/bbva | press | Medium | yes |
| bbva-redhat-paas-2018 | BBVA case study (Red Hat OpenShift PaaS) | Red Hat | 2018-07 | https://www.redhat.com/cms/managed-files/rh-bbva-case-study-f10924wg-201807-en.pdf | press | Medium | no |
