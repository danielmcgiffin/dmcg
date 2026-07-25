#!/usr/bin/env python3
"""Run the bounded transitioned-owner pipeline from harvest through dry-run."""

from __future__ import annotations

import argparse
import json
import os
import sqlite3
import subprocess
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from harvest_candidates import harvest_all
from pipeline_core import (
    DEFAULT_BUDGET_PATH,
    DEFAULT_DB_PATH,
    DEFAULT_REVIEWS_PATH,
    DEFAULT_SOURCES_PATH,
    PROJECT_ENV_PATH,
    PROJECT_ROOT,
    BudgetExceeded,
    BudgetTracker,
    ReviewedLead,
    ScreeningDecision,
    atomic_write_json,
    candidate_packet,
    connect_state,
    extract_candidate,
    finalize_report,
    load_runtime_environment,
    load_reviewed_leads,
    match_reviewed_lead,
    new_report,
    normalize_url,
    persist_screening,
    record_error,
    record_event,
    rejection_counter,
    is_material_reopen_trigger,
    screen_metadata,
    utc_now,
)
from qualify_packets import qualify_with_hermes


STANDARD_REJECTIONS = {
    "duplicate": 0,
    "intermediary": 0,
    "too_old": 0,
    "unconfirmed_transition": 0,
    "no_operating_role": 0,
    "outside_target": 0,
    "insufficient_evidence": 0,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH)
    parser.add_argument("--sources", type=Path, default=DEFAULT_SOURCES_PATH)
    parser.add_argument("--budget", type=Path, default=DEFAULT_BUDGET_PATH)
    parser.add_argument("--reviews", type=Path, default=DEFAULT_REVIEWS_PATH)
    parser.add_argument("--output", type=Path, default=PROJECT_ROOT / "out" / "latest.json")
    parser.add_argument("--report", type=Path)
    parser.add_argument("--run-id")
    parser.add_argument("--search-query", action="append", default=[])
    parser.add_argument("--timeout", type=int, default=20)
    parser.add_argument("--hermes-timeout", type=int, default=300)
    parser.add_argument(
        "--qualifier",
        choices=("hermes", "none"),
        default="hermes",
        help="'none' writes an empty validation batch and is intended for checks only.",
    )
    parser.add_argument("--no-submit", action="store_true")
    return parser.parse_args()


def assert_project_dry_run() -> None:
    """Refuse to invoke the submitter unless project delivery is explicitly dry."""
    value = os.getenv("DRY_RUN", "").strip().lower()
    if value not in {"1", "true", "yes", "on"}:
        raise RuntimeError(
            f"{PROJECT_ENV_PATH} must explicitly keep DRY_RUN=true for research runs"
        )


def _screen_pending(
    conn: sqlite3.Connection,
    *,
    run_id: str,
    borderline_enabled: bool,
    budget: BudgetTracker,
    report: dict[str, Any],
) -> tuple[list[str], dict[str, ScreeningDecision]]:
    survivors: list[str] = []
    decisions: dict[str, ScreeningDecision] = {}
    rows = conn.execute(
        """
        SELECT * FROM candidate_urls
        WHERE screening_status = 'new'
        ORDER BY
          CASE source_family
            WHEN 'acquiring_minds' THEN 0
            WHEN 'family_business_alliance' THEN 1
            WHEN 'insead_eta_podcast' THEN 2
            ELSE 3
          END,
          publication_date DESC,
          first_discovered_at ASC
        """
    ).fetchall()
    for candidate in rows:
        try:
            budget.consume("candidates_screened")
        except BudgetExceeded:
            break
        decision = screen_metadata(
            candidate,
            borderline_enabled=borderline_enabled,
        )
        persist_screening(conn, candidate["normalized_url"], decision, run_id)
        decisions[candidate["normalized_url"]] = decision
        if decision.status in {"passed", "borderline"}:
            survivors.append(candidate["normalized_url"])
        else:
            report["candidates_rejected_before_extraction"] += 1
            rejection_counter(report, decision.reason)
    conn.commit()

    pending = conn.execute(
        """
        SELECT normalized_url FROM candidate_urls
        WHERE screening_status IN ('passed', 'borderline')
          AND (
            extraction_status = 'not_attempted'
            OR (
              extraction_status = 'success'
              AND qualification_status IS NULL
            )
          )
        ORDER BY
          CASE source_family
            WHEN 'acquiring_minds' THEN 0
            WHEN 'family_business_alliance' THEN 1
            WHEN 'insead_eta_podcast' THEN 2
            ELSE 3
          END,
          publication_date DESC,
          first_discovered_at ASC
        """
    ).fetchall()
    for row in pending:
        if row["normalized_url"] not in survivors:
            survivors.append(row["normalized_url"])
    return survivors, decisions


def _decision_for_existing(candidate: sqlite3.Row) -> ScreeningDecision:
    return screen_metadata(candidate, borderline_enabled=True)


def _suppress_previously_reviewed(
    conn: sqlite3.Connection,
    survivor_urls: list[str],
    reviewed_leads: list[ReviewedLead],
    *,
    run_id: str,
    report: dict[str, Any],
) -> list[str]:
    """Remove reviewed identities before any extraction or qualification."""
    survivors: list[str] = []
    for normalized in survivor_urls:
        candidate = conn.execute(
            "SELECT * FROM candidate_urls WHERE normalized_url = ?", (normalized,)
        ).fetchone()
        if candidate is None:
            continue
        reviewed = match_reviewed_lead(candidate, reviewed_leads)
        if reviewed is None:
            survivors.append(normalized)
            continue

        reopen_trigger = candidate["review_reopen_trigger"]
        if (
            candidate["review_reopen_approved"]
            and is_material_reopen_trigger(reopen_trigger)
        ):
            report["materially_new_trigger_reopened"] += 1
            conn.execute(
                """
                UPDATE candidate_urls
                SET review_reopen_approved = 0, rejection_reason = NULL
                WHERE normalized_url = ?
                """,
                (normalized,),
            )
            record_event(
                conn,
                normalized,
                "material_review_trigger_reopened",
                run_id,
                str(reopen_trigger),
            )
            survivors.append(normalized)
            continue

        report["previously_reviewed_suppressed"] += 1
        counter = (
            "previously_accepted_suppressed"
            if reviewed.verdict == "accept"
            else "previously_rejected_suppressed"
        )
        report[counter] += 1
        report["candidates_skipped_as_duplicates"] += 1
        rejection_counter(report, "previously_reviewed")
        conn.execute(
            """
            UPDATE candidate_urls
            SET screening_status = 'suppressed',
                rejection_reason = 'previously_reviewed'
            WHERE normalized_url = ?
            """,
            (normalized,),
        )
        record_event(
            conn,
            normalized,
            "previously_reviewed_suppressed",
            run_id,
            f"{reviewed.verdict}:sequence={reviewed.calibration_sequence}",
        )
    conn.commit()
    return survivors


def _extract_survivors(
    conn: sqlite3.Connection,
    survivor_urls: list[str],
    decisions: dict[str, ScreeningDecision],
    *,
    run_id: str,
    budget: BudgetTracker,
    report: dict[str, Any],
    timeout: int,
) -> tuple[list[dict[str, Any]], dict[str, sqlite3.Row]]:
    packets: list[dict[str, Any]] = []
    packet_rows: dict[str, sqlite3.Row] = {}
    for normalized in survivor_urls:
        if budget.stop_reason:
            break
        candidate = conn.execute(
            "SELECT * FROM candidate_urls WHERE normalized_url = ?", (normalized,)
        ).fetchone()
        if candidate is None:
            continue
        if (
            candidate["qualification_status"] in {"qualified", "rejected"}
            and candidate["content_hash"]
            and candidate["last_qualified_content_hash"] == candidate["content_hash"]
        ):
            report["candidates_skipped_as_duplicates"] += 1
            continue
        result = extract_candidate(
            conn,
            candidate,
            run_id=run_id,
            budget=budget,
            report=report,
            timeout=timeout,
        )
        if not result.success:
            rejection_counter(report, result.status)
            continue
        if result.from_cache:
            try:
                budget.consume("evidence_pages")
            except BudgetExceeded:
                break
            report["evidence_pages_inspected"] += 1
        refreshed = conn.execute(
            "SELECT * FROM candidate_urls WHERE normalized_url = ?", (normalized,)
        ).fetchone()
        decision = decisions.get(normalized) or _decision_for_existing(refreshed)
        packet = candidate_packet(refreshed, result, decision)
        packets.append(packet)
        packet_rows[normalized] = refreshed
    return packets, packet_rows


def _qualification_batch(
    result: dict[str, Any],
    *,
    packets: list[dict[str, Any]],
    conn: sqlite3.Connection,
    run_id: str,
    started_at: str,
    budget: BudgetTracker,
    report: dict[str, Any],
) -> dict[str, Any]:
    packet_by_url = {
        packet["source_urls"][0]: packet
        for packet in packets
        if packet.get("source_urls")
    }
    leads: list[dict[str, Any]] = []
    hermes_rejections = Counter()
    now = utc_now()

    for raw in result.get("qualified_leads", []):
        if not budget.can_consume("qualified_leads"):
            budget.stop_reason = "max_qualified_leads_reached"
            break
        primary = normalize_url(raw["primary_source_url"])
        packet = packet_by_url.get(primary)
        if packet is None:
            hermes_rejections["source_not_in_packet"] += 1
            continue
        lead = dict(raw)
        lead.pop("content_hash", None)
        lead.setdefault("owner_title", None)
        lead.setdefault("linkedin_url", None)
        lead.setdefault("professional_email", None)
        lead.setdefault("business_domain", None)
        lead.setdefault("business_location", None)
        lead.setdefault("transition_date", None)
        lead.setdefault("operational_signal", None)
        lead.setdefault("source_quote", None)
        lead.setdefault("supporting_source_urls", [])
        lead.setdefault("is_existing_lead", False)
        lead["primary_source_url"] = primary
        lead["discovered_at"] = lead.get("discovered_at") or now
        budget.consume("qualified_leads")
        leads.append(lead)
        conn.execute(
            """
            UPDATE candidate_urls
            SET qualification_status = 'qualified',
                last_qualified_content_hash = ?,
                associated_owner = ?, associated_business = ?,
                associated_business_domain = ?
            WHERE normalized_url = ?
            """,
            (
                packet.get("content_hash"),
                lead["owner_name"],
                lead["business_name"],
                lead.get("business_domain"),
                primary,
            ),
        )
        record_event(conn, primary, "qualified", run_id, str(lead["lead_score"]))

    for rejection in result.get("rejections", []):
        if not isinstance(rejection, dict):
            continue
        source = rejection.get("primary_source_url")
        reason = str(rejection.get("reason") or "insufficient_evidence")
        hermes_rejections[reason] += 1
        try:
            normalized = normalize_url(str(source))
        except ValueError:
            continue
        packet = packet_by_url.get(normalized)
        if packet:
            conn.execute(
                """
                UPDATE candidate_urls
                SET qualification_status = 'rejected',
                    last_qualified_content_hash = ?, rejection_reason = ?
                WHERE normalized_url = ?
                """,
                (packet.get("content_hash"), reason, normalized),
            )
            record_event(conn, normalized, "qualification_rejected", run_id, reason)
    conn.commit()

    for reason, count in hermes_rejections.items():
        report["rejection_counts_by_reason"][reason] = (
            report["rejection_counts_by_reason"].get(reason, 0) + count
        )
    rejected_summary = dict(STANDARD_REJECTIONS)
    rejected_summary["duplicate"] = report["candidates_skipped_as_duplicates"]
    rejected_summary["intermediary"] = report["rejection_counts_by_reason"].get(
        "intermediary", 0
    )
    rejected_summary["too_old"] = report["rejection_counts_by_reason"].get(
        "old_transition_no_new_trigger", 0
    )
    rejected_summary["unconfirmed_transition"] = report[
        "rejection_counts_by_reason"
    ].get("no_transition_signal", 0)
    rejected_summary["no_operating_role"] = report["rejection_counts_by_reason"].get(
        "generic_appointed_executive", 0
    ) + report["rejection_counts_by_reason"].get("retained_seller", 0)
    rejected_summary["insufficient_evidence"] = sum(hermes_rejections.values())
    report["qualified_leads"] = len(leads)
    return {
        "run": {
            "run_id": run_id,
            "started_at": started_at,
            "completed_at": utc_now(),
            "queries_run": budget.usage["search_calls"],
            "sources_inspected": budget.usage["evidence_pages"],
            "qualified_leads": len(leads),
        },
        "leads": leads,
        "rejected_summary": rejected_summary,
    }


def _run_submitter(output: Path) -> dict[str, Any]:
    assert_project_dry_run()
    environment = dict(os.environ)
    environment["DRY_RUN"] = "true"
    environment.setdefault("UV_CACHE_DIR", "/tmp/systemscraft-uv-cache")
    completed = subprocess.run(
        [
            "uv",
            "run",
            "--no-project",
            "python",
            "scripts/submit_batch.py",
            str(output),
        ],
        cwd=PROJECT_ROOT,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
        timeout=120,
    )
    if completed.returncode != 0:
        raise RuntimeError(
            f"Dry-run submitter failed with exit {completed.returncode}: "
            f"{completed.stderr.strip()[-600:]}"
        )
    try:
        response = json.loads(completed.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError("Dry-run submitter returned invalid JSON") from exc
    if response.get("dry_run") is not True or response.get("sent") != 0:
        raise RuntimeError("Submitter did not confirm a zero-send dry run")
    return response


def main() -> int:
    args = parse_args()
    load_runtime_environment()
    assert_project_dry_run()
    run_id = args.run_id or f"calibration-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}"
    started_at = utc_now()
    report_path = args.report or PROJECT_ROOT / "out" / f"run-report-{run_id}.json"
    packet_path = PROJECT_ROOT / "out" / f"evidence-packet-{run_id}.json"
    usage_path = PROJECT_ROOT / "out" / f"hermes-usage-{run_id}.json"
    archive_path = PROJECT_ROOT / "out" / f"batch-{run_id}.json"
    sources_config = json.loads(args.sources.read_text(encoding="utf-8"))
    reviewed_leads = load_reviewed_leads(args.reviews)
    budget = BudgetTracker.from_path(args.budget)
    report = new_report(run_id, started_at, budget)
    conn = connect_state(args.db)
    conn.execute(
        "INSERT OR REPLACE INTO research_runs (run_id, started_at) VALUES (?, ?)",
        (run_id, started_at),
    )
    conn.commit()

    exit_code = 0
    try:
        report["phase"] = "A_harvest"
        harvest_all(
            conn,
            run_id=run_id,
            sources_config=sources_config,
            budget=budget,
            report=report,
            search_queries=args.search_query,
            timeout=args.timeout,
        )

        report["phase"] = "B_pre_screen"
        survivor_urls, decisions = _screen_pending(
            conn,
            run_id=run_id,
            borderline_enabled=bool(sources_config.get("borderline_queue", True)),
            budget=budget,
            report=report,
        )
        survivor_urls = _suppress_previously_reviewed(
            conn,
            survivor_urls,
            reviewed_leads,
            run_id=run_id,
            report=report,
        )

        report["phase"] = "C_extract"
        packets, _ = _extract_survivors(
            conn,
            survivor_urls,
            decisions,
            run_id=run_id,
            budget=budget,
            report=report,
            timeout=args.timeout,
        )

        report["phase"] = "D_evidence_packets"
        atomic_write_json(
            packet_path,
            {
                "run_id": run_id,
                "generated_at": utc_now(),
                "packets": packets,
            },
        )

        report["phase"] = "E_qualify"
        if args.qualifier == "hermes":
            qualification = qualify_with_hermes(
                packets,
                max_qualified_leads=budget.limits["max_qualified_leads"],
                usage_path=usage_path,
                timeout=args.hermes_timeout,
            )
        else:
            qualification = {
                "qualified_leads": [],
                "rejections": [
                    {
                        "primary_source_url": packet["source_urls"][0],
                        "reason": "qualification_disabled",
                    }
                    for packet in packets
                ],
            }

        report["phase"] = "F_write_batch"
        batch = _qualification_batch(
            qualification,
            packets=packets,
            conn=conn,
            run_id=run_id,
            started_at=started_at,
            budget=budget,
            report=report,
        )
        atomic_write_json(args.output, batch)
        atomic_write_json(archive_path, batch)

        report["phase"] = "G_dry_run_validation"
        if args.no_submit:
            report["submission"] = {"skipped": True, "dry_run": True, "sent": 0}
        else:
            report["submission"] = _run_submitter(args.output)
        report["phase"] = "awaiting_human_review"
    except Exception as exc:
        exit_code = 1
        record_error(
            report,
            provider="pipeline",
            source_family=report["phase"],
            error=f"{type(exc).__name__}:{exc}",
        )
        report["phase"] = "failed"
        print(f"PIPELINE_ERROR: {exc}", file=sys.stderr)
    finally:
        finalize_report(report, budget)
        atomic_write_json(report_path, report)
        conn.execute(
            """
            UPDATE research_runs
            SET completed_at = ?, report_path = ?, stopped_reason = ?
            WHERE run_id = ?
            """,
            (report["completed_at"], str(report_path), budget.stop_reason, run_id),
        )
        conn.commit()
        conn.close()

    print(
        json.dumps(
            {
                "run_id": run_id,
                "report": str(report_path),
                "output": str(args.output),
                "qualified_leads": report["qualified_leads"],
                "estimated_firecrawl_credits": report[
                    "estimated_firecrawl_credits_consumed"
                ],
                "phase": report["phase"],
                "dry_run": True,
            }
        )
    )
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
