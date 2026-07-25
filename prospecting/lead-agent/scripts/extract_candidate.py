#!/usr/bin/env python3
"""Extract one pre-screened candidate through the bounded provider waterfall."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from pipeline_core import (
    DEFAULT_BUDGET_PATH,
    DEFAULT_DB_PATH,
    BudgetTracker,
    atomic_write_json,
    connect_state,
    extract_candidate,
    finalize_report,
    load_runtime_environment,
    new_report,
    normalize_url,
    utc_now,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH)
    parser.add_argument("--budget", type=Path, default=DEFAULT_BUDGET_PATH)
    parser.add_argument("--timeout", type=int, default=20)
    parser.add_argument("--run-id", default=f"extract-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}")
    parser.add_argument("--report", type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    load_runtime_environment()
    budget = BudgetTracker.from_path(args.budget)
    report = new_report(args.run_id, utc_now(), budget)
    report["phase"] = "extract"
    conn = connect_state(args.db)
    try:
        normalized = normalize_url(args.url)
        candidate = conn.execute(
            "SELECT * FROM candidate_urls WHERE normalized_url = ?", (normalized,)
        ).fetchone()
        if candidate is None:
            raise SystemExit(f"Candidate is not in state: {normalized}")
        if candidate["screening_status"] not in {"passed", "borderline"}:
            raise SystemExit(
                f"Candidate must pass screening before extraction; "
                f"status={candidate['screening_status']}"
            )
        result = extract_candidate(
            conn,
            candidate,
            run_id=args.run_id,
            budget=budget,
            report=report,
            timeout=args.timeout,
        )
        report["phase"] = "complete"
        finalize_report(report, budget)
        if args.report:
            atomic_write_json(args.report, report)
        print(
            json.dumps(
                {
                    "url": normalized,
                    "success": result.success,
                    "status": result.status,
                    "provider": result.provider,
                    "content_hash": result.content_hash,
                    "from_cache": result.from_cache,
                }
            )
        )
        return 0 if result.success else 1
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
