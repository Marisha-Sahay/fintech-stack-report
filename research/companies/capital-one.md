# Capital One

**Category:** bank
**HQ / founded:** McLean, Virginia (No public source read in this pass for founding year)
**Scale signal:** About 52,600 employees at 2024-12-31 (capital-one-10k-2024); "tens of thousands of Lambda functions" across "thousands of accounts" (capital-one-serverless-scale-nd)
**Last researched:** 2026-11-11

## Summary

Capital One is the clearest public case of a US bank going all-in on one public cloud: it says it closed its last data center in 2020 and runs on AWS, after an eight-year migration that began in 2012 (capital-one-serverless-scale-nd; capital-one-aws-case-study-nd; capital-one-cloud-migration-2024). Its stated reasons are instant provisioning at near unlimited scale, cloud providers' economies of scale, and multi-region resilience (capital-one-cloud-migration-2024). But its own 10-K shows the "technology company that does banking" still buys its card processing and some banking systems: TSYS processes its consumer and commercial cards for North America and the UK, and FIS runs "certain of our banking systems" (capital-one-10k-2023). A 2017 engineering post describes the classic bank pattern of a mainframe core feeding a read-only DynamoDB copy that serves most traffic (capital-one-serverless-transactions-2017), and a 2025 job listing shows a "Bank Modernization" program building "a core agnostic GraphQL interface layer" over a "new core banking platform" whose vendor is not named (capital-one-bank-modernization-job-2025).

## Matrix row

| Dimension | Value | Evidence | Key |
|---|---|---|---|
| Primary languages | Java, Python, Go, Node, Scala (job listings); Python for open source tools | Medium | capital-one-backend-job-2026; capital-one-bank-modernization-job-2025 |
| Main frameworks | Spring (listing title); AWS Lambda serverless at large scale | Medium (Spring); Strong (Lambda) | capital-one-backend-job-2026; capital-one-serverless-scale-nd |
| Primary OLTP store(s) | Mainframe core (2017); DynamoDB as read-only transaction store; "open source RDBMS and NoSQL", RDS and DynamoDB in listings | Strong (2017); Medium (current) | capital-one-serverless-transactions-2017; capital-one-backend-job-2026; capital-one-aws-case-study-nd |
| Service-layer persistence | No public source found | None | |
| Money / ledger model | Card ledger at TSYS; certain banking systems at FIS; internal model not public | Strong | capital-one-10k-2023 |
| Messaging / streaming | Kafka (listings, CDC post); SNS; Kinesis and Flink posts | Strong (blog); Medium (listings) | capital-one-cdc-2021; capital-one-backend-job-2026; capital-one-aws-case-study-nd |
| Infrastructure | Public cloud, AWS; last data center closed 2020 | Strong | capital-one-serverless-scale-nd; capital-one-10k-2023 |
| Scaling approach | Serverless (Lambda) plus read offload from mainframe to DynamoDB; multi-region on AWS | Strong | capital-one-serverless-transactions-2017; capital-one-cloud-migration-2024 |
| Build vs buy (core) | Buy: TSYS (card processing), FIS (certain banking systems); new core platform vendor not named | Strong (TSYS, FIS); Medium (new core) | capital-one-10k-2023; capital-one-bank-modernization-job-2025 |
| Notable open source | Cloud Custodian (donated to CNCF 2020), DataProfiler, datacompy | Strong | capital-one-cloud-custodian-cncf-2020; capital-one-github-org-2026 |

## Languages and frameworks

- A 2026 back-end listing (Marketing and Messaging organization) says engineers "Utilize programming languages like Java, Python, SQL, Node, Go, and Scala" and work with "Container Orchestration services including Docker and Kubernetes"; its title names "Java, Spring, Kafka, CI/CD, AI tools, Glue, RDS, DynamoDB" (capital-one-backend-job-2026, Medium).
- The Bank Modernization architect listing requires "at least one of the following programming languages: Java, Python, or Node.js" (capital-one-bank-modernization-job-2025, Medium).
- Capital One runs "thousands of accounts, and in those accounts, we have tens of thousands of Lambda functions" (capital-one-serverless-scale-nd).
- Its open source is mostly Python data and governance tooling: Cloud Custodian, DataProfiler, datacompy, locopy (capital-one-github-org-2026).

## The money layer (ledger, balances, payments)

- The 10-K names the vendors: "Total System Services LLC ("TSYS") for consumer and commercial credit card processing services for our North American and U.K. portfolios and Fidelity Information Services ("FIS") for certain of our banking systems" (capital-one-10k-2023, Strong).
- In 2017 the core was a mainframe: "Many large financial institutions rely on monolithic, legacy mainframe systems as their core banking platforms." The cloud system was "fed by the mainframe in batch and in near real-time modes", with "DynamoDB as the read-only datastore" (capital-one-serverless-transactions-2017, Strong, 2017).
- A 2025 listing describes "designing services at the heart of our new core banking platform", "client onboarding to the modern core", and migrating clients to "a core agnostic interface that can abstract away the clients from the underlying systems of record" (capital-one-bank-modernization-job-2025, Medium). The vendor or build choice for that new core is not stated.
- No public source found on double-entry, immutability or event sourcing in Capital One's own ledgers.

## Service-layer persistence and databases

- The AWS case study names Amazon RDS and Amazon DynamoDB among the services used (capital-one-aws-case-study-nd, Medium).
- "Loading billions of transactional records into DynamoDB" for the read path (capital-one-serverless-transactions-2017).
- Listings ask for "Open Source RDBMS and NoSQL databases" (capital-one-backend-job-2026).
- A 2025 post on testing event-driven systems "Uses Kafka or Amazon MSK as central message bus" with "DynamoDB, S3 or Elasticsearch used for storage", but presents this as "a sample EDA setup used for performance benchmarking", not as a named production system (capital-one-eda-testing-2025).
- No public source found on ORM vs SQL-first choices.

## Scale

- "close to 80% of the traffic was related to reading transactions", which is why reads were moved off the mainframe (capital-one-serverless-transactions-2017, 2017).
- Eight on-premises data centers exited; development environment build time dropped "from 3 months to minutes"; disaster recovery time cut 70% in tests (capital-one-aws-case-study-nd, Medium, vendor-reported).
- About 52,600 employees at 2024-12-31 (capital-one-10k-2024).

## Build vs buy

- The 10-K states the policy: "we may either develop such capabilities internally or rely on third-party service providers who have the ability to deliver technology that is of higher quality, lower cost, or both." (capital-one-10k-2023).
- Buy: AWS for infrastructure, TSYS for card processing, FIS for certain banking systems (capital-one-10k-2023).
- Build: cloud governance tooling (Cloud Custodian, launched 2016) and a serverless application estate (capital-one-cloud-custodian-cncf-2020; capital-one-serverless-scale-nd).
- Open source: Cloud Custodian "began as a Capital One owned project" and was contributed to the CNCF in 2020 because "its future growth and optimal governance would be best served under an open source foundation like the CNCF" (capital-one-cloud-custodian-cncf-2020). It is now a CNCF incubating project (capital-one-cloud-custodian-repo-2016).

## Correctness (idempotency, reconciliation, audit)

- The AWS case study reports a 50% reduction in "transaction errors" and critical incident resolution time (capital-one-aws-case-study-nd, Medium, vendor-reported; no definition of transaction errors given).
- The 2021 CDC post recommends Kafka for event sourcing: "Kafka is a great choice for Event Sourcing implementations as it is persistent." (capital-one-cdc-2021). It is written as general guidance, not as a description of a named Capital One system.
- No public source found on idempotency or reconciliation in Capital One's payment or deposit systems.

## Changes over time (migrations and reasons)

- 2012: transformation starts; eight-year migration to AWS (capital-one-aws-case-study-nd).
- 2016: Cloud Custodian launched (capital-one-cloud-custodian-cncf-2020).
- 2017: mainframe core with read offload to DynamoDB and Lambda (capital-one-serverless-transactions-2017).
- 2020: "In 2020, we closed our last remaining data center to go all-in on the cloud." (capital-one-serverless-scale-nd). Cloud Custodian donated to CNCF in 2020-08 (capital-one-cloud-custodian-cncf-2020).
- 2021 to 2025: moves from batch toward real-time with CDC and Kafka (capital-one-cdc-2021); Bank Modernization program migrating clients to a new core behind a GraphQL layer (capital-one-bank-modernization-job-2025).

## Stated reasons (verbatim quotes)

> "Instantly provisioned infrastructure at near unlimited scale" (capital-one-cloud-migration-2024, 2024-05)

> "Third party providers can realize economies of scale that we could not realize on our own." (capital-one-cloud-migration-2024, 2024-05)

> "If one region were to go down, we can stand up in another region on AWS." (capital-one-cloud-migration-2024, 2024-05)

> "Governance and automation should be implemented early." (capital-one-cloud-migration-2024, 2024-05)

> "Going all in on the cloud has enabled both instant provisioning of infrastructure and rapid innovation." (Chris Nims, Capital One, in capital-one-aws-case-study-nd)

> "Cost effective (cheaper than mainframe per transaction)" (capital-one-serverless-transactions-2017, 2017-11)

> "we may either develop such capabilities internally or rely on third-party service providers who have the ability to deliver technology that is of higher quality, lower cost, or both." (capital-one-10k-2023, filed 2024-02)

## Open questions

- Does Capital One still run a mainframe after the 2020 data center exit, and where? No source read says. A search snippet of an American Banker piece on Citizens implies Capital One did not move its whole mainframe to cloud. Unverified.
- Which platform is the "new core banking platform" in the Bank Modernization program (in-house, FIS, or another vendor)? Not stated.
- Effect of the Discover acquisition (2025) on processing: search snippets say the FY2025 10-K mentions legacy Discover businesses running on data centers and third-party vendors. The FY2025 10-K fetch returned only XBRL metadata (capital-one-10k-2025, read = no), so this is unverified.
- Databases behind deposits and card authorization: no public source found.

## System architecture

Caveat: Capital One publishes team-level posts, not an end-to-end description of its payment path. Each item below names the system it comes from.

### Money path
1. Card processing and core banking are bought: TSYS for consumer and commercial card processing in North America and the UK, and FIS for "certain of our banking systems" (capital-one-10k-2023).
2. Transaction read path (2017). The mainframe stays the system of record and feeds a cloud read store "in batch and in near real-time modes": Lambda functions detect transaction files from the mainframe, track file state, ingest into DynamoDB, and DynamoDB serves as "the read-only datastore" behind a new cloud "getTransactions API" (capital-one-serverless-transactions-2017, 2017).
3. Virtual card numbers (2021). The team's stack "runs in an active-active configuration in both East and West AWS regions" and moved from PostgreSQL to DynamoDB global tables (capital-one-dynamodb-resiliency-2021).
4. Check clearing. The check clearing application runs on AWS and "uses AWS Step Functions to orchestrate how workloads are processed by AWS Lambda", with check files in Amazon S3; "analysts need to manually review a small but consistent portion of checks before the close of each business day" (capital-one-check-step-functions-nd, Medium, vendor case study).
5. New core. A 2025 listing describes migrating clients to "a core agnostic interface that can abstract away the clients from the underlying systems of record" (capital-one-bank-modernization-job-2025, Medium).
6. Card authorization flow, the deposit ledger and connections to card networks, ACH or Fedwire: No public source found.

### Orchestration
- Read/write split (2017): "A Command Query Responsibility Segregation pattern is an approach where applications maintain two different data models", which "raises the likelihood of using eventual consistency" (capital-one-serverless-transactions-2017, 2017).
- Check clearing uses Step Functions Distributed Map, launching "25 times the number of concurrent workflows" instead of batches of 40, and "the automated retry feature of AWS Step Functions" to avoid throttling (capital-one-check-step-functions-nd, Medium).
- Sagas, TCC or a workflow engine for card or deposit payments: No public source found.

### Deployment topology
- All public cloud: the last data center closed in 2020 (capital-one-serverless-scale-nd); the stated reason is "If one region were to go down, we can stand up in another region on AWS. If a data center goes down, there's no alternative." (capital-one-cloud-migration-2024).
- Active-active example (virtual card numbers): failover across East and West regions was "nearly instantaneous" except PostgreSQL, where promoting the cross-region read replica "takes ten to fifteen minutes"; DynamoDB global tables cut "application failover time by 99%" (capital-one-dynamodb-resiliency-2021).
- Active-passive example (2018, a Kubernetes platform team): "our first implementation of supporting multi-region deployments was meant to be active/passive", deploying to us-east-1 and us-west-2, with "active/active" as a later goal (capital-one-multi-region-terraform-2018, 2018).
- Tiers: an engineering post defines active, active-passive and active-active availability and says each project picks its level (capital-one-resiliency-2018, 2018).
- An enterprise-wide standard (number of regions, RTO and RPO per tier): No public source found.

### Platform layer
- Serverless at scale: "tens of thousands of Lambda functions" across "thousands of accounts" (capital-one-serverless-scale-nd).
- Kubernetes clusters provisioned with Terraform per region and environment (capital-one-multi-region-terraform-2018, 2018); Docker and Kubernetes appear in a 2026 listing (capital-one-backend-job-2026, Medium).
- Standards: "RESTful APIs, microservices and building on open source foundations" (capital-one-cloud-migration-2024).
- RPC framework, service mesh, monorepo or a shared service chassis: No public source found.

### Data platform
- Change data capture (guidance, not a named system): CDC tools "read this transaction log and provide interfaces to stream out the transactions as they happen to stream technologies such as Kafka"; the author recommends CDC for existing applications and, for new ones, having the microservice publish events instead (capital-one-cdc-2021).
- 2017 read store sync: "Creating a messaging infrastructure to keep transactions available on the mainframe and in our cloud-based system in sync near real-time" was a stated problem to solve (capital-one-serverless-transactions-2017, 2017).
- DynamoDB is "usually a poor choice for reporting databases", so data moves to a relational database or warehouse via streams or scheduled transfers (capital-one-dynamodb-resiliency-2021).
- The enterprise warehouse (Snowflake appears in secondary sources only, not read) and reconciliation systems: No public source found.

### Published architecture diagrams
- https://www.capitalone.com/tech/cloud/serverless-transactions-serve-customers/ : "a logical view of how the read traffic across all channels migrates to the new destination serverless architecture" (mainframe to Lambda and DynamoDB). (capital-one-serverless-transactions-2017)
- https://www.capitalone.com/tech/software-engineering/batch-to-real-time-with-change-data-capture/ : diagrams of CDC streaming a producer database to Kafka, event sourcing replay, a microservice publishing to Kafka, AWS DMS, and Debezium with Kafka Connect. (capital-one-cdc-2021)
- https://www.capitalone.com/tech/software-engineering/architecting-for-resiliency/ : region A to region B failover states for active-passive. (capital-one-resiliency-2018)
- https://www.capitalone.com/tech/software-engineering/comparing-dynamodb-and-aurora-global-database-and-aurora-multi-master/ : table of pros and cons for DynamoDB, Aurora Global Database and Aurora Multi-Master. (capital-one-dynamodb-resiliency-2021)

### Stated architectural principles (verbatim)
> "Resiliency has to be planned and built into all levels of the stack and application and one of the most challenging layers to address is the database." (capital-one-dynamodb-resiliency-2021, 2021-02)

> "There are no failovers for the database because the application writes to the database in its region and the data is replicated by AWS keeping the regions in sync." (capital-one-dynamodb-resiliency-2021, 2021-02)

> "Every project has unique use cases and requirements, therefore different projects will have their own necessary levels of availability." (capital-one-resiliency-2018, 2018-09)

> "Introducing distributed patterns, e.g. utilizing Kafka, creates complexity with asynchrony and eventual consistency." (capital-one-resiliency-2018, 2018-09)

> "We needed to move to an agile model for delivering software and insist on modern architectural standards like RESTful APIs, microservices and building on open source foundations" (capital-one-cloud-migration-2024, 2024-05)

## Sources

| key | title | publisher | date | url | type | evidence | read |
|---|---|---|---|---|---|---|---|
| capital-one-10k-2023 | Form 10-K for fiscal year 2023 (Technology and Intellectual Property, Technology/Systems) | Capital One via SEC EDGAR | 2024-02 | https://www.sec.gov/Archives/edgar/data/927628/000092762824000094/cof-20231231.htm | filing | Strong | partial |
| capital-one-10k-2024 | Form 10-K for fiscal year 2024 (Supervision and Regulation, Human Capital) | Capital One via SEC EDGAR | 2025-02 | https://www.sec.gov/Archives/edgar/data/927628/000092762825000092/cof-20241231.htm | filing | Strong | partial |
| capital-one-cloud-migration-2024 | How Capital One migrated to the cloud: Lessons from an 8-year journey | Capital One Software blog | 2024-05 | https://capitalonesoftware.com/blog/cloud-migration-journey | engineering-blog | Strong | yes |
| capital-one-serverless-scale-nd | Serverless at Scale (Capital One Tech) | Capital One | n.d. | https://www.capitalone.com/tech/apis-behind-customer-rewards | engineering-blog | Strong | yes |
| capital-one-serverless-transactions-2017 | Fintech: How serverless transactions better serve customers | Capital One Tech | 2017-11 | https://www.capitalone.com/tech/cloud/serverless-transactions-serve-customers/ | engineering-blog | Strong | yes |
| capital-one-cdc-2021 | The journey from batch to real-time with change data capture | Capital One Tech | 2021-03 | https://capitalone.com/tech/software-engineering/batch-to-real-time-with-change-data-capture | engineering-blog | Strong | yes |
| capital-one-eda-testing-2025 | Event-driven architecture performance testing | Capital One Tech | 2025-08 | https://www.capitalone.com/tech/software-engineering/event-driven-architecture-performance-testing/ | engineering-blog | Strong | yes |
| capital-one-cloud-custodian-cncf-2020 | Capital One contributes Cloud Custodian to CNCF | Capital One Tech | 2020-08 | https://www.capitalone.com/tech/cloud/cloud-custodian-cncf-donation/ | engineering-blog | Strong | yes |
| capital-one-cloud-custodian-repo-2016 | cloud-custodian/cloud-custodian repository and README | Cloud Custodian (CNCF, GitHub) | 2016-03 | https://github.com/cloud-custodian/cloud-custodian | repo | Strong | yes |
| capital-one-github-org-2026 | capitalone GitHub organization repository list | Capital One (GitHub) | 2026-11 | https://github.com/capitalone | repo | Strong | yes |
| capital-one-aws-case-study-nd | Capital One Completes Migration from Data Centers to AWS, Becomes First US Bank to Announce Going All In on the Cloud | Amazon Web Services | n.d. | https://aws.amazon.com/solutions/case-studies/capital-one-all-in-on-aws/ | press | Medium | yes |
| capital-one-backend-job-2026 | Senior Lead Software Engineer, Back End (Java, Spring, Kafka, CI/CD, AI tools, Glue, RDS, DynamoDB) | Capital One via AnitaB.org job board | 2026-08 | https://jobs.anitab.org/companies/capital-one/jobs/91612492-senior-lead-software-engineer-back-end-java-spring-kafka-ci-cd-ai-tools-glue-rds-dynamodb | job-listing | Medium | yes |
| capital-one-bank-modernization-job-2025 | Distinguished Engineer/Architect, Bank Modernization | Capital One via Built In | 2025-06 | https://www.builtinla.com/job/distinguished-engineerarchitect-bank-modernization/4414548 | job-listing | Medium | yes |
| capital-one-10k-2025 | Form 10-K for fiscal year 2025 | Capital One via SEC EDGAR | 2026-02 | https://www.sec.gov/Archives/edgar/data/927628/000092762826000024/cof-20251231.htm | filing | Strong | no |
| capital-one-dynamodb-resiliency-2021 | Moving to DynamoDB to increase application resiliency (Kelly Jo Brown) | Capital One Tech | 2021-02 | https://www.capitalone.com/tech/software-engineering/comparing-dynamodb-and-aurora-global-database-and-aurora-multi-master/ | engineering-blog | Strong | yes |
| capital-one-resiliency-2018 | Architecting for resiliency during cloud migration (Steven Dang; older than 5 years) | Capital One Tech | 2018-09 | https://www.capitalone.com/tech/software-engineering/architecting-for-resiliency/ | engineering-blog | Strong | yes |
| capital-one-multi-region-terraform-2018 | Multi-Region deployments with Terraform (Chris Pisano; older than 5 years) | Capital One Tech | 2018-10 | https://www.capitalone.com/tech/software-engineering/multi-region-deployments-with-terraform-kubernetes/ | engineering-blog | Strong | yes |
| capital-one-check-step-functions-nd | Processing Checks Up to 80% Faster Using AWS Step Functions Distributed Map with Capital One | Amazon Web Services | n.d. | https://aws.amazon.com/solutions/case-studies/capital-one-distributed-map/ | press | Medium | yes |
