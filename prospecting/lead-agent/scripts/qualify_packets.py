#!/usr/bin/env python3
"""Ask Hermes to adjudicate concise evidence packets without web tools."""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path
from typing import Any


SYSTEM_RULES = """
You are the qualification adjudicator for SystemsCraft transitioned-owner leads.
Use ONLY the supplied evidence packets. Do not search, browse, call tools, or
rediscover facts. Reject rather than infer unsupported details.

Accept only a named acquiring owner, closed searcher, family successor, or
owner-operator with a completed transition and concrete operating relevance.
An appointed non-owner executive requires an explicit transformation mandate
and a concrete current constraint. Reject intermediaries, passive investors,
generic transaction announcements, unclosed transactions, retained sellers
without purchasing responsibility, generic appointed executives, and clearly
out-of-profile companies.

Generic press-release language is never sufficient evidence. LinkedIn must not
be extracted. Never issue a follow-up search merely because the prior search
produced no qualified lead. A follow-up search requires a specific named person,
business, or unresolved fact discovered in the prior result.

Score only supported facts:
- transition recency: 0-25
- operator certainty: 0-20
- operational need: 0-25
- company fit: 0-20
- public professional contactability: 0-10
Only qualify scores >=55. Priorities: high 80-100, medium 65-79, low 55-64.

Return one JSON object and no markdown:
{
  "qualified_leads": [
    {
      "owner_name": "string",
      "owner_title": "string or null",
      "linkedin_url": "string or null",
      "professional_email": "string or null",
      "business_name": "string",
      "business_domain": "string or null",
      "business_location": "string or null",
      "industry": "string",
      "transition_type": "acquired | inherited | succeeded | appointed_operator | other",
      "transition_date": "YYYY-MM-DD or null",
      "trigger_event": "concise factual summary",
      "operational_signal": "concise factual summary or null",
      "source_quote": "short supporting excerpt or null",
      "primary_source_url": "string",
      "supporting_source_urls": ["string"],
      "lead_score": 0,
      "lead_priority": "high | medium | low",
      "score_reason": "one sentence",
      "is_existing_lead": false,
      "discovered_at": "ISO-8601 timestamp or null",
      "content_hash": "copy from packet"
    }
  ],
  "rejections": [
    {
      "primary_source_url": "string",
      "reason": "short_machine_reason"
    }
  ]
}
""".strip()


def _parse_json_object(raw: str) -> dict[str, Any]:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start < 0 or end <= start:
            raise ValueError("Hermes did not return a JSON object")
        parsed = json.loads(text[start : end + 1])
    if not isinstance(parsed, dict):
        raise ValueError("Hermes qualification response is not an object")
    return parsed


def _validate_lead(lead: Any, packet_urls: set[str]) -> tuple[bool, str]:
    if not isinstance(lead, dict):
        return False, "not_an_object"
    required = {
        "owner_name",
        "business_name",
        "industry",
        "transition_type",
        "trigger_event",
        "primary_source_url",
        "lead_score",
        "lead_priority",
    }
    if required - set(lead):
        return False, "missing_required_fields"
    if lead["primary_source_url"] not in packet_urls:
        return False, "source_not_in_packet"
    if not isinstance(lead["lead_score"], int) or lead["lead_score"] < 55:
        return False, "score_below_threshold"
    if lead["lead_score"] > 100:
        return False, "score_above_range"
    if lead["lead_priority"] not in {"high", "medium", "low"}:
        return False, "invalid_priority"
    if lead["transition_type"] not in {
        "acquired",
        "inherited",
        "succeeded",
        "appointed_operator",
        "other",
    }:
        return False, "invalid_transition_type"
    return True, ""


def qualify_with_hermes(
    packets: list[dict[str, Any]],
    *,
    max_qualified_leads: int,
    usage_path: Path,
    timeout: int = 300,
    hermes_binary: str = "hermes",
) -> dict[str, Any]:
    if not packets:
        return {"qualified_leads": [], "rejections": []}
    payload = json.dumps(
        {
            "maximum_qualified_leads": max_qualified_leads,
            "evidence_packets": packets,
        },
        ensure_ascii=False,
    )
    prompt = f"{SYSTEM_RULES}\n\nINPUT:\n{payload}"
    command = [
        hermes_binary,
        "--oneshot",
        prompt,
        "--toolsets",
        "file",
        "--usage-file",
        str(usage_path),
    ]
    completed = subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=timeout,
        check=False,
    )
    if completed.returncode != 0:
        detail = completed.stderr.strip()[-800:]
        raise RuntimeError(
            f"Hermes qualification failed with exit {completed.returncode}: {detail}"
        )
    response = _parse_json_object(completed.stdout)
    raw_leads = response.get("qualified_leads", [])
    raw_rejections = response.get("rejections", [])
    if not isinstance(raw_leads, list) or not isinstance(raw_rejections, list):
        raise ValueError("Hermes response has invalid qualification arrays")

    packet_urls = {
        url
        for packet in packets
        for url in packet.get("source_urls", [])
        if isinstance(url, str)
    }
    leads: list[dict[str, Any]] = []
    invalid_rejections: list[dict[str, str]] = []
    for lead in raw_leads:
        valid, reason = _validate_lead(lead, packet_urls)
        if not valid:
            source = lead.get("primary_source_url", "") if isinstance(lead, dict) else ""
            invalid_rejections.append(
                {"primary_source_url": source, "reason": f"invalid_hermes_lead:{reason}"}
            )
            continue
        leads.append(lead)
        if len(leads) >= max_qualified_leads:
            break
    return {
        "qualified_leads": leads,
        "rejections": raw_rejections + invalid_rejections,
    }
