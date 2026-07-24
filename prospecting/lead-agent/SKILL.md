---
name: transitioned-owner-leads
description: Find and validate newly transitioned SMB owner-operators
version: 1.0.0
metadata:
  hermes:
    tags: [lead-research, eta, smb, operations]
    category: research
---

# SystemsCraft Transitioned-Owner Lead Research

## Mission

Find newly transitioned owner-operators who may need strategic operations and systematization support.

Do not collect generic transaction announcements. Find people who acquired, inherited, succeeded into, or were appointed to operate a small or midsized business and who have real operating responsibility.

Run one bounded research cycle per invocation. The external scheduler owns recurrence.

## Target person

Accept:
- Acquiring entrepreneur
- Search fund entrepreneur
- Self-funded searcher after close
- New owner-operator
- Family-business successor
- Second- or third-generation owner
- Newly appointed president or CEO after a transition
- Operating partner directly responsible for the acquired business
- General manager installed after an acquisition

The person must have meaningful responsibility for operating the business.

## Target company

Prioritize:
- 5–200 employees
- Roughly $1M–$50M revenue when verifiable
- Recurring or repeatable operational work
- Multiple crews, branches, roles, systems, or customer handoffs
- Founder-led or family-led history

Priority industries:
- HVAC, plumbing, electrical, landscaping, pest control
- Roofing, restoration, cleaning, facilities services
- Logistics, transportation, warehousing, distribution
- Light manufacturing, commercial contractors
- Property services, managed IT, B2B field services
- Professional services and family-owned industrial businesses

Do not reject another industry when the operational fit is strong.

## Recency

Normally accept transitions within the last 180 days.

An older transition qualifies only when there is a new trigger, such as:
- First-year reflection
- New location or add-on acquisition
- Major hiring push
- ERP, CRM, or system replacement
- Publicly stated operating problem
- Management-team buildout

## High-value signals

Transition:
- "I acquired"
- "we acquired"
- "closed on"
- "first 100 days"
- "first year as owner"
- "took over the family business"
- "second-generation owner"
- "third-generation owner"
- "ownership transition"
- "management transition"
- "search fund acquisition"
- "self-funded search"
- "entrepreneurship through acquisition"

Operational need:
- Previous owner remains involved
- Knowledge lives in one person's head
- Processes are undocumented
- Delegation problems
- Key-person dependence
- Manual spreadsheets
- Disconnected software
- Decisions escalate to the owner
- Scaling, hiring, branch expansion, or integration
- Lack of visibility or reporting
- Standardization or professionalization
- "drinking from a firehose"
- "tribal knowledge"
- "institutional knowledge"

## Anti-target

Reject:
- Brokers, M&A advisors, investment bankers
- SBA lenders, bankers, lawyers, accountants
- Recruiters and job postings
- Franchise sales pitches
- PE or fund announcements without a named operator
- Passive investors
- Consultants commenting on another person's acquisition
- Startup funding announcements
- Real-estate transactions
- Unclosed or merely proposed acquisitions
- Courses, communities, and service providers selling to searchers
- Companies clearly outside the target, unless an SMB subsidiary has a named operator

An intermediary may reveal a lead, but the emitted lead must be the operator.

## Sources

Use:
- Search engines
- Public LinkedIn posts and profiles indexed by search engines
- Searchfunder and public ETA ecosystem pages
- Acquiring Minds and ETA podcasts
- Search fund and holdco portfolio pages
- Company newsrooms
- Local business journals and newspapers
- Trade publications and industry associations
- Chamber announcements
- Public podcast descriptions and transcripts

Respect login restrictions, robots.txt, rate limits, paywalls, and technical access controls. Do not bypass CAPTCHAs or authentication.

## Source access and fallback

- Prefer structured `web_search` and `web_extract` tools when available. Do not use browser navigation for search-engine result pages unless no structured search tool is available.
- A search-results page is discovery, not an inspected source. Increment `sources_inspected` only after opening an underlying page that contains candidate evidence.
- When a search provider returns a CAPTCHA, consent wall, login wall, or block page, record one access error and stop using that provider for the rest of the run. Do not retry equivalent queries against the same blocked provider.
- Switch source families instead of increasing volume. Try at least three accessible source families within the existing cap before ending with no candidates, such as company newsrooms, holdco or search-fund portfolio pages, ETA podcast episode pages or transcripts, local business news, and trade publications.
- Open promising direct sources and corroborating pages individually. Never qualify from a search snippet alone.
- If access failures prevent a usable evidence sample, return zero leads honestly and identify the blocked providers and untried fallback source families. Do not describe blocked result pages as inspected sources.

## Search query rotation

Rotate phrases, industries, titles, recency terms, and source domains. Examples:
- site:linkedin.com/posts "I acquired" HVAC
- site:linkedin.com/posts "first 100 days" business owner
- site:linkedin.com/posts "took over the family business"
- site:searchfunder.com acquired landscaping
- site:acquiringminds.co plumbing acquisition
- "search fund acquisition" pest control
- "second-generation owner" logistics
- "new president" "family-owned" distributor
- "acquired business" "previous owner"
- "acquired company" integration
- "new owner" standardize
- "family business" "institutional knowledge"

Do not run the exact same query set every cycle. Check state/query_history.jsonl when present.

## Procedure

For each candidate:

1. Confirm a completed acquisition, succession, inheritance, or appointment.
2. Confirm the event date or publication date.
3. Confirm the named person is an owner or direct operator.
4. Verify the company, domain, industry, and location when possible.
5. Find explicit evidence of operational relevance. Do not invent pain.
6. Find only public professional contact paths.
7. Check state/leads.db or existing output for duplicates.
8. Score the lead.
9. Write the complete batch to out/latest.json.
10. Run:
   uv run --no-project python scripts/submit_batch.py out/latest.json
11. Return only a terse count of searched sources, qualified leads, sent leads, duplicates, and errors.

## Scoring

Transition recency, max 25:
- 0–30 days: 25
- 31–60 days: 20
- 61–120 days: 15
- 121–180 days: 10
- Older with a new trigger: 5

Operator certainty, max 20:
- Confirmed owner-operator or president: 20
- Confirmed CEO or general manager: 15
- Probable but not explicit: 5
- Passive investor or intermediary: reject

Operational need, max 25:
- Explicit operating pain or system problem: 25
- Clear integration or transition complexity: 20
- Growth, hiring, or location complexity: 15
- Structural fit only: 5

Company fit, max 20:
- Strong target industry and SMB size: 20
- Strong operational complexity in secondary industry: 15
- Size or industry uncertain: 5
- Clearly outside target: reject

Contactability, max 10:
- Professional email and LinkedIn: 10
- LinkedIn and company website: 7
- Company website only: 3
- No practical path: 0

Only emit scores of 55 or more.
- high: 80–100
- medium: 65–79
- low: 55–64

## Integrity rules

- Never invent facts, dates, titles, quotes, contact data, or transactions.
- Open the underlying source; do not rely on an AI search summary alone.
- Prefer first-party sources.
- Otherwise corroborate with two independent sources.
- Use null for unknown values.
- Do not fabricate revenue or employee estimates.
- Collect only public professional contact information.
- Keep source excerpts short.
- Distinguish fact from inference.

## Required JSON

Write a valid JSON object to out/latest.json:

{
  "run": {
    "run_id": "string",
    "started_at": "ISO-8601 timestamp",
    "completed_at": "ISO-8601 timestamp",
    "queries_run": 0,
    "sources_inspected": 0,
    "qualified_leads": 0
  },
  "leads": [
    {
      "owner_name": "string",
      "owner_title": "string or null",
      "linkedin_url": "string or null",
      "professional_email": "string or null",
      "business_name": "string",
      "business_domain": "string or null",
      "business_location": "string or null",
      "industry": "string",
      "transition_type": "acquired | inherited | succeeded | appointed_operator | other",
      "transition_date": "YYYY-MM-DD or null",
      "trigger_event": "concise factual summary",
      "operational_signal": "concise factual summary or null",
      "source_quote": "short supporting excerpt or null",
      "primary_source_url": "string",
      "supporting_source_urls": ["string"],
      "lead_score": 0,
      "lead_priority": "high | medium | low",
      "score_reason": "one-sentence explanation",
      "is_existing_lead": false,
      "discovered_at": "ISO-8601 timestamp"
    }
  ],
  "rejected_summary": {
    "duplicate": 0,
    "intermediary": 0,
    "too_old": 0,
    "unconfirmed_transition": 0,
    "no_operating_role": 0,
    "outside_target": 0,
    "insufficient_evidence": 0
  }
}

The file must parse with JSON.parse() and Python json.load().
