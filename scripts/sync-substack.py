#!/usr/bin/env python3
"""Merge published Built that Way posts into the site's static article list."""

import argparse
import json
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.error import URLError
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen
from xml.etree import ElementTree

FEED_URL = "https://dannymcgiffin.substack.com/feed"
ARCHIVE_URL = "https://dannymcgiffin.substack.com/api/v1/archive?sort=new&limit=20"
ARCHIVE_RELAY_URL = "https://r.jina.ai/http://dannymcgiffin.substack.com/api/v1/archive?sort=new%26limit=20"
FEED_RELAY_URL = "https://api.allorigins.win/raw?url=" + quote(FEED_URL, safe="")
POSTS_FILE = Path(__file__).resolve().parents[1] / "src/data/substack-posts.json"
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Accept": "application/json, application/rss+xml, application/xml, text/xml, */*",
    "Accept-Language": "en-US,en;q=0.9",
}


def post_record(title: str, published_at: str, href: str) -> dict[str, str]:
    url = urlparse(href)
    if not title or url.scheme != "https" or url.hostname != "dannymcgiffin.substack.com" or not url.path.startswith("/p/"):
        raise ValueError(f"Invalid Substack article: {href}")
    return {"title": title, "publishedAt": published_at, "href": url._replace(query="", fragment="").geturl()}


def parse_posts(feed: bytes) -> list[dict[str, str]]:
    channel = ElementTree.fromstring(feed).find("channel")
    if channel is None or urlparse(channel.findtext("link", "")).hostname != "dannymcgiffin.substack.com":
        raise ValueError("Unexpected Substack feed")

    posts = []
    for item in channel.findall("item"):
        title = (item.findtext("title") or "").strip()
        href = (item.findtext("link") or "").strip()
        published = (item.findtext("pubDate") or "").strip()
        date = parsedate_to_datetime(published).astimezone(timezone.utc).date().isoformat()
        posts.append(post_record(title, date, href))

    if not posts:
        raise ValueError("Substack feed has no published posts")
    return posts


def parse_archive(archive: bytes) -> list[dict[str, str]]:
    entries = json.loads(archive)
    if not isinstance(entries, list) or not entries:
        raise ValueError("Substack archive has no published posts")
    return [
        post_record(
            (entry.get("title") or "").strip(),
            datetime.fromisoformat(entry["post_date"].replace("Z", "+00:00")).astimezone(timezone.utc).date().isoformat(),
            (entry.get("canonical_url") or "").strip(),
        )
        for entry in entries
    ]


def parse_relay_archive(response: bytes) -> list[dict[str, str]]:
    marker = b"Markdown Content:\n"
    if marker not in response:
        raise ValueError("Archive relay response has no JSON content")
    return parse_archive(response.split(marker, 1)[1].strip())


def merge_posts(existing: list[dict[str, str]], incoming: list[dict[str, str]]) -> list[dict[str, str]]:
    posts = {post["href"]: post for post in existing}
    posts.update({post["href"]: post for post in incoming})
    return sorted(posts.values(), key=lambda post: (post["publishedAt"], post["href"]), reverse=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--feed-file", type=Path, help="Read a saved RSS feed instead of fetching live sources")
    parser.add_argument("--archive-file", type=Path, help="Read a saved archive response instead of fetching live sources")
    args = parser.parse_args()

    if args.feed_file or args.archive_file:
        incoming = []
        if args.feed_file:
            incoming.extend(parse_posts(args.feed_file.read_bytes()))
        if args.archive_file:
            incoming.extend(parse_archive(args.archive_file.read_bytes()))
    else:
        incoming = []
        sources = (("archive", ARCHIVE_URL, parse_archive), ("RSS", FEED_URL, parse_posts))
        relays = (("archive relay", ARCHIVE_RELAY_URL, parse_relay_archive), ("RSS relay", FEED_RELAY_URL, parse_posts))
        for group in (sources, relays):
            for name, url, parse in group:
                try:
                    request = Request(url, headers=REQUEST_HEADERS)
                    with urlopen(request, timeout=20) as response:
                        incoming.extend(parse(response.read()))
                except (URLError, TimeoutError, ValueError, ElementTree.ParseError, KeyError) as error:
                    print(f"Could not read Substack {name}: {error}")
            if incoming:
                break
        if not incoming:
            raise RuntimeError("Neither Substack source returned published posts")

    existing = json.loads(POSTS_FILE.read_text())
    ordered = merge_posts(existing, incoming)
    updated = json.dumps(ordered, ensure_ascii=False, indent=2) + "\n"
    if POSTS_FILE.read_text() != updated:
        POSTS_FILE.write_text(updated)
        print(f"Updated {POSTS_FILE.relative_to(POSTS_FILE.parents[2])}: {len(ordered)} posts")
    else:
        print(f"No new Substack posts ({len(ordered)} listed)")


if __name__ == "__main__":
    main()
