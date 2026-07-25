---
name: transitioned-owner-leads
description: Adjudicate bounded evidence packets for newly transitioned SMB owner-operators
version: 2.0.0
metadata:
  hermes:
    tags: [lead-research, eta, smb, operations, bounded-research]
    category: research
---

# SystemsCraft Transitioned-Owner Qualification

## Role

Qualify promising owner-operator candidates from evidence gathered by the local
pipeline. Do not autonomously wander the web. Do not rediscover facts already in a
packet. Never perform broad query rotation.

Run one bounded cycle per invocation. Recurrence, outreach, and production delivery
are outside this skill.

## Required phases

1. Phase A: run `scripts/harvest_candidates.py` to harvest new candidate URLs.
2. Phase B: pre-screen title, snippet, date, and source metadata locally.
3. Phase C: extract only survivors with the configured waterfall.
4. Phase D: receive concise evidence packets.
5. Phase E: qualify and score using only packet evidence.
6. Phase F: write the compatible batch to `out/latest.json`.
7. Phase G: run `uv run --no-project python scripts/submit_batch.py out/latest.json`.
8. Stop for human review.

`config/research-budget.json` is authoritative. Stop at any reached limit.

Never issue a follow-up search merely because the prior search produced no qualified
lead. A follow-up search requires a specific named person, business, or unresolved
fact discovered in the prior result.

## Evidence packet contract

Use only:

- candidate name, when known
- business name, when known
- source family
- transition or publication date
- title and snippet
- extracted evidence
- source URLs
- corroborating evidence
- known rejection flags

Do not ask Hermes to search for information already present. Never invent missing
facts, dates, titles, quotes, contact data, transactions, company size, or revenue.

## Target

Normally accept:

- an acquiring entrepreneur or self-funded searcher after close
- a new owner-operator
- a family-business successor
- a second- or third-generation owner

An appointed CEO, president, general manager, or operating partner qualifies only
with an explicit operational/transformation mandate, a concrete current constraint,
and plausible purchasing responsibility in a target-sized company.

Prioritize roughly 5-200 employees, $1M-$50M revenue when verifiable, repeatable
operations, multiple crews/branches/roles/handoffs, and founder- or family-led
histories. Strong industries include field services, facilities services, logistics,
distribution, light manufacturing, commercial contractors, managed IT, and other
operationally complex SMBs.

## Required evidence

Confirm:

1. a completed acquisition, inheritance, succession, or qualifying appointment
2. a named person with direct operating responsibility
3. a recent transition, normally within 180 days, or a specific newer trigger
4. a concrete operating condition rather than generic transaction or job language

High-value conditions include key-person dependence, undocumented knowledge,
manual/disconnected systems, owner escalation, inventory or scheduling problems,
reporting/visibility gaps, integration, hiring, branch expansion, turnaround, and
management-team buildout.

Generic duties such as "drive performance," "ensure continuity," "lead the company,"
or "oversee integration" do not establish operational need.

## Reject

- brokers, M&A advisors, investment bankers, lenders, bankers, lawyers, accountants
- recruiters, job postings, franchise sales, courses, consultants, and service
  providers commenting on someone else's acquisition
- passive investors and generic fund announcements
- startup funding and real-estate transactions
- unclosed or proposed acquisitions
- retained sellers or local presidents after a platform acquisition when they are
  not the purchasing operator
- generic appointed executives without a concrete constraint
- companies clearly outside the target profile
- stale transitions with no newer operating trigger
- unchanged URLs already extracted or qualified

Kyle Cooper / ACT Power Services is rejected: appointed professional CEO, generic
duties, no concrete constraint, and likely outside the target profile.

Bill Detillion / Superior Building Services is rejected: retained seller-president
after a platform acquisition rather than the likely integration buyer.

## Source policy

Primary evidence sources:

1. Acquiring Minds and detailed operator post-mortems
2. Operator podcasts and interviews
3. Family-business succession publications
4. Trade publications with substantive operator stories
5. Company or holdco pages containing concrete operating details

Secondary discovery-only sources:

- PR Newswire
- Business Wire
- GlobeNewswire
- generic transaction announcements
- generic Searchfunder result pages

Press releases may identify a person or business but normally must not be extracted
and qualified as evidence. Use cheap search only for a named candidate to find a
substantive interview, operating update, company page, or post-acquisition account.
Do not qualify from generic transaction language alone.

Do not attempt LinkedIn extraction when the configured extraction path does not
support it. Respect robots.txt, login restrictions, paywalls, CAPTCHAs, rate limits,
and technical controls.

## Scoring

Transition recency, maximum 25:

- 0-30 days: 25
- 31-60 days: 20
- 61-120 days: 15
- 121-180 days: 10
- older with a specific new trigger: 5

Operator certainty, maximum 20:

- confirmed owner-operator: 20
- confirmed qualifying operator: 15
- probable but not explicit: 5
- passive investor or intermediary: reject

Operational need, maximum 25:

- explicit operating pain or system problem: 25
- clear integration/transition complexity: 20
- growth, hiring, location, or management complexity: 15
- structural fit only: 5

Company fit, maximum 20:

- strong target industry and SMB size: 20
- strong complexity in another industry: 15
- size/industry uncertain: 5
- clearly outside target: reject

Public professional contactability, maximum 10:

- professional email plus public profile: 10
- public profile plus company website: 7
- company website only: 3
- no practical path: 0

Only emit scores of at least 55:

- high: 80-100
- medium: 65-79
- low: 55-64

## Integrity and output

Use null for unknown values. Keep source excerpts short. Distinguish fact from
inference. Collect only public professional contact paths. Do not include secrets.

Keep the existing `out/latest.json` schema documented in `README.md` and validated by
`scripts/submit_batch.py`. Never mark a lead sent. `DRY_RUN=true` and human review are
mandatory.
