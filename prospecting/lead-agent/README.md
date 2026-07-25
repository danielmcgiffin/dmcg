# SystemsCraft Transitioned-Owner Prospecting

This project finds recently transitioned SMB owner-operators without paying
Firecrawl to perform broad discovery. Hermes is a bounded qualification judge, not
an autonomous web researcher.

## Architecture

```text
structured index or explicit cheap search
  -> deterministic metadata screening
  -> persistent URL deduplication
  -> ordinary HTTP + local main-text extraction
  -> configured basic reader, if one already exists
  -> one Firecrawl fallback per unchanged URL
  -> concise evidence packets
  -> Hermes qualification without web tools
  -> out/latest.json
  -> submit_batch.py with DRY_RUN=true
  -> human review
```

The existing n8n payload schema, `out/latest.json`, `scripts/submit_batch.py`, and
calibration ledger remain compatible. No cron job is part of this design.

## Components

- `scripts/harvest_candidates.py`: harvests stable listing pages and optionally runs
  explicit Brave queries.
- `scripts/extract_candidate.py`: extracts one already screened URL through the
  provider waterfall.
- `scripts/run_research.py`: executes phases A-G and writes the batch and run report.
- `scripts/pipeline_core.py`: URL state, screening, extraction, budgets, and reports.
- `scripts/qualify_packets.py`: calls Hermes with the web toolset disabled.
- `config/sources.json`: structured source adapters and borderline-queue setting.
- `config/research-budget.json`: hard per-run limits.
- `state/leads.db`: existing delivery state plus additive candidate and run tables.

Runtime artifacts in `state/` and `out/` are ignored by Git. Existing files are
never reset or deleted.

## Discovery and extraction separation

Hermes v0.18.2 supports `web.search_backend` and `web.extract_backend`. Its Brave
provider is named `brave-free` and reads `BRAVE_SEARCH_API_KEY`; its Firecrawl
provider is named `firecrawl`.

When a Brave credential is available, configure Hermes with:

```bash
hermes config set web.search_backend brave-free
hermes config set web.extract_backend firecrawl
```

Then use one named-entity query to verify search and one known URL to verify
extraction. Do not change the shared working Firecrawl backend when Brave is absent.

Brave searches are never generated automatically. Pass a specific query explicitly:

```bash
uv run --no-project python scripts/harvest_candidates.py \
  --search-query '"Named Owner" "Named Business" post-acquisition'
```

The default run needs no search credential because it begins with structured source
indexes.

## Source priorities

Primary evidence sources:

1. Acquiring Minds and detailed operator post-mortems
2. Operator podcasts and interviews
3. Family-business succession publications
4. Trade publications with substantive operator stories
5. Company or holdco pages with concrete operating details

PR Newswire, Business Wire, GlobeNewswire, generic deal announcements, and generic
Searchfunder result pages are secondary discovery-only sources. A press release can
name a person or business, but qualification requires a substantive interview,
operating update, company page, or post-acquisition account. LinkedIn extraction is
not supported.

Each adapter uses host/path rules plus anchor/context fallbacks rather than a single
fragile CSS selector. One broken adapter is recorded and skipped without aborting the
run.

## URL state

The additive `candidate_urls` table records:

- normalized and original URL
- source family, title, snippet, and publication date
- discovery and last-seen timestamps
- screening and rejection state
- extraction status, provider, timestamp, text hash, and cached text
- the metadata version that consumed a Firecrawl attempt
- associated owner/business/domain and qualification state
- an explicitly recorded reviewed-lead reopen trigger, when authorized

Tracking parameters and fragments do not create new candidates. An unchanged URL is
not re-extracted or requalified. It becomes eligible only after a new trigger appears
in changed metadata, extracted content changes, or an explicit reset is performed.

Every run also loads `calibration/reviews.jsonl`. Both accepted and rejected reviews
are suppressed before extraction when the normalized source URL or reviewed
owner/business identity matches, including identity matches on a different URL.
Reviewed leads use a stricter rule than ordinary cached URLs: changed metadata alone
does not reopen them. A concrete material trigger must be explicitly recorded with
`flag_material_review_trigger`; the approval is consumed after one re-entry.

## Screening

Metadata normally needs both a completed-transition signal and an operating
hypothesis. High-quality operator sources with a transition signal may enter the
configurable borderline queue. Clear intermediaries, passive investors, generic
fund announcements, unclosed deals, retained sellers, generic appointed executives,
stale transitions, and press-release-only pages are rejected before paid extraction.

Screening is a heuristic. Hermes makes the final evidence-based decision.

## Extraction waterfall

For every survivor:

1. Check `robots.txt`, then make a bounded HTTP request with a normal user agent.
2. Extract `<article>` or `<main>` content, with a body fallback.
3. Reject CAPTCHA, access-denied, login, paywall, unavailable, and link-index shells.
4. Use `BASIC_READER_URL` only when it was explicitly configured in advance.
5. Use Firecrawl once as the final fallback, only inside both extraction and estimated
   credit budgets.

A clear Firecrawl failure is persisted for that metadata version and is not retried.
No second paid dependency is installed or selected automatically.

## Budgets and reports

Default calibration limits are:

```json
{
  "max_search_calls": 15,
  "max_firecrawl_extractions": 15,
  "max_firecrawl_credits_estimated": 25,
  "max_candidates_screened": 30,
  "max_evidence_pages": 30,
  "max_qualified_leads": 5
}
```

Every research run writes `out/run-report-<run_id>.json` with provider counts,
discovery/deduplication/screening totals, local and Firecrawl extraction results,
estimated credits, rejection/error breakdowns, and yields per search, evidence page,
and estimated Firecrawl credit. Review-cache reporting separates accepted and
rejected suppressions and counts explicitly reopened material triggers. Reports
contain no credentials.

## Run safely

Confirm `.env` contains `DRY_RUN=true`, then:

```bash
uv run --no-project python -m unittest discover -s tests -v
uv run --no-project python scripts/run_research.py
```

The runner writes `out/latest.json` atomically and then executes:

```bash
uv run --no-project python scripts/submit_batch.py out/latest.json
```

It also forces the child submission environment to dry-run and requires the
submitter to report `"sent": 0`. Human review remains mandatory before any later
production decision.

Success is lead quality and bounded cost: at least two plausible leads in the final
calibration, no more than 25 estimated Firecrawl credits, no duplicate extraction,
and no generic press-release false positives. Reaching a budget with fewer leads is
an honest stop, not permission to widen the search.
