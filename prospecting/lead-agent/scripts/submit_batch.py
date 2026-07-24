#!/usr/bin/env python3
"""Validate, deduplicate, and POST a Hermes lead batch to n8n.

No third-party packages required.
"""

from __future__ import annotations

import hashlib
import json
import os
import sqlite3
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
STATE_DIR = PROJECT_ROOT / "state"
DB_PATH = STATE_DIR / "leads.db"
ENV_PATH = PROJECT_ROOT / ".env"

REQUIRED_LEAD_FIELDS = {
    "owner_name",
    "business_name",
    "industry",
    "transition_type",
    "trigger_event",
    "primary_source_url",
    "lead_score",
    "lead_priority",
}


def load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize(value: Any) -> str:
    if value is None:
        return ""
    return " ".join(str(value).lower().strip().split())


def compute_dedupe_key(lead: dict[str, Any]) -> str:
    company = normalize(lead.get("business_domain")) or normalize(lead.get("business_name"))
    owner = normalize(lead.get("owner_name"))
    transition = normalize(lead.get("transition_type"))
    source = normalize(lead.get("primary_source_url"))
    canonical = "|".join([company, owner, transition, source])
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def validate_batch(data: Any) -> dict[str, Any]:
    if not isinstance(data, dict):
        raise ValueError("Top-level payload must be an object.")
    if not isinstance(data.get("run"), dict):
        raise ValueError("Missing object: run")
    if not isinstance(data.get("leads"), list):
        raise ValueError("Missing array: leads")
    if not isinstance(data.get("rejected_summary"), dict):
        raise ValueError("Missing object: rejected_summary")

    valid_priorities = {"high", "medium", "low"}
    valid_transition_types = {
        "acquired", "inherited", "succeeded", "appointed_operator", "other"
    }

    for index, lead in enumerate(data["leads"]):
        if not isinstance(lead, dict):
            raise ValueError(f"Lead {index} is not an object.")
        missing = sorted(field for field in REQUIRED_LEAD_FIELDS if field not in lead)
        if missing:
            raise ValueError(f"Lead {index} missing fields: {', '.join(missing)}")

        score = lead["lead_score"]
        if not isinstance(score, int) or not 0 <= score <= 100:
            raise ValueError(f"Lead {index} has invalid lead_score.")
        if score < 55:
            raise ValueError(f"Lead {index} has score below transmission threshold.")
        if lead["lead_priority"] not in valid_priorities:
            raise ValueError(f"Lead {index} has invalid lead_priority.")
        if lead["transition_type"] not in valid_transition_types:
            raise ValueError(f"Lead {index} has invalid transition_type.")
        if not str(lead["primary_source_url"]).startswith(("http://", "https://")):
            raise ValueError(f"Lead {index} has invalid primary_source_url.")

    return data


def connect_db() -> sqlite3.Connection:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS sent_leads (
            dedupe_key TEXT PRIMARY KEY,
            owner_name TEXT NOT NULL,
            business_name TEXT NOT NULL,
            primary_source_url TEXT NOT NULL,
            first_sent_at TEXT NOT NULL,
            last_seen_at TEXT NOT NULL,
            run_id TEXT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS runs (
            run_id TEXT PRIMARY KEY,
            completed_at TEXT NOT NULL,
            input_count INTEGER NOT NULL,
            sent_count INTEGER NOT NULL,
            duplicate_count INTEGER NOT NULL,
            dry_run INTEGER NOT NULL
        )
        """
    )
    return conn


def filter_new_leads(
    conn: sqlite3.Connection, leads: list[dict[str, Any]]
) -> tuple[list[dict[str, Any]], int]:
    fresh: list[dict[str, Any]] = []
    duplicates = 0

    for lead in leads:
        key = compute_dedupe_key(lead)
        lead["dedupe_key"] = key
        exists = conn.execute(
            "SELECT 1 FROM sent_leads WHERE dedupe_key = ?", (key,)
        ).fetchone()
        if exists:
            duplicates += 1
            continue
        fresh.append(lead)

    return fresh, duplicates


def post_payload(url: str, token: str, payload: dict[str, Any], timeout: int) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-SystemsCraft-Token": token,
            "User-Agent": "SystemsCraft-Hermes-Lead-Agent/1.0",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            status = response.status
            if not 200 <= status < 300:
                raise RuntimeError(f"n8n returned HTTP {status}")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        raise RuntimeError(f"n8n returned HTTP {exc.code}: {detail}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Could not reach n8n: {exc.reason}") from exc


def record_sent(
    conn: sqlite3.Connection, leads: list[dict[str, Any]], run_id: str
) -> None:
    now = utc_now()
    for lead in leads:
        conn.execute(
            """
            INSERT INTO sent_leads (
                dedupe_key, owner_name, business_name, primary_source_url,
                first_sent_at, last_seen_at, run_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                lead["dedupe_key"],
                lead["owner_name"],
                lead["business_name"],
                lead["primary_source_url"],
                now,
                now,
                run_id,
            ),
        )


def main() -> int:
    load_dotenv(ENV_PATH)

    if len(sys.argv) != 2:
        print("Usage: submit_batch.py path/to/batch.json", file=sys.stderr)
        return 2

    batch_path = Path(sys.argv[1]).expanduser().resolve()
    if not batch_path.exists():
        print(f"Batch file not found: {batch_path}", file=sys.stderr)
        return 2

    try:
        data = validate_batch(json.loads(batch_path.read_text(encoding="utf-8")))
    except (json.JSONDecodeError, ValueError) as exc:
        print(f"VALIDATION_ERROR: {exc}", file=sys.stderr)
        return 3

    run_id = str(data["run"].get("run_id") or f"run-{int(datetime.now().timestamp())}")
    dry_run = os.getenv("DRY_RUN", "true").lower() in {"1", "true", "yes", "on"}
    timeout = int(os.getenv("HTTP_TIMEOUT", "30"))

    conn = connect_db()
    try:
        fresh, duplicate_count = filter_new_leads(conn, data["leads"])

        outbound = dict(data)
        outbound["leads"] = fresh
        outbound["delivery"] = {
            "sent_at": utc_now(),
            "input_count": len(data["leads"]),
            "new_count": len(fresh),
            "duplicate_count": duplicate_count,
            "dry_run": dry_run,
        }

        if fresh and not dry_run:
            url = os.getenv("N8N_WEBHOOK_URL", "").strip()
            token = os.getenv("N8N_WEBHOOK_TOKEN", "").strip()
            if not url or not token:
                raise RuntimeError(
                    "N8N_WEBHOOK_URL and N8N_WEBHOOK_TOKEN are required when DRY_RUN=false."
                )
            post_payload(url, token, outbound, timeout)
            record_sent(conn, fresh, run_id)

        conn.execute(
            """
            INSERT OR REPLACE INTO runs (
                run_id, completed_at, input_count, sent_count,
                duplicate_count, dry_run
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                run_id,
                utc_now(),
                len(data["leads"]),
                0 if dry_run else len(fresh),
                duplicate_count,
                int(dry_run),
            ),
        )
        conn.commit()

        print(
            json.dumps(
                {
                    "ok": True,
                    "run_id": run_id,
                    "input": len(data["leads"]),
                    "new": len(fresh),
                    "duplicates": duplicate_count,
                    "sent": 0 if dry_run else len(fresh),
                    "dry_run": dry_run,
                }
            )
        )
        return 0

    except Exception as exc:
        conn.rollback()
        print(f"DELIVERY_ERROR: {exc}", file=sys.stderr)
        return 4
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
