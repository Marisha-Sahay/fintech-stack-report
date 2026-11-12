## Scope and method

The sample is 24 companies that move money at scale: payment processors, neobanks, consumer fintechs, five banks, and four platforms that run their own payment systems. Zalando, an online retailer, is included as a reference case for one data access pattern. Companies were chosen for size and for how much they publish about their engineering, which biases the sample (see Limitations).

The report has two parts. **Part I** covers system architecture: a reference architecture built from what these companies publish, profiles of the best-documented systems, how they are deployed for scale and resilience, and the languages and frameworks they are built in. **Part II** covers the six design decisions inside that architecture, from how money is recorded to how it is verified, followed by how companies migrated live systems and a set of design heuristics. Vendor selection, build-versus-buy, front-end stacks, analytics and security tooling are out of scope.

### How sources were graded

Every claim rests on a source that was opened and read, not on a search result. Each source carries one of three grades:

- **Strong:** the company's own engineering blog, conference talk, documentation, open-source code, or regulatory filing.
- **Medium:** the company's job listings, or material the company took part in, such as a vendor case study. These are labeled in the text wherever they carry a claim.
- **Weak:** third-party coverage. Used only to find stronger sources. No claim here rests on a Weak source alone.

In total, 412 sources were consulted. 303 of them are Strong, and 386 were read in full or in the relevant part. The [sources page](sources.html) lists every one, with its grade, its date, and whether it was read. Any source older than five years carries its year in the text, because designs change.

<!-- Decision for the author: disclose AI-assisted research. Suggested wording:
"Source discovery and first-pass reading were done with AI research assistants. Every cited source was opened and read, and its grade and date were recorded in a per-company research note. Those notes are public in the report's repository." -->
