from __future__ import annotations

import importlib.util
import json
import sqlite3
import subprocess
import sys
import tempfile
import threading
import unittest
from datetime import date
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = PROJECT_ROOT / "scripts"
sys.path.insert(0, str(SCRIPTS))

from pipeline_core import (  # noqa: E402
    BudgetExceeded,
    BudgetTracker,
    LocalExtraction,
    ReviewedLead,
    atomic_write_json,
    connect_state,
    extract_candidate,
    extract_html_text,
    flag_material_review_trigger,
    find_signals,
    load_reviewed_leads,
    match_reviewed_lead,
    new_report,
    normalize_identity,
    normalize_url,
    screen_metadata,
    upsert_candidate,
)
from run_research import (  # noqa: E402
    _observed_candidate_urls,
    _suppress_previously_reviewed,
)


def load_submitter():
    spec = importlib.util.spec_from_file_location(
        "submit_batch_for_tests", SCRIPTS / "submit_batch.py"
    )
    module = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(module)
    return module


def budget(**overrides: int) -> BudgetTracker:
    limits = {
        "max_search_calls": 15,
        "max_firecrawl_extractions": 15,
        "max_firecrawl_credits_estimated": 25,
        "max_candidates_screened": 30,
        "max_evidence_pages": 30,
        "max_qualified_leads": 5,
    }
    limits.update(overrides)
    return BudgetTracker(limits)


def candidate(
    *,
    title: str,
    snippet: str,
    source_family: str = "acquiring_minds",
    url: str = "https://example.com/story",
    publication_date: str | None = "2026-07-20",
) -> dict[str, object]:
    return {
        "normalized_url": url,
        "title": title,
        "snippet": snippet,
        "source_family": source_family,
        "publication_date": publication_date,
    }


class UrlStateTests(unittest.TestCase):
    def test_url_normalization(self) -> None:
        self.assertEqual(
            normalize_url(
                "HTTPS://Example.COM:443//story/?utm_source=x&b=2&a=1#section"
            ),
            "https://example.com/story?a=1&b=2",
        )

    def test_duplicate_suppression_and_material_trigger(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            conn = connect_state(Path(directory) / "state.db")
            first = upsert_candidate(
                conn,
                url="https://example.com/story?utm_campaign=a",
                source_family="operator_interview",
                title="Owner acquired a service business",
                snippet="A completed transition.",
                publication_date="2026-07-20",
                run_id="one",
            )
            duplicate = upsert_candidate(
                conn,
                url="https://EXAMPLE.com/story#top",
                source_family="operator_interview",
                title="Owner acquired a service business",
                snippet="A completed transition.",
                publication_date="2026-07-20",
                run_id="two",
            )
            updated = upsert_candidate(
                conn,
                url="https://example.com/story",
                source_family="operator_interview",
                title="Owner acquired a service business",
                snippet="A new ERP integration created a reporting constraint.",
                publication_date="2026-07-20",
                run_id="three",
            )
            self.assertEqual(first.status, "new")
            self.assertEqual(duplicate.status, "duplicate")
            self.assertEqual(updated.status, "materially_updated")
            self.assertEqual(
                conn.execute("SELECT count(*) FROM candidate_urls").fetchone()[0],
                1,
            )
            conn.close()


class ReviewedLeadSuppressionTests(unittest.TestCase):
    PATRICK = ReviewedLead(
        owner_name="Patrick Beal",
        business_name="Temperature Control Maintenance",
        source_url=(
            "https://acquiringminds.co/articles/"
            "patrick-beal-temperature-control-maintenance"
        ),
        verdict="accept",
        calibration_sequence=2,
    )
    KYLE = ReviewedLead(
        owner_name="Kyle Cooper",
        business_name="ACT Power Services",
        source_url=(
            "https://globalrenewablenews.com/article/energy/category/"
            "solar/142/1195176/act-power-services-acquired-names-new-ceo.html"
        ),
        verdict="reject",
        calibration_sequence=4,
    )

    def _insert_candidate(
        self,
        conn: sqlite3.Connection,
        *,
        url: str,
        title: str = "Operator story",
        snippet: str = "The owner acquired the business and is modernizing systems.",
        owner: str | None = None,
        business: str | None = None,
    ) -> str:
        result = upsert_candidate(
            conn,
            url=url,
            source_family="operator_interview",
            title=title,
            snippet=snippet,
            publication_date="2026-07-20",
            run_id="test",
        )
        conn.execute(
            """
            UPDATE candidate_urls
            SET screening_status = 'passed', associated_owner = ?,
                associated_business = ?
            WHERE normalized_url = ?
            """,
            (owner, business, result.normalized_url),
        )
        conn.commit()
        return result.normalized_url

    def _suppress(
        self,
        conn: sqlite3.Connection,
        url: str,
        reviews: list[ReviewedLead],
    ) -> tuple[list[str], dict[str, object]]:
        tracker = budget()
        report = new_report("review-test", "2026-07-25T00:00:00+00:00", tracker)
        survivors = _suppress_previously_reviewed(
            conn,
            [url],
            reviews,
            run_id="review-test",
            report=report,
        )
        return survivors, report

    def test_exact_reviewed_url_suppression(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            conn = connect_state(Path(directory) / "state.db")
            url = self._insert_candidate(
                conn,
                url=f"{self.PATRICK.source_url}?utm_source=index#episode",
            )
            survivors, report = self._suppress(conn, url, [self.PATRICK])
            self.assertEqual(survivors, [])
            self.assertEqual(report["previously_reviewed_suppressed"], 1)
            self.assertEqual(report["previously_accepted_suppressed"], 1)
            row = conn.execute(
                "SELECT screening_status, rejection_reason FROM candidate_urls"
            ).fetchone()
            self.assertEqual(tuple(row), ("suppressed", "previously_reviewed"))
            conn.close()

    def test_same_owner_and_business_different_url(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            conn = connect_state(Path(directory) / "state.db")
            url = self._insert_candidate(
                conn,
                url="https://operator.example/new-interview",
                owner="PATRICK BEAL",
                business="Temperature-Control Maintenance",
            )
            survivors, _ = self._suppress(conn, url, [self.PATRICK])
            self.assertEqual(survivors, [])
            conn.close()

    def test_previously_rejected_lead_suppression(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            conn = connect_state(Path(directory) / "state.db")
            url = self._insert_candidate(
                conn,
                url="https://example.com/another-act-power-profile",
                owner="Kyle Cooper",
                business="ACT Power Services",
            )
            survivors, report = self._suppress(conn, url, [self.KYLE])
            self.assertEqual(survivors, [])
            self.assertEqual(report["previously_rejected_suppressed"], 1)
            self.assertEqual(report["previously_accepted_suppressed"], 0)
            conn.close()

    def test_identity_normalization_ignores_punctuation_and_case(self) -> None:
        reviewed = ReviewedLead(
            owner_name="Renée O'Neil",
            business_name="ACME Services, Inc.",
            source_url="https://example.com/original",
            verdict="accept",
            calibration_sequence=99,
            business_domain="www.Acme-Services.com",
        )
        self.assertEqual(normalize_identity("RENÉE O’NEIL"), "reneeoneil")
        matched = match_reviewed_lead(
            {
                "normalized_url": "https://different.example/story",
                "original_url": "https://different.example/story",
                "title": "",
                "snippet": "",
                "associated_owner": "renee oneil",
                "associated_business": "acme services inc",
                "associated_business_domain": "https://acme-services.com/about",
            },
            [reviewed],
        )
        self.assertEqual(matched, reviewed)

    def test_material_trigger_requires_explicit_flag(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            conn = connect_state(Path(directory) / "state.db")
            url = self._insert_candidate(
                conn,
                url="https://operator.example/patrick-update",
                title="Patrick Beal update",
                snippet=(
                    "Temperature Control Maintenance has a new ERP integration "
                    "and reporting problem."
                ),
                owner="Patrick Beal",
                business="Temperature Control Maintenance",
            )
            survivors, report = self._suppress(conn, url, [self.PATRICK])
            self.assertEqual(survivors, [])
            self.assertEqual(report["materially_new_trigger_reopened"], 0)

            with self.assertRaises(ValueError):
                flag_material_review_trigger(
                    conn, url, "A general follow-up", "review-test"
                )
            flag_material_review_trigger(
                conn,
                url,
                "New ERP integration created a reporting problem",
                "review-test",
            )
            survivors, report = self._suppress(conn, url, [self.PATRICK])
            self.assertEqual(survivors, [url])
            self.assertEqual(report["materially_new_trigger_reopened"], 1)
            self.assertEqual(report["previously_reviewed_suppressed"], 0)
            approved = conn.execute(
                "SELECT review_reopen_approved FROM candidate_urls"
            ).fetchone()[0]
            self.assertEqual(approved, 0)
            conn.close()

    def test_patrick_different_index_page_is_not_emitted(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            conn = connect_state(Path(directory) / "state.db")
            url = self._insert_candidate(
                conn,
                url="https://podcasts.example/operator-index/patrick-beal",
                title="Patrick Beal owner interview",
                snippet="Temperature Control Maintenance operating update",
            )
            survivors, report = self._suppress(conn, url, [self.PATRICK])
            self.assertEqual(survivors, [])
            self.assertEqual(report["previously_reviewed_suppressed"], 1)
            self.assertEqual(report["local_extraction_attempts"], 0)
            conn.close()

    def test_run_report_contains_review_suppression_metrics(self) -> None:
        report = new_report(
            "schema-test",
            "2026-07-25T00:00:00+00:00",
            budget(),
        )
        for key in (
            "previously_reviewed_suppressed",
            "previously_accepted_suppressed",
            "previously_rejected_suppressed",
            "materially_new_trigger_reopened",
        ):
            self.assertIn(key, report)
            self.assertEqual(report[key], 0)

    def test_reviewed_cache_duplicate_is_observed_and_suppressed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            conn = connect_state(Path(directory) / "state.db")
            url = self._insert_candidate(conn, url=self.PATRICK.source_url)
            upsert_candidate(
                conn,
                url=f"{self.PATRICK.source_url}?utm_source=weekly",
                source_family="acquiring_minds",
                title="Weekly index result",
                snippet="Previously seen operator story.",
                publication_date="2026-07-20",
                run_id="weekly-run",
            )
            conn.commit()
            observed = _observed_candidate_urls(conn, "weekly-run")
            self.assertEqual(observed, [url])
            report = new_report(
                "weekly-run",
                "2026-07-25T00:00:00+00:00",
                budget(),
            )
            allowed = _suppress_previously_reviewed(
                conn,
                observed,
                [self.PATRICK],
                run_id="weekly-run",
                report=report,
            )
            self.assertEqual(allowed, [])
            self.assertEqual(report["previously_reviewed_suppressed"], 1)
            self.assertEqual(report["candidates_skipped_as_duplicates"], 0)
            conn.close()


class ScreeningTests(unittest.TestCase):
    def test_transition_signal_detection(self) -> None:
        decision = screen_metadata(
            candidate(
                title="First year as owner after he purchased the business",
                snippet="The company is expanding.",
            )
        )
        self.assertIn("first year as owner", decision.transition_signals)

    def test_operational_hypothesis_detection(self) -> None:
        decision = screen_metadata(
            candidate(
                title="She acquired the distributor",
                snippet="Inventory, ERP reporting, and scheduling were disconnected.",
            )
        )
        self.assertEqual(decision.status, "passed")
        self.assertIn("inventory", decision.operational_signals)
        self.assertIn("erp", decision.operational_signals)

    def test_clear_intermediary_rejection(self) -> None:
        decision = screen_metadata(
            candidate(
                title="M&A advisor discusses an acquisition",
                snippet="The investment bank represented the seller.",
            )
        )
        self.assertEqual(decision.status, "rejected")
        self.assertEqual(decision.reason, "intermediary")

    def test_known_accepted_examples_pass_or_borderline(self) -> None:
        examples = [
            candidate(
                title="Patrick Beal acquired Temperature Control Maintenance",
                snippet="The previous owner remains while Patrick earns the HVAC license.",
                url="https://acquiringminds.co/articles/patrick-beal-temperature-control-maintenance",
            ),
            candidate(
                title="Himmat Singh bought the business EPI-Colorspace",
                snippet="The lead sales employee quit, forcing a turnaround.",
                url="https://acquiringminds.co/articles/himmat-singh-epi-colorspace",
            ),
            candidate(
                title="Chris Farkas acquired EmergencyKits.com",
                snippet="A website bug caused lost sales and an inventory crisis.",
                url="https://acquiringminds.co/articles/chris-farkas-emergencykits-com",
            ),
            candidate(
                title="Paw Paw Rentals acquired and stays family owned",
                snippet="Nick Roskam plans software for scheduling and real-time inventory.",
                source_family="trade_publication",
                url="https://news.ararental.org/paw-paw-rentals-acquired-stays-family-owned",
            ),
        ]
        for item in examples:
            with self.subTest(url=item["normalized_url"]):
                self.assertIn(
                    screen_metadata(item).status,
                    {"passed", "borderline"},
                )

    def test_acquiring_minds_index_candidate_can_enter_borderline_queue(self) -> None:
        decision = screen_metadata(
            candidate(
                title="Product-Market Fit in the Trades: 4x in 2.5 Years",
                snippet="A detailed operator post-mortem.",
                url="https://acquiringminds.co/articles/patrick-beal-temperature-control-maintenance",
            )
        )
        self.assertEqual(decision.status, "borderline")
        self.assertEqual(decision.reason, "primary_operator_index_borderline")

    def test_known_rejected_examples(self) -> None:
        kyle = candidate(
            title="ACT Power Services acquired, names new CEO",
            snippet="Kyle Cooper was appointed CEO to lead the company.",
            source_family="trade_publication",
        )
        bill = candidate(
            title="Platform acquisition of Superior Building Services",
            snippet="Seller Bill Detillion will remain president after the acquisition.",
            source_family="company_page",
        )
        self.assertEqual(
            screen_metadata(kyle).reason,
            "generic_appointed_executive",
        )
        self.assertEqual(screen_metadata(bill).reason, "retained_seller")

    def test_old_transition_without_trigger_rejected(self) -> None:
        decision = screen_metadata(
            candidate(
                title="Owner acquired the business",
                snippet="The acquisition closed.",
                publication_date="2025-01-01",
            ),
            today=date(2026, 7, 24),
        )
        self.assertEqual(decision.reason, "old_transition_no_new_trigger")


class ExtractionTests(unittest.TestCase):
    def test_static_article_extraction(self) -> None:
        body = " ".join(
            [
                "The new owner acquired the service company and inherited its operations.",
                "The previous owner held scheduling knowledge in spreadsheets.",
                "The team is standardizing processes, reporting, and inventory.",
            ]
            * 12
        )
        result = extract_html_text(
            f"<html><head><title>Operator story</title></head>"
            f"<body><nav>{'links ' * 200}</nav><main><h1>Story</h1><p>{body}</p>"
            f"</main></body></html>"
        )
        self.assertTrue(result.success)
        self.assertIn("standardizing processes", result.text)
        self.assertNotIn("links links", result.text)

    def test_paywall_shell_detection(self) -> None:
        result = extract_html_text(
            "<html><body><main><h1>Story</h1>"
            "<p>Subscribe to continue reading this article.</p></main></body></html>"
        )
        self.assertFalse(result.success)
        self.assertEqual(result.status, "paywall_or_login")

    def test_firecrawl_fallback_selected_once(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            conn = connect_state(Path(directory) / "state.db")
            upsert_candidate(
                conn,
                url="https://example.com/operator-story",
                source_family="operator_interview",
                title="Owner acquired a business",
                snippet="Inventory and reporting need integration.",
                publication_date="2026-07-20",
                run_id="test",
            )
            conn.execute(
                "UPDATE candidate_urls SET screening_status = 'passed' "
                "WHERE normalized_url = 'https://example.com/operator-story'"
            )
            conn.commit()
            row = conn.execute("SELECT * FROM candidate_urls").fetchone()
            tracker = budget()
            report = new_report("test", "2026-07-24T00:00:00+00:00", tracker)
            calls = {"firecrawl": 0}

            def local_failure(url: str, timeout: int) -> LocalExtraction:
                return LocalExtraction(False, "inadequate_content")

            def firecrawl_success(url: str, timeout: int) -> LocalExtraction:
                calls["firecrawl"] += 1
                return LocalExtraction(True, "success", text="Evidence " * 300)

            result = extract_candidate(
                conn,
                row,
                run_id="test",
                budget=tracker,
                report=report,
                local_fetcher=local_failure,
                firecrawl_fetcher=firecrawl_success,
            )
            self.assertTrue(result.success)
            self.assertEqual(result.provider, "firecrawl")
            self.assertEqual(calls["firecrawl"], 1)
            self.assertEqual(tracker.usage["firecrawl_extractions"], 1)
            self.assertEqual(tracker.usage["firecrawl_credits_estimated"], 1)
            refreshed = conn.execute("SELECT * FROM candidate_urls").fetchone()
            refreshed_dict = dict(refreshed)
            refreshed_dict["extraction_status"] = "not_attempted"
            refreshed_dict["extracted_text"] = ""
            second = extract_candidate(
                conn,
                refreshed_dict,
                run_id="test-two",
                budget=tracker,
                report=report,
                local_fetcher=local_failure,
                firecrawl_fetcher=firecrawl_success,
            )
            self.assertFalse(second.success)
            self.assertEqual(second.status, "firecrawl_already_attempted_unchanged")
            self.assertEqual(calls["firecrawl"], 1)
            conn.close()


class BudgetAndIntegrationTests(unittest.TestCase):
    def test_budget_enforcement(self) -> None:
        tracker = budget(max_search_calls=1, max_firecrawl_credits_estimated=1)
        tracker.consume("search_calls")
        with self.assertRaises(BudgetExceeded):
            tracker.consume("search_calls")
        tracker.reserve_firecrawl()
        with self.assertRaises(BudgetExceeded):
            tracker.reserve_firecrawl()

    def test_valid_latest_batch_and_no_secret_fields(self) -> None:
        submitter = load_submitter()
        batch = {
            "run": {
                "run_id": "unit-test",
                "started_at": "2026-07-24T00:00:00+00:00",
                "completed_at": "2026-07-24T00:01:00+00:00",
                "queries_run": 0,
                "sources_inspected": 1,
                "qualified_leads": 1,
            },
            "leads": [
                {
                    "owner_name": "Example Owner",
                    "owner_title": "Owner",
                    "linkedin_url": None,
                    "professional_email": None,
                    "business_name": "Example Co",
                    "business_domain": "example.com",
                    "business_location": None,
                    "industry": "field services",
                    "transition_type": "acquired",
                    "transition_date": "2026-07-01",
                    "trigger_event": "The owner completed the acquisition.",
                    "operational_signal": "Scheduling requires standardization.",
                    "source_quote": None,
                    "primary_source_url": "https://example.com/story",
                    "supporting_source_urls": [],
                    "lead_score": 70,
                    "lead_priority": "medium",
                    "score_reason": "Recent owner transition with a concrete process need.",
                    "is_existing_lead": False,
                    "discovered_at": "2026-07-24T00:00:00+00:00",
                }
            ],
            "rejected_summary": {
                "duplicate": 0,
                "intermediary": 0,
                "too_old": 0,
                "unconfirmed_transition": 0,
                "no_operating_role": 0,
                "outside_target": 0,
                "insufficient_evidence": 0,
            },
        }
        with tempfile.TemporaryDirectory() as directory:
            latest = Path(directory) / "latest.json"
            atomic_write_json(latest, batch)
            parsed = json.loads(latest.read_text(encoding="utf-8"))
            self.assertEqual(submitter.validate_batch(parsed), parsed)
            serialized = latest.read_text(encoding="utf-8").lower()
            for secret_name in (
                "firecrawl_api_key",
                "brave_search_api_key",
                "n8n_webhook_token",
                "authorization",
            ):
                self.assertNotIn(secret_name, serialized)

    def test_phase_runner_uses_local_extraction_without_firecrawl(self) -> None:
        article = " ".join(
            [
                "Jordan acquired the field service business in July 2026.",
                "The previous owner managed scheduling and inventory in spreadsheets.",
                "Jordan is standardizing systems, CRM reporting, and hiring processes.",
            ]
            * 15
        )

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self) -> None:
                if self.path == "/robots.txt":
                    body = b"User-agent: *\nAllow: /\n"
                    content_type = "text/plain"
                elif self.path == "/":
                    body = (
                        b"<html><body><main><a href='/operator-story'>"
                        b"Jordan acquired a field service business; inventory systems "
                        b"and scheduling need standardization</a></main></body></html>"
                    )
                    content_type = "text/html"
                elif self.path == "/operator-story":
                    body = (
                        f"<html><body><main><h1>Owner story</h1><p>{article}</p>"
                        "</main></body></html>"
                    ).encode()
                    content_type = "text/html"
                else:
                    self.send_error(404)
                    return
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, format: str, *args: object) -> None:
                return

        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            with tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                port = server.server_address[1]
                sources = {
                    "borderline_queue": True,
                    "sources": [
                        {
                            "family": "operator_interview",
                            "name": "test index",
                            "index_urls": [f"http://127.0.0.1:{port}/"],
                            "allowed_hosts": ["127.0.0.1"],
                            "include_path_prefixes": ["/operator-story"],
                            "priority": "primary",
                        }
                    ],
                }
                sources_path = root / "sources.json"
                budget_path = root / "budget.json"
                sources_path.write_text(json.dumps(sources), encoding="utf-8")
                budget_path.write_text(
                    json.dumps(budget().limits),
                    encoding="utf-8",
                )
                output = root / "latest.json"
                report_path = root / "report.json"
                completed = subprocess.run(
                    [
                        sys.executable,
                        str(SCRIPTS / "run_research.py"),
                        "--db",
                        str(root / "state.db"),
                        "--sources",
                        str(sources_path),
                        "--budget",
                        str(budget_path),
                        "--output",
                        str(output),
                        "--report",
                        str(report_path),
                        "--run-id",
                        "integration-test",
                        "--qualifier",
                        "none",
                        "--no-submit",
                    ],
                    cwd=PROJECT_ROOT,
                    capture_output=True,
                    text=True,
                    check=False,
                    timeout=30,
                )
                self.assertEqual(completed.returncode, 0, completed.stderr)
                report = json.loads(report_path.read_text(encoding="utf-8"))
                batch = json.loads(output.read_text(encoding="utf-8"))
                self.assertEqual(report["local_extraction_attempts"], 1)
                self.assertEqual(report["local_extraction_successes"], 1)
                self.assertEqual(report["firecrawl_extraction_attempts"], 0)
                self.assertEqual(report["estimated_firecrawl_credits_consumed"], 0)
                self.assertEqual(report["phase"], "awaiting_human_review")
                self.assertEqual(batch["leads"], [])
                self.assertEqual(batch["run"]["sources_inspected"], 1)
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)

    def test_calibration_jsonl_sequences_and_totals(self) -> None:
        reviews_path = PROJECT_ROOT / "calibration" / "reviews.jsonl"
        raw_lines = [
            line
            for line in reviews_path.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        parsed_lines = []
        for line_number, raw_line in enumerate(raw_lines, start=1):
            with self.subTest(line=line_number):
                record = json.loads(raw_line)
                self.assertIsInstance(record, dict)
                parsed_lines.append(record)
        loaded = load_reviewed_leads(reviews_path)
        self.assertEqual(
            [review.calibration_sequence for review in loaded],
            list(range(1, 11)),
        )
        self.assertEqual(
            [record["calibration_sequence"] for record in parsed_lines],
            list(range(1, 11)),
        )
        totals = {
            verdict: sum(1 for review in loaded if review.verdict == verdict)
            for verdict in ("accept", "reject")
        }
        self.assertEqual(totals, {"accept": 8, "reject": 2})
        self.assertEqual(
            sum(
                1
                for review in loaded
                if review.normalized_owner == normalize_identity("Patrick Beal")
                and review.normalized_business
                == normalize_identity("Temperature Control Maintenance")
            ),
            1,
        )


if __name__ == "__main__":
    unittest.main()
