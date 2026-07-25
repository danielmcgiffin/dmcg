# SystemsCraft Lead Research Project

This directory is the durable working state for transitioned-owner prospecting.

## Required pipeline

Run exactly these phases:

1. Harvest structured source indexes or execute an explicitly supplied cheap search.
2. Pre-screen metadata deterministically.
3. Deduplicate against `state/leads.db`.
4. Extract survivors through ordinary HTTP, local HTML-to-text, an already configured
   basic reader, then Firecrawl only as the final fallback.
5. Give concise evidence packets to Hermes for adjudication.
6. Write the compatible batch atomically to `out/latest.json`.
7. Run `uv run --no-project python scripts/submit_batch.py out/latest.json`.
8. Require human review. Do not append a verdict to the calibration ledger on the
   human's behalf.

Hermes judges gathered evidence. It must not wander the web or rediscover facts that
the deterministic phases already collected.

Load `calibration/reviews.jsonl` on every run. Suppress both accepted and rejected
reviewed identities before extraction and qualification. A reviewed identity may
re-enter only through an explicitly recorded material-trigger flag; changed metadata
or a different source URL is not sufficient.

## Safety

- `DRY_RUN=true` is mandatory. The runner must refuse submission otherwise.
- Never create or modify cron jobs.
- Never send outreach or production deliveries.
- Never expose n8n or change firewall, tunnel, webhook, or delivery settings.
- Never alter or reset `state/leads.db`.
- Never delete prior output or calibration records.
- Never write credentials, authorization headers, or webhook tokens to output.
- Never mark a lead sent. `scripts/submit_batch.py` owns delivery state.
- Keep runtime files under the ignored `state/` and `out/` directories.

## Bounds

`config/research-budget.json` is authoritative. Stop cleanly at any limit; do not
continue searching because a prior result yielded no lead.

Never issue a follow-up search merely because the prior search produced no qualified
lead. A follow-up search requires a specific named person, business, or unresolved
fact discovered in the prior result.

Press releases and generic transaction pages are discovery-only. Do not qualify from
their transaction language. Do not attempt LinkedIn extraction.

## Commands

Run checks:

```bash
uv run --no-project python -m unittest discover -s tests -v
```

Run one bounded calibration only after checks pass:

```bash
uv run --no-project python scripts/run_research.py
```

Inspect the machine report in `out/run-report-<run_id>.json`, then review
`out/latest.json` manually.
