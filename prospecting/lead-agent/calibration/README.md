# Prospecting Calibration

The lead-quality threshold is at least 7 accepted leads among the first 10 emitted leads.

The target research yield is at least 2 qualified leads per 25 search queries.

Cron remains disabled until 10 emitted leads have been manually reviewed.

After manual review, append every emitted lead to `reviews.jsonl` with its verdict, priority, rationale, source, review timestamp, and calibration sequence.

`out/latest.json` is temporary runtime output. It is not the permanent calibration review record; `reviews.jsonl` is.
