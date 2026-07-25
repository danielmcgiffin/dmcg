#!/usr/bin/env python3
"""Deterministic discovery, screening, extraction, and budget primitives."""

from __future__ import annotations

import hashlib
import html
import json
import os
import re
import sqlite3
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser
from collections import Counter
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Callable, Iterable


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DB_PATH = PROJECT_ROOT / "state" / "leads.db"
DEFAULT_BUDGET_PATH = PROJECT_ROOT / "config" / "research-budget.json"
DEFAULT_SOURCES_PATH = PROJECT_ROOT / "config" / "sources.json"
DEFAULT_REVIEWS_PATH = PROJECT_ROOT / "calibration" / "reviews.jsonl"
PROJECT_ENV_PATH = PROJECT_ROOT / ".env"
HERMES_ENV_PATH = Path.home() / ".hermes" / ".env"
USER_AGENT = (
    "SystemsCraftLeadResearch/2.0 "
    "(bounded public-business research; respects robots.txt)"
)

TRACKING_QUERY_KEYS = {
    "fbclid",
    "gclid",
    "mc_cid",
    "mc_eid",
    "ref",
    "source",
}
TRANSITION_SIGNALS = (
    "acquired",
    "acquiring",
    "acquisition",
    "new owner",
    "took over",
    "take over",
    "successor",
    "succession",
    "second generation",
    "second-generation",
    "third generation",
    "third-generation",
    "first year as owner",
    "post-acquisition",
    "post acquisition",
    "closed on",
    "purchased the business",
    "bought a business",
    "bought the business",
    "buy a business",
    "family business transition",
    "ownership transition",
)
OPERATIONAL_SIGNALS = (
    "previous owner",
    "key employee",
    "owner dependence",
    "systems",
    "system",
    "process",
    "standardize",
    "integration",
    "inventory",
    "fulfillment",
    "scheduling",
    "hiring",
    "management team",
    "software",
    "erp",
    "crm",
    "reporting",
    "visibility",
    "expansion",
    "turnaround",
    "firefighting",
    "tribal knowledge",
    "institutional knowledge",
    "quit",
    "crisis",
    "decline",
    "underperform",
    "lost sales",
    "website bug",
    "working in the business",
)
MATERIAL_REOPEN_SIGNALS = OPERATIONAL_SIGNALS + (
    "add-on acquisition",
    "new location",
    "new branch",
    "major hiring",
    "management buildout",
    "system replacement",
    "ownership change",
)
INTERMEDIARY_SIGNALS = (
    "m&a advisor",
    "m&a advisory",
    "investment bank",
    "business broker",
    "sba lender",
    "loan broker",
    "accounting firm",
    "law firm",
    "legal counsel",
    "franchise opportunity",
    "franchise sales",
)
PASSIVE_OR_GENERIC_SIGNALS = (
    "fund announces",
    "portfolio investment",
    "passive investor",
    "funding round",
    "venture funding",
    "seed round",
    "series a",
    "series b",
    "real estate transaction",
)
UNCLOSED_SIGNALS = (
    "letter of intent",
    "proposed acquisition",
    "plans to acquire",
    "will acquire",
    "pending acquisition",
    "subject to closing",
)
RETAINED_SELLER_SIGNALS = (
    "will remain president",
    "will continue as president",
    "retained seller",
    "seller will remain",
)
GENERIC_EXECUTIVE_SIGNALS = (
    "appointed ceo",
    "named ceo",
    "names new ceo",
    "appointed president",
    "named president",
)
PRESS_RELEASE_HOSTS = {
    "businesswire.com",
    "www.businesswire.com",
    "globenewswire.com",
    "www.globenewswire.com",
    "prnewswire.com",
    "www.prnewswire.com",
}
BLOCK_PAGE_SIGNALS = (
    "captcha",
    "verify you are human",
    "checking your browser",
    "access denied",
    "enable javascript and cookies",
)
PAYWALL_SIGNALS = (
    "subscribe to continue",
    "subscription required",
    "sign in to continue",
    "already a subscriber",
    "this article is for subscribers",
    "purchase this article",
)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_dotenv(path: Path, *, override: bool = False) -> None:
    """Load a dotenv file without ever logging values."""
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", key):
            continue
        value = value.strip().strip('"').strip("'")
        if override:
            os.environ[key] = value
        else:
            os.environ.setdefault(key, value)


def load_runtime_environment() -> None:
    load_dotenv(PROJECT_ENV_PATH)
    load_dotenv(HERMES_ENV_PATH)


def normalize_url(url: str) -> str:
    """Canonicalize an HTTP(S) URL for durable deduplication."""
    raw = html.unescape(url.strip())
    parsed = urllib.parse.urlsplit(raw)
    if parsed.scheme.lower() not in {"http", "https"} or not parsed.hostname:
        raise ValueError(f"Unsupported candidate URL: {url!r}")

    scheme = parsed.scheme.lower()
    host = parsed.hostname.lower().rstrip(".")
    port = parsed.port
    if port and not ((scheme == "http" and port == 80) or (scheme == "https" and port == 443)):
        host = f"{host}:{port}"

    path = re.sub(r"/{2,}", "/", parsed.path or "/")
    path = urllib.parse.quote(urllib.parse.unquote(path), safe="/:@-._~!$&'()*+,;=")
    if path != "/":
        path = path.rstrip("/")

    query_pairs = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
    filtered = [
        (key, value)
        for key, value in query_pairs
        if key.lower() not in TRACKING_QUERY_KEYS
        and not key.lower().startswith("utm_")
    ]
    query = urllib.parse.urlencode(sorted(filtered), doseq=True)
    return urllib.parse.urlunsplit((scheme, host, path, query, ""))


def normalize_identity(value: Any) -> str:
    """Normalize names and businesses across punctuation, spacing, and case."""
    if value is None:
        return ""
    decomposed = unicodedata.normalize("NFKD", str(value)).casefold()
    return "".join(character for character in decomposed if character.isalnum())


def normalize_domain(value: Any) -> str:
    if value is None:
        return ""
    raw = str(value).strip().casefold()
    if not raw:
        return ""
    parsed = urllib.parse.urlsplit(
        raw if "://" in raw else f"https://{raw}"
    )
    host = (parsed.hostname or "").lower().rstrip(".")
    return host.removeprefix("www.")


def stable_hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def metadata_hash(title: str | None, snippet: str | None, publication_date: str | None) -> str:
    canonical = "\n".join(
        " ".join((part or "").lower().split())
        for part in (title, snippet, publication_date)
    )
    return stable_hash(canonical)


def find_signals(text: str, signals: Iterable[str]) -> list[str]:
    lowered = " ".join(text.lower().replace("–", "-").replace("—", "-").split())
    return [signal for signal in signals if signal in lowered]


@dataclass(frozen=True)
class ReviewedLead:
    owner_name: str
    business_name: str
    source_url: str
    verdict: str
    calibration_sequence: int
    business_domain: str = ""

    @property
    def normalized_owner(self) -> str:
        return normalize_identity(self.owner_name)

    @property
    def normalized_business(self) -> str:
        return normalize_identity(self.business_name)

    @property
    def normalized_source_url(self) -> str:
        return normalize_url(self.source_url)

    @property
    def normalized_business_domain(self) -> str:
        return normalize_domain(self.business_domain)


def load_reviewed_leads(path: Path = DEFAULT_REVIEWS_PATH) -> list[ReviewedLead]:
    """Load and validate the human-review ledger one independent line at a time."""
    reviewed: list[ReviewedLead] = []
    if not path.exists():
        return reviewed
    required = {
        "owner_name",
        "business_name",
        "source_url",
        "verdict",
        "calibration_sequence",
    }
    for line_number, raw_line in enumerate(
        path.read_text(encoding="utf-8").splitlines(), start=1
    ):
        if not raw_line.strip():
            continue
        try:
            record = json.loads(raw_line)
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"{path}:{line_number}: invalid JSON: {exc.msg}"
            ) from exc
        if not isinstance(record, dict):
            raise ValueError(f"{path}:{line_number}: review must be an object")
        missing = sorted(required - set(record))
        if missing:
            raise ValueError(
                f"{path}:{line_number}: missing fields: {', '.join(missing)}"
            )
        verdict = str(record["verdict"]).strip().lower()
        if verdict not in {"accept", "reject"}:
            raise ValueError(
                f"{path}:{line_number}: verdict must be accept or reject"
            )
        try:
            sequence = int(record["calibration_sequence"])
            source_url = normalize_url(str(record["source_url"]))
        except (TypeError, ValueError) as exc:
            raise ValueError(
                f"{path}:{line_number}: invalid sequence or source URL"
            ) from exc
        reviewed.append(
            ReviewedLead(
                owner_name=str(record["owner_name"]),
                business_name=str(record["business_name"]),
                source_url=source_url,
                verdict=verdict,
                calibration_sequence=sequence,
                business_domain=str(record.get("business_domain") or ""),
            )
        )
    return reviewed


def _candidate_value(candidate: sqlite3.Row | dict[str, Any], key: str) -> Any:
    try:
        return candidate[key]
    except (KeyError, IndexError):
        return None


def match_reviewed_lead(
    candidate: sqlite3.Row | dict[str, Any],
    reviewed_leads: Iterable[ReviewedLead],
) -> ReviewedLead | None:
    """Match reviewed identity without treating a source-domain as a business-domain."""
    candidate_url_raw = str(
        _candidate_value(candidate, "normalized_url")
        or _candidate_value(candidate, "original_url")
        or ""
    )
    try:
        candidate_url = normalize_url(candidate_url_raw)
    except ValueError:
        candidate_url = ""
    owner = normalize_identity(_candidate_value(candidate, "associated_owner"))
    business = normalize_identity(_candidate_value(candidate, "associated_business"))
    business_domain = normalize_domain(
        _candidate_value(candidate, "associated_business_domain")
    )
    metadata_identity = normalize_identity(
        " ".join(
            str(_candidate_value(candidate, key) or "")
            for key in ("title", "snippet", "normalized_url", "original_url")
        )
    )

    for reviewed in reviewed_leads:
        if candidate_url and candidate_url == reviewed.normalized_source_url:
            return reviewed
        reviewed_owner = reviewed.normalized_owner
        reviewed_business = reviewed.normalized_business
        reviewed_domain = reviewed.normalized_business_domain
        owner_and_business = (
            owner
            and business
            and owner == reviewed_owner
            and business == reviewed_business
        )
        metadata_owner_and_business = (
            reviewed_owner
            and reviewed_business
            and reviewed_owner in metadata_identity
            and reviewed_business in metadata_identity
        )
        owner_and_domain = (
            owner
            and business_domain
            and reviewed_domain
            and owner == reviewed_owner
            and business_domain == reviewed_domain
        )
        business_and_domain = (
            business
            and business_domain
            and reviewed_domain
            and business == reviewed_business
            and business_domain == reviewed_domain
        )
        if (
            owner_and_business
            or metadata_owner_and_business
            or owner_and_domain
            or business_and_domain
        ):
            return reviewed
    return None


def is_material_reopen_trigger(trigger: Any) -> bool:
    return bool(find_signals(str(trigger or ""), MATERIAL_REOPEN_SIGNALS))


def _ensure_candidate_column(
    conn: sqlite3.Connection, column: str, declaration: str
) -> None:
    existing = {
        row["name"] for row in conn.execute("PRAGMA table_info(candidate_urls)")
    }
    if column not in existing:
        conn.execute(
            f"ALTER TABLE candidate_urls ADD COLUMN {column} {declaration}"
        )


def connect_state(db_path: Path = DEFAULT_DB_PATH) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS candidate_urls (
            normalized_url TEXT PRIMARY KEY,
            original_url TEXT NOT NULL,
            source_family TEXT NOT NULL,
            title TEXT,
            snippet TEXT,
            publication_date TEXT,
            metadata_hash TEXT NOT NULL,
            first_discovered_at TEXT NOT NULL,
            last_seen_at TEXT NOT NULL,
            screening_status TEXT NOT NULL DEFAULT 'new',
            extraction_status TEXT NOT NULL DEFAULT 'not_attempted',
            extraction_provider TEXT,
            extraction_timestamp TEXT,
            content_hash TEXT,
            extracted_text TEXT,
            rejection_reason TEXT,
            associated_owner TEXT,
            associated_business TEXT,
            associated_business_domain TEXT,
            firecrawl_attempted_hash TEXT,
            last_qualified_content_hash TEXT,
            qualification_status TEXT,
            force_reset INTEGER NOT NULL DEFAULT 0,
            review_reopen_approved INTEGER NOT NULL DEFAULT 0,
            review_reopen_trigger TEXT,
            review_reopen_at TEXT
        )
        """
    )
    _ensure_candidate_column(conn, "associated_business_domain", "TEXT")
    _ensure_candidate_column(
        conn, "review_reopen_approved", "INTEGER NOT NULL DEFAULT 0"
    )
    _ensure_candidate_column(conn, "review_reopen_trigger", "TEXT")
    _ensure_candidate_column(conn, "review_reopen_at", "TEXT")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS candidate_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            normalized_url TEXT NOT NULL,
            event_type TEXT NOT NULL,
            event_at TEXT NOT NULL,
            run_id TEXT,
            detail TEXT,
            FOREIGN KEY (normalized_url) REFERENCES candidate_urls(normalized_url)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS research_runs (
            run_id TEXT PRIMARY KEY,
            started_at TEXT NOT NULL,
            completed_at TEXT,
            report_path TEXT,
            stopped_reason TEXT
        )
        """
    )
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_candidate_screening "
        "ON candidate_urls(screening_status, extraction_status)"
    )
    conn.commit()
    return conn


def record_event(
    conn: sqlite3.Connection,
    normalized: str,
    event_type: str,
    run_id: str,
    detail: str | None = None,
) -> None:
    conn.execute(
        """
        INSERT INTO candidate_events (
            normalized_url, event_type, event_at, run_id, detail
        ) VALUES (?, ?, ?, ?, ?)
        """,
        (normalized, event_type, utc_now(), run_id, detail),
    )


@dataclass
class UpsertResult:
    normalized_url: str
    status: str


def upsert_candidate(
    conn: sqlite3.Connection,
    *,
    url: str,
    source_family: str,
    title: str | None,
    snippet: str | None,
    publication_date: str | None,
    run_id: str,
) -> UpsertResult:
    normalized = normalize_url(url)
    now = utc_now()
    new_metadata_hash = metadata_hash(title, snippet, publication_date)
    row = conn.execute(
        "SELECT * FROM candidate_urls WHERE normalized_url = ?", (normalized,)
    ).fetchone()

    if row is None:
        conn.execute(
            """
            INSERT INTO candidate_urls (
                normalized_url, original_url, source_family, title, snippet,
                publication_date, metadata_hash, first_discovered_at, last_seen_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                normalized,
                url,
                source_family,
                title,
                snippet,
                publication_date,
                new_metadata_hash,
                now,
                now,
            ),
        )
        record_event(conn, normalized, "discovered", run_id, source_family)
        return UpsertResult(normalized, "new")

    old_text = f"{row['title'] or ''} {row['snippet'] or ''}"
    new_text = f"{title or ''} {snippet or ''}"
    old_trigger_set = set(find_signals(old_text, TRANSITION_SIGNALS + OPERATIONAL_SIGNALS))
    new_trigger_set = set(find_signals(new_text, TRANSITION_SIGNALS + OPERATIONAL_SIGNALS))
    materially_new_trigger = bool(new_trigger_set - old_trigger_set)
    metadata_changed = new_metadata_hash != row["metadata_hash"]

    screening_status = row["screening_status"]
    extraction_status = row["extraction_status"]
    rejection_reason = row["rejection_reason"]
    if row["force_reset"] or materially_new_trigger:
        screening_status = "new"
        extraction_status = "not_attempted"
        rejection_reason = None

    conn.execute(
        """
        UPDATE candidate_urls
        SET original_url = ?, source_family = ?, title = ?, snippet = ?,
            publication_date = ?, metadata_hash = ?, last_seen_at = ?,
            screening_status = ?, extraction_status = ?, rejection_reason = ?,
            force_reset = 0
        WHERE normalized_url = ?
        """,
        (
            url,
            source_family,
            title or row["title"],
            snippet or row["snippet"],
            publication_date or row["publication_date"],
            new_metadata_hash if metadata_changed else row["metadata_hash"],
            now,
            screening_status,
            extraction_status,
            rejection_reason,
            normalized,
        ),
    )
    status = "materially_updated" if materially_new_trigger or row["force_reset"] else "duplicate"
    record_event(conn, normalized, "seen", run_id, status)
    return UpsertResult(normalized, status)


def reset_candidate(conn: sqlite3.Connection, url: str, run_id: str) -> None:
    normalized = normalize_url(url)
    changed = conn.execute(
        """
        UPDATE candidate_urls
        SET screening_status = 'new', extraction_status = 'not_attempted',
            rejection_reason = NULL, force_reset = 0
        WHERE normalized_url = ?
        """,
        (normalized,),
    ).rowcount
    if not changed:
        raise KeyError(f"Candidate is not in state: {normalized}")
    record_event(conn, normalized, "explicit_reset", run_id)
    conn.commit()


def flag_material_review_trigger(
    conn: sqlite3.Connection,
    url: str,
    trigger: str,
    run_id: str,
) -> None:
    """Explicitly record a material trigger that permits one reviewed re-entry."""
    normalized = normalize_url(url)
    clean_trigger = " ".join(str(trigger).split())
    if not is_material_reopen_trigger(clean_trigger):
        raise ValueError(
            "Review reopening requires a concrete material operating trigger"
        )
    changed = conn.execute(
        """
        UPDATE candidate_urls
        SET review_reopen_approved = 1, review_reopen_trigger = ?,
            review_reopen_at = ?, screening_status = 'new',
            extraction_status = 'not_attempted', rejection_reason = NULL,
            qualification_status = NULL, last_qualified_content_hash = NULL
        WHERE normalized_url = ?
        """,
        (clean_trigger, utc_now(), normalized),
    ).rowcount
    if not changed:
        raise KeyError(f"Candidate is not in state: {normalized}")
    record_event(
        conn,
        normalized,
        "material_review_trigger_flagged",
        run_id,
        clean_trigger,
    )
    conn.commit()


@dataclass
class ScreeningDecision:
    status: str
    reason: str
    transition_signals: list[str] = field(default_factory=list)
    operational_signals: list[str] = field(default_factory=list)
    rejection_flags: list[str] = field(default_factory=list)


def _host_for_candidate(candidate: sqlite3.Row | dict[str, Any]) -> str:
    try:
        return urllib.parse.urlsplit(candidate["normalized_url"]).hostname or ""
    except (KeyError, TypeError):
        return ""


def screen_metadata(
    candidate: sqlite3.Row | dict[str, Any],
    *,
    borderline_enabled: bool = True,
    today: date | None = None,
) -> ScreeningDecision:
    title = candidate["title"] or ""
    snippet = candidate["snippet"] or ""
    source_family = candidate["source_family"] or ""
    combined = f"{title}. {snippet}"
    lowered = combined.lower()
    transition = find_signals(combined, TRANSITION_SIGNALS)
    operational = find_signals(combined, OPERATIONAL_SIGNALS)
    rejection_flags: list[str] = []

    if source_family in {"pr_newswire", "business_wire", "globenewswire"}:
        rejection_flags.append("press_release_discovery_only")
    if _host_for_candidate(candidate) in PRESS_RELEASE_HOSTS:
        rejection_flags.append("press_release_discovery_only")
    if find_signals(combined, INTERMEDIARY_SIGNALS):
        rejection_flags.append("intermediary")
    if find_signals(combined, PASSIVE_OR_GENERIC_SIGNALS):
        rejection_flags.append("generic_transaction_or_passive")
    if find_signals(combined, UNCLOSED_SIGNALS):
        rejection_flags.append("unclosed_transaction")
    if find_signals(combined, RETAINED_SELLER_SIGNALS) and not any(
        phrase in lowered
        for phrase in ("acquiring owner", "buyer", "purchased the business", "bought the business")
    ):
        rejection_flags.append("retained_seller")
    if find_signals(combined, GENERIC_EXECUTIVE_SIGNALS) and not operational:
        rejection_flags.append("generic_appointed_executive")

    publication = candidate["publication_date"] or ""
    if publication:
        try:
            published = date.fromisoformat(publication[:10])
            age = ((today or datetime.now(timezone.utc).date()) - published).days
            newer_trigger = any(
                signal in lowered
                for signal in (
                    "first year",
                    "expansion",
                    "new location",
                    "hiring",
                    "erp",
                    "crm",
                    "turnaround",
                    "integration",
                )
            )
            if age > 180 and not newer_trigger:
                rejection_flags.append("old_transition_no_new_trigger")
        except ValueError:
            pass

    if rejection_flags:
        return ScreeningDecision(
            "rejected",
            rejection_flags[0],
            transition,
            operational,
            rejection_flags,
        )
    if transition and operational:
        return ScreeningDecision(
            "passed", "transition_and_operational_signals", transition, operational
        )
    if (
        borderline_enabled
        and source_family == "acquiring_minds"
        and "/articles/" in str(candidate["normalized_url"])
    ):
        return ScreeningDecision(
            "borderline",
            "primary_operator_index_borderline",
            transition,
            operational,
        )
    if borderline_enabled and transition and source_family in {
        "acquiring_minds",
        "family_business_alliance",
        "insead_eta_podcast",
        "operator_interview",
        "trade_publication",
    }:
        return ScreeningDecision(
            "borderline", "primary_source_transition_signal", transition, operational
        )
    if not transition:
        return ScreeningDecision(
            "rejected", "no_transition_signal", transition, operational
        )
    return ScreeningDecision(
        "rejected", "no_operational_hypothesis_signal", transition, operational
    )


def persist_screening(
    conn: sqlite3.Connection,
    normalized: str,
    decision: ScreeningDecision,
    run_id: str,
) -> None:
    conn.execute(
        """
        UPDATE candidate_urls
        SET screening_status = ?, rejection_reason = ?
        WHERE normalized_url = ?
        """,
        (
            decision.status,
            decision.reason if decision.status == "rejected" else None,
            normalized,
        ),
    )
    record_event(
        conn,
        normalized,
        f"screening_{decision.status}",
        run_id,
        decision.reason,
    )


class BudgetExceeded(RuntimeError):
    pass


@dataclass
class BudgetTracker:
    limits: dict[str, int]
    usage: dict[str, int] = field(default_factory=lambda: {
        "search_calls": 0,
        "firecrawl_extractions": 0,
        "firecrawl_credits_estimated": 0,
        "candidates_screened": 0,
        "evidence_pages": 0,
        "qualified_leads": 0,
    })
    stop_reason: str | None = None

    LIMIT_BY_USAGE = {
        "search_calls": "max_search_calls",
        "firecrawl_extractions": "max_firecrawl_extractions",
        "firecrawl_credits_estimated": "max_firecrawl_credits_estimated",
        "candidates_screened": "max_candidates_screened",
        "evidence_pages": "max_evidence_pages",
        "qualified_leads": "max_qualified_leads",
    }

    @classmethod
    def from_path(cls, path: Path = DEFAULT_BUDGET_PATH) -> "BudgetTracker":
        return cls(json.loads(path.read_text(encoding="utf-8")))

    def remaining(self, usage_key: str) -> int:
        limit_key = self.LIMIT_BY_USAGE[usage_key]
        return int(self.limits[limit_key]) - self.usage[usage_key]

    def can_consume(self, usage_key: str, amount: int = 1) -> bool:
        return self.remaining(usage_key) >= amount

    def consume(self, usage_key: str, amount: int = 1) -> None:
        if amount < 0:
            raise ValueError("Budget consumption cannot be negative")
        if not self.can_consume(usage_key, amount):
            limit_key = self.LIMIT_BY_USAGE[usage_key]
            self.stop_reason = f"{limit_key}_reached"
            raise BudgetExceeded(self.stop_reason)
        self.usage[usage_key] += amount

    def reserve_firecrawl(self, estimated_credits: int = 1) -> None:
        if not self.can_consume("firecrawl_extractions"):
            self.stop_reason = "max_firecrawl_extractions_reached"
            raise BudgetExceeded(self.stop_reason)
        if not self.can_consume("firecrawl_credits_estimated", estimated_credits):
            self.stop_reason = "max_firecrawl_credits_estimated_reached"
            raise BudgetExceeded(self.stop_reason)
        self.consume("firecrawl_extractions")
        self.consume("firecrawl_credits_estimated", estimated_credits)


def new_report(run_id: str, started_at: str, budget: BudgetTracker) -> dict[str, Any]:
    return {
        "run_id": run_id,
        "started_at": started_at,
        "completed_at": None,
        "phase": "initializing",
        "budget_limits": dict(budget.limits),
        "budget_usage": dict(budget.usage),
        "stopped_reason": None,
        "search_calls_by_provider": {},
        "index_pages_fetched": 0,
        "candidates_discovered": 0,
        "candidates_materially_updated": 0,
        "candidates_skipped_as_duplicates": 0,
        "previously_reviewed_suppressed": 0,
        "previously_accepted_suppressed": 0,
        "previously_rejected_suppressed": 0,
        "materially_new_trigger_reopened": 0,
        "candidates_rejected_before_extraction": 0,
        "local_extraction_attempts": 0,
        "local_extraction_successes": 0,
        "basic_reader_attempts": 0,
        "basic_reader_successes": 0,
        "firecrawl_extraction_attempts": 0,
        "firecrawl_extraction_successes": 0,
        "estimated_firecrawl_credits_consumed": 0,
        "evidence_pages_inspected": 0,
        "qualified_leads": 0,
        "rejection_counts_by_reason": {},
        "errors_by_provider_and_source_family": {},
        "yield_per_search_call": 0.0,
        "yield_per_evidence_page": 0.0,
        "yield_per_estimated_firecrawl_credit": 0.0,
        "human_review_required": True,
        "submission": None,
    }


def increment_nested_count(mapping: dict[str, Any], key: str, amount: int = 1) -> None:
    mapping[key] = int(mapping.get(key, 0)) + amount


def record_error(
    report: dict[str, Any],
    *,
    provider: str,
    source_family: str,
    error: str,
) -> None:
    key = f"{provider}:{source_family}"
    errors = report["errors_by_provider_and_source_family"]
    entry = errors.setdefault(key, {"count": 0, "last_error": ""})
    entry["count"] += 1
    entry["last_error"] = error[:300]


def finalize_report(report: dict[str, Any], budget: BudgetTracker) -> None:
    report["completed_at"] = utc_now()
    report["budget_usage"] = dict(budget.usage)
    report["stopped_reason"] = budget.stop_reason
    report["estimated_firecrawl_credits_consumed"] = budget.usage[
        "firecrawl_credits_estimated"
    ]
    qualified = report["qualified_leads"]
    search_calls = budget.usage["search_calls"]
    evidence_pages = budget.usage["evidence_pages"]
    firecrawl_credits = budget.usage["firecrawl_credits_estimated"]
    report["yield_per_search_call"] = (
        round(qualified / search_calls, 4) if search_calls else 0.0
    )
    report["yield_per_evidence_page"] = (
        round(qualified / evidence_pages, 4) if evidence_pages else 0.0
    )
    report["yield_per_estimated_firecrawl_credit"] = (
        round(qualified / firecrawl_credits, 4) if firecrawl_credits else 0.0
    )


class LinkIndexParser(HTMLParser):
    """Collect anchors and nearby metadata without relying on CSS selectors."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.links: list[dict[str, str]] = []
        self._href: str | None = None
        self._anchor_text: list[str] = []
        self.page_title = ""
        self.description = ""
        self._in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value or "" for key, value in attrs}
        if tag.lower() == "a" and values.get("href"):
            self._href = values["href"]
            self._anchor_text = []
        elif tag.lower() == "title":
            self._in_title = True
        elif tag.lower() == "meta":
            name = (values.get("name") or values.get("property") or "").lower()
            if name in {"description", "og:description"} and values.get("content"):
                self.description = values["content"].strip()

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "a" and self._href:
            text = " ".join(" ".join(self._anchor_text).split())
            self.links.append({"href": self._href, "text": text})
            self._href = None
            self._anchor_text = []
        elif tag.lower() == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        clean = " ".join(data.split())
        if not clean:
            return
        if self._href:
            self._anchor_text.append(clean)
        if self._in_title:
            self.page_title = f"{self.page_title} {clean}".strip()


class MainTextParser(HTMLParser):
    """Extract article/main text, with a body fallback."""

    SKIP_TAGS = {"script", "style", "noscript", "svg", "form", "nav", "footer"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._skip_depth = 0
        self._article_depth = 0
        self._body_depth = 0
        self.article_parts: list[str] = []
        self.body_parts: list[str] = []
        self.title_parts: list[str] = []
        self._in_title = False
        self.link_text_chars = 0
        self.total_text_chars = 0
        self._link_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag in self.SKIP_TAGS:
            self._skip_depth += 1
        if tag in {"article", "main"}:
            self._article_depth += 1
        if tag == "body":
            self._body_depth += 1
        if tag == "title":
            self._in_title = True
        if tag == "a":
            self._link_depth += 1

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in self.SKIP_TAGS and self._skip_depth:
            self._skip_depth -= 1
        if tag in {"article", "main"} and self._article_depth:
            self._article_depth -= 1
        if tag == "body" and self._body_depth:
            self._body_depth -= 1
        if tag == "title":
            self._in_title = False
        if tag == "a" and self._link_depth:
            self._link_depth -= 1

    def handle_data(self, data: str) -> None:
        if self._skip_depth:
            return
        clean = " ".join(data.split())
        if not clean:
            return
        if self._in_title:
            self.title_parts.append(clean)
        if self._body_depth:
            self.body_parts.append(clean)
            self.total_text_chars += len(clean)
            if self._link_depth:
                self.link_text_chars += len(clean)
        if self._article_depth:
            self.article_parts.append(clean)


@dataclass
class LocalExtraction:
    success: bool
    status: str
    text: str = ""
    title: str = ""


def extract_html_text(
    raw_html: str,
    *,
    min_chars: int = 1000,
    max_link_ratio: float = 0.55,
) -> LocalExtraction:
    lowered_raw = raw_html.lower()
    if find_signals(lowered_raw, BLOCK_PAGE_SIGNALS):
        return LocalExtraction(False, "blocked_or_captcha")
    if find_signals(lowered_raw, PAYWALL_SIGNALS):
        return LocalExtraction(False, "paywall_or_login")

    parser = MainTextParser()
    try:
        parser.feed(raw_html)
    except Exception:
        return LocalExtraction(False, "malformed_html")

    parts = parser.article_parts if parser.article_parts else parser.body_parts
    text = "\n".join(parts)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    if find_signals(text, BLOCK_PAGE_SIGNALS):
        return LocalExtraction(False, "blocked_or_captcha")
    if find_signals(text, PAYWALL_SIGNALS):
        return LocalExtraction(False, "paywall_or_login")
    if len(text) < min_chars:
        return LocalExtraction(False, "inadequate_content")
    link_ratio = parser.link_text_chars / max(parser.total_text_chars, 1)
    if not parser.article_parts and link_ratio > max_link_ratio:
        return LocalExtraction(False, "index_or_link_shell")
    return LocalExtraction(
        True,
        "success",
        text=text,
        title=" ".join(parser.title_parts).strip(),
    )


class RobotsCache:
    def __init__(self) -> None:
        self._cache: dict[str, urllib.robotparser.RobotFileParser | None] = {}

    def allowed(self, url: str, *, timeout: int = 10) -> bool:
        parsed = urllib.parse.urlsplit(url)
        origin = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, "", "", ""))
        if origin not in self._cache:
            robots_url = f"{origin}/robots.txt"
            parser = urllib.robotparser.RobotFileParser()
            parser.set_url(robots_url)
            request = urllib.request.Request(robots_url, headers={"User-Agent": USER_AGENT})
            try:
                with urllib.request.urlopen(request, timeout=timeout) as response:
                    content = response.read(512_000).decode("utf-8", errors="replace")
                parser.parse(content.splitlines())
                self._cache[origin] = parser
            except (urllib.error.URLError, TimeoutError, ValueError):
                self._cache[origin] = None
        parser = self._cache[origin]
        return True if parser is None else parser.can_fetch(USER_AGENT, url)


ROBOTS_CACHE = RobotsCache()


def http_get(
    url: str,
    *,
    timeout: int = 20,
    max_bytes: int = 3_000_000,
    respect_robots: bool = True,
) -> tuple[str, str]:
    if respect_robots and not ROBOTS_CACHE.allowed(url, timeout=min(timeout, 10)):
        raise PermissionError("robots_disallowed")
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5",
        },
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        content_type = response.headers.get_content_type()
        if content_type not in {"text/html", "application/xhtml+xml", "text/plain"}:
            raise ValueError(f"unsupported_content_type:{content_type}")
        raw = response.read(max_bytes + 1)
        if len(raw) > max_bytes:
            raise ValueError("response_too_large")
        charset = response.headers.get_content_charset() or "utf-8"
        return raw.decode(charset, errors="replace"), response.geturl()


@dataclass
class ExtractionResult:
    success: bool
    status: str
    provider: str | None = None
    text: str = ""
    content_hash: str | None = None
    from_cache: bool = False


def _basic_reader_extract(url: str, timeout: int) -> LocalExtraction:
    reader_url = os.getenv("BASIC_READER_URL", "").strip()
    if not reader_url:
        return LocalExtraction(False, "not_configured")
    target = reader_url.replace("{url}", urllib.parse.quote(url, safe=""))
    raw, _ = http_get(target, timeout=timeout, respect_robots=False)
    if "<html" in raw[:500].lower():
        return extract_html_text(raw)
    text = raw.strip()
    if len(text) < 1000:
        return LocalExtraction(False, "inadequate_content")
    return LocalExtraction(True, "success", text=text)


def _firecrawl_extract(url: str, timeout: int) -> LocalExtraction:
    api_key = os.getenv("FIRECRAWL_API_KEY", "").strip()
    api_url = os.getenv("FIRECRAWL_API_URL", "https://api.firecrawl.dev").strip()
    if not api_key and "firecrawl.dev" in api_url:
        return LocalExtraction(False, "not_configured")
    endpoint = f"{api_url.rstrip('/')}/v1/scrape"
    payload = json.dumps(
        {
            "url": url,
            "formats": ["markdown"],
            "onlyMainContent": True,
        }
    ).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
    }
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    request = urllib.request.Request(endpoint, data=payload, method="POST", headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = json.loads(response.read(5_000_000).decode("utf-8", errors="replace"))
    except urllib.error.HTTPError as exc:
        return LocalExtraction(False, f"http_{exc.code}")
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        return LocalExtraction(False, f"request_failed:{type(exc).__name__}")
    data = body.get("data") if isinstance(body, dict) else None
    markdown = data.get("markdown", "") if isinstance(data, dict) else ""
    if not body.get("success") or len(markdown.strip()) < 1000:
        return LocalExtraction(False, "inadequate_or_failed")
    return LocalExtraction(True, "success", text=markdown.strip())


def extract_candidate(
    conn: sqlite3.Connection,
    candidate: sqlite3.Row | dict[str, Any],
    *,
    run_id: str,
    budget: BudgetTracker,
    report: dict[str, Any],
    timeout: int = 20,
    local_fetcher: Callable[[str, int], LocalExtraction] | None = None,
    basic_fetcher: Callable[[str, int], LocalExtraction] | None = None,
    firecrawl_fetcher: Callable[[str, int], LocalExtraction] | None = None,
) -> ExtractionResult:
    normalized = candidate["normalized_url"]
    cached_text = candidate["extracted_text"] or ""
    if candidate["extraction_status"] == "success" and cached_text:
        return ExtractionResult(
            True,
            "success",
            candidate["extraction_provider"],
            cached_text,
            candidate["content_hash"],
            True,
        )

    def default_local(url: str, fetch_timeout: int) -> LocalExtraction:
        raw, _ = http_get(url, timeout=fetch_timeout)
        return extract_html_text(raw)

    local_provider = local_fetcher or default_local
    report["local_extraction_attempts"] += 1
    try:
        local = local_provider(normalized, timeout)
    except PermissionError:
        local = LocalExtraction(False, "robots_disallowed")
    except urllib.error.HTTPError as exc:
        local = LocalExtraction(False, f"http_{exc.code}")
    except (urllib.error.URLError, TimeoutError, ValueError) as exc:
        local = LocalExtraction(False, f"request_failed:{type(exc).__name__}")

    if local.success:
        report["local_extraction_successes"] += 1
        return persist_extraction(
            conn, candidate, local.text, "local_http", run_id, budget, report
        )

    basic_provider = basic_fetcher or _basic_reader_extract
    if basic_fetcher is not None or os.getenv("BASIC_READER_URL", "").strip():
        report["basic_reader_attempts"] += 1
        try:
            basic = basic_provider(normalized, timeout)
        except (urllib.error.URLError, TimeoutError, ValueError):
            basic = LocalExtraction(False, "request_failed")
        if basic.success:
            report["basic_reader_successes"] += 1
            return persist_extraction(
                conn, candidate, basic.text, "basic_reader", run_id, budget, report
            )

    current_metadata_hash = candidate["metadata_hash"]
    if candidate["firecrawl_attempted_hash"] == current_metadata_hash:
        status = "firecrawl_already_attempted_unchanged"
        conn.execute(
            "UPDATE candidate_urls SET extraction_status = ? WHERE normalized_url = ?",
            (status, normalized),
        )
        return ExtractionResult(False, status)

    try:
        budget.reserve_firecrawl(1)
    except BudgetExceeded as exc:
        return ExtractionResult(False, str(exc))
    report["firecrawl_extraction_attempts"] += 1
    conn.execute(
        """
        UPDATE candidate_urls
        SET firecrawl_attempted_hash = ?, extraction_status = 'firecrawl_attempted',
            extraction_provider = 'firecrawl', extraction_timestamp = ?
        WHERE normalized_url = ?
        """,
        (current_metadata_hash, utc_now(), normalized),
    )
    conn.commit()

    firecrawl_provider = firecrawl_fetcher or _firecrawl_extract
    firecrawl = firecrawl_provider(normalized, timeout)
    if firecrawl.success:
        report["firecrawl_extraction_successes"] += 1
        return persist_extraction(
            conn, candidate, firecrawl.text, "firecrawl", run_id, budget, report
        )

    status = f"firecrawl_failed:{firecrawl.status}"
    conn.execute(
        """
        UPDATE candidate_urls
        SET extraction_status = ?, extraction_provider = 'firecrawl',
            extraction_timestamp = ?
        WHERE normalized_url = ?
        """,
        (status, utc_now(), normalized),
    )
    record_event(conn, normalized, "extraction_failed", run_id, status)
    conn.commit()
    return ExtractionResult(False, status, "firecrawl")


def persist_extraction(
    conn: sqlite3.Connection,
    candidate: sqlite3.Row | dict[str, Any],
    text: str,
    provider: str,
    run_id: str,
    budget: BudgetTracker,
    report: dict[str, Any],
) -> ExtractionResult:
    try:
        budget.consume("evidence_pages")
    except BudgetExceeded as exc:
        return ExtractionResult(False, str(exc))
    normalized = candidate["normalized_url"]
    clean_text = text.strip()[:200_000]
    digest = stable_hash(clean_text)
    previous_hash = candidate["content_hash"]
    conn.execute(
        """
        UPDATE candidate_urls
        SET extraction_status = 'success', extraction_provider = ?,
            extraction_timestamp = ?, content_hash = ?, extracted_text = ?,
            rejection_reason = NULL
        WHERE normalized_url = ?
        """,
        (provider, utc_now(), digest, clean_text, normalized),
    )
    detail = "content_changed" if previous_hash and previous_hash != digest else "success"
    record_event(conn, normalized, "extraction_success", run_id, f"{provider}:{detail}")
    conn.commit()
    report["evidence_pages_inspected"] += 1
    return ExtractionResult(True, "success", provider, clean_text, digest)


def concise_evidence(text: str, max_chars: int = 4500) -> str:
    """Select evidence-bearing sentences rather than sending full pages to Hermes."""
    clean = re.sub(r"\s+", " ", text).strip()
    sentences = re.split(r"(?<=[.!?])\s+", clean)
    signals = TRANSITION_SIGNALS + OPERATIONAL_SIGNALS
    selected: list[str] = []
    selected_indexes: set[int] = set()
    for index, sentence in enumerate(sentences):
        if find_signals(sentence, signals):
            for neighbor in range(max(0, index - 1), min(len(sentences), index + 2)):
                if neighbor not in selected_indexes:
                    selected_indexes.add(neighbor)
                    selected.append(sentences[neighbor])
        if sum(len(item) + 1 for item in selected) >= max_chars:
            break
    if not selected:
        return clean[:max_chars]
    return " ".join(selected)[:max_chars]


def candidate_packet(
    candidate: sqlite3.Row | dict[str, Any],
    extraction: ExtractionResult,
    decision: ScreeningDecision,
) -> dict[str, Any]:
    return {
        "candidate_name": candidate["associated_owner"],
        "business_name": candidate["associated_business"],
        "source_family": candidate["source_family"],
        "transition_or_publication_date": candidate["publication_date"],
        "title": candidate["title"],
        "snippet": candidate["snippet"],
        "extracted_evidence": concise_evidence(extraction.text),
        "source_urls": [candidate["normalized_url"]],
        "corroborating_evidence": [],
        "known_rejection_flags": decision.rejection_flags,
        "content_hash": extraction.content_hash,
    }


def rejection_counter(report: dict[str, Any], reason: str) -> None:
    increment_nested_count(report["rejection_counts_by_reason"], reason)


def atomic_write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temp.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    os.replace(temp, path)
