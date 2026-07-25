#!/usr/bin/env python3
"""Harvest structured source indexes and optional explicit Brave searches."""

from __future__ import annotations

import argparse
import json
import os
import re
import sqlite3
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from pipeline_core import (
    DEFAULT_BUDGET_PATH,
    DEFAULT_DB_PATH,
    DEFAULT_SOURCES_PATH,
    USER_AGENT,
    BudgetExceeded,
    BudgetTracker,
    LinkIndexParser,
    atomic_write_json,
    connect_state,
    finalize_report,
    http_get,
    load_runtime_environment,
    new_report,
    normalize_url,
    record_error,
    upsert_candidate,
    utc_now,
)


MONTHS = {
    name.lower(): number
    for number, name in enumerate(
        (
            "",
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        )
    )
    if name
}
MONTHS.update({name[:3].lower(): number for name, number in MONTHS.items()})


@dataclass
class HarvestedCandidate:
    url: str
    source_family: str
    title: str
    snippet: str
    publication_date: str | None
    state_status: str = ""


def parse_publication_date(text: str) -> str | None:
    iso_match = re.search(r"\b(20\d{2})-(\d{2})-(\d{2})\b", text)
    if iso_match:
        return iso_match.group(0)
    month_match = re.search(
        r"\b(" + "|".join(MONTHS) + r")\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d{2})\b",
        text,
        re.IGNORECASE,
    )
    if not month_match:
        return None
    try:
        value = datetime(
            int(month_match.group(3)),
            MONTHS[month_match.group(1).lower()[:3]],
            int(month_match.group(2)),
            tzinfo=timezone.utc,
        )
        return value.date().isoformat()
    except ValueError:
        return None


def title_from_url(url: str) -> str:
    slug = urllib.parse.urlsplit(url).path.rstrip("/").rsplit("/", 1)[-1]
    return " ".join(word.capitalize() for word in re.split(r"[-_]+", slug) if word)


def _strip_markup(raw: str) -> str:
    text = re.sub(r"<script\b.*?</script>", " ", raw, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"<style\b.*?</style>", " ", text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"<[^>]+>", " ", text)
    return " ".join(text.split())


def context_for_link(raw_html: str, href: str, max_chars: int = 700) -> str:
    """Fallback context extraction when an anchor itself contains no useful text."""
    positions = [raw_html.find(href)]
    encoded = href.replace("&", "&amp;")
    if encoded != href:
        positions.append(raw_html.find(encoded))
    position = max(positions)
    if position < 0:
        return ""
    window = raw_html[max(0, position - 300) : position + 900]
    return _strip_markup(window)[:max_chars]


def source_allows_url(source: dict[str, Any], url: str) -> bool:
    parsed = urllib.parse.urlsplit(url)
    allowed_hosts = {host.lower() for host in source.get("allowed_hosts", [])}
    if allowed_hosts and (parsed.hostname or "").lower() not in allowed_hosts:
        return False
    prefixes = source.get("include_path_prefixes", [])
    if prefixes and not any(parsed.path.startswith(prefix) for prefix in prefixes):
        return False
    if any(fragment in parsed.path for fragment in source.get("exclude_path_fragments", [])):
        return False
    minimum_slug_words = int(source.get("minimum_slug_words", 0))
    if minimum_slug_words:
        slug = parsed.path.rstrip("/").rsplit("/", 1)[-1]
        words = [word for word in re.split(r"[-_]+", slug) if word]
        if len(words) < minimum_slug_words:
            return False
    return True


def harvest_index(
    source: dict[str, Any],
    *,
    report: dict[str, Any],
    timeout: int,
) -> list[HarvestedCandidate]:
    """Read all configured listing pages; one broken page does not fail the adapter."""
    candidates: dict[str, HarvestedCandidate] = {}
    successful_pages = 0
    for index_url in source.get("index_urls", []):
        try:
            raw_html, final_url = http_get(index_url, timeout=timeout)
            successful_pages += 1
            report["index_pages_fetched"] += 1
        except Exception as exc:
            record_error(
                report,
                provider="ordinary_http",
                source_family=source["family"],
                error=f"{type(exc).__name__}:{exc}",
            )
            continue

        parser = LinkIndexParser()
        try:
            parser.feed(raw_html)
        except Exception as exc:
            record_error(
                report,
                provider="html_index_parser",
                source_family=source["family"],
                error=f"{type(exc).__name__}:{exc}",
            )
            continue

        for link in parser.links:
            absolute = urllib.parse.urljoin(final_url, link["href"])
            try:
                normalized = normalize_url(absolute)
            except ValueError:
                continue
            if normalized == normalize_url(final_url) or not source_allows_url(source, normalized):
                continue
            text = " ".join(link["text"].split())
            fallback = context_for_link(raw_html, link["href"])
            title = text[:300] if text else title_from_url(normalized)
            snippet = fallback or text
            if len(title) < 5:
                title = title_from_url(normalized)
            existing = candidates.get(normalized)
            if existing and len(existing.snippet) >= len(snippet):
                continue
            candidates[normalized] = HarvestedCandidate(
                url=absolute,
                source_family=source["family"],
                title=title,
                snippet=snippet[:1500],
                publication_date=parse_publication_date(f"{text} {fallback}"),
            )

    if not successful_pages:
        record_error(
            report,
            provider="source_adapter",
            source_family=source["family"],
            error="all_index_pages_failed",
        )
    return list(candidates.values())


def _source_family_for_search_url(url: str) -> str:
    host = (urllib.parse.urlsplit(url).hostname or "").lower()
    if "prnewswire.com" in host:
        return "pr_newswire"
    if "businesswire.com" in host:
        return "business_wire"
    if "globenewswire.com" in host:
        return "globenewswire"
    if "acquiringminds.co" in host:
        return "acquiring_minds"
    return "brave_search"


def brave_search(
    query: str,
    *,
    budget: BudgetTracker,
    report: dict[str, Any],
    timeout: int,
    count: int = 10,
) -> list[HarvestedCandidate]:
    """Run only an explicit, caller-supplied Brave query."""
    api_key = os.getenv("BRAVE_SEARCH_API_KEY", "").strip()
    if not api_key:
        record_error(
            report,
            provider="brave-free",
            source_family="explicit_search",
            error="BRAVE_SEARCH_API_KEY is not configured",
        )
        return []
    try:
        budget.consume("search_calls")
    except BudgetExceeded:
        return []
    report["search_calls_by_provider"]["brave-free"] = (
        report["search_calls_by_provider"].get("brave-free", 0) + 1
    )
    params = urllib.parse.urlencode({"q": query, "count": min(max(count, 1), 20)})
    request = urllib.request.Request(
        f"https://api.search.brave.com/res/v1/web/search?{params}",
        headers={
            "Accept": "application/json",
            "X-Subscription-Token": api_key,
            "User-Agent": USER_AGENT,
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = json.loads(response.read(2_000_000).decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        record_error(
            report,
            provider="brave-free",
            source_family="explicit_search",
            error=f"{type(exc).__name__}:{exc}",
        )
        return []
    results = body.get("web", {}).get("results", [])
    harvested: list[HarvestedCandidate] = []
    for item in results:
        url = item.get("url", "")
        try:
            normalize_url(url)
        except ValueError:
            continue
        harvested.append(
            HarvestedCandidate(
                url=url,
                source_family=_source_family_for_search_url(url),
                title=str(item.get("title") or "")[:300],
                snippet=_strip_markup(str(item.get("description") or ""))[:1500],
                publication_date=parse_publication_date(
                    f"{item.get('page_age', '')} {item.get('description', '')}"
                ),
            )
        )
    return harvested


def harvest_all(
    conn: sqlite3.Connection,
    *,
    run_id: str,
    sources_config: dict[str, Any],
    budget: BudgetTracker,
    report: dict[str, Any],
    search_queries: list[str] | None = None,
    timeout: int = 20,
) -> list[str]:
    emitted: list[str] = []
    all_candidates: list[HarvestedCandidate] = []
    for source in sources_config.get("sources", []):
        try:
            all_candidates.extend(harvest_index(source, report=report, timeout=timeout))
        except Exception as exc:
            record_error(
                report,
                provider="source_adapter",
                source_family=source.get("family", "unknown"),
                error=f"{type(exc).__name__}:{exc}",
            )
    for query in search_queries or []:
        all_candidates.extend(
            brave_search(query, budget=budget, report=report, timeout=timeout)
        )

    seen_this_run: set[str] = set()
    for candidate in all_candidates:
        try:
            normalized = normalize_url(candidate.url)
        except ValueError:
            continue
        if normalized in seen_this_run:
            continue
        seen_this_run.add(normalized)
        result = upsert_candidate(
            conn,
            url=candidate.url,
            source_family=candidate.source_family,
            title=candidate.title,
            snippet=candidate.snippet,
            publication_date=candidate.publication_date,
            run_id=run_id,
        )
        candidate.state_status = result.status
        if result.status == "new":
            report["candidates_discovered"] += 1
            emitted.append(result.normalized_url)
        elif result.status == "materially_updated":
            report["candidates_materially_updated"] += 1
            emitted.append(result.normalized_url)
        else:
            report["candidates_skipped_as_duplicates"] += 1
    conn.commit()
    return emitted


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH)
    parser.add_argument("--sources", type=Path, default=DEFAULT_SOURCES_PATH)
    parser.add_argument("--budget", type=Path, default=DEFAULT_BUDGET_PATH)
    parser.add_argument("--search-query", action="append", default=[])
    parser.add_argument("--timeout", type=int, default=20)
    parser.add_argument("--run-id", default=f"harvest-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}")
    parser.add_argument("--report", type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    load_runtime_environment()
    sources = json.loads(args.sources.read_text(encoding="utf-8"))
    budget = BudgetTracker.from_path(args.budget)
    started = utc_now()
    report = new_report(args.run_id, started, budget)
    report["phase"] = "harvest"
    conn = connect_state(args.db)
    try:
        emitted = harvest_all(
            conn,
            run_id=args.run_id,
            sources_config=sources,
            budget=budget,
            report=report,
            search_queries=args.search_query,
            timeout=args.timeout,
        )
        report["phase"] = "complete"
        finalize_report(report, budget)
        report_path = args.report or (
            args.db.parents[0].parent / "out" / f"run-report-{args.run_id}.json"
        )
        atomic_write_json(report_path, report)
        print(json.dumps({"run_id": args.run_id, "emitted_urls": emitted, "report": str(report_path)}))
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
