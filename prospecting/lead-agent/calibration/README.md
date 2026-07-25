# Prospecting Calibration

Calibration measures accepted operator leads per bounded unit of evidence and
Firecrawl credit. It does not reward scraped rows or search volume.

## Current status

The first 10 unique emitted leads have been reviewed:

- 8 accepted
- 2 rejected
- precision: 80%
- initial precision threshold: passed

The latest bounded architecture used zero Firecrawl credits. Scheduled operation may
proceed only with `DRY_RUN=true`. Every discovered lead still requires human review,
and automatic outreach remains prohibited.

## Gate

Before a calibration run:

```bash
uv run --no-project python -m unittest discover -s tests -v
uv run --no-project python scripts/submit_batch.py out/latest.json
```

The second command must report `"dry_run": true` and `"sent": 0`. The existing
`sent_leads` count must remain unchanged.

Existing scheduling must remain dry-run only. Do not create or modify a job without
separate human authorization.

## Fixed run bounds

Use `config/research-budget.json`:

- at most 15 search calls
- at most 15 Firecrawl extractions
- at most 25 estimated Firecrawl credits
- at most 30 screened candidates
- at most 30 evidence pages
- at most 5 qualified leads

Run:

```bash
uv run --no-project python scripts/run_research.py
```

Prefer direct Acquiring Minds harvesting and substantive operator interviews. Do not
diversify sources artificially. If the budget produces fewer than two leads, stop
and report that outcome without widening the bounds.

## Review

`out/latest.json` is temporary runtime output, not the durable review record. A human
reviews each emitted lead, checks its cited evidence, then appends one verdict to
`reviews.jsonl` with:

- verdict and priority
- concise rationale
- primary source
- review timestamp
- calibration sequence

The agent must not invent or append a human verdict.

## Success metrics

The lead-quality threshold remains at least 7 accepted leads among the first 10
emitted leads. For the bounded calibration, target:

- at least two plausible qualified leads
- no more than 25 estimated Firecrawl credits
- no duplicate extractions
- no generic press-release false positives
- all submission attempts dry-run with zero leads marked sent

Inspect `out/run-report-<run_id>.json` for:

- search calls by provider
- index pages and candidates
- duplicate and pre-extraction rejection counts
- local versus Firecrawl extraction success
- evidence pages and qualified leads
- rejection/error breakdowns
- yield per search, evidence page, and estimated Firecrawl credit

Never delete earlier calibration batches or `reviews.jsonl`.
