# SystemsCraft Lead Research Project

This directory is the durable working state for the transitioned-owner lead agent.

Rules:
- Run one bounded cycle per invocation.
- Use the attached `transitioned-owner-leads` skill.
- Read `state/query_history.jsonl` before choosing queries.
- Do not alter `scripts/submit_batch.py`.
- Write the final batch atomically to `out/latest.json`.
- Then execute `uv run --no-project python scripts/submit_batch.py out/latest.json`.
- A run is successful only when the script returns exit code 0.
- Do not mark a lead as sent yourself. The script owns deduplication and transmission state.
- Never place API keys or webhook secrets in output files.
